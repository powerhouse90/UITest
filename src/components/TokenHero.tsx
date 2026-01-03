import { useState, useEffect } from 'react';
import { Clock, TrendingUp, TrendingDown, Zap, Award, Info } from 'lucide-react';
import type { MemeToken } from '../types';
import { getTimeUntilNextLaunch, mockTreasuryStats } from '../data/mockData';
import './TokenHero.css';

interface TokenHeroProps {
  token: MemeToken;
  onTrade: () => void;
}

export function TokenHero({ token, onTrade }: TokenHeroProps) {
  const [countdown, setCountdown] = useState(getTimeUntilNextLaunch());
  const isPositive = token.priceChangePercent24h >= 0;
  const tvlProgress = Math.min((token.tvl / 10000) * 100, 100);

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(getTimeUntilNextLaunch());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="token-hero">
      {/* Countdown - top right */}
      <div className="hero-countdown">
        <div className="countdown-label">Next token in</div>
        <div className="countdown-value">
          <Clock size={16} />
          {countdown}
        </div>
      </div>

      {/* Main section with icon and info */}
      <div className="hero-main">
        <div className="hero-icon">{token.image}</div>
        <div className="hero-content">
          <div className="hero-theme">{token.theme}</div>
          <h1 className="hero-name">{token.name}</h1>
          <div className="hero-ticker">{token.ticker}</div>
          <p className="hero-description">{token.description}</p>
        </div>
      </div>

      {/* Price section */}
      <div className="hero-price-section">
        <div className="hero-price">${token.price.toFixed(8)}</div>
        <div className={`hero-change ${isPositive ? 'positive' : 'negative'}`}>
          {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
          {isPositive ? '+' : ''}{token.priceChangePercent24h.toFixed(2)}%
        </div>
      </div>

      {/* Stats row */}
      <div className="hero-stats">
        <div className="hero-stat">
          <span className="hero-stat-label">Pool TVL</span>
          <span className="hero-stat-value">${token.tvl.toLocaleString()}</span>
        </div>
        <div className="hero-stat">
          <span className="hero-stat-label">24h Volume</span>
          <span className="hero-stat-value">${token.volume24h.toLocaleString()}</span>
        </div>
        <div className="hero-stat">
          <span className="hero-stat-label">Max Leverage</span>
          <span className="hero-stat-value leverage">{token.maxLeverage}x</span>
        </div>
      </div>

      {/* Tax section */}
      <div className="hero-taxes">
        <div className="tax-header">
          <span className="tax-title">Dynamic Tax Rate</span>
          <span className="tax-info">
            <Info size={12} />
            Converges as TVL grows
          </span>
        </div>
        <div className="tax-row">
          <div className="tax-item">
            <span className="tax-label">Buy</span>
            <span className="tax-value buy">{token.buyTax.toFixed(1)}%</span>
          </div>
          <div className="tax-progress">
            <div className="tax-progress-bar">
              <div 
                className="tax-progress-fill" 
                style={{ width: `${tvlProgress}%` }} 
              />
            </div>
            <span className="tax-progress-label">{tvlProgress.toFixed(0)}% to 5%/5%</span>
          </div>
          <div className="tax-item">
            <span className="tax-label">Sell</span>
            <span className="tax-value sell">{token.sellTax.toFixed(1)}%</span>
          </div>
        </div>
      </div>

      {/* Holder incentive banner */}
      <div className="hodler-banner">
        <Award size={16} className="banner-icon" />
        <div className="banner-content">
          <span className="banner-title">Holder Bonus</span>
          <span className="banner-text">Buy & hold to earn fee redistribution + airdrop eligibility</span>
        </div>
      </div>

      {/* Seed info */}
      <div className="seed-info">
        <span className="seed-label">Initial Seed:</span>
        <span className="seed-value">${mockTreasuryStats.nextLaunchSeed}</span>
        <span className="seed-source">from Treasury</span>
      </div>

      {/* Trade button */}
      <div className="hero-actions">
        <button className="hero-btn primary" onClick={onTrade}>
          <Zap size={20} />
          Trade {token.ticker}
        </button>
      </div>
    </div>
  );
}
