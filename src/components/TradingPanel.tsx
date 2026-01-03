import { useState } from 'react';
import { TrendingUp, TrendingDown, AlertTriangle, Zap, Info, X, Plus, ChevronDown, ChevronUp } from 'lucide-react';
import type { MemeToken, Position } from '../types';
import './TradingPanel.css';

interface TradingPanelProps {
  token: MemeToken;
  positions?: Position[];
}

export function TradingPanel({ token, positions = [] }: TradingPanelProps) {
  const [mode, setMode] = useState<'spot' | 'perps'>('spot');
  const [direction, setDirection] = useState<'buy' | 'sell'>('buy');
  const [amount, setAmount] = useState('');
  const [leverage, setLeverage] = useState(10);
  const [orderType, setOrderType] = useState<'market' | 'limit'>('market');
  const [limitPrice, setLimitPrice] = useState(token.price.toString());
  const [activeTab, setActiveTab] = useState<'trade' | 'positions'>('trade');
  const [isSummaryExpanded, setIsSummaryExpanded] = useState(true);

  const tokenPositions = positions.filter(p => p.tokenId === token.id);

  const amountNum = parseFloat(amount) || 0;
  const isLong = direction === 'buy';

  // Spot calculations
  const taxRate = isLong ? token.buyTax : token.sellTax;
  const taxAmount = amountNum * (taxRate / 100);
  const tokensReceived = isLong 
    ? (amountNum - taxAmount) / token.price 
    : amountNum * token.price * (1 - taxRate / 100);

  // Perps calculations
  const positionSize = amountNum * leverage;
  const liquidationPrice = isLong 
    ? token.price * (1 - 0.9 / leverage)
    : token.price * (1 + 0.9 / leverage);
  
  const marginRatio = amountNum > 0 ? (1 / leverage) * 100 : 0;
  const fundingRate = token.fundingRate || 0.0001;

  return (
    <div className="trading-panel">
      {/* Panel Header */}
      <div className="panel-header">
        <div className="panel-title">
          <Zap size={18} className="panel-icon" />
          <span>{mode === 'spot' ? 'Spot Trade' : 'Perps Trading'}</span>
        </div>
        <div className="panel-tabs">
          <button 
            className={`panel-tab ${activeTab === 'trade' ? 'active' : ''}`}
            onClick={() => setActiveTab('trade')}
          >
            Trade
          </button>
          <button 
            className={`panel-tab ${activeTab === 'positions' ? 'active' : ''}`}
            onClick={() => setActiveTab('positions')}
          >
            Positions
          </button>
        </div>
      </div>

      <div className="panel-content">
        {activeTab === 'trade' ? (
          <>
            {/* Mode Toggle */}
            <div className="mode-toggle">
              <button 
                className={`mode-btn ${mode === 'spot' ? 'active' : ''}`}
                onClick={() => setMode('spot')}
              >
                Spot
              </button>
              <button 
                className={`mode-btn ${mode === 'perps' ? 'active' : ''}`}
                onClick={() => setMode('perps')}
              >
                <span>Perps</span>
                <span className="mode-badge">50x</span>
              </button>
            </div>

            {/* Order Type Toggle (Perps only) */}
            {mode === 'perps' && (
              <div className="order-type-toggle">
                <button 
                  className={`order-type-btn ${orderType === 'market' ? 'active' : ''}`}
                  onClick={() => setOrderType('market')}
                >
                  Market
                </button>
                <button 
                  className={`order-type-btn ${orderType === 'limit' ? 'active' : ''}`}
                  onClick={() => setOrderType('limit')}
                >
                  Limit
                </button>
              </div>
            )}

            {/* Direction Toggle */}
            <div className="direction-toggle">
              <button 
                className={`direction-btn buy ${direction === 'buy' ? 'active' : ''}`}
                onClick={() => setDirection('buy')}
              >
                <TrendingUp size={18} />
                {mode === 'spot' ? 'Buy' : 'Long'}
              </button>
              <button 
                className={`direction-btn sell ${direction === 'sell' ? 'active' : ''}`}
                onClick={() => setDirection('sell')}
              >
                <TrendingDown size={18} />
                {mode === 'spot' ? 'Sell' : 'Short'}
              </button>
            </div>

            {/* Limit Price Input */}
            {mode === 'perps' && orderType === 'limit' && (
              <div className="input-group">
                <label className="input-label">Limit Price</label>
                <div className="input-wrapper">
                  <span className="input-prefix">$</span>
                  <input
                    type="number"
                    className="amount-input"
                    value={limitPrice}
                    onChange={(e) => setLimitPrice(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Amount Input */}
            <div className="input-group">
              <label className="input-label">
                <span>{mode === 'spot' ? (isLong ? 'You Pay' : 'You Sell') : 'Margin (USDC)'}</span>
                <span className="input-balance">Balance: $1,234.56</span>
              </label>
              <div className="input-wrapper">
                <span className="input-prefix">$</span>
                <input
                  type="number"
                  className="amount-input"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
                <button className="max-btn">MAX</button>
              </div>
              <div className="quick-amounts">
                {['25', '50', '100', '250'].map(val => (
                  <button 
                    key={val} 
                    className={`quick-amount-btn ${amount === val ? 'active' : ''}`}
                    onClick={() => setAmount(val)}
                  >
                    ${val}
                  </button>
                ))}
              </div>
            </div>

            {/* Leverage Slider (Perps only) */}
            {mode === 'perps' && (
              <div className="leverage-section">
                <div className="leverage-header">
                  <span className="leverage-label">Leverage</span>
                  <span className="leverage-value">{leverage}x</span>
                </div>
                <div className="leverage-slider-container">
                  <input
                    type="range"
                    min="1"
                    max={token.maxLeverage}
                    value={leverage}
                    onChange={(e) => setLeverage(parseInt(e.target.value))}
                    className="leverage-slider"
                  />
                </div>
                <div className="leverage-presets">
                  {[5, 10, 25, 50].map(val => (
                    <button 
                      key={val}
                      className={`leverage-preset ${leverage === val ? 'active' : ''}`}
                      onClick={() => setLeverage(val)}
                    >
                      {val}x
                    </button>
                  ))}
                </div>

                {/* Margin Ratio Bar */}
                <div className="margin-ratio-container">
                  <div className="margin-ratio-header">
                    <span className="margin-ratio-label">Margin Usage</span>
                    <span className={`margin-ratio-value ${leverage > 25 ? 'danger' : leverage > 10 ? 'warning' : ''}`}>
                      {leverage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="margin-ratio-bar-bg">
                    <div 
                      className={`margin-ratio-bar-fill ${leverage > 25 ? 'danger' : leverage > 10 ? 'warning' : ''}`}
                      style={{ width: `${(leverage / 50) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Order Summary */}
            <div className={`order-summary ${!isSummaryExpanded ? 'collapsed' : ''}`}>
              <button 
                className="summary-toggle"
                onClick={() => setIsSummaryExpanded(!isSummaryExpanded)}
              >
                <span>Order Summary</span>
                {isSummaryExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
              
              {isSummaryExpanded && (
                <div className="summary-content">
                  {mode === 'spot' ? (
                    <>
                      <div className="summary-row">
                        <span className="summary-label">Price</span>
                        <span className="summary-value">${token.price.toFixed(8)}</span>
                      </div>
                      <div className="summary-row">
                        <span className="summary-label">{isLong ? 'Buy' : 'Sell'} Tax</span>
                        <span className={`summary-value ${taxRate > 5 ? 'warning' : ''}`}>
                          {taxRate.toFixed(1)}%
                        </span>
                      </div>
                      <div className="summary-row">
                        <span className="summary-label">You Receive</span>
                        <span className="summary-value positive">
                          {isLong 
                            ? `${tokensReceived.toLocaleString(undefined, {maximumFractionDigits: 0})} ${token.ticker}`
                            : `$${tokensReceived.toFixed(2)}`
                          }
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="summary-row">
                        <span className="summary-label">Position Size</span>
                        <span className="summary-value">${positionSize.toLocaleString()}</span>
                      </div>
                      <div className="summary-row">
                        <span className="summary-label">Liq. Price</span>
                        <span className="summary-value danger">${liquidationPrice.toFixed(8)}</span>
                      </div>
                      <div className="summary-row">
                        <span className="summary-label">Funding Rate</span>
                        <span className={`summary-value ${fundingRate > 0 ? 'negative' : 'positive'}`}>
                          {(fundingRate * 100).toFixed(4)}% / 1h
                        </span>
                      </div>
                      <div className="summary-row">
                        <span className="summary-label">Open Interest</span>
                        <span className="summary-value">
                          ${(token.openInterest || 0).toLocaleString()}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button className={`submit-btn ${direction}`} disabled={!amountNum}>
              {mode === 'spot' 
                ? (isLong ? `Buy ${token.ticker}` : `Sell ${token.ticker}`)
                : `Open ${direction === 'buy' ? 'Long' : 'Short'}`
              }
            </button>

            {/* Risk Warning for Perps (Conditional) */}
            {mode === 'perps' && leverage >= 20 && (
              <div className="risk-warning">
                <AlertTriangle size={16} />
                <span className="risk-warning-text">
                  <strong>High Leverage ({leverage}x):</strong> Significant risk of liquidation.
                </span>
              </div>
            )}
          </>
        ) : (
          <div className="positions-mini-list">
            {tokenPositions.length > 0 ? (
              tokenPositions.map(pos => (
                <div key={pos.id} className="position-mini-card">
                  <div className="pos-mini-header">
                    <div className="pos-mini-info">
                      <span className={`pos-mini-badge ${pos.type}`}>{pos.type.toUpperCase()} {pos.leverage}x</span>
                      <span className="pos-mini-ticker">{pos.tokenTicker}</span>
                    </div>
                    <div className={`pos-mini-pnl ${pos.pnl >= 0 ? 'positive' : 'negative'}`}>
                      {pos.pnl >= 0 ? '+' : ''}${pos.pnl.toFixed(2)}
                    </div>
                  </div>
                  <div className="pos-mini-stats">
                    <div className="pos-mini-stat">
                      <span>Size</span>
                      <span>${pos.size.toFixed(2)}</span>
                    </div>
                    <div className="pos-mini-stat">
                      <span>Entry</span>
                      <span>${pos.entryPrice.toFixed(8)}</span>
                    </div>
                    <div className="pos-mini-stat">
                      <span>Liq.</span>
                      <span className="danger">${pos.liquidationPrice.toFixed(8)}</span>
                    </div>
                  </div>
                  <div className="pos-mini-actions">
                    <button className="pos-mini-btn close">Close</button>
                    <button className="pos-mini-btn add">Add Margin</button>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state mini">
                <div className="empty-state-text">No active {token.ticker} positions</div>
                <button className="empty-state-btn mini" onClick={() => setActiveTab('trade')}>
                  Trade Now
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
