/**
 * priceFeed.ts - Production-grade BTC price feed aggregator
 *
 * Features:
 * - Multi-venue WebSocket ingestion (Coinbase + Kraken)
 * - Automatic failover and reconnection with exponential backoff
 * - Staleness detection (>2s = stale)
 * - Outlier rejection (>50bps deviation from median)
 * - 1Hz canonical output with per-second OHLC
 * - EWMA volatility computation
 */

// ============ TYPES ============

export type FeedStatus = 'CONNECTING' | 'CONNECTED' | 'STALE' | 'DISCONNECTED' | 'SUSPECT';
export type PriceQuality = 'MID' | 'LAST' | 'STALE';
export type OverallStatus = 'OK' | 'DEGRADED' | 'PAUSED';

export interface FeedDiagnostic {
  name: string;
  status: FeedStatus;
  lastMsgMsAgo: number;
  lastMid: number | null;
  lastTrade: number | null;
  reconnects: number;
}

export interface PriceTick {
  tsMs: number;
  status: 'OK' | 'DEGRADED';
  priceMid: number;
  source: string;
  quality: PriceQuality;
  high1s: number;
  low1s: number;
  sigma1s: number;
  feeds: FeedDiagnostic[];
}

export interface PausedTick {
  tsMs: number;
  status: 'PAUSED';
  reason: string;
  feeds: FeedDiagnostic[];
}

export type TickOutput = PriceTick | PausedTick;

interface FeedState {
  name: string;
  status: FeedStatus;
  lastMsgTs: number;
  lastMid: number | null;
  lastBid: number | null;
  lastAsk: number | null;
  lastTrade: number | null;
  reconnectAttempts: number;
  reconnectTimer: ReturnType<typeof setTimeout> | null;
  ws: WebSocket | null;
}

interface RawTick {
  ts: number;
  price: number;
  source: string;
}

interface SecondBar {
  tsSecond: number;
  open: number;
  high: number;
  low: number;
  close: number;
  ticks: number;
}

// ============ CONSTANTS ============

const STALE_THRESHOLD_MS = 2000;
const OUTLIER_BPS_THRESHOLD = 50; // 0.5% deviation = suspect
const RECONNECT_BASE_MS = 1000;
const RECONNECT_MAX_MS = 30000;
const EWMA_LAMBDA = 0.94;
const FALLBACK_SIGMA = 0.0002; // 0.02% per second fallback
const RAW_TICK_BUFFER_SECONDS = 10;

// ============ FEED CONFIGURATIONS ============

interface FeedConfig {
  name: string;
  url: string;
  subscribe: () => string;
  parse: (data: unknown) => { bid?: number; ask?: number; trade?: number } | null;
  heartbeatMs?: number;
}

