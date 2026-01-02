import { useState } from 'react';
import { TrendingUp, TrendingDown, AlertTriangle, Zap, Info } from 'lucide-react';
import type { MemeToken } from '../types';
import './TradingPanel.css';

interface TradingPanelProps {
  token: MemeToken;
}

export function TradingPanel({ token }: TradingPanelProps) {
  const [mode, setMode] = useState<'spot' | 'perps'>('spot');
  const [direction, setDirection] = useState<'buy' | 'sell'>('buy');
  const [amount, setAmount] = useState('');
  const [leverage, setLeverage] = useState(10);

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

  return (
    <div className="trading-panel">
      {/* Panel Header */}
      <div className="panel-header">
        <div className="panel-title">
          <Zap size={18} className="panel-icon" />
          <span>Trade {token.ticker}</span>
        </div>
        <button className="panel-info-btn">
          <Info size={16} />
        </button>
      </div>

      <div className="panel-content">
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

        {/* Amount Input */}
        <div className="input-group">
          <label className="input-label">
            <span>{mode === 'spot' ? (isLong ? 'You Pay' : 'You Sell') : 'Margin'}</span>
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
          </div>
        )}

        {/* Order Summary */}
        <div className="order-summary">
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
                <span className="summary-label">Entry Price</span>
                <span className="summary-value">${token.price.toFixed(8)}</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Liquidation Price</span>
                <span className="summary-value danger">${liquidationPrice.toFixed(8)}</span>
              </div>
            </>
          )}
        </div>

        {/* Submit Button */}
        <button className={`submit-btn ${direction}`} disabled={!amountNum}>
          {mode === 'spot' 
            ? (isLong ? `Buy ${token.ticker}` : `Sell ${token.ticker}`)
            : (isLong ? `Long ${token.ticker}` : `Short ${token.ticker}`)
          }
        </button>

        {/* Risk Warning for Perps */}
        {mode === 'perps' && (
          <div className="risk-warning">
            <AlertTriangle size={16} />
            <span className="risk-warning-text">
              High leverage trading carries significant risk. You can lose your entire margin.
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
