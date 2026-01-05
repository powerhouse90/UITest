import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, AlertTriangle, Wifi, WifiOff } from 'lucide-react';
import type { MemeToken } from '../types';
import { usePriceFeed } from '../lib/priceFeed';
import './TapTrading.css';

// ============ TYPES ============
interface TapTradingProps {
  token: MemeToken;
  onClose: () => void;
}

interface Bet {
  id: string;
  placedAt: number;
  scrollXAtPlacement: number; // smoothScrollX value when bet was placed - for synced positioning
  colIdxAtPlacement: number;  // Which column index the bet was placed on
  timeframe: View;
  startsAt: number;  // When the box starts (when to begin checking for touches)
  expiryAt: number;  // When the box ends (deadline for touch)
  direction: 'LONG' | 'SHORT';
  rowsAwayAtPlacement: number;
  priceAtPlacement: number;
  sigmaAtPlacement: number;
  rowSizePctAtPlacement: number;
  barrierLogB: number;
  targetPriceAbs: number;
  multiplierLocked: number;
  amount: number;
  status: 'open' | 'won' | 'lost';
  touchedAt?: number;
}

interface PricePoint {
  time: number;
  price: number;
}

// ============ CONSTANTS ============
const HOUSE_EDGE = 0.92;
const MAX_MULT = 100;
const MIN_PROB = HOUSE_EDGE / MAX_MULT;

const VISIBLE_ROWS = 9; // 4 above + center + 4 below
const CELL_WIDTH = 56;
const CELL_HEIGHT = 56;
const PRICE_LABEL_WIDTH = 80;
const TIME_HEADER_HEIGHT = 28;
const LEFT_BUFFER_COLS = 6; // Extra columns on left for slower fade-out effect

// Lockout: fixed seconds before NOW that are not bettable (prevents latency arbitrage)
// Only used for bet placement logic, NOT for visual display
const LOCKOUT_SECONDS = 2; // Reduced - just enough to prevent latency issues

type View = '5s' | '30s' | '1m';

// Timeframe configuration with target probability for outer row (4 away)
// Each mode: Δ (secondsPerBox) is the time to traverse one box completely
const TIMEFRAME_CONFIG: Record<View, {
  secondsPerBox: number; // Δ - time to traverse one box
  p4Target: number;      // Target touch probability for row 4 away within ONE box
}> = {
  '5s':  { secondsPerBox: 5,  p4Target: 0.05 },
  '30s': { secondsPerBox: 30, p4Target: 0.08 },
  '1m':  { secondsPerBox: 60, p4Target: 0.10 },
};

// ============ MATH FUNCTIONS ============

// Standard normal CDF using Abramowitz-Stegun approximation
function normCdf(x: number): number {
  const a1 = 0.319381530, a2 = -0.356563782, a3 = 1.781477937;
  const a4 = -1.821255978, a5 = 1.330274429, p = 0.2316419;
  const sign = x < 0 ? -1 : 1;
  const ax = Math.abs(x);
  const t = 1 / (1 + p * ax);
  const pdf = 0.3989422804014327 * Math.exp(-0.5 * ax * ax);
  const poly = ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t;
  const cdfPos = 1 - pdf * poly;
  return sign === 1 ? cdfPos : 1 - cdfPos;
}

// Inverse normal CDF (quantile function) using rational approximation
function normInvCdf(p: number): number {
  if (p <= 0) return -Infinity;
  if (p >= 1) return Infinity;
  if (p === 0.5) return 0;

  // Rational approximation for central region
  const a = [
    -3.969683028665376e+01, 2.209460984245205e+02,
    -2.759285104469687e+02, 1.383577518672690e+02,
    -3.066479806614716e+01, 2.506628277459239e+00
  ];
  const b = [
    -5.447609879822406e+01, 1.615858368580409e+02,
    -1.556989798598866e+02, 6.680131188771972e+01, -1.328068155288572e+01
  ];
  const c = [
    -7.784894002430293e-03, -3.223964580411365e-01,
    -2.400758277161838e+00, -2.549732539343734e+00,
    4.374664141464968e+00, 2.938163982698783e+00
  ];
  const d = [
    7.784695709041462e-03, 3.224671290700398e-01,
    2.445134137142996e+00, 3.754408661907416e+00
  ];

  const pLow = 0.02425, pHigh = 1 - pLow;
  let q: number, r: number;

  if (p < pLow) {
    q = Math.sqrt(-2 * Math.log(p));
    return (((((c[0]*q + c[1])*q + c[2])*q + c[3])*q + c[4])*q + c[5]) /
           ((((d[0]*q + d[1])*q + d[2])*q + d[3])*q + 1);
  } else if (p <= pHigh) {
    q = p - 0.5;
    r = q * q;
    return (((((a[0]*r + a[1])*r + a[2])*r + a[3])*r + a[4])*r + a[5])*q /
           (((((b[0]*r + b[1])*r + b[2])*r + b[3])*r + b[4])*r + 1);
  } else {
    q = Math.sqrt(-2 * Math.log(1 - p));
    return -(((((c[0]*q + c[1])*q + c[2])*q + c[3])*q + c[4])*q + c[5]) /
            ((((d[0]*q + d[1])*q + d[2])*q + d[3])*q + 1);
  }
}

