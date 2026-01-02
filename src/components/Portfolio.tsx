import { TrendingUp, TrendingDown, X } from 'lucide-react';
import type { Position, SpotHolding } from '../types';
import './Portfolio.css';

interface PortfolioProps {
  positions: Position[];
  spotHoldings: SpotHolding[];
}

export function Portfolio({ positions, spotHoldings }: PortfolioProps) {
  const totalPositionsValue = positions.reduce((sum, p) => sum + p.margin + p.pnl, 0);
  const totalSpotValue = spotHoldings.reduce((sum, h) => sum + h.value, 0);
  const totalPnl = positions.reduce((sum, p) => sum + p.pnl, 0) + 
                   spotHoldings.reduce((sum, h) => sum + h.pnl, 0);

  return (
    <div className="portfolio">
      {/* Portfolio Summary */}
      <div className="portfolio-summary">
        <div className="summary-main">
          <span className="summary-label">Portfolio Value</span>
          <span className="summary-value">${(totalPositionsValue + totalSpotValue).toFixed(2)}</span>
          <span className={`summary-pnl ${totalPnl >= 0 ? 'positive' : 'negative'}`}>
            {totalPnl >= 0 ? '+' : ''}${totalPnl.toFixed(2)} today
          </span>
        </div>
      </div>

      {/* Open Positions */}
      <div className="portfolio-section">
        <h3 className="section-title">
          <TrendingUp size={18} />
          Open Positions
          <span className="section-count">{positions.length}</span>
        </h3>
        
        {positions.length === 0 ? (
          <div className="empty-state">No open positions</div>
        ) : (
          <div className="positions-list">
            {positions.map(position => (
              <div key={position.id} className="position-card">
                <div className="position-header">
                  <div className="position-token">
                    <span className={`position-direction ${position.type}`}>
                      {position.type === 'long' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                      {position.type.toUpperCase()}
                    </span>
                    <span className="position-ticker">{position.tokenTicker}</span>
                    <span className="position-leverage">{position.leverage}x</span>
                  </div>
                  <button className="close-btn">
                    <X size={16} />
                  </button>
                </div>
                
                <div className="position-details">
                  <div className="detail-row">
                    <span className="detail-label">Size</span>
                    <span className="detail-value">${position.size.toFixed(2)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Entry</span>
                    <span className="detail-value">${position.entryPrice.toFixed(8)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Liq. Price</span>
                    <span className="detail-value warning">${position.liquidationPrice.toFixed(8)}</span>
                  </div>
                </div>

                <div className={`position-pnl ${position.pnl >= 0 ? 'positive' : 'negative'}`}>
                  <span className="pnl-label">PnL</span>
                  <span className="pnl-value">
                    {position.pnl >= 0 ? '+' : ''}${position.pnl.toFixed(2)}
                    <span className="pnl-percent">({position.pnl >= 0 ? '+' : ''}{position.pnlPercent.toFixed(1)}%)</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Spot Holdings */}
      <div className="portfolio-section">
        <h3 className="section-title">
          💰 Spot Holdings
          <span className="section-count">{spotHoldings.length}</span>
        </h3>
        
        {spotHoldings.length === 0 ? (
          <div className="empty-state">No spot holdings</div>
        ) : (
          <div className="holdings-list">
            {spotHoldings.map(holding => (
              <div key={holding.tokenId} className="holding-card">
                <div className="holding-info">
                  <span className="holding-image">{holding.tokenImage}</span>
                  <div className="holding-details">
                    <span className="holding-ticker">{holding.tokenTicker}</span>
                    <span className="holding-amount">
                      {holding.amount.toLocaleString()} tokens
                    </span>
                  </div>
                </div>
                <div className="holding-value">
                  <span className="value-usd">${holding.value.toFixed(2)}</span>
                  <span className={`value-pnl ${holding.pnl >= 0 ? 'positive' : 'negative'}`}>
                    {holding.pnl >= 0 ? '+' : ''}{holding.pnlPercent.toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