const FEED_CONFIGS: FeedConfig[] = [
  {
    name: 'binance',
    url: 'wss://stream.binance.com:9443/ws/btcusdt@trade',
    subscribe: () => '', // Binance auto-subscribes via URL
    parse: (data: unknown) => {
      const msg = data as Record<string, unknown>;
      if (msg.e !== 'trade') return null;
      const trade = parseFloat(msg.p as string);
      if (isNaN(trade)) return null;
      return { trade, bid: trade, ask: trade };
    }
  },
  {
    name: 'coinbase',
    url: 'wss://ws-feed.exchange.coinbase.com',
    subscribe: () => JSON.stringify({
      type: 'subscribe',
      product_ids: ['BTC-USD'],
      channels: ['ticker']
    }),
    parse: (data: unknown) => {
      const msg = data as Record<string, unknown>;
      if (msg.type !== 'ticker') return null;
      const bid = parseFloat(msg.best_bid as string);
      const ask = parseFloat(msg.best_ask as string);
      const trade = parseFloat(msg.price as string);
      if (isNaN(bid) || isNaN(ask)) return null;
      return { bid, ask, trade: isNaN(trade) ? undefined : trade };
    }
  },
  {
    name: 'kraken',
    url: 'wss://ws.kraken.com',
    subscribe: () => JSON.stringify({
      event: 'subscribe',
      pair: ['XBT/USD'],
      subscription: { name: 'ticker' }
    }),
    parse: (data: unknown) => {
      // Kraken ticker format: [channelID, tickerData, "ticker", "XBT/USD"]
      if (!Array.isArray(data) || data.length < 2) return null;
      const ticker = data[1] as Record<string, unknown>;
      if (!ticker || typeof ticker !== 'object') return null;

      // Kraken ticker: a=[ask], b=[bid], c=[last trade]
      const askArr = ticker.a as string[];
      const bidArr = ticker.b as string[];
      const lastArr = ticker.c as string[];

      if (!askArr || !bidArr) return null;

      const bid = parseFloat(bidArr[0]);
      const ask = parseFloat(askArr[0]);
      const trade = lastArr ? parseFloat(lastArr[0]) : undefined;

      if (isNaN(bid) || isNaN(ask)) return null;
      return { bid, ask, trade: trade && !isNaN(trade) ? trade : undefined };
    },
    heartbeatMs: 30000 // Kraken requires ping every 30s
  },
  {
    name: 'bitstamp',
    url: 'wss://ws.bitstamp.net',
    subscribe: () => JSON.stringify({
      event: 'bts:subscribe',
      data: { channel: 'live_trades_btcusd' }
    }),
    parse: (data: unknown) => {
      const msg = data as Record<string, unknown>;
      if (msg.event !== 'trade') return null;
      const tradeData = msg.data as Record<string, unknown>;
      if (!tradeData) return null;
      const trade = parseFloat(tradeData.price as string);
      if (isNaN(trade)) return null;
      // Bitstamp only gives trades, not orderbook
      return { trade };
    }
  }
];

// ============ PRICE FEED CLASS ============

type TickCallback = (tick: TickOutput) => void;

class PriceFeed {
  feeds: Map<string, FeedState> = new Map();
  rawTicks: RawTick[] = [];
  secondBars: Map<number, SecondBar> = new Map();
  lastCanonicalPrice: number = 0;
  variance: number = FALLBACK_SIGMA * FALLBACK_SIGMA;
  _sigma1s: number = FALLBACK_SIGMA;
  warmupTicks: number = 0;
  subscribers: Set<TickCallback> = new Set();
  tickInterval: ReturnType<typeof setInterval> | null = null;
  running: boolean = false;
  lastEmittedSecond: number = 0;
  enabledFeeds: string[];

  constructor(enabledFeeds: string[] = ['binance', 'coinbase']) {
    this.enabledFeeds = enabledFeeds;
  }

  // ============ PUBLIC API ============

  start(): void {
    if (this.running) return;
    this.running = true;

    console.log('[PriceFeed] Starting with feeds:', this.enabledFeeds);

    // Initialize feed states
    for (const config of FEED_CONFIGS) {
      if (this.enabledFeeds.includes(config.name)) {
        this.feeds.set(config.name, {
          name: config.name,
          status: 'DISCONNECTED',
          lastMsgTs: 0,
          lastMid: null,
          lastBid: null,
          lastAsk: null,
          lastTrade: null,
          reconnectAttempts: 0,
          reconnectTimer: null,
          ws: null
        });
        this.connectFeed(config);
      }
    }

    // Start 1Hz tick emission
    this.tickInterval = setInterval(() => this.emitTick(), 1000);
  }

  stop(): void {
    this.running = false;

    // Close all WebSockets
    for (const [, state] of this.feeds) {
      if (state.ws) {
        state.ws.close();
        state.ws = null;
      }
      if (state.reconnectTimer) {
        clearTimeout(state.reconnectTimer);
        state.reconnectTimer = null;
      }
    }

    if (this.tickInterval) {
      clearInterval(this.tickInterval);
      this.tickInterval = null;
    }

    console.log('[PriceFeed] Stopped');
  }