// Compute row size percentage based on sigma and timeframe target
// Δ (secondsPerBox) is the reference time - we want p4Target probability at row 4 within Δ seconds
function computeRowSizePct(sigma1s: number, secondsPerBox: number, p4Target: number): number {
  // z4 = Φ^{-1}(1 - p4/2)
  const z4 = normInvCdf(1 - p4Target / 2);
  // b4 = z4 * sigma * sqrt(Δ)
  const b4 = z4 * sigma1s * Math.sqrt(secondsPerBox);
  // priceRangePct = exp(b4) - 1
  const priceRangePct = Math.exp(b4) - 1;
  // Each side has 4 rows
  const rowSizePct = priceRangePct / 4;
  // Clamp to reasonable bounds
  return Math.max(0.0001, Math.min(0.05, rowSizePct));
}

// First-passage touch probability (driftless Brownian)
// P_touch = 2 * (1 - Φ(b / (σ√T)))
function touchProb(distancePct: number, secondsLeft: number, sigma1s: number): number {
  if (distancePct <= 0) return 1;
  if (secondsLeft <= 0 || sigma1s <= 0) return 0;

  const b = Math.log(1 + Math.abs(distancePct));
  const z = b / (sigma1s * Math.sqrt(secondsLeft));
  const p = 2 * (1 - normCdf(z));

  return Math.max(0, Math.min(1, p));
}

// Get distance percentage for a given rowsAway value
// rowsAway=0 means "touch either edge of current band" (0.5 * rowSizePct)
function distancePctForRowsAway(rowsAway: number, rowSizePct: number): number {
  if (rowsAway === 0) {
    // "Same row" bet = touch either edge of current band
    return 0.5 * rowSizePct;
  }
  return Math.abs(rowsAway) * rowSizePct;
}

// Compute multiplier for a cell
function computeMultiplier(rowsAway: number, secondsLeft: number, sigma1s: number, rowSizePct: number): number {
  if (secondsLeft <= 0) return 0;

  const distancePct = distancePctForRowsAway(rowsAway, rowSizePct);
  const p = touchProb(distancePct, secondsLeft, sigma1s);
  const pEff = Math.max(p, MIN_PROB);
  const mult = HOUSE_EDGE / pEff;

  return Math.max(1.01, Math.min(MAX_MULT, Math.round(mult * 100) / 100));
}

// Cell opacity based on box index relative to NOW
// j: box offset from NOW (0=current box, 1=next, -1=past, etc.)
// tInBox: seconds elapsed in current box [0..secondsPerBox)
// Returns a CONTINUOUS opacity value - cells fade as they APPROACH NOW, gone by the time they hit it
function cellOpacity(j: number, tInBox: number, secondsPerBox: number): number {
  const progress = tInBox / secondsPerBox; // 0 at start of box, approaching 1 at end
  
  // Use fractional box position for smooth transitions
  // fractionalJ = how many boxes ahead of NOW this cell is
  const fractionalJ = j - progress;
  
  // Past boxes (behind NOW): completely invisible
  if (fractionalJ < 0) {
    return 0;
  }
  
  // Fade happens over 2 boxes BEFORE reaching NOW
  // At fractionalJ = 2+: full opacity (1.0)
  // At fractionalJ = 0: completely gone (0.0)
  // Linear fade over 2 boxes
  if (fractionalJ < 2) {
    return Math.min(1, fractionalJ / 2);
  }
  
  // Future boxes (2+ ahead): full opacity
  return 1.0;
}

