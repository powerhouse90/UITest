import { useEffect, useRef } from 'react';
import { createChart, ColorType, AreaSeries } from 'lightweight-charts';
import type { IChartApi } from 'lightweight-charts';
import type { ChartData, MemeToken } from '../types';
import './StockChart.css';

interface StockChartProps {
  data: ChartData[];
  token: MemeToken;
}

export function StockChart({ data, token }: StockChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  const isPositive = token.priceChangePercent24h >= 0;
  const lineColor = isPositive ? '#00d632' : '#ff4444';

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#808080',
      },
      grid: {
        vertLines: { visible: false },
        horzLines: { color: '#1a1a1a' },
      },
      width: chartContainerRef.current.clientWidth,
      height: 300,
      rightPriceScale: {
        borderVisible: false,
        scaleMargins: { top: 0.1, bottom: 0.1 },
      },
      timeScale: {
        borderVisible: false,
        timeVisible: true,
        secondsVisible: false,
      },
      crosshair: {
        horzLine: { visible: true, labelVisible: true },
        vertLine: { visible: true, labelVisible: true },
      },
      handleScroll: { mouseWheel: true, pressedMouseMove: true },
      handleScale: { mouseWheel: true, pinch: true },
    });

    const areaSeries = chart.addSeries(AreaSeries, {
      lineColor: lineColor,
      topColor: `${lineColor}40`,
      bottomColor: `${lineColor}05`,
      lineWidth: 2,
    });

    areaSeries.setData(data);
    chart.timeScale().fitContent();

    chartRef.current = chart;

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ 
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight || 350
        });
      }
    };

    // Use ResizeObserver for more reliable resizing
    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });

    if (chartContainerRef.current) {
      resizeObserver.observe(chartContainerRef.current);
    }

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      resizeObserver.disconnect();
      chart.remove();
    };
  }, [data, lineColor]);

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
          <span className="chart-price">${token.price.toFixed(8)}</span>
          <span className={`chart-change ${isPositive ? 'positive' : 'negative'}`}>
            {isPositive ? '+' : ''}{token.priceChangePercent24h.toFixed(2)}%
          </span>
        </div>
      </div>
      
      <div className="chart-timeframes">
        <button className="timeframe-btn">1H</button>
        <button className="timeframe-btn">4H</button>
        <button className="timeframe-btn active">24H</button>
        <button className="timeframe-btn">7D</button>
        <button className="timeframe-btn">ALL</button>
      </div>

      <div ref={chartContainerRef} className="chart-container" />
    </div>
  );
}
