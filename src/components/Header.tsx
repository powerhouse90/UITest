import { useState } from 'react';
import { Wallet, Home, TrendingUp, Trophy, Info, Menu, X } from 'lucide-react';
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

  return (
    <header className="header">
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