// ============ COMPONENT ============
export function TapTrading({ onClose }: TapTradingProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  // Layout state
  const [containerWidth, setContainerWidth] = useState(1000);

  // Use real Bitcoin price feed (Binance + Coinbase)
  const priceFeed = usePriceFeed();
  const {
    price: currentPrice,
    sigma1s,
    high1s,
    low1s,
    status: feedStatus,
    isPaused,
    source: feedSource,
    feeds,
    quality: feedQuality,
  } = priceFeed;

  // Smoothed display price for UI
  const [displayPrice, setDisplayPrice] = useState(0);
  const [priceHistory, setPriceHistory] = useState<PricePoint[]>([]);

  // View state (only 5s, 30s, 1m available)
  const [view, setView] = useState<View>('5s');
  const [rowOffset, setRowOffset] = useState(0); // For vertical scrolling
  const [colOffset, setColOffset] = useState(0); // For horizontal scrolling (future columns)

  // Betting state
  const [bets, setBets] = useState<Bet[]>([]);
  const betsRef = useRef<Bet[]>([]); // Ref for RAF access to avoid stale closure
  const [betAmount, setBetAmount] = useState(10);
  const [totalPnL, setTotalPnL] = useState(0);
  const [showBetsPanel, setShowBetsPanel] = useState(false);

  // Animation refs
  const animationRef = useRef<number | null>(null);
  const priceHistoryRef = useRef<PricePoint[]>([]);
  const displayPriceRef = useRef<number>(0); // Track display price for settlement
  const rowSizePctRef = useRef<number>(0); // Track current rowSizePct for settlement
  const high1sRef = useRef<number>(0); // Track high price for settlement
  const low1sRef = useRef<number>(0); // Track low price for settlement
  const settledBetsRef = useRef<Set<string>>(new Set()); // Prevent duplicate settlements

  // Time origin for smooth auto-scroll
  const timeOriginRef = useRef<number>(Date.now());
  const [smoothScrollX, setSmoothScrollX] = useState(0); // Pixels to scroll left

  // Drag state
  const isDraggingRef = useRef(false);
  const dragStartYRef = useRef(0);
  const dragStartRowOffsetRef = useRef(0);

  // Get config for current view
  const config = TIMEFRAME_CONFIG[view];

  // Compute row size based on current sigma and timeframe
  // Uses Δ (secondsPerBox) as the reference time
  const rowSizePct = useMemo(() => {
    const pct = computeRowSizePct(sigma1s, config.secondsPerBox, config.p4Target);
    rowSizePctRef.current = pct; // Keep ref in sync for settlement
    return pct;
  }, [sigma1s, config.secondsPerBox, config.p4Target]);

  // Compute lockout boxes based on fixed LOCKOUT_SECONDS
  const lockoutBoxes = Math.ceil(LOCKOUT_SECONDS / config.secondsPerBox);

  // Grid dimensions
  const visibleCols = useMemo(() => {
    const availableWidth = containerWidth - PRICE_LABEL_WIDTH;
    return Math.max(10, Math.floor(availableWidth / CELL_WIDTH));
  }, [containerWidth]);

  const gridWidth = visibleCols * CELL_WIDTH;
  const gridHeight = VISIBLE_ROWS * CELL_HEIGHT;

  // NOW column is at ~33% from left
  const nowColIdx = Math.floor(visibleCols * 0.33);

  // ============ PRICE FEED UPDATES ============
  // Update price history when we get new prices from the feed
  useEffect(() => {
    if (currentPrice && currentPrice > 0) {
      const now = Date.now();

      // Initialize display price AND ref
      if (displayPrice === 0) {
        setDisplayPrice(currentPrice);
        displayPriceRef.current = currentPrice; // Initialize ref too!
      }

      // Update high/low refs for settlement (to catch price spikes)
      high1sRef.current = high1s || currentPrice;
      low1sRef.current = low1s || currentPrice;

      // Update price history (keep last 60 seconds)
      setPriceHistory(prev => {
        const cutoff = now - 60000;
        const filtered = prev.filter(p => p.time > cutoff);
        return [...filtered, { time: now, price: currentPrice }];
      });
      priceHistoryRef.current = [
        ...priceHistoryRef.current.filter(p => p.time > now - 60000),
        { time: now, price: currentPrice }
      ];
    }
  }, [currentPrice, displayPrice]);

  // ============ UNIFIED ANIMATION LOOP ============
  // Single RAF loop for all animations to prevent jitter/jolts
  useEffect(() => {
    const animate = () => {
      const now = Date.now();

      // Update smooth scroll position
      const elapsedSec = (now - timeOriginRef.current) / 1000;
      const pixelsToScroll = (elapsedSec / config.secondsPerBox) * CELL_WIDTH;
      setSmoothScrollX(pixelsToScroll);

      // Smooth price interpolation - calculate new price first
      let visualPrice = displayPriceRef.current;
      if (currentPrice && currentPrice !== 0) {
        // Initialize ref if it's still 0
        if (visualPrice === 0) {
          visualPrice = currentPrice;
        } else {
          visualPrice = visualPrice + (currentPrice - visualPrice) * 0.15;
        }
        displayPriceRef.current = visualPrice;
        setDisplayPrice(visualPrice);
      }

      // Check bet settlements using VISUAL displayPrice (matches what user sees)
      // Use betsRef to avoid stale closure issues with RAF
      const currentBets = betsRef.current;
      
      if (visualPrice !== 0 && currentBets.length > 0) {
        
        let pnlDelta = 0;
        const updatedBets = currentBets.map(bet => {
          // Already resolved bets just pass through to the filter
          if (bet.status !== 'open') {
            return bet;
          }
          
          // Prevent duplicate settlements for OPEN bets (React Strict Mode can call twice)
          if (settledBetsRef.current.has(bet.id)) return bet;

          // Calculate visual X position of bet (same formula as renderBetMarkers)
          const msUntilStart = bet.startsAt - now;
          const secondsUntilStart = msUntilStart / 1000;
          const boxesFromNow = secondsUntilStart / config.secondsPerBox;
          
          // Active when price dot is VISUALLY inside bet marker
          // Bet's LEFT edge reaches NOW line when boxesFromNow = 0.5
          // Bet's RIGHT edge leaves NOW line when boxesFromNow = -0.5
          // Only check for touches when dot is actually in the box!
          const boxIsActive = boxesFromNow <= 0.5 && boxesFromNow >= -0.5;
          const timeUntilExpiry = bet.expiryAt - now;

          // Calculate rows from center (same formula as visual)
          const currentRowSizePct = rowSizePctRef.current;
          if (currentRowSizePct === 0) return bet; // Safety check
          
          const targetPrice = bet.targetPriceAbs;
          const pctFromCenter = (targetPrice - visualPrice) / visualPrice;
          const rowsFromCenterFloat = pctFromCenter / currentRowSizePct;

          if (boxIsActive) {
            let touched = false;

            if (bet.rowsAwayAtPlacement === 0) {
              // Center row bet: the dot is ALWAYS at center row
              // When dot enters the box horizontally (boxIsActive), it's touching
              // The bet marker is at center, the dot is at center = they overlap
              touched = true; // Always touching when dot is in the box
            } else {
              // Directional bet: wins if rows is within touching distance
              if (bet.direction === 'LONG') {
                // LONG: target above center, wins when rows <= 1.0
                touched = rowsFromCenterFloat <= 1.0 && rowsFromCenterFloat >= -0.5;
              } else {
                // SHORT: target below center (negative rows), wins when rows >= -1.0
                touched = rowsFromCenterFloat >= -1.0 && rowsFromCenterFloat <= 0.5;
              }
            }

            if (touched) {
              settledBetsRef.current.add(bet.id);
              console.log(`🎉 BET WON! ${bet.direction} target=${targetPrice.toFixed(0)} payout=${(bet.amount * bet.multiplierLocked).toFixed(2)}`);
              pnlDelta += bet.amount * bet.multiplierLocked - bet.amount;
              return { ...bet, status: 'won' as const, touchedAt: now };
            }
          }

          // Check if bet has EXITED the box without winning (dot passed through)
          // This happens when boxesFromNow < -0.5 (dot has exited right edge of bet)
          if (boxesFromNow < -0.5) {
            settledBetsRef.current.add(bet.id);
            console.log(`❌ BET LOST! ${bet.direction} target=${targetPrice.toFixed(0)} - dot exited box`);
            pnlDelta -= bet.amount;
            return { ...bet, status: 'lost' as const, touchedAt: now };
          }

          return bet;
        });

        if (pnlDelta !== 0) {
          setTotalPnL(prev => prev + pnlDelta);
        }

        // Remove bets that have been resolved for more than 1.5 seconds (after animation)
        // Also clean up settledBetsRef when removing bets
        const finalBets = updatedBets.filter(bet => {
          if (bet.status === 'open') return true;
          
          const resolvedAt = bet.touchedAt || now;
          const age = now - resolvedAt;
          
          const keep = age < 1500;
          if (!keep) {
            settledBetsRef.current.delete(bet.id);
          }
          return keep;
        });
        
        // Update both ref and state
        betsRef.current = finalBets;
        setBets(finalBets);
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [currentPrice, config.secondsPerBox]);

  // Reset time origin when view changes
  useEffect(() => {
    timeOriginRef.current = Date.now();
    setSmoothScrollX(0);
    setColOffset(0);
  }, [view]);

  // ============ CANVAS CHART ============
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || displayPrice === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = gridWidth * dpr;
    canvas.height = gridHeight * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, gridWidth, gridHeight);

    const history = priceHistoryRef.current;
    if (history.length < 2) return;

    const now = Date.now();
    // Account for rowOffset so chart moves when user drags vertically
    const centerY = gridHeight / 2 - rowOffset * CELL_HEIGHT;
    // NOW position - FIXED visual position, never moves
    const nowVisualCol = nowColIdx - colOffset;
    const nowX = nowVisualCol * CELL_WIDTH + CELL_WIDTH / 2;

    // Draw price line
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(255, 215, 0, 0.8)';
    ctx.lineWidth = 2;

    let first = true;
    for (const point of history) {
      const secondsAgo = (now - point.time) / 1000;
      // Chart stays fixed, anchored to NOW position
      const x = nowX - (secondsAgo / config.secondsPerBox) * CELL_WIDTH;

      if (x < 0 || x > gridWidth) continue;

      // Convert price to Y position
      const pctFromCenter = (point.price - displayPrice) / displayPrice;
      const rowsFromCenter = pctFromCenter / rowSizePct;
      const y = centerY - rowsFromCenter * CELL_HEIGHT;

      if (first) {
        ctx.moveTo(x, y);
        first = false;
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();

    // Draw current price dot
    ctx.beginPath();
    ctx.fillStyle = '#FFD700';
    ctx.shadowColor = '#FFD700';
    ctx.shadowBlur = 10;
    ctx.arc(nowX, centerY, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

  }, [displayPrice, priceHistory, gridWidth, gridHeight, rowSizePct, config.secondsPerBox, nowColIdx, rowOffset, colOffset]);

  // ============ CONTAINER RESIZE ============
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth);
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // ============ DRAG HANDLERS ============
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    isDraggingRef.current = true;
    dragStartYRef.current = e.clientY;
    dragStartRowOffsetRef.current = rowOffset;
  }, [rowOffset]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;

    const deltaY = e.clientY - dragStartYRef.current;
    const rowsDelta = Math.round(deltaY / CELL_HEIGHT);
    const newOffset = Math.max(-20, Math.min(20, dragStartRowOffsetRef.current + rowsDelta));
    setRowOffset(newOffset);
  }, []);

  const handleMouseUp = useCallback(() => {
    isDraggingRef.current = false;
  }, []);

  // ============ SCROLL HANDLER ============
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    if (e.shiftKey) {
      // Horizontal scroll
      const colsDelta = Math.sign(e.deltaY);
      setColOffset(prev => Math.max(0, Math.min(100, prev + colsDelta)));
    } else {
      // Vertical scroll
      const rowsDelta = Math.sign(e.deltaY);
      setRowOffset(prev => Math.max(-20, Math.min(20, prev + rowsDelta)));
    }
  }, []);

  // ============ PLACE BET ============
  const placeBet = useCallback((rowsAway: number, secondsLeft: number, colIdx: number) => {
    if (secondsLeft <= 0 || displayPrice === 0) return;

    // For rowsAway=0 (center row), bet is "touch either edge"
    // Direction is determined by row position for non-zero rows
    // For center row, we'll use LONG but both edges trigger win
    const direction: 'LONG' | 'SHORT' = rowsAway <= 0 ? 'LONG' : 'SHORT';
    const absRowsAway = Math.abs(rowsAway);

    // Calculate target price using the new distancePctForRowsAway function
    const distancePct = distancePctForRowsAway(rowsAway, rowSizePct);
    const barrierLogB = Math.log(1 + distancePct);

    // For rowsAway=0, target is the edge of the band (either direction)
    // We'll store both edges for settlement
    const targetPriceAbs = direction === 'LONG'
      ? displayPrice * Math.exp(barrierLogB)
      : displayPrice * Math.exp(-barrierLogB);

    // Calculate multiplier
    const multiplier = computeMultiplier(rowsAway, secondsLeft, sigma1s, rowSizePct);
    if (multiplier <= 1) return;

    // Calculate when the box starts and ends
    // secondsLeft is time until box ENDS
    // Box duration is config.secondsPerBox
    // So box STARTS at (secondsLeft - config.secondsPerBox) from now
    const now = Date.now();
    const expiryAt = now + secondsLeft * 1000;
    const startsAt = expiryAt - config.secondsPerBox * 1000;
    
    // Calculate what boxesFromNow will be immediately after placement
    const initialBoxesFromNow = (startsAt - now) / 1000 / config.secondsPerBox;
    console.log(`🎯 PLACING: secondsLeft=${secondsLeft.toFixed(1)}s | boxes=${initialBoxesFromNow.toFixed(2)} (should match visual cell position)`);

    const bet: Bet = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      placedAt: now,
      scrollXAtPlacement: smoothScrollX, // Store scroll position for synced movement
      colIdxAtPlacement: colIdx,         // Store which column was clicked
      timeframe: view,
      startsAt,
      expiryAt,
      direction,
      rowsAwayAtPlacement: absRowsAway,
      priceAtPlacement: displayPrice,
      sigmaAtPlacement: sigma1s,
      rowSizePctAtPlacement: rowSizePct,
      barrierLogB,
      targetPriceAbs,
      multiplierLocked: multiplier,
      amount: betAmount,
      status: 'open',
    };

    // Update both ref and state when adding a bet
    betsRef.current = [...betsRef.current, bet];
    setBets(betsRef.current);
  }, [displayPrice, sigma1s, rowSizePct, view, betAmount, smoothScrollX, config.secondsPerBox]);

  // ============ GET CELL INFO ============
  // Calculate time into current box from smooth scroll
  const tInBox = (smoothScrollX % CELL_WIDTH) / CELL_WIDTH * config.secondsPerBox;

  const getCellInfo = useCallback((visualRowIdx: number, actualColIdx: number) => {
    // Visual row 0 is top, center is at VISIBLE_ROWS/2
    const centerVisualRow = Math.floor(VISIBLE_ROWS / 2);
    const rowsFromCenter = visualRowIdx - centerVisualRow + rowOffset;

    // Calculate box index (j) relative to NOW
    // scrolledCols tells us how many full columns have scrolled past
    const scrolledCols = Math.floor(smoothScrollX / CELL_WIDTH);
    // boxIndex j: 0 = current NOW box, 1 = next, -1 = past, etc.
    // The NOW column is at actual position (scrolledCols + nowColIdx)
    // So: boxIndex = actualColIdx - (scrolledCols + nowColIdx) + colOffset
    const nowActualColIdx = scrolledCols + nowColIdx;
    const boxIndex = actualColIdx - nowActualColIdx + colOffset;

    // Time until end of that box: T = (j+1) * colStepSec - tInBox
    const secondsLeft = (boxIndex + 1) * config.secondsPerBox - tInBox;

    // Determine if this is a bettable cell
    const isPast = boxIndex < 0;
    // Can bet on any future box (lockout only prevents immediate boxes for latency)
    const canBet = boxIndex >= lockoutBoxes && secondsLeft > 0;

    // Calculate multiplier for all non-past boxes
    const multiplier = !isPast && secondsLeft > 0 ? computeMultiplier(rowsFromCenter, secondsLeft, sigma1s, rowSizePct) : 0;

    // NOW cell is box 0 at center row
    const isNowCell = boxIndex === 0 && rowsFromCenter === 0;

    // Opacity for dimming past cells (smooth fade)
    const opacity = cellOpacity(boxIndex, tInBox, config.secondsPerBox);

    // Price at this row
    const pctFromCenter = -rowsFromCenter * rowSizePct;
    const priceAtRow = displayPrice * (1 + pctFromCenter);

    return { rowsFromCenter, secondsLeft, multiplier, isNowCell, isPast, canBet, priceAtRow, boxIndex, opacity };
  }, [rowOffset, colOffset, smoothScrollX, tInBox, nowColIdx, config.secondsPerBox, sigma1s, rowSizePct, displayPrice, lockoutBoxes]);

  // ============ RENDER BET MARKERS ============
  // Render bet markers as overlays positioned by absolute time (works across timeframes)
  // Bet markers are positioned absolutely in tap-grid, NOT inside the transformed tap-cells

  const renderBetMarkers = useMemo(() => {
    if (displayPrice === 0) return null;

    const now = Date.now();
    const currentSecondsPerBox = config.secondsPerBox;

    return bets
      .filter(bet => {
        // Show open bets, and recently resolved bets (for animation)
        if (bet.status === 'open') return true;
        // Show won/lost bets for 1.5 seconds after resolution
        const resolvedAt = bet.touchedAt || bet.expiryAt;
        return now - resolvedAt < 1500;
      })
      .map(bet => {
        // Calculate row position based on TARGET price (where the bet wins)
        const targetPrice = bet.rowsAwayAtPlacement === 0 
          ? bet.priceAtPlacement  // Center row: show at placement price
          : bet.targetPriceAbs;   // Directional: show at target price
        const pctFromCenter = (targetPrice - displayPrice) / displayPrice;
        // Match chart's Y calculation: positive pctFromCenter = above center
        const rowsFromCenterFloat = pctFromCenter / rowSizePct;
        // Higher price = negative Y direction (up on screen = lower row index)
        const visualRow = Math.floor(VISIBLE_ROWS / 2) - rowsFromCenterFloat - rowOffset;



        // Check if this bet is from a different timeframe
        const isHologram = bet.timeframe !== view;

        // Get the bet's original duration (from its timeframe)
        const betSecondsPerBox = TIMEFRAME_CONFIG[bet.timeframe].secondsPerBox;
        
        // Calculate the width of the bet marker in current view's scale
        // If bet was 5s and we're viewing 1min (60s), width = 5/60 * CELL_WIDTH
        const betWidthRatio = betSecondsPerBox / currentSecondsPerBox;
        const betWidth = Math.max(8, betWidthRatio * CELL_WIDTH - 2); // Minimum 8px width

        // Calculate position using ABSOLUTE TIME from NOW
        // The bet STARTS at startsAt and ENDS at expiryAt
        // Position the LEFT edge of the bet marker at startsAt
        const msUntilStart = bet.startsAt - now;
        const secondsUntilStart = msUntilStart / 1000;
        
        // Position = how many boxes ahead of NOW the bet starts
        // Positive = future (right of NOW), Negative = past (left of NOW)
        const boxesFromNow = secondsUntilStart / currentSecondsPerBox;
        
        // The visual position relative to FIXED NOW line
        // NOW line is at a fixed position, bet moves relative to time
        const nowX = (nowColIdx - colOffset) * CELL_WIDTH + CELL_WIDTH / 2;
        // Bet's left edge is boxesFromNow * CELL_WIDTH to the right of NOW
        const x = nowX + boxesFromNow * CELL_WIDTH - CELL_WIDTH / 2;
        const y = visualRow * CELL_HEIGHT;

        // Check if visible - extend left buffer for resolved bets to show animation
        if (visualRow < -0.5 || visualRow > VISIBLE_ROWS - 0.5) return null;
        const leftLimit = bet.status !== 'open' ? -CELL_WIDTH * 8 : -CELL_WIDTH * 2;
        if (x < leftLimit || x > gridWidth + CELL_WIDTH) return null;

        // Calculate opacity for bet markers
        // Resolved bets fade out over ~4 boxes as they scroll left
        let betOpacity = 1;
        if (bet.status !== 'open') {
          // For resolved bets, fade based on how far behind NOW they are
          // boxesFromNow is negative when behind NOW
          // Fade from 1 at NOW to 0 at 4 boxes behind
          betOpacity = Math.max(0, Math.min(1, 1 + boxesFromNow / 4));
        }

        // Determine status class for animations
        const statusClass = bet.status === 'won' ? 'won' : bet.status === 'lost' ? 'lost' : '';

        return (
          <div
            key={bet.id}
            className={`bet-marker ${bet.direction.toLowerCase()} ${isHologram ? 'hologram' : ''} ${statusClass}`}
            style={{
              left: x,
              top: y,
              width: betWidth,
              height: CELL_HEIGHT - 2,
              opacity: betOpacity,
            }}
          >
            {bet.status === 'won' ? (
              <>
                <span className="bet-marker-result">+${(bet.amount * bet.multiplierLocked - bet.amount).toFixed(2)}</span>
                <span className="bet-marker-win-text">WIN!</span>
              </>
            ) : bet.status === 'lost' ? (
              <>
                <span className="bet-marker-result">-${bet.amount.toFixed(2)}</span>
                <span className="bet-marker-loss-text">MISS</span>
              </>
            ) : (
              <>
                <span className="bet-marker-amount">${bet.amount}</span>
                <span className="bet-marker-mult">{bet.multiplierLocked.toFixed(2)}x</span>
                <span style={{ fontSize: '8px', color: '#888' }}>r:{rowsFromCenterFloat.toFixed(1)}</span>
                {isHologram && <span className="bet-marker-timeframe">{bet.timeframe}</span>}
              </>
            )}
          </div>
        );
      });
  }, [bets, displayPrice, rowSizePct, rowOffset, view, config.secondsPerBox, nowColIdx, colOffset, smoothScrollX, gridWidth]);

  // ============ LOCK BODY SCROLL ============
  useEffect(() => {
    const orig = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = orig; };
  }, []);

  // ============ RENDER ============
  return createPortal(
    <div className="tap-trading-modal-root">
      <div className="tap-trading-overlay" onClick={onClose}>
        <div className="tap-trading-fullscreen" onClick={e => e.stopPropagation()}>
          {/* Header */}
          <div className="tap-header">
            <div className="tap-token-info">
              <span className="tap-token-name">TOUCH TRADING</span>
              <span className="tap-token-ticker">BTC / USD</span>
            </div>

            {/* Timeframe tabs */}
            <div className="tap-timeframe-selector">
              {(Object.keys(TIMEFRAME_CONFIG) as View[]).map(tf => (
                <button
                  key={tf}
                  className={`tap-timeframe-btn ${view === tf ? 'active' : ''}`}
                  onClick={() => setView(tf)}
                >
                  {tf}
                </button>
              ))}
            </div>

            {/* Bet size */}
            <div className="tap-bet-size">
              <span>Bet:</span>
              <input
                type="number"
                value={betAmount}
                onChange={e => setBetAmount(Math.max(1, parseFloat(e.target.value) || 1))}
                min="1"
              />
            </div>

            {/* Status */}
            <div className="tap-status">
              <button
                className="tap-bets-btn"
                onClick={() => setShowBetsPanel(!showBetsPanel)}
              >
                Bets ({bets.filter(b => b.status === 'open').length})
              </button>

              {/* Feed Status Indicator */}
              <div className={`tap-feed-status ${feedStatus.toLowerCase()}`} title={`Source: ${feedSource || 'none'}`}>
                {isPaused ? (
                  <>
                    <WifiOff size={14} />
                    <span>PAUSED</span>
                  </>
                ) : feedStatus === 'DEGRADED' ? (
                  <>
                    <AlertTriangle size={14} />
                    <span>DEGRADED</span>
                  </>
                ) : (
                  <>
                    <Wifi size={14} />
                    <span>LIVE</span>
                  </>
                )}
              </div>

              {/* Feed Details Tooltip */}
              <div className="tap-feeds-info">
                {feeds.map(f => (
                  <div key={f.name} className={`feed-item ${f.status.toLowerCase()}`}>
                    <span className="feed-name">{f.name}</span>
                    <span className={`feed-dot ${f.status === 'CONNECTED' ? 'ok' : 'bad'}`} />
                  </div>
                ))}
              </div>

              <span className={`tap-pnl ${totalPnL >= 0 ? 'positive' : 'negative'}`}>
                {totalPnL >= 0 ? '+' : ''}{totalPnL.toFixed(2)}
              </span>
            </div>

            <button className="tap-close-btn" onClick={onClose}>
              <X size={24} />
            </button>
          </div>

          {/* Price display */}
          <div className={`tap-price-display ${isPaused ? 'paused' : ''}`}>
            {isPaused ? (
              <div className="tap-paused-message">
                <AlertTriangle size={24} />
                <span>Data feed paused - reconnecting...</span>
              </div>
            ) : (
              <>
                <span className="tap-current-price">${displayPrice.toFixed(2)}</span>
                <span className="tap-vol">
                  σ: {(sigma1s * 100).toFixed(4)}%/s
                  {feedQuality && <span className={`quality-badge ${feedQuality.toLowerCase()}`}>{feedQuality}</span>}
                </span>
              </>
            )}
          </div>

          {/* Main content */}
          <div className="tap-main-content" ref={containerRef}>
            {/* Price labels */}
            <div className="tap-price-labels" style={{ height: gridHeight }}>
              {[...Array(VISIBLE_ROWS + 1)].map((_, i) => {
                const centerRow = Math.floor(VISIBLE_ROWS / 2);
                const rowsFromCenter = i - centerRow + rowOffset;
                const pctFromCenter = -rowsFromCenter * rowSizePct;
                const price = displayPrice * (1 + pctFromCenter);
                return (
                  <div
                    key={i}
                    className="tap-price-label"
                    style={{ top: i * CELL_HEIGHT - 8 }}
                  >
                    ${price.toFixed(2)}
                  </div>
                );
              })}
            </div>

            {/* Grid wrapper */}
            <div
              className="tap-grid-wrapper"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onWheel={handleWheel}
            >
              {/* Time header - scrolls with grid, includes left buffer for fade-out */}
              <div
                className="tap-time-header"
                style={{
                  width: gridWidth + CELL_WIDTH * (LEFT_BUFFER_COLS + 2), // Extra width for scroll buffer + fade
                  height: TIME_HEADER_HEIGHT,
                  transform: `translateX(${-smoothScrollX % CELL_WIDTH - LEFT_BUFFER_COLS * CELL_WIDTH}px)`, // Offset for left buffer
                }}
              >
                {[...Array(visibleCols + LEFT_BUFFER_COLS + 2)].map((_, colIdx) => {
                  // Account for columns that have scrolled off, minus left buffer offset
                  const scrolledColsLocal = Math.floor(smoothScrollX / CELL_WIDTH);
                  const actualColIdx = colIdx + scrolledColsLocal - LEFT_BUFFER_COLS;

                  // Calculate boxIndex (j) relative to NOW
                  const nowActualColIdx = scrolledColsLocal + nowColIdx;
                  const boxIndex = actualColIdx - nowActualColIdx + colOffset;

                  // Time until end of box
                  const secondsLeft = (boxIndex + 1) * config.secondsPerBox - tInBox;

                  // Determine past state
                  const isPastCol = boxIndex < 0;
                  const isNowCol = boxIndex === 0;

                  // Apply same opacity as cells
                  const headerOpacity = cellOpacity(boxIndex, tInBox, config.secondsPerBox);

                  let label: string;
                  if (isNowCol) {
                    label = 'NOW';
                  } else if (isPastCol) {
                    label = `${Math.round(secondsLeft)}s`;
                  } else {
                    label = `+${Math.round(secondsLeft)}s`;
                  }
                  return (
                    <div
                      key={`header-${colIdx}`}
                      className={`tap-time-cell ${isNowCol ? 'live-col' : ''} ${isPastCol ? 'past' : ''}`}
                      style={{ left: colIdx * CELL_WIDTH, width: CELL_WIDTH, opacity: headerOpacity }}
                    >
                      {label}
                    </div>
                  );
                })}
              </div>

              {/* Grid with canvas overlay */}
              <div
                className="tap-grid"
                style={{ width: gridWidth, height: gridHeight }}
                ref={gridRef}
              >
                {/* Background gradient */}
                <div className="tap-grid-bg" />

                {/* Canvas for chart - pointer-events: none so clicks pass through */}
                <canvas
                  ref={canvasRef}
                  className="tap-chart-canvas"
                  style={{ width: gridWidth, height: gridHeight, pointerEvents: 'none' }}
                />

                {/* Grid cells - scrolls smoothly, includes left buffer for fade-out */}
                <div
                  className="tap-cells"
                  style={{
                    width: gridWidth + CELL_WIDTH * (LEFT_BUFFER_COLS + 2),
                    transform: `translateX(${-smoothScrollX % CELL_WIDTH - LEFT_BUFFER_COLS * CELL_WIDTH}px)`,
                  }}
                >
                  {[...Array(VISIBLE_ROWS)].map((_, visualRowIdx) => {
                    const scrolledCols = Math.floor(smoothScrollX / CELL_WIDTH);
                    return (
                      <div
                        key={`row-${visualRowIdx}`}
                        className="tap-row"
                        style={{ top: visualRowIdx * CELL_HEIGHT, height: CELL_HEIGHT }}
                      >
                        {[...Array(visibleCols + LEFT_BUFFER_COLS + 2)].map((_, colIdx) => {
                          // Adjust for left buffer offset
                          const actualColIdx = colIdx + scrolledCols - LEFT_BUFFER_COLS;
                          const { rowsFromCenter, secondsLeft, multiplier, isNowCell, isPast, canBet, opacity } = getCellInfo(visualRowIdx, actualColIdx);
                          const isLong = rowsFromCenter < 0;
                          const isCenterRow = rowsFromCenter === 0;

                          // Show multiplier for all non-past boxes, show '-' if can't bet (lockout)
                          let displayText: string;
                          if (isPast || opacity < 0.1) {
                            displayText = '';
                          } else if (multiplier > 1) {
                            displayText = `${multiplier.toFixed(2)}x`;
                          } else {
                            displayText = '-';
                          }

                          // Don't render bets inside cells - they're rendered as overlay markers
                          return (
                            <button
                              key={`col-${colIdx}-row-${visualRowIdx}`}
                              className={`tap-cell ${isLong ? 'long' : 'short'} ${isCenterRow ? 'center-row' : ''} ${isNowCell ? 'current-row' : ''} ${isPast ? 'past' : ''} ${!canBet && !isPast ? 'no-bet' : ''}`}
                              style={{
                                left: colIdx * CELL_WIDTH,
                                width: CELL_WIDTH,
                                height: CELL_HEIGHT,
                                opacity: opacity,
                              }}
                              onClick={() => canBet && placeBet(rowsFromCenter, secondsLeft, actualColIdx)}
                              disabled={!canBet}
                            >
                              <span className={`cell-mult ${isPast ? 'past' : ''}`}>
                                {displayText}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>

                {/* NOW vertical line - FIXED position, cells scroll past it */}
                {(() => {
                  const nowVisualCol = nowColIdx - colOffset;
                  const nowX = nowVisualCol * CELL_WIDTH + CELL_WIDTH / 2;
                  const isVisible = nowX >= 0 && nowX < gridWidth;
                  if (!isVisible) return null;
                  return (
                    <div
                      className="tap-now-line"
                      style={{ left: nowX }}
                    />
                  );
                })()}

                {/* LIVE marker - FIXED position with NOW line */}
                {(() => {
                  const nowVisualCol = nowColIdx - colOffset;
                  const nowX = nowVisualCol * CELL_WIDTH + CELL_WIDTH / 2;
                  const isVisible = nowX >= 0 && nowX < gridWidth;
                  if (!isVisible) return null;
                  return (
                    <div
                      className="tap-live-marker"
                      style={{
                        left: nowX,
                        top: gridHeight / 2 - rowOffset * CELL_HEIGHT,
                      }}
                    >
                      <span className="tap-live-label">LIVE</span>
                    </div>
                  );
                })()}
              </div>

              {/* Bet markers - positioned absolutely in grid wrapper to allow overflow */}
              <div 
                className="tap-bet-markers-container"
                style={{ 
                  position: 'absolute',
                  top: TIME_HEADER_HEIGHT,
                  left: 0,
                  width: gridWidth,
                  height: gridHeight,
                  pointerEvents: 'none',
                  overflow: 'visible',
                }}
              >
                {renderBetMarkers}
              </div>

              {/* Scroll indicators */}
              <div className="tap-scroll-indicators">
                {rowOffset > -20 && (
                  <button className="scroll-btn up" onClick={() => setRowOffset(r => r - 1)}>
                    <ChevronUp size={16} />
                  </button>
                )}
                {rowOffset < 20 && (
                  <button className="scroll-btn down" onClick={() => setRowOffset(r => r + 1)}>
                    <ChevronDown size={16} />
                  </button>
                )}
                {colOffset > 0 && (
                  <button className="scroll-btn left" onClick={() => setColOffset(c => c - 1)}>
                    <ChevronLeft size={16} />
                  </button>
                )}
                <button className="scroll-btn right" onClick={() => setColOffset(c => c + 1)}>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Bets Panel */}
          {showBetsPanel && (
            <div className="tap-bets-panel">
              <div className="bets-panel-header">
                <h3>Active Bets</h3>
                <button onClick={() => setShowBetsPanel(false)}>×</button>
              </div>
              <div className="bets-panel-content">
                {bets.filter(b => b.status === 'open').length === 0 ? (
                  <p className="no-bets">No active bets</p>
                ) : (
                  bets.filter(b => b.status === 'open').map(bet => {
                    const secsLeft = Math.max(0, Math.round((bet.expiryAt - Date.now()) / 1000));
                    return (
                      <div key={bet.id} className={`bet-item ${bet.direction.toLowerCase()}`}>
                        <div className="bet-item-header">
                          <span className={`bet-direction ${bet.direction.toLowerCase()}`}>
                            {bet.direction}
                          </span>
                          <span className="bet-timeframe">{bet.timeframe}</span>
                        </div>
                        <div className="bet-item-details">
                          <span>Target: ${bet.targetPriceAbs.toFixed(2)}</span>
                          <span>Mult: {bet.multiplierLocked.toFixed(2)}x</span>
                          <span>Time: {secsLeft}s</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
              <div className="bets-panel-history">
                <h4>Recent Results</h4>
                {bets.filter(b => b.status !== 'open').slice(-5).map(bet => (
                  <div key={bet.id} className={`bet-result ${bet.status}`}>
                    <span>{bet.direction} {bet.status === 'won' ? '✓' : '✗'}</span>
                    <span>{bet.status === 'won' ? `+$${(bet.amount * bet.multiplierLocked - bet.amount).toFixed(2)}` : `-$${bet.amount.toFixed(2)}`}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
