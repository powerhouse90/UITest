import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { firstToken, mockTreasuryStats } from '../data/mockData';
import { PulseIcon, RocketIcon } from './icons/PulseIcons';
import './PreLaunchHero.css';

interface PreLaunchHeroProps {
  onNotify?: () => void;
}

export function PreLaunchHero({ onNotify }: PreLaunchHeroProps) {
  const [countdown, setCountdown] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [notified, setNotified] = useState(false);

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const diff = firstToken.launchTime.getTime() - now.getTime();
      
      if (diff <= 0) {
        setCountdown({ hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const hours = Math.floor(diff / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      
      setCountdown({ hours, minutes, seconds });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleNotify = () => {
    setNotified(true);
    onNotify?.();
  };

  return (
    <div className="prelaunch-hero">
      <div className="prelaunch-badge">
        <RocketIcon size={16} />
        <span>LAUNCHING SOON</span>
      </div>

      <PulseIcon size={80} className="prelaunch-main-icon" />
      
      <h1 className="prelaunch-title">First Token Drops In</h1>
      
      <div className="countdown-display">
        <div className="countdown-block">
          <span className="countdown-number">{String(countdown.hours).padStart(2, '0')}</span>
          <span className="countdown-label">Hours</span>
        </div>
        <span className="countdown-separator">:</span>
        <div className="countdown-block">
          <span className="countdown-number">{String(countdown.minutes).padStart(2, '0')}</span>
          <span className="countdown-label">Minutes</span>
        </div>
        <span className="countdown-separator">:</span>
        <div className="countdown-block">
          <span className="countdown-number">{String(countdown.seconds).padStart(2, '0')}</span>
          <span className="countdown-label">Seconds</span>
        </div>
      </div>

      <p className="prelaunch-description">
        A new meme token launches every day at 00:00 UTC. Be ready to trade spot or perps with up to 50x leverage.
      </p>

      <div className="prelaunch-stats">
        <div className="prelaunch-stat">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M9 2L11 7H16L12 10.5L13.5 16L9 12.5L4.5 16L6 10.5L2 7H7L9 2Z" fill="#00c805"/>
          </svg>
          <div className="stat-content">
            <span className="stat-value">50x</span>
            <span className="stat-label">Max Leverage</span>
          </div>
        </div>
        <div className="prelaunch-stat">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M2 14L6 10L10 12L16 4" stroke="#00c805" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 4H16V8" stroke="#00c805" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <div className="stat-content">
            <span className="stat-value">${mockTreasuryStats.nextLaunchSeed}</span>
            <span className="stat-label">Initial Seed</span>
          </div>
        </div>
        <div className="prelaunch-stat">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <rect x="2" y="8" width="14" height="8" rx="2" stroke="#00c805" strokeWidth="1.5" fill="none"/>
            <path d="M5 8V5C5 2.79 6.79 1 9 1C11.21 1 13 2.79 13 5V8" stroke="#00c805" strokeWidth="1.5" fill="none"/>
          </svg>
          <div className="stat-content">
            <span className="stat-value">1% / 20%</span>
            <span className="stat-label">Buy / Sell Tax</span>
          </div>
        </div>
      </div>

      <div className="prelaunch-features">
        <div className="feature-item">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="6" r="3" stroke="#00c805" strokeWidth="1.5" fill="none"/>
            <path d="M3 14C3 11.24 5.24 9 8 9C10.76 9 13 11.24 13 14" stroke="#00c805" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <span>Holders earn 40% of all trading fees</span>
        </div>
        <div className="feature-item">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <rect x="2" y="3" width="12" height="10" rx="1" stroke="#00c805" strokeWidth="1.5" fill="none"/>
            <circle cx="8" cy="8" r="2" fill="#00c805"/>
          </svg>
          <span>Daily snapshots track airdrop eligibility</span>
        </div>
        <div className="feature-item">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="6" stroke="#00c805" strokeWidth="1.5" fill="none"/>
            <path d="M8 4V8L11 10" stroke="#00c805" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <span>New token every day at 00:00 UTC</span>
        </div>
      </div>

      <button 
        className={`notify-btn ${notified ? 'notified' : ''}`}
        onClick={handleNotify}
        disabled={notified}
      >
        <Bell size={18} />
        <span>{notified ? 'Reminder Set!' : 'Notify Me at Launch'}</span>
      </button>
    </div>
  );
}
