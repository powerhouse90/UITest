import { useState } from 'react';
import { Wallet, Home, TrendingUp, Trophy, Info, Menu, X, Vault, Flame } from 'lucide-react';
import { mockTreasuryStats } from '../data/mockData';
import './Header.css';

interface HeaderProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  isConnected: boolean;
  onConnect: () => void;
}

export function Header({ currentTab, onTabChange, isConnected, onConnect }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'trade', label: 'Trade', icon: TrendingUp },
    { id: 'portfolio', label: 'Portfolio', icon: Wallet },
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
    { id: 'info', label: 'How It Works', icon: Info },
  ];

  const treasuryProgress = (mockTreasuryStats.totalBalance / mockTreasuryStats.targetForMainLaunch) * 100;

  return (
    <header className="header">
      {/* Treasury Banner */}
      <div className="treasury-banner">
        <div className="treasury-content">
          <div className="treasury-item">
            <Vault size={14} />
            <span className="treasury-label">Treasury:</span>
            <span className="treasury-value">${mockTreasuryStats.totalBalance.toLocaleString()}</span>
          </div>
          <div className="treasury-progress-container">
            <div className="treasury-progress-bar">
              <div 
                className="treasury-progress-fill" 
                style={{ width: `${Math.min(treasuryProgress, 100)}%` }}
              />
            </div>
            <span className="treasury-target">{treasuryProgress.toFixed(1)}% to main launch</span>
          </div>
          <div className="treasury-item">
            <Flame size={14} />
            <span className="treasury-label">Tokens Launched:</span>
            <span className="treasury-value">{mockTreasuryStats.tokensLaunched}</span>
          </div>
        </div>
      </div>

      <div className="header-content">
        <div className="header-left">
          <div className="logo" onClick={() => onTabChange('home')}>
            <span className="logo-icon">🎰</span>
            <span className="logo-text">PerpCasino</span>
            <span className="logo-badge">BASE</span>
          </div>
        </div>

        <nav className={`nav-tabs ${mobileMenuOpen ? 'open' : ''}`}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`nav-tab ${currentTab === tab.id ? 'active' : ''}`}
              onClick={() => {
                onTabChange(tab.id);
                setMobileMenuOpen(false);
              }}
            >
              <tab.icon size={18} />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>

        <div className="header-right">
          <button 
            className={`connect-btn ${isConnected ? 'connected' : ''}`}
            onClick={onConnect}
          >
            <Wallet size={18} />
            <span>{isConnected ? '0x1a2b...3c4d' : 'Connect'}</span>
          </button>
          
          <button 
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
    </header>
  );
}
