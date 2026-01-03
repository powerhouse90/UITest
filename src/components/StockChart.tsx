import { useEffect, useRef, useState, useCallback } from 'react';
import { Zap, Flame, Trophy, Radio } from 'lucide-react';
import type { ChartData, MemeToken } from '../types';
import './StockChart.css';

interface StockChartProps {
  data: ChartData[];
  token: MemeToken;
}

interface TapBox {
  id: string;
  priceMin: number;
  priceMax: number;
  timeStart: number; // Absolute timestamp when box starts
  timeEnd: number;   // Absolute timestamp when box ends
  multiplier: number;
  amount: number;
  row: number;
  col: number;
}

const GRID_ROWS = 8;
const GRID_COLS = 12;
const BOX_DURATION = 3000; // Each box spans 3 seconds
const VISIBLE_FUTURE_MS = 36000; // Show 36 seconds into future

export function StockChart({ data, token }: StockChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Mode state
  const [liveMode, setLiveMode] = useState(false);
  const [tapMode, setTapMode] = useState(false);
  
  // Price state
  const [priceHistory, setPriceHistory] = useState<{time: number, price: number}[]>([]);
  const [currentPrice, setCurrentPrice] = useState(token.price);
  const [priceRange, setPriceRange] = useState({ min: token.price * 0.95, max: token.price * 1.05 });
  
  // Tap trading state
  const [activeBets, setActiveBets] = useState<TapBox[]>([]);
  const [betAmount, setBetAmount] = useState(10);
  const [streak, setStreak] = useState(0);
  const [totalPnL, setTotalPnL] = useState(0);
  const [results, setResults] = useState<{won: boolean, payout: number}[]>([]);
  
  // Current time for animation
  const [now, setNow] = useState(() => Date.now());

  const isPositive = token.priceChangePercent24h >= 0;

  // Initialize price history from data
  useEffect(() => {
    if (data.length > 0) {
      const currentTime = Date.now();
      const history = data.slice(-100).map((d, i) => ({
        time: currentTime - (100 - i) * 1000,
        price: d.value
      }));
      setPriceHistory(history);
      setCurrentPrice(data[data.length - 1].value);
    }
  }, [data]);

  // Animation loop - updates every frame for smooth scrolling
  useEffect(() => {
    let animationId: number;
    
    const animate = () => {
      setNow(Date.now());
      animationId = requestAnimationFrame(animate);
    };
    
    if (liveMode || tapMode) {
      animationId = requestAnimationFrame(animate);
    }
    
    return () => cancelAnimationFrame(animationId);
  }, [liveMode, tapMode]);

  // LIVE MODE - Update price every second
  useEffect(() => {
    if (!liveMode) return;

    const interval = setInterval(() => {
      const currentTime = Date.now();
      
      setCurrentPrice(prev => {
        const change = prev * 0.003 * (Math.random() - 0.5) * 2;
        const newPrice = Math.max(prev * 0.8, Math.min(prev * 1.2, prev + change));
        
        setPriceHistory(h => {
          const updated = [...h, { time: currentTime, price: newPrice }].slice(-200);
          
          const recentPrices = updated.slice(-80).map(p => p.price);
          const min = Math.min(...recentPrices) * 0.98;
          const max = Math.max(...recentPrices) * 1.02;
          setPriceRange({ min, max });
          
          return updated;
        });
        
        return newPrice;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [liveMode]);

  // Check bet outcomes - when box scrolls past NOW line
  useEffect(() => {
    if (!tapMode) return;

    setActiveBets(prev => {
      const stillActive: TapBox[] = [];
      const expired: TapBox[] = [];
      
      prev.forEach(bet => {
        if (now >= bet.timeEnd) {
          expired.push(bet);
        } else {
          stillActive.push(bet);
        }
      });

      expired.forEach(bet => {
        const won = currentPrice >= bet.priceMin && currentPrice <= bet.priceMax;
        const payout = won ? bet.amount * bet.multiplier : 0;
        
        setResults(r => [...r.slice(-4), { won, payout: won ? payout - bet.amount : -bet.amount }]);
        setTotalPnL(p => p + (won ? payout - bet.amount : -bet.amount));
        setStreak(s => won ? s + 1 : 0);
      });

      return stillActive;
    });
  }, [now, currentPrice, tapMode]);

  // Calculate multiplier based on distance from current price
  const getMultiplier = useCallback((priceMid: number) => {
    const distPct = Math.abs(priceMid - currentPrice) / currentPrice * 100;
    
    if (distPct > 4) return 30;
    if (distPct > 3) return 18;
    if (distPct > 2.5) return 12;
    if (distPct > 2) return 8;
    if (distPct > 1.5) return 5;
    if (distPct > 1) return 3;
    if (distPct > 0.5) return 2;
    return 1.5;
  }, [currentPrice]);

  // Handle tap on grid cell
  const handleTap = (row: number, col: number) => {
    const range = priceRange.max - priceRange.min;
    const rowHeight = range / GRID_ROWS;
    const priceMax = priceRange.max - row * rowHeight;
    const priceMin = priceMax - rowHeight;
    const priceMid = (priceMin + priceMax) / 2;
    const multiplier = getMultiplier(priceMid);
    
    // Box time is fixed in the future based on column
    const timeStart = now + col * BOX_DURATION;
    const timeEnd = timeStart + BOX_DURATION;

    const bet: TapBox = {
      id: `${now}-${row}-${col}`,
      priceMin,
      priceMax,
      timeStart,
      timeEnd,
      multiplier,
      amount: betAmount,
      row,
      col,
    };
    
    setActiveBets(prev => [...prev, bet]);
  };

  // Draw canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || priceHistory.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;

    // Clear
    ctx.clearRect(0, 0, width, height);

    // Layout: NOW line at 25% from left
    const nowX = width * 0.25;
    const chartPadding = { top: 10, bottom: 35, left: 5, right: 50 };
    const chartHeight = height - chartPadding.top - chartPadding.bottom;
    const chartWidth = width - chartPadding.left - chartPadding.right;

    // Time scale: pixels per millisecond
    const pxPerMs = chartWidth / (VISIBLE_FUTURE_MS + 30000); // 30s past + 36s future

    const priceToY = (price: number) => {
      const pct = (priceRange.max - price) / (priceRange.max - priceRange.min);
      return chartPadding.top + pct * chartHeight;
    };

    const timeToX = (time: number) => {
      const msFromNow = time - now;
      return nowX + msFromNow * pxPerMs;
    };

    // Draw horizontal grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= GRID_ROWS; i++) {
      const y = chartPadding.top + (i / GRID_ROWS) * chartHeight;
      ctx.beginPath();
      ctx.moveTo(chartPadding.left, y);
      ctx.lineTo(width - chartPadding.right, y);
      ctx.stroke();
    }

    // Draw vertical grid lines (time divisions)
    for (let i = 0; i <= GRID_COLS; i++) {
      const futureTime = now + i * BOX_DURATION;
      const x = timeToX(futureTime);
      if (x > nowX && x < width - chartPadding.right) {
        ctx.beginPath();
        ctx.moveTo(x, chartPadding.top);
        ctx.lineTo(x, height - chartPadding.bottom);
        ctx.stroke();
      }
    }

    // Draw price line
    if (priceHistory.length > 1) {
      // Area fill
      ctx.beginPath();
      let started = false;
      
      priceHistory.forEach((point) => {
        const x = timeToX(point.time);
        const y = priceToY(point.price);
        
        if (x >= chartPadding.left && x <= nowX + 10) {
          if (!started) {
            ctx.moveTo(x, height - chartPadding.bottom);
            ctx.lineTo(x, y);
            started = true;
          } else {
            ctx.lineTo(x, y);
          }
        }
      });
      
      if (started) {
        ctx.lineTo(nowX, priceToY(currentPrice));
        ctx.lineTo(nowX, height - chartPadding.bottom);
        ctx.closePath();
        ctx.fillStyle = 'rgba(0, 200, 5, 0.08)';
        ctx.fill();
      }

      // Line
      ctx.beginPath();
      ctx.strokeStyle = '#00c805';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      started = false;
      priceHistory.forEach((point) => {
        const x = timeToX(point.time);
        const y = priceToY(point.price);
        
        if (x >= chartPadding.left - 50 && x <= nowX + 10) {
          if (!started) {
            ctx.moveTo(x, y);
            started = true;
          } else {
            ctx.lineTo(x, y);
          }
        }
      });
      ctx.lineTo(nowX, priceToY(currentPrice));
      ctx.stroke();
    }

    // NOW vertical line
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(0, 200, 5, 0.5)';
    ctx.lineWidth = 2;
    ctx.setLineDash([]);
    ctx.moveTo(nowX, chartPadding.top);
    ctx.lineTo(nowX, height - chartPadding.bottom);
    ctx.stroke();

    // Current price dot
    const currentY = priceToY(currentPrice);
    
    ctx.beginPath();
    ctx.arc(nowX, currentY, 10, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 200, 5, 0.3)';
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(nowX, currentY, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#00c805';
    ctx.fill();

    // NOW label
    ctx.fillStyle = '#00c805';
    ctx.font = 'bold 10px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('NOW', nowX, height - chartPadding.bottom + 12);

    // Price labels
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = '9px system-ui';
    ctx.textAlign = 'right';
    for (let i = 0; i <= 4; i++) {
      const price = priceRange.max - (i / 4) * (priceRange.max - priceRange.min);
      const y = priceToY(price);
      ctx.fillText(`$${price.toFixed(6)}`, width - 5, y + 3);
    }

    // Future time labels
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.textAlign = 'center';
    for (let i = 1; i <= GRID_COLS; i++) {
      const futureTime = now + i * BOX_DURATION;
      const x = timeToX(futureTime);
      if (x > nowX && x < width - chartPadding.right - 20) {
        ctx.fillText(`${i * 3}s`, x, height - chartPadding.bottom + 12);
      }
    }

    // Draw TAPPED BOXES (they scroll with time!)
    if (tapMode) {
      activeBets.forEach(bet => {
        const x1 = timeToX(bet.timeStart);
        const x2 = timeToX(bet.timeEnd);
        const y1 = priceToY(bet.priceMax);
        const y2 = priceToY(bet.priceMin);
        
        // Only draw if visible
        if (x2 > chartPadding.left && x1 < width - chartPadding.right) {
          const boxX = Math.max(chartPadding.left, x1);
          const boxW = Math.min(x2, width - chartPadding.right) - boxX;
          
          // Box fill
          ctx.fillStyle = 'rgba(0, 200, 5, 0.25)';
          ctx.fillRect(boxX, y1, boxW, y2 - y1);
          
          // Box border
          ctx.strokeStyle = '#00c805';
          ctx.lineWidth = 2;
          ctx.strokeRect(boxX, y1, boxW, y2 - y1);
          
          // Multiplier text
          if (boxW > 30) {
            ctx.fillStyle = '#00c805';
            ctx.font = 'bold 12px system-ui';
            ctx.textAlign = 'center';
            ctx.fillText(`${bet.multiplier}x`, boxX + boxW / 2, y1 + (y2 - y1) / 2 + 4);
          }
        }
      });
    }
  }, [now, priceHistory, currentPrice, priceRange, tapMode, activeBets]);

  // Get row for current price
  const getCurrentPriceRow = () => {
    const range = priceRange.max - priceRange.min;
    const rowHeight = range / GRID_ROWS;
    return Math.min(GRID_ROWS - 1, Math.max(0, Math.floor((priceRange.max - currentPrice) / rowHeight)));
  };

  return (
    <div className={`stock-chart ${tapMode ? 'tap-active' : ''}`}>
      <div className="chart-header">
        <div className="chart-token-info">
          <span className="chart-token-image">{token.image}</span>
          <div className="chart-token-details">
            <h2 className="chart-token-name">{token.ticker}</h2>
            <span className="chart-token-fullname">{token.name}</span>
          </div>
        </div>
        <div className="chart-price-info">
          <span className="chart-price">${currentPrice.toFixed(8)}</span>
          <span className={`chart-change ${isPositive ? 'positive' : 'negative'}`}>
            {isPositive ? '+' : ''}{token.priceChangePercent24h.toFixed(2)}%
          </span>
        </div>
      </div>
      
      <div className="chart-controls">
        <div className="chart-timeframes">
          <button className="timeframe-btn">1H</button>
          <button className="timeframe-btn">4H</button>
          <button className="timeframe-btn active">24H</button>
          <button className="timeframe-btn">7D</button>
        </div>
        
        <div className="chart-mode-btns">
          <button 
            className={`live-mode-btn ${liveMode ? 'active' : ''}`}
            onClick={() => setLiveMode(!liveMode)}
          >
            <Radio size={14} />
            <span>LIVE</span>
          </button>
          
          <button 
            className={`tap-mode-btn ${tapMode ? 'active' : ''}`}
            onClick={() => {
              setTapMode(!tapMode);
              if (!tapMode && !liveMode) setLiveMode(true);
            }}
          >
            <Zap size={14} />
            <span>TAP TRADE</span>
          </button>
        </div>
      </div>

      {tapMode && (
        <div className="tap-stats-bar">
          <div className="tap-stat">
            <Flame size={14} className={streak > 0 ? 'fire' : ''} />
            <span>{streak} streak</span>
          </div>
          <div className="tap-stat">
            <Trophy size={14} />
            <span className={totalPnL >= 0 ? 'green' : 'red'}>
              {totalPnL >= 0 ? '+' : ''}${totalPnL.toFixed(0)}
            </span>
          </div>
          <div className="tap-stat">
            <span className="bets-count">{activeBets.length} active</span>
          </div>
          <div className="tap-bet-btns">
            {[5, 10, 25, 50].map(amt => (
              <button 
                key={amt} 
                className={`tap-bet-btn ${betAmount === amt ? 'active' : ''}`}
                onClick={() => setBetAmount(amt)}
              >
                ${amt}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="chart-wrapper" ref={containerRef}>
        <canvas ref={canvasRef} className="chart-canvas" />
        
        {/* TAP GRID OVERLAY - Covers future area, boxes placed here scroll with canvas */}
        {tapMode && (
          <div className="tap-grid-overlay">
            {Array.from({ length: GRID_ROWS * GRID_COLS }).map((_, idx) => {
              const row = Math.floor(idx / GRID_COLS);
              const col = idx % GRID_COLS;
              
              const range = priceRange.max - priceRange.min;
              const rowHeight = range / GRID_ROWS;
              const priceMax = priceRange.max - row * rowHeight;
              const priceMin = priceMax - rowHeight;
              const priceMid = (priceMin + priceMax) / 2;
              const multiplier = getMultiplier(priceMid);
              
              const currentRow = getCurrentPriceRow();
              const isAbove = row < currentRow;
              const isCurrent = row === currentRow;
              
              // Check if this cell already has a bet
              const hasBet = activeBets.some(b => {
                const betCol = Math.floor((b.timeStart - now) / BOX_DURATION);
                return b.row === row && betCol === col;
              });
              
              return (
                <button
                  key={`${row}-${col}`}
                  className={`tap-cell ${isAbove ? 'above' : 'below'} ${isCurrent ? 'current' : ''} ${hasBet ? 'has-bet' : ''} ${multiplier >= 18 ? 'legendary' : multiplier >= 8 ? 'epic' : multiplier >= 5 ? 'rare' : ''}`}
                  onClick={() => !hasBet && handleTap(row, col)}
                  disabled={hasBet}
                >
                  <span className="cell-mult">{multiplier}x</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {tapMode && results.length > 0 && (
        <div className="tap-results">
          {results.slice(-3).map((r, i) => (
            <div key={i} className={`tap-result ${r.payout >= 0 ? 'won' : 'lost'}`}>
              {r.payout >= 0 ? `+$${r.payout.toFixed(0)} 🎉` : `-$${Math.abs(r.payout).toFixed(0)} 💀`}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
