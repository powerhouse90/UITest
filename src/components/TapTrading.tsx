import { useEffect, useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, TrendingUp, TrendingDown } from 'lucide-react';
import type { MemeToken } from '../types';
import './TapTrading.css';

interface TapTradingProps {
  token: MemeToken;
  onClose: () => void;
}

const ROWS = [
  { side: 'LONG', leverage: 10, tier: 4 },
  { side: 'LONG', leverage: 5, tier: 3 },
  { side: 'LONG', leverage: 2, tier: 2 },
  { side: 'LONG', leverage: 1, tier: 1 },
  { side: 'SHORT', leverage: 1, tier: 1 },
  { side: 'SHORT', leverage: 2, tier: 2 },
  { side: 'SHORT', leverage: 5, tier: 3 },
  { side: 'SHORT', leverage: 10, tier: 4 }
];

export function TapTrading({ token, onClose }: TapTradingProps) {
  const SECONDS_PER_COL = 30;
  const VISIBLE_COLS = 15;
  const TOTAL_COLS = VISIBLE_COLS * 2; // Double for seamless loop
  const HEADER_HEIGHT = 20;
  const NUM_ROWS = ROWS.length;

  const containerRef = useRef<HTMLDivElement>(null);
  const [cellSize, setCellSize] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const [offset, setOffset] = useState(0);
  const [simPrice, setSimPrice] = useState(token.price);
  const [yPoints, setYPoints] = useState<number[]>([]);
  const [verticalOffset, setVerticalOffset] = useState(0); // in pixels
  
  const animationRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());
  const lastPriceUpdateRef = useRef<number>(performance.now());

  // Calculate cell size based on container
  const updateCellSize = useCallback(() => {
    if (!containerRef.current) return;
    const containerHeight = containerRef.current.clientHeight;
    const availableHeight = containerHeight - HEADER_HEIGHT;
    const size = Math.floor(availableHeight / NUM_ROWS);
    setCellSize(size);
    setContainerWidth(containerRef.current.clientWidth);
    
    const gridHeight = NUM_ROWS * size;
    // Initialize yPoints in pixels, centered in the grid
    if (yPoints.length === 0) {
      setYPoints(new Array(60).fill(gridHeight / 2));
    }
    setVerticalOffset(0);
  }, [NUM_ROWS, HEADER_HEIGHT, yPoints.length]);

  // Infinite scroll animation and price simulation
  useEffect(() => {
    const totalWidth = cellSize * TOTAL_COLS;
    const halfWidth = totalWidth / 2;
    const pixelsPerSecond = halfWidth / (VISIBLE_COLS * SECONDS_PER_COL);

    const animate = (now: number) => {
      const delta = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;
      
      setOffset(prev => {
        let next = prev + pixelsPerSecond * delta;
        if (next >= halfWidth) next -= halfWidth; // Loop back
        return next;
      });

      // Update price every ~100ms
      if (now - lastPriceUpdateRef.current > 100 && cellSize > 0) {
        lastPriceUpdateRef.current = now;

        const volatilityFactor = (Math.random() - 0.5) * 2; // -1 to 1

        setSimPrice(prev => {
          const volatility = prev * 0.002;
          const change = volatilityFactor * volatility;
          return prev + change;
        });

        setYPoints(prev => {
          const lastY = prev[prev.length - 1];
          const pixelVolatility = 5; // How many pixels to move per update
          // INVERSE: if volatilityFactor is positive (price up), subtract from Y (move up)
          let nextY = lastY - (volatilityFactor * pixelVolatility);
          
          const newPoints = [...prev.slice(1), nextY];
          
          // Allow the line to move 3/4 of the way up or down before shifting the grid
          setVerticalOffset(currentOffset => {
            const viewportHeight = containerRef.current?.clientHeight || 0;
            const availableHeight = viewportHeight - HEADER_HEIGHT;
            const center = availableHeight / 2;
            
            // The position of the dot relative to the viewport top
            const dotViewportY = nextY + currentOffset;
            
            // Define a threshold (3/4 of way to edge from center = 3/8 of total height)
            const threshold = availableHeight * 0.375; 
            
            let targetOffset = currentOffset;
            const distFromCenter = dotViewportY - center;

            if (Math.abs(distFromCenter) > threshold) {
              // Shift the grid to bring it back towards the threshold edge
              const correction = distFromCenter > 0 
                ? distFromCenter - threshold 
                : distFromCenter + threshold;
              targetOffset = currentOffset - correction;
            }

            return currentOffset + (targetOffset - currentOffset) * 0.05; // Slower, smoother shift
          });

          return newPoints;
        });
      }
      
      animationRef.current = requestAnimationFrame(animate);
    };

    if (cellSize > 0) {
      animationRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [cellSize, TOTAL_COLS, VISIBLE_COLS, SECONDS_PER_COL, NUM_ROWS, HEADER_HEIGHT]);

  // Generate path for the chart using pixel coordinates
  const gridHeight = NUM_ROWS * cellSize;
  const chartPath = yPoints.reduce((acc, y, i) => {
    const x = (i / (yPoints.length - 1)) * 333; // 333 is 1/3 of the 1000 viewBox width
    return acc + `${i === 0 ? 'M' : 'L'} ${x} ${y} `;
  }, '');

  // Fill area to a very large "bottom" to ensure it covers the view
  const areaPath = `${chartPath} L 333 ${gridHeight * 2} L 0 ${gridHeight * 2} Z`;
  const currentPixelY = yPoints[yPoints.length - 1];

  // Resize handler
  useEffect(() => {
    updateCellSize();
    window.addEventListener('resize', updateCellSize);
    return () => window.removeEventListener('resize', updateCellSize);
  }, [updateCellSize]);

  // Calculate time labels - 0s should be at the LIVE marker (33.33% from left)
  // The RIGHT edge of the 0s column should align with LIVE
  const getTimeLabel = (colIdx: number) => {
    if (cellSize === 0) return 0;
    
    // The LIVE marker is at 33.33% of container width
    // We want the RIGHT edge of a column to be at LIVE, so subtract 1 column
    const liveColIdx = (containerWidth * 0.333 + offset) / cellSize - 1;
    
    // This column's offset from live (negative = past, positive = future)
    let relativeOffset = colIdx - liveColIdx;
    
    // Wrap around for seamless loop
    while (relativeOffset < -TOTAL_COLS / 2) relativeOffset += TOTAL_COLS;
    while (relativeOffset > TOTAL_COLS / 2) relativeOffset -= TOTAL_COLS;
    
    return Math.round(relativeOffset * SECONDS_PER_COL);
  };

  // Lock scroll when open
  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  return createPortal(
    <div className="tap-trading-modal-root">
      <div className="tap-trading-overlay">
        <div className="tap-trading-fullscreen">
          <div className="tap-header">
            <div className="tap-token-info">
              <div className="tap-token-details">
                <span className="tap-token-name">Perpetual Trading</span>
                <span className="tap-token-ticker">{token.ticker} / USD</span>
              </div>
            </div>
            <button className="tap-close-btn" onClick={onClose} aria-label="Close tap trading">
              <X size={32} />
            </button>
          </div>

          <div className="tap-main-content">
            <div className="tap-price-display">
              <div className="tap-current-price">${simPrice.toFixed(8)}</div>
              <div className={`tap-price-change ${token.priceChangePercent24h >= 0 ? 'positive' : 'negative'}`}>
                {token.priceChangePercent24h >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                {Math.abs(token.priceChangePercent24h).toFixed(2)}%
              </div>
            </div>

            <div className="tap-interactive-grid" ref={containerRef}>
              {/* Fixed Header (Time labels) */}
              <div 
                className="tap-grid-header-container"
                style={{
                  height: HEADER_HEIGHT,
                  width: '100%',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  zIndex: 10,
                  overflow: 'hidden',
                  background: '#000' // Solid background for header
                }}
              >
                <div
                  style={{
                    transform: `translateX(${-offset}px)`,
                    width: cellSize * TOTAL_COLS,
                    height: '100%',
                    position: 'relative'
                  }}
                >
                  {[...Array(TOTAL_COLS)].map((_, colIdx) => (
                    <div
                      key={colIdx}
                      style={{
                        position: 'absolute',
                        left: colIdx * cellSize,
                        top: 0,
                        width: cellSize,
                        height: HEADER_HEIGHT,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'rgba(255,255,255,0.03)',
                        borderBottom: '1px solid rgba(255,255,255,0.08)',
                        fontSize: 9,
                        fontWeight: 700,
                        color: 'rgba(255,255,255,0.5)'
                      }}
                    >
                      {getTimeLabel(colIdx)}s
                    </div>
                  ))}
                </div>
              </div>

              {/* Vertically moving content */}
              <div 
                className="tap-grid-vertical-container"
                style={{ 
                  transform: `translateY(${verticalOffset}px)`,
                  height: gridHeight, // Match grid height exactly
                  width: '100%',
                  position: 'absolute',
                  top: HEADER_HEIGHT,
                  left: 0
                }}
              >
                {/* Background Gradient that moves with the grid */}
                <div 
                  className="tap-grid-background"
                  style={{
                    position: 'absolute',
                    top: (gridHeight / 2) - 10000,
                    left: 0,
                    right: 0,
                    height: 20000,
                    zIndex: -1
                  }}
                />
                
                <div
                  className="tap-moving-grid"
                  style={{
                    transform: `translateX(${-offset}px)`,
                    width: cellSize * TOTAL_COLS,
                    height: '100%'
                  }}
                >
                  {[...Array(TOTAL_COLS)].map((_, colIdx) => {
                    const x = colIdx * cellSize;
                    // Determine which sets to render based on verticalOffset to cover the viewport
                    const gridH = NUM_ROWS * cellSize;
                    const startSet = Math.floor(-verticalOffset / gridH) - 1;
                    const endSet = startSet + 3; // Render 3-4 sets to be safe

                    return (
                      <div
                        key={colIdx}
                        style={{
                          position: 'absolute',
                          left: x,
                          top: 0,
                          width: cellSize,
                          height: '100%'
                        }}
                      >
                        {Array.from({ length: endSet - startSet + 1 }, (_, i) => startSet + i).map((setIdx) => (
                          <div 
                            key={setIdx}
                            style={{
                              position: 'absolute',
                              top: setIdx * gridH,
                              left: 0,
                              width: '100%'
                            }}
                          >
                            {ROWS.map((row, rowIdx) => (
                              <button
                                key={rowIdx}
                                className={`tap-square-btn ${row.side.toLowerCase()} tier-${row.tier}`}
                                style={{
                                  position: 'absolute',
                                  left: 0,
                                  top: rowIdx * cellSize,
                                  width: cellSize,
                                  height: cellSize
                                }}
                                onClick={() => console.log(`Trade: ${row.side} ${row.leverage}x`)}
                              />
                            ))}
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>

                {/* Static Chart Line (Moves with vertical container) */}
                <div className="tap-chart-overlay">
                  <div className="tap-live-marker" style={{ left: '33.3%' }}>
                    <div className="tap-live-line" />
                    <div className="tap-price-dot" style={{ top: currentPixelY }} />
                  </div>
                  <svg 
                    className="tap-chart-svg" 
                    viewBox={`0 0 1000 ${gridHeight}`} 
                    preserveAspectRatio="none"
                    style={{ 
                      overflow: 'visible',
                      height: gridHeight, // Match pixel height
                      width: '100%',
                      position: 'absolute',
                      top: 0,
                      left: 0
                    }}
                  >
                    <defs>
                      <linearGradient id="cometGradient" x1="0" y1="0" x2="333" y2="0" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="white" stopOpacity="0" />
                        <stop offset="80%" stopColor="white" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="white" stopOpacity="1" />
                      </linearGradient>
                      <linearGradient id="areaGradient" x1="0" y1="0" x2="333" y2="0" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="white" stopOpacity="0" />
                        <stop offset="100%" stopColor="white" stopOpacity="0.1" />
                      </linearGradient>
                    </defs>
                    {/* Area Fill under the line */}
                    <path
                      d={areaPath}
                      fill="url(#areaGradient)"
                      pointerEvents="none"
                    />
                    {/* The Chart Line (Sharp 0.5px) */}
                    <path
                      d={chartPath}
                      fill="none"
                      stroke="url(#cometGradient)"
                      strokeWidth="0.5"
                      strokeLinecap="butt"
                    />
                  </svg>
                </div>
              </div>

              {/* LIVE label (Stays fixed relative to grid) */}
              <div 
                className="tap-live-label-container"
                style={{
                  position: 'absolute',
                  top: HEADER_HEIGHT + 4,
                  left: '33.33%',
                  transform: 'translateX(-50%)',
                  zIndex: 20
                }}
              >
                <span className="tap-live-label">LIVE</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