  subscribe(callback: TickCallback): () => void {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  getLatestPrice(): number | null {
    return this.lastCanonicalPrice > 0 ? this.lastCanonicalPrice : null;
  }

  getSigma1s(): number {
    return this._sigma1s;
  }

  getStatus(): OverallStatus {
    const validFeeds = this.getValidFeeds();
    if (validFeeds.length === 0) return 'PAUSED';
    if (validFeeds.length < this.enabledFeeds.length) return 'DEGRADED';
    return 'OK';
  }

  getDiagnostics(): FeedDiagnostic[] {
    const now = Date.now();
    return Array.from(this.feeds.values()).map(f => ({
      name: f.name,
      status: f.status,
      lastMsgMsAgo: f.lastMsgTs > 0 ? now - f.lastMsgTs : Infinity,
      lastMid: f.lastMid,
      lastTrade: f.lastTrade,
      reconnects: f.reconnectAttempts
    }));
  }

  // Get per-second min/max for barrier crossing detection
  getSecondBar(tsSecond: number): SecondBar | null {
    return this.secondBars.get(tsSecond) || null;
  }

  getRecentBars(count: number = 60): SecondBar[] {
    const bars = Array.from(this.secondBars.values());
    bars.sort((a, b) => b.tsSecond - a.tsSecond);
    return bars.slice(0, count);
  }

  // ============ WEBSOCKET MANAGEMENT ============

connectFeed(config: FeedConfig): void {
    const state = this.feeds.get(config.name);
    if (!state || !this.running) return;

    state.status = 'CONNECTING';
    console.log(`[PriceFeed] Connecting to ${config.name}...`);

    try {
      const ws = new WebSocket(config.url);
      state.ws = ws;

      ws.onopen = () => {
        console.log(`[PriceFeed] ${config.name} connected`);
        state.status = 'CONNECTED';
        state.reconnectAttempts = 0;
        
        // Only send subscribe message if not empty (Binance uses URL-based subscription)
        const subMsg = config.subscribe();
        if (subMsg) {
          ws.send(subMsg);
        }

        // Setup heartbeat if needed
        if (config.heartbeatMs) {
          const pingInterval = setInterval(() => {
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({ event: 'ping' }));
            } else {
              clearInterval(pingInterval);
            }
          }, config.heartbeatMs);
        }
      };

      ws.onmessage = (event) => {
        this.handleMessage(config, event.data);
      };

      ws.onerror = (error) => {
        console.error(`[PriceFeed] ${config.name} error:`, error);
      };

      ws.onclose = (event) => {
        console.log(`[PriceFeed] ${config.name} disconnected (code: ${event.code})`);
        state.status = 'DISCONNECTED';
        state.ws = null;
        this.scheduleReconnect(config, state);
      };

    } catch (error) {
      console.error(`[PriceFeed] ${config.name} connection failed:`, error);
      state.status = 'DISCONNECTED';
      this.scheduleReconnect(config, state);
    }
  }

handleMessage(config: FeedConfig, data: string): void {
    const state = this.feeds.get(config.name);
    if (!state) return;

    try {
      const parsed = JSON.parse(data);

      // Handle Kraken system messages
      if (parsed.event === 'heartbeat' || parsed.event === 'pong') return;
      if (parsed.event === 'systemStatus' || parsed.event === 'subscriptionStatus') {
        console.log(`[PriceFeed] ${config.name}:`, parsed.event, parsed.status || '');
        return;
      }

      const priceData = config.parse(parsed);
      if (!priceData) return;

      const now = Date.now();
      state.lastMsgTs = now;
      state.status = 'CONNECTED';

      // Update bid/ask/trade
      if (priceData.bid !== undefined) state.lastBid = priceData.bid;
      if (priceData.ask !== undefined) state.lastAsk = priceData.ask;
      if (priceData.trade !== undefined) state.lastTrade = priceData.trade;

      // Compute mid price
      if (state.lastBid && state.lastAsk) {
        state.lastMid = (state.lastBid + state.lastAsk) / 2;
      } else if (priceData.trade) {
        state.lastMid = priceData.trade;
      }

      // Store raw tick for OHLC
      if (state.lastMid) {
        this.addRawTick(now, state.lastMid, config.name);
      }

    } catch (error) {
      // Ignore parse errors for non-JSON messages
    }
  }

scheduleReconnect(config: FeedConfig, state: FeedState): void {
    if (!this.running) return;

    state.reconnectAttempts++;
    const delay = Math.min(
      RECONNECT_BASE_MS * Math.pow(2, state.reconnectAttempts - 1) + Math.random() * 1000,
      RECONNECT_MAX_MS
    );

    console.log(`[PriceFeed] ${config.name} reconnecting in ${Math.round(delay)}ms (attempt ${state.reconnectAttempts})`);

    state.reconnectTimer = setTimeout(() => {
      state.reconnectTimer = null;
      this.connectFeed(config);
    }, delay);
  }

  // ============ TICK PROCESSING ============

