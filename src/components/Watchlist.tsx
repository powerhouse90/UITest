import type { WatchlistItem } from '../types';
import { Plus, Trophy, TrendingUp, TrendingDown, Share2, Flame, Star } from 'lucide-react';
import type { LeaderboardEntry } from '../types';
import './Watchlist.css';

interface WatchlistProps {
  items: WatchlistItem[];
  onSelectStock: (symbol: string) => void;
}

export function Watchlist({ items, onSelectStock }: WatchlistProps) {
  return (
    <div className="watchlist">
      <div className="watchlist-header">
        <h2 className="watchlist-title">
          <Star size={18} className="title-icon" />
          Watchlist
        </h2>
        <button className="watchlist-add">
          <Plus size={18} />
        </button>
      </div>
      
      <div className="watchlist-section">
        <div className="watchlist-section-header">
          <span className="watchlist-section-title">My First List</span>
          <span className="watchlist-section-count">{items.length}</span>
        </div>
        
        <div className="watchlist-items">
          {items.map((item, index) => (
            <div 
              key={item.symbol} 
              className="watchlist-item"
              onClick={() => onSelectStock(item.symbol)}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="watchlist-item-left">
                <div className="watchlist-item-icon">
                  {item.symbol.charAt(0)}
                </div>
                <span className="watchlist-item-symbol">{item.symbol}</span>
              </div>
              <div className="watchlist-item-chart">
                <svg viewBox="0 0 50 20" className={`mini-chart ${item.change >= 0 ? 'positive' : 'negative'}`}>
                  <path
                    d={item.change >= 0 
                      ? "M0,15 L10,12 L20,14 L30,8 L40,10 L50,5" 
                      : "M0,5 L10,8 L20,6 L30,12 L40,10 L50,15"}
                    fill="none"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div className="watchlist-item-right">
                <span className="watchlist-item-price">${item.price.toFixed(2)}</span>
                <span className={`watchlist-item-change ${item.change >= 0 ? 'positive' : 'negative'}`}>
                  {item.change >= 0 ? '+' : ''}{item.changePercent.toFixed(2)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="watchlist-cta">
        <button className="cta-btn">
          <Plus size={16} />
          Add to List
        </button>
      </div>
    </div>
  );
}

interface LeaderboardProps {
  entries: LeaderboardEntry[];
}

export function Leaderboard({ entries }: LeaderboardProps) {
  const getRankDisplay = (rank: number) => {
    if (rank === 1) return { emoji: '🥇', class: 'gold' };
    if (rank === 2) return { emoji: '🥈', class: 'silver' };
    if (rank === 3) return { emoji: '🥉', class: 'bronze' };
    return { emoji: `#${rank}`, class: '' };
  };

  return (
    <div className="leaderboard">
      <div className="leaderboard-header">
        <div className="leaderboard-title-group">
          <Trophy size={20} className="trophy-icon" />
          <h2 className="leaderboard-title">Top Traders</h2>
          <span className="live-badge">
            <Flame size={12} />
            LIVE
          </span>
        </div>
        <button className="share-btn">
          <Share2 size={14} />
        </button>
      </div>

      <div className="leaderboard-list">
        {entries.map((entry, index) => {
          const rankInfo = getRankDisplay(entry.rank);
          return (
            <div 
              key={entry.address} 
              className={`leaderboard-item ${rankInfo.class}`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="rank-badge">{rankInfo.emoji}</div>
              
              <div className="trader-info">
                <div className="trader-avatar" style={{ 
                  background: `linear-gradient(135deg, hsl(${entry.rank * 60}, 70%, 60%), hsl(${entry.rank * 60 + 40}, 70%, 50%))` 
                }} />
                <div className="trader-details">
                  <span className="trader-name">{entry.displayName}</span>
                  <span className="trader-address">{entry.address}</span>
                </div>
              </div>

              <div className="trader-stats">
                <div className="stat-pill">
                  <span className="stat-value">{entry.winRate}%</span>
                  <span className="stat-label">Win</span>
                </div>
              </div>

              <div className="trader-pnl">
                <span className={`pnl-amount ${entry.pnl >= 0 ? 'positive' : 'negative'}`}>
                  {entry.pnl >= 0 ? '+' : ''}${entry.pnl.toLocaleString()}
                </span>
                {entry.biggestPosition && (
                  <span className={`biggest-position ${entry.biggestPosition.type}`}>
                    {entry.biggestPosition.type === 'long' ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                    {entry.biggestPosition.leverage}x
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <button className="twitter-cta">
        <span className="twitter-icon">𝕏</span>
        Share your rank
      </button>
    </div>
  );
}
