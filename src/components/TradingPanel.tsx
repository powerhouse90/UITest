import { useState } from 'react';
import { TrendingUp, TrendingDown, Zap, ChevronDown, ChevronUp } from 'lucide-react';
import type { MemeToken, Position } from '../types';
import './TradingPanel.css';

interface TradingPanelProps {
  token: MemeToken;
  positions?: Position[];
  onOpenTapTrading?: () => void;
}

export function TradingPanel({ token, positions = [], onOpenTapTrading }: TradingPanelProps) {
  const [direction, setDirection] = useState<'buy' | 'sell'>('buy');
  const [amount, setAmount] = useState('100');
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

  return (
    <div className="trading-panel">
      {/* Panel Header */}
      <div className="panel-header">
        <div className="panel-title">
          <Zap size={18} className="panel-icon" />
          <span>Spot Trading</span>
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
          <div className="trade-content">
            {/* Mode Toggle */}
            <div className="mode-toggle">
              <button 
                className="mode-btn active"
              >
                Spot
              </button>
              <button 
                className="mode-btn tap-mode-btn"
                onClick={onOpenTapTrading}
              >
                <Zap size={14} />
                Tap
              </button>
            </div>

            {/* SPOT MODE */}
            <div className="spot-content">
                <div className="direction-toggle">
                  <button 
                    className={`direction-btn buy ${direction === 'buy' ? 'active' : ''}`}
                    onClick={() => setDirection('buy')}
                  >
                    <TrendingUp size={18} />
                    Buy
                  </button>
                  <button 
                    className={`direction-btn sell ${direction === 'sell' ? 'active' : ''}`}
                    onClick={() => setDirection('sell')}
                  >
                    <TrendingDown size={18} />
                    Sell
                  </button>
                </div>

                <div className="input-group">
                  <label className="input-label">
                    <span>{isLong ? 'You Pay' : 'You Sell'}</span>
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

                <div className={`order-summary ${!isSummaryExpanded ? 'collapsed' : ''}`}>
                  <button 
                    className="summary-toggle"
                    onClick={() => setIsSummaryExpanded(!isSummaryExpanded)}
                  >
                    <span>Summary</span>
                    {isSummaryExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                  
                  {isSummaryExpanded && (
                    <div className="summary-content">
                      <div className="summary-row">
                        <span>Price</span>
                        <span>${token.price.toFixed(8)}</span>
                      </div>
                      <div className="summary-row">
                        <span>{isLong ? 'Buy' : 'Sell'} Tax</span>
                        <span className={taxRate > 5 ? 'warning' : ''}>{taxRate.toFixed(1)}%</span>
                      </div>
                      <div className="summary-row">
                        <span>You Receive</span>
                        <span className="positive">
                          {isLong 
                            ? `${tokensReceived.toLocaleString(undefined, {maximumFractionDigits: 0})} ${token.ticker}`
                            : `$${tokensReceived.toFixed(2)}`
                          }
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <button className={`submit-btn ${direction}`} disabled={!amountNum}>
                  {isLong ? `Buy ${token.ticker}` : `Sell ${token.ticker}`}
                </button>
              </div>
          </div>
        ) : (
          <div className="positions-list">
            {tokenPositions.length > 0 ? (
              tokenPositions.map(pos => (
                <div key={pos.id} className="position-card">
                  <div className="pos-header">
                    <span className={`pos-badge ${pos.type}`}>
                      {pos.type.toUpperCase()} {pos.leverage}x
                    </span>
                    <span className={`pos-pnl ${pos.pnl >= 0 ? 'positive' : 'negative'}`}>
                      {pos.pnl >= 0 ? '+' : ''}${pos.pnl.toFixed(2)}
                    </span>
                  </div>
                  <div className="pos-stats">
                    <div className="pos-stat">
                      <span>Size</span>
                      <span>${pos.size.toFixed(2)}</span>
                    </div>
                    <div className="pos-stat">
                      <span>Entry</span>
                      <span>${pos.entryPrice.toFixed(8)}</span>
                    </div>
                    <div className="pos-stat">
                      <span>Liq.</span>
                      <span className="danger">${pos.liquidationPrice.toFixed(8)}</span>
                    </div>
                  </div>
                  <div className="pos-actions">
                    <button className="pos-btn close">Close</button>
                    <button className="pos-btn add">+ Margin</button>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-positions">
                <p>No active positions</p>
                <button onClick={() => setActiveTab('trade')}>Start Trading</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