addRawTick(ts: number, price: number, source: string): void {
    // Add to raw buffer
    this.rawTicks.push({ ts, price, source });

    // Prune old ticks
    const cutoff = ts - RAW_TICK_BUFFER_SECONDS * 1000;
    this.rawTicks = this.rawTicks.filter(t => t.ts > cutoff);

    // Update second bar
    const tsSecond = Math.floor(ts / 1000);
    let bar = this.secondBars.get(tsSecond);

    if (!bar) {
      bar = {
        tsSecond,
        open: price,
        high: price,
        low: price,
        close: price,
        ticks: 1
      };
      this.secondBars.set(tsSecond, bar);
    } else {
      bar.high = Math.max(bar.high, price);
      bar.low = Math.min(bar.low, price);
      bar.close = price;
      bar.ticks++;
    }

    // Prune old bars
    const barCutoff = tsSecond - 120; // Keep 2 minutes
    for (const [key] of this.secondBars) {
      if (key < barCutoff) this.secondBars.delete(key);
    }
  }

updateStaleness(): void {
    const now = Date.now();

    for (const [name, state] of this.feeds) {
      if (state.status === 'CONNECTED') {
        if (state.lastMsgTs > 0 && now - state.lastMsgTs > STALE_THRESHOLD_MS) {
          console.log(`[PriceFeed] ${name} became STALE (no data for ${now - state.lastMsgTs}ms)`);
          state.status = 'STALE';
        }
      }
    }
  }

getValidFeeds(): FeedState[] {
    return Array.from(this.feeds.values()).filter(
      f => f.status === 'CONNECTED' && f.lastMid !== null
    );
  }

detectOutliers(feeds: FeedState[]): FeedState[] {
    if (feeds.length < 2) return feeds;

    // Get median price
    const prices = feeds.map(f => f.lastMid!).sort((a, b) => a - b);
    const median = prices[Math.floor(prices.length / 2)];

    // Filter outliers
    return feeds.filter(f => {
      const deviation = Math.abs(f.lastMid! - median) / median;
      const bps = deviation * 10000;

      if (bps > OUTLIER_BPS_THRESHOLD) {
        console.log(`[PriceFeed] ${f.name} marked SUSPECT: ${f.lastMid} deviates ${bps.toFixed(1)}bps from median ${median}`);
        f.status = 'SUSPECT';
        return false;
      }
      return true;
    });
  }

computeCanonicalPrice(validFeeds: FeedState[]): { price: number; source: string; quality: PriceQuality } | null {
    if (validFeeds.length === 0) return null;

    // Prefer MID prices, fall back to LAST
    const midFeeds = validFeeds.filter(f => f.lastBid && f.lastAsk);

    if (midFeeds.length > 0) {
      // Average of mid prices from feeds with bid/ask
      const avgMid = midFeeds.reduce((sum, f) => sum + f.lastMid!, 0) / midFeeds.length;
      return {
        price: avgMid,
        source: midFeeds.map(f => f.name).join('+'),
        quality: 'MID'
      };
    }

    // Fall back to last trade
    const tradeFeeds = validFeeds.filter(f => f.lastTrade);
    if (tradeFeeds.length > 0) {
      const avgTrade = tradeFeeds.reduce((sum, f) => sum + f.lastTrade!, 0) / tradeFeeds.length;
      return {
        price: avgTrade,
        source: tradeFeeds.map(f => f.name).join('+'),
        quality: 'LAST'
      };
    }

    return null;
  }

updateVolatility(newPrice: number): void {
    if (this.lastCanonicalPrice > 0 && newPrice > 0) {
      const logReturn = Math.log(newPrice / this.lastCanonicalPrice);
      this.variance = EWMA_LAMBDA * this.variance + (1 - EWMA_LAMBDA) * logReturn * logReturn;
      this._sigma1s = Math.sqrt(this.variance);

      // Clamp to reasonable range
      this._sigma1s = Math.max(0.00005, Math.min(0.01, this._sigma1s));
      this.warmupTicks++;
    }
  }

