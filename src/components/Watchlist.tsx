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
  isPreLaunch?: boolean;
}

// Custom medal SVGs - declared outside component
const GoldMedal = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
    <circle cx="16" cy="14" r="10" fill="#FFD700" stroke="#FFA500" strokeWidth="2"/>
    <text x="16" y="18" textAnchor="middle" fill="#8B4513" fontSize="12" fontWeight="bold">1</text>
    <path d="M12 24L16 28L20 24" fill="#DC143C"/>
    <path d="M10 24H22V26H10V24Z" fill="#DC143C"/>
  </svg>
);

const SilverMedal = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
    <circle cx="16" cy="14" r="10" fill="#C0C0C0" stroke="#A0A0A0" strokeWidth="2"/>
    <text x="16" y="18" textAnchor="middle" fill="#505050" fontSize="12" fontWeight="bold">2</text>
    <path d="M12 24L16 28L20 24" fill="#4169E1"/>
    <path d="M10 24H22V26H10V24Z" fill="#4169E1"/>
  </svg>
);

const BronzeMedal = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
    <circle cx="16" cy="14" r="10" fill="#CD7F32" stroke="#8B4513" strokeWidth="2"/>
    <text x="16" y="18" textAnchor="middle" fill="#4A2C0A" fontSize="12" fontWeight="bold">3</text>
    <path d="M12 24L16 28L20 24" fill="#228B22"/>
    <path d="M10 24H22V26H10V24Z" fill="#228B22"/>
  </svg>
);

export function Leaderboard({ entries, isPreLaunch = false }: LeaderboardProps) {
  const getRankDisplay = (rank: number) => {
    if (rank === 1) return { class: 'gold', medal: <GoldMedal /> };
    if (rank === 2) return { class: 'silver', medal: <SilverMedal /> };
    if (rank === 3) return { class: 'bronze', medal: <BronzeMedal /> };
    return { class: '', medal: <span className="rank-number">#{rank}</span> };
  };

  if (isPreLaunch) {
    return (
      <div className="leaderboard prelaunch">
        <div className="leaderboard-header">
          <div className="leaderboard-title-group">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="trophy-icon">
              <path d="M6 3H14V4C14 7.31 11.31 10 8 10H12C8.69 10 6 7.31 6 4V3Z" fill="#3a3a3a" stroke="#4a4a4a" strokeWidth="1"/>
              <path d="M6 5C4 5 3 6.5 3 7.5C3 8.5 4 9.5 6 9.5" stroke="#4a4a4a" strokeWidth="1" fill="none"/>
              <path d="M14 5C16 5 17 6.5 17 7.5C17 8.5 16 9.5 14 9.5" stroke="#4a4a4a" strokeWidth="1" fill="none"/>
              <rect x="9" y="10" width="2" height="3" fill="#3a3a3a"/>
              <rect x="7" y="13" width="6" height="2" rx="0.5" fill="#3a3a3a"/>
            </svg>
            <h2 className="leaderboard-title">Leaderboard</h2>
          </div>
        </div>
        
        <div className="leaderboard-prelaunch">
          <svg width="56" height="56" viewBox="0 0 48 48" fill="none" className="prelaunch-trophy">
            <path d="M16 8L32 8L30 24C30 28 27 30 24 30C21 30 18 28 18 24L16 8Z" fill="#2a2a2a" stroke="#3a3a3a" strokeWidth="1.5"/>
            <path d="M16 12C12 12 10 16 10 18C10 20 12 22 16 22" fill="none" stroke="#3a3a3a" strokeWidth="1.5"/>
            <path d="M32 12C36 12 38 16 38 18C38 20 36 22 32 22" fill="none" stroke="#3a3a3a" strokeWidth="1.5"/>
            <rect x="22" y="30" width="4" height="6" fill="#2a2a2a"/>
            <rect x="18" y="36" width="12" height="4" rx="1" fill="#2a2a2a" stroke="#3a3a3a" strokeWidth="1"/>
            <circle cx="24" cy="18" r="5" fill="#1a1a1a" stroke="#00c805" strokeWidth="1.5"/>
          </svg>
          <h3>Competition Starts at Launch</h3>
          <p>Top traders will be ranked by total P&L. Be the first to claim the #1 spot!</p>
          <div className="prelaunch-prizes">
            <div className="prize-item">
              <GoldMedal />
              <span className="prize-label">1st Place</span>
            </div>
            <div className="prize-item">
              <SilverMedal />
              <span className="prize-label">2nd Place</span>
            </div>
            <div className="prize-item">
              <BronzeMedal />
              <span className="prize-label">3rd Place</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
              <div className="rank-badge">{rankInfo.medal}</div>
              
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
