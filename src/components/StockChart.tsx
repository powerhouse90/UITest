import { useEffect, useRef, useState } from 'react';
import { Radio } from 'lucide-react';
import type { ChartData, MemeToken } from '../types';
import './StockChart.css';

interface StockChartProps {
  data: ChartData[];
  token: MemeToken;
}

const GRID_ROWS = 5;
const VISIBLE_FUTURE_MS = 40000;

export function StockChart({ data, token }: StockChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Mode state
  const [liveMode, setLiveMode] = useState(false);
  
  // Price state
  const [priceHistory, setPriceHistory] = useState<{time: number, price: number}[]>([]);
  const [currentPrice, setCurrentPrice] = useState(token.price);
  const [priceRange, setPriceRange] = useState({ min: token.price * 0.95, max: token.price * 1.05 });
  
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
    
    if (liveMode) {
      animationId = requestAnimationFrame(animate);
    }
    
    return () => cancelAnimationFrame(animationId);
  }, [liveMode]);

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
  }, [now, priceHistory, currentPrice, priceRange]);

  return (
    <div className="stock-chart">
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
        </div>
      </div>

      <div className="chart-wrapper" ref={containerRef}>
        <canvas ref={canvasRef} className="chart-canvas" />
      </div>
    </div>
  );
}