getCurrentSecondBar(): { high: number; low: number } {
    const currentSecond = Math.floor(Date.now() / 1000);
    const bar = this.secondBars.get(currentSecond);

    if (bar) {
      return { high: bar.high, low: bar.low };
    }

    // Fall back to last canonical price
    const price = this.lastCanonicalPrice || 0;
    return { high: price, low: price };
  }

emitTick(): void {
    const now = Date.now();
    const currentSecond = Math.floor(now / 1000);

    // Prevent double emission in same second
    if (currentSecond === this.lastEmittedSecond) return;
    this.lastEmittedSecond = currentSecond;

    // Update staleness
    this.updateStaleness();

    // Get valid feeds
    let validFeeds = this.getValidFeeds();

    // Detect and remove outliers
    validFeeds = this.detectOutliers(validFeeds);

    // Build diagnostics
    const feedDiagnostics: FeedDiagnostic[] = this.getDiagnostics();

    // Compute canonical price
    const canonical = this.computeCanonicalPrice(validFeeds);

    if (!canonical) {
      // All feeds stale - emit PAUSED
      const pausedTick: PausedTick = {
        tsMs: now,
        status: 'PAUSED',
        reason: 'ALL_FEEDS_STALE',
        feeds: feedDiagnostics
      };
      this.broadcast(pausedTick);
      return;
    }

    // Update volatility
    this.updateVolatility(canonical.price);
    this.lastCanonicalPrice = canonical.price;

    // Get high/low for this second
    const { high, low } = this.getCurrentSecondBar();

    // Determine overall status
    const status = validFeeds.length < this.enabledFeeds.length ? 'DEGRADED' : 'OK';

    const tick: PriceTick = {
      tsMs: now,
      status,
      priceMid: canonical.price,
      source: canonical.source,
      quality: canonical.quality,
      high1s: high || canonical.price,
      low1s: low || canonical.price,
      sigma1s: this.warmupTicks >= 10 ? this._sigma1s : FALLBACK_SIGMA,
      feeds: feedDiagnostics
    };

    this.broadcast(tick);
  }

broadcast(tick: TickOutput): void {
    for (const callback of this.subscribers) {
      try {
        callback(tick);
      } catch (error) {
        console.error('[PriceFeed] Subscriber error:', error);
      }
    }
  }
}

// ============ SINGLETON INSTANCE ============

let instance: PriceFeed | null = null;

export function getPriceFeed(): PriceFeed {
  if (!instance) {
    instance = new PriceFeed(['coinbase', 'kraken']);
  }
  return instance;
}

export function startPriceFeed(feeds?: string[]): PriceFeed {
  if (instance) {
    instance.stop();
  }
  instance = new PriceFeed(feeds || ['coinbase', 'kraken']);
  instance.start();
  return instance;
}

export function stopPriceFeed(): void {
  if (instance) {
    instance.stop();
    instance = null;
  }
}

// ============ REACT HOOK ============

import { useState, useEffect, useRef } from 'react';

export interface UsePriceFeedResult {
  price: number | null;
  status: OverallStatus;
  sigma1s: number;
  high1s: number;
  low1s: number;
  source: string;
  quality: PriceQuality | null;
  feeds: FeedDiagnostic[];
  isPaused: boolean;
}

export function usePriceFeed(): UsePriceFeedResult {
  const [state, setState] = useState<UsePriceFeedResult>({
    price: null,
    status: 'PAUSED',
    sigma1s: FALLBACK_SIGMA,
    high1s: 0,
    low1s: 0,
    source: '',
    quality: null,
    feeds: [],
    isPaused: true
  });

  const feedRef = useRef<PriceFeed | null>(null);

  useEffect(() => {
    // Start feed on mount
    const feed = startPriceFeed(['coinbase', 'kraken']);
    feedRef.current = feed;

    const unsubscribe = feed.subscribe((tick) => {
      if (tick.status === 'PAUSED') {
        setState(prev => ({
          ...prev,
          status: 'PAUSED',
          feeds: tick.feeds,
          isPaused: true
        }));
      } else {
        setState({
          price: tick.priceMid,
          status: tick.status,
          sigma1s: tick.sigma1s,
          high1s: tick.high1s,
          low1s: tick.low1s,
          source: tick.source,
          quality: tick.quality,
          feeds: tick.feeds,
          isPaused: false
        });
      }
    });

    return () => {
      unsubscribe();
      stopPriceFeed();
    };
  }, []);

  return state;
}

