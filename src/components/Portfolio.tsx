import { TrendingUp, X, Plus } from 'lucide-react';
import type { Position, SpotHolding } from '../types';
import { PortfolioIcon, AnalyticsIcon, LongIcon, ShortIcon, DiamondIcon, CoinsIcon } from './icons/PulseIcons';
import './Portfolio.css';

interface PortfolioProps {
  positions: Position[];
  spotHoldings: SpotHolding[];
  isPreLaunch?: boolean;
}

export function Portfolio({ positions, spotHoldings, isPreLaunch = false }: PortfolioProps) {
  const totalPositionsValue = positions.reduce((sum, p) => sum + p.margin + p.pnl, 0);
  const totalSpotValue = spotHoldings.reduce((sum, h) => sum + h.value, 0);
  const totalPnl = positions.reduce((sum, p) => sum + p.pnl, 0) + 
                   spotHoldings.reduce((sum, h) => sum + h.pnl, 0);
  const totalPnlPercent = ((totalPnl / (totalPositionsValue + totalSpotValue - totalPnl)) * 100) || 0;

  if (isPreLaunch) {
    return (
      <div className="portfolio prelaunch">
        <div className="portfolio-prelaunch-state">
          <PortfolioIcon size={56} className="prelaunch-icon" />
          <h2>Portfolio Awaiting First Launch</h2>
          <p>Your positions and holdings will appear here once you start trading after the first token launches.</p>
          <div className="prelaunch-features">
            <div className="prelaunch-feature">
              <span className="feature-bullet">•</span>
              <span>Track leveraged perp positions up to 50x</span>
            </div>
            <div className="prelaunch-feature">
              <span className="feature-bullet">•</span>
              <span>Monitor spot token holdings</span>
            </div>
            <div className="prelaunch-feature">
              <span className="feature-bullet">•</span>
              <span>View real-time P&L across all trades</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="portfolio">
      {/* Portfolio Summary Cards */}
      <div className="portfolio-summary">
        <div className="summary-card highlight">
          <div className="summary-card-label">Portfolio Value</div>
          <div className="summary-card-value">${(totalPositionsValue + totalSpotValue).toFixed(2)}</div>
          <div className={`summary-card-change ${totalPnl >= 0 ? 'positive' : 'negative'}`}>
            {totalPnl >= 0 ? '+' : ''}${totalPnl.toFixed(2)} today
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-card-label">Open Positions</div>
          <div className="summary-card-value">{positions.length}</div>
          <div className="summary-card-change">Active trades</div>
        </div>
        <div className="summary-card">
          <div className="summary-card-label">Spot Holdings</div>
          <div className="summary-card-value">{spotHoldings.length}</div>
          <div className={`summary-card-change ${totalPnlPercent >= 0 ? 'positive' : 'negative'}`}>
            {totalPnlPercent >= 0 ? '+' : ''}{totalPnlPercent.toFixed(1)}% overall
          </div>
        </div>
      </div>

      {/* Open Positions */}
      <div className="portfolio-section">
        <div className="section-header">
          <h3 className="section-title">
            <TrendingUp size={18} />
            Open Positions
            <span className="section-badge">{positions.length}</span>
          </h3>
          <button className="section-action">View All</button>
        </div>
        
        {positions.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><AnalyticsIcon size={40} /></div>
            <div className="empty-state-title">No Open Positions</div>
            <div className="empty-state-text">Start trading to see your positions here</div>
            <button className="empty-state-btn">
              <Plus size={16} />
              Open Position
            </button>
          </div>
        ) : (
          <div className="positions-list">
            {positions.map(position => (
              <div key={position.id} className="position-card">
                <div className="position-header">
                  <div className="position-info">
                    <div className="position-icon">
                      {position.type === 'long' ? <LongIcon size={20} /> : <ShortIcon size={20} />}
                    </div>
                    <div className="position-details">
                      <span className="position-name">{position.tokenTicker}</span>
                      <div className="position-type">
                        <span className={`position-direction ${position.type}`}>
                          {position.type.toUpperCase()}
                        </span>
                        <span className="position-leverage">{position.leverage}x</span>
                      </div>
                    </div>
                  </div>
                  <div className="position-pnl">
                    <div className={`position-pnl-value ${position.pnl >= 0 ? 'positive' : 'negative'}`}>
                      {position.pnl >= 0 ? '+' : ''}${position.pnl.toFixed(2)}
                    </div>
                    <div className={`position-pnl-percent ${position.pnl >= 0 ? 'positive' : 'negative'}`}>
                      {position.pnl >= 0 ? '+' : ''}{position.pnlPercent.toFixed(1)}%
                    </div>
                  </div>
                </div>
                
                <div className="position-stats">
                  <div className="position-stat">
                    <span className="position-stat-label">Size</span>
                    <span className="position-stat-value">${position.size.toFixed(2)}</span>
                  </div>
                  <div className="position-stat">
                    <span className="position-stat-label">Entry Price</span>
                    <span className="position-stat-value">${position.entryPrice.toFixed(8)}</span>
                  </div>
                  <div className="position-stat">
                    <span className="position-stat-label">Mark Price</span>
                    <span className="position-stat-value">${position.currentPrice.toFixed(8)}</span>
                  </div>
                  <div className="position-stat">
                    <span className="position-stat-label">Liq. Price</span>
                    <span className="position-stat-value danger">${position.liquidationPrice.toFixed(8)}</span>
                  </div>
                </div>

                <div className="position-actions">
                  <button className="position-btn close">
                    <X size={14} />
                    Close Position
                  </button>
                  <button className="position-btn add">
                    <Plus size={14} />
                    Add Margin
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Spot Holdings */}
      <div className="portfolio-section">
        <div className="section-header">
          <h3 className="section-title">
            <CoinsIcon size={18} />
            Spot Holdings
            <span className="section-badge">{spotHoldings.length}</span>
          </h3>
          <button className="section-action">View All</button>
        </div>
        
        {spotHoldings.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><DiamondIcon size={40} /></div>
            <div className="empty-state-title">No Spot Holdings</div>
            <div className="empty-state-text">Buy some tokens to see them here</div>
            <button className="empty-state-btn">
              <Plus size={16} />
              Buy Tokens
            </button>
          </div>
        ) : (
          <div className="holdings-list">
            {spotHoldings.map(holding => (
              <div key={holding.tokenId} className="holding-card">
                <div className="holding-info">
                  <div className="holding-icon">{holding.tokenImage}</div>
                  <div className="holding-details">
                    <span className="holding-name">{holding.tokenTicker}</span>
                    <span className="holding-amount">
                      {holding.amount.toLocaleString()} tokens
                    </span>
                  </div>
                </div>
                <div className="holding-value">
                  <div className="holding-value-usd">${holding.value.toFixed(2)}</div>
                  <div className={`holding-pnl ${holding.pnl >= 0 ? 'positive' : 'negative'}`}>
                    {holding.pnl >= 0 ? '+' : ''}{holding.pnlPercent.toFixed(1)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
