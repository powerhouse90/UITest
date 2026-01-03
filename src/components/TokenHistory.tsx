import { useState } from 'react';
import { TrendingUp, TrendingDown, ArrowRight, Clock, Rocket, ChevronDown, ChevronUp, Calendar } from 'lucide-react';
import type { MemeToken } from '../types';
import './TokenHistory.css';

interface TokenHistoryProps {
  tokens: MemeToken[];
  nextToken?: MemeToken;
  onTokenSelect: (token: MemeToken) => void;
  isPreLaunch?: boolean;
}

export function TokenHistory({ tokens, nextToken, onTokenSelect, isPreLaunch = false }: TokenHistoryProps) {
  const [showAll, setShowAll] = useState(false);
  const displayTokens = showAll ? tokens : tokens.slice(0, 5);

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / 86400000);
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    return `${days}d ago`;
  };

  const formatNextLaunch = (date: Date) => {
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    
    if (hours < 1) return `${minutes}m`;
    if (hours < 24) return `${hours}h ${minutes}m`;
    return 'Tomorrow 00:00 UTC';
  };

  // Pre-launch empty state
  if (isPreLaunch) {
    return (
      <div className="token-history prelaunch-state">
        <div className="history-header">
          <h2><Calendar size={20} /> Token Schedule</h2>
        </div>

        {nextToken && (
          <div className="next-token-card first-launch">
            <div className="next-token-header">
              <div className="next-badge first">
                <Rocket size={12} />
                <span>FIRST TOKEN</span>
              </div>
              <div className="next-countdown">
                <Clock size={14} />
                <span>{formatNextLaunch(nextToken.launchTime)}</span>
              </div>
            </div>
            
            <div className="next-token-main">
              <div className="next-token-icon mystery">?</div>
              <div className="next-token-info">
                <div className="next-token-name">Theme TBA</div>
                <div className="next-token-ticker">Revealed at launch</div>
              </div>
            </div>
            
            <div className="next-token-desc" style={{ color: '#a0a0a0', fontSize: '14px', marginTop: '12px' }}>
              The first Pulse token will launch based on trending topics. Theme and ticker will be revealed at 00:00 UTC.
            </div>
            
            <div className="next-token-stats">
              <div className="next-stat">
                <span className="next-stat-label">Initial Seed</span>
                <span className="next-stat-value">$350</span>
              </div>
              <div className="next-stat">
                <span className="next-stat-label">Buy Tax</span>
                <span className="next-stat-value green">1%</span>
              </div>
              <div className="next-stat">
                <span className="next-stat-label">Sell Tax</span>
                <span className="next-stat-value red">20%</span>
              </div>
              <div className="next-stat">
                <span className="next-stat-label">Max Leverage</span>
                <span className="next-stat-value orange">50x</span>
              </div>
            </div>
          </div>
        )}

        <div className="empty-history">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="empty-history-icon-svg">
            <rect x="10" y="6" width="28" height="36" rx="3" fill="#1a1a1a" stroke="#00c805" strokeWidth="2"/>
            <line x1="16" y1="14" x2="32" y2="14" stroke="#00c805" strokeWidth="2" strokeLinecap="round" opacity="0.8"/>
            <line x1="16" y1="22" x2="32" y2="22" stroke="#00c805" strokeWidth="2" strokeLinecap="round" opacity="0.6"/>
            <line x1="16" y1="30" x2="28" y2="30" stroke="#00c805" strokeWidth="2" strokeLinecap="round" opacity="0.4"/>
          </svg>
          <div className="empty-history-title">No Tokens Yet</div>
          <div className="empty-history-text">Token history will appear here after the first launch</div>
        </div>
      </div>
    );
  }

  return (
    <div className="token-history">
      <div className="history-header">
        <h2>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{marginRight: '8px', verticalAlign: 'middle'}}>
            <rect x="4" y="2" width="12" height="16" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5"/>
            <line x1="7" y1="6" x2="13" y2="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="7" y1="10" x2="13" y2="10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
            <line x1="7" y1="14" x2="11" y2="14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.4"/>
          </svg>
          Token History
        </h2>
        <span className="history-count">{tokens.length} launched</span>
      </div>

      {/* Next Token Preview */}
      {nextToken && (
        <div className="next-token-card">
          <div className="next-token-header">
            <div className="next-badge">
              <Rocket size={12} />
              <span>NEXT LAUNCH</span>
            </div>
            <div className="next-countdown">
              <Clock size={14} />
              <span>{formatNextLaunch(nextToken.launchTime)}</span>
            </div>
          </div>
          
          <div className="next-token-main">
            <div className="next-token-icon">{nextToken.image}</div>
            <div className="next-token-info">
              <div className="next-token-name">{nextToken.name}</div>
              <div className="next-token-ticker">{nextToken.ticker}</div>
            </div>
          </div>
          
          <div className="next-token-theme">{nextToken.theme}</div>
          <div className="next-token-desc">{nextToken.description}</div>
          
          <div className="next-token-stats">
            <div className="next-stat">
              <span className="next-stat-label">Initial Seed</span>
              <span className="next-stat-value">$350</span>
            </div>
            <div className="next-stat">
              <span className="next-stat-label">Buy Tax</span>
              <span className="next-stat-value green">1%</span>
            </div>
            <div className="next-stat">
              <span className="next-stat-label">Sell Tax</span>
              <span className="next-stat-value red">20%</span>
            </div>
            <div className="next-stat">
              <span className="next-stat-label">Max Leverage</span>
              <span className="next-stat-value orange">50x</span>
            </div>
          </div>

          <button className="notify-btn">
            🔔 Set Reminder
          </button>
        </div>
      )}

      {/* Section Title for Past Tokens */}
      <div className="past-tokens-header">
        <span>Past Launches</span>
        <div className="past-tokens-line" />
      </div>

      {/* Past Tokens */}
      <div className="history-list">
        {displayTokens.map((token, index) => {
          const isPositive = token.priceChangePercent24h >= 0;
          return (
            <div 
              key={token.id} 
              className="history-item"
              onClick={() => onTokenSelect(token)}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="history-item-left">
                <div className="history-icon">{token.image}</div>
                <div className="history-info">
                  <div className="history-name">{token.name}</div>
                  <div className="history-meta">
                    <span className="history-ticker">{token.ticker}</span>
                    <span className="history-dot">•</span>
                    <span className="history-time">{formatDate(token.launchTime)}</span>
                  </div>
                </div>
              </div>
              
              <div className="history-item-right">
                <div className="history-price">${token.price.toFixed(8)}</div>
                <div className={`history-change ${isPositive ? 'positive' : 'negative'}`}>
                  {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                  {isPositive ? '+' : ''}{token.priceChangePercent24h.toFixed(1)}%
                </div>
                <div className="history-tvl">TVL ${(token.tvl / 1000).toFixed(1)}k</div>
              </div>

              <ArrowRight className="history-arrow" size={16} />
            </div>
          );
        })}
      </div>

      {/* Show More/Less Button */}
      {tokens.length > 5 && (
        <button className="show-more-btn" onClick={() => setShowAll(!showAll)}>
          {showAll ? (
            <>
              <ChevronUp size={16} />
              Show Less
            </>
          ) : (
            <>
              <ChevronDown size={16} />
              Show All ({tokens.length - 5} more)
            </>
          )}
        </button>
      )}
    </div>
  );
}