// ============ TEST/MOCK MODE ============

export class MockPriceFeed {
  subscribers: Set<TickCallback> = new Set();
  interval: ReturnType<typeof setInterval> | null = null;
  basePrice: number = 92000;
  variance: number = 0.0002 * 0.0002;
  _sigma1s: number = 0.0002;
  lastPrice: number = 92000;
  disconnectedFeeds: Set<string> = new Set();

  start(): void {
    console.log('[MockPriceFeed] Starting simulation...');

    this.interval = setInterval(() => {
      // Simulate random walk
      const drift = (Math.random() - 0.5) * 0.0004 * this.basePrice;
      this.basePrice += drift;

      // Update volatility
      if (this.lastPrice > 0) {
        const logReturn = Math.log(this.basePrice / this.lastPrice);
        this.variance = 0.94 * this.variance + 0.06 * logReturn * logReturn;
        this._sigma1s = Math.sqrt(this.variance);
      }
      this.lastPrice = this.basePrice;

      // Build feed diagnostics
      const feeds: FeedDiagnostic[] = [
        {
          name: 'coinbase',
          status: this.disconnectedFeeds.has('coinbase') ? 'DISCONNECTED' : 'CONNECTED',
          lastMsgMsAgo: this.disconnectedFeeds.has('coinbase') ? 5000 : 100,
          lastMid: this.disconnectedFeeds.has('coinbase') ? null : this.basePrice,
          lastTrade: this.basePrice,
          reconnects: 0
        },
        {
          name: 'kraken',
          status: this.disconnectedFeeds.has('kraken') ? 'DISCONNECTED' : 'CONNECTED',
          lastMsgMsAgo: this.disconnectedFeeds.has('kraken') ? 5000 : 150,
          lastMid: this.disconnectedFeeds.has('kraken') ? null : this.basePrice * (1 + (Math.random() - 0.5) * 0.0001),
          lastTrade: this.basePrice,
          reconnects: 0
        }
      ];

      const activeFeeds = feeds.filter(f => f.status === 'CONNECTED');

      if (activeFeeds.length === 0) {
        // All feeds disconnected
        const pausedTick: PausedTick = {
          tsMs: Date.now(),
          status: 'PAUSED',
          reason: 'ALL_FEEDS_STALE',
          feeds
        };
        this.broadcast(pausedTick);
      } else {
        const tick: PriceTick = {
          tsMs: Date.now(),
          status: activeFeeds.length < 2 ? 'DEGRADED' : 'OK',
          priceMid: this.basePrice,
          source: activeFeeds.map(f => f.name).join('+'),
          quality: 'MID',
          high1s: this.basePrice + Math.random() * 10,
          low1s: this.basePrice - Math.random() * 10,
          sigma1s: this._sigma1s,
          feeds
        };
        this.broadcast(tick);
      }
    }, 1000);
  }

  stop(): void {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  subscribe(callback: TickCallback): () => void {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  // Test helpers
  simulateFeedDisconnect(feedName: string): void {
    console.log(`[MockPriceFeed] Simulating ${feedName} disconnect`);
    this.disconnectedFeeds.add(feedName);
  }

  simulateFeedReconnect(feedName: string): void {
    console.log(`[MockPriceFeed] Simulating ${feedName} reconnect`);
    this.disconnectedFeeds.delete(feedName);
  }

  simulateAllDisconnect(): void {
    this.disconnectedFeeds.add('coinbase');
    this.disconnectedFeeds.add('kraken');
  }

  simulateAllReconnect(): void {
    this.disconnectedFeeds.clear();
  }

broadcast(tick: TickOutput): void {
    for (const callback of this.subscribers) {
      try {
        callback(tick);
      } catch (error) {
        console.error('[MockPriceFeed] Subscriber error:', error);
      }
    }
  }
}

// Export for testing
export { PriceFeed };
