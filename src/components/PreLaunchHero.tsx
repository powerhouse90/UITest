import { useState, useEffect } from 'react';
import { firstToken } from '../data/mockData';
import './PreLaunchHero.css';

interface PreLaunchHeroProps {
  onNotify?: () => void;
}

export function PreLaunchHero({ onNotify }: PreLaunchHeroProps) {
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [notified, setNotified] = useState(false);
  const [waitlistCount] = useState(2847);

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const diff = firstToken.launchTime.getTime() - now.getTime();
      
      if (diff <= 0) {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(diff / 86400000);
      const hours = Math.floor((diff % 86400000) / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      
      setCountdown({ days, hours, minutes, seconds });
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
    <div className="hero">
      <div className="hero-bg">
        {/* Main gradient orbs */}
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="gradient-orb orb-3"></div>
        <div className="gradient-orb orb-4"></div>
        <div className="gradient-orb orb-5"></div>
        <div className="gradient-orb orb-6"></div>
        
        {/* Floating elements */}
        <div className="floating-elements">
          <span className="float-item float-1">🚀</span>
          <span className="float-item float-2">💎</span>
          <span className="float-item float-3">$$$</span>
          <span className="float-item float-4">🌙</span>
          <span className="float-item float-5">100x</span>
          <span className="float-item float-6">📈</span>
          <span className="float-item float-7">🔥</span>
          <span className="float-item float-8">+420%</span>
          <span className="float-item float-9">💰</span>
          <span className="float-item float-10">🦍</span>
        </div>
      </div>

      <div className="hero-content">
        {/* Badge */}
        <div className="live-badge">
          <div className="live-pulse"></div>
          <span>GENESIS DROP</span>
        </div>

        {/* Main headline */}
        <h1 className="hero-title">
          <span className="title-line-1">Trade Memes.</span>
          <span className="title-line-2">Stack Profits.</span>
          <span className="title-line-3">Every. Single. Day.</span>
        </h1>

        {/* Value props */}
        <div className="value-props">
          <div className="value-prop">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 1L12.5 6.5L18 7.5L14 11.5L15 17L10 14.5L5 17L6 11.5L2 7.5L7.5 6.5L10 1Z" fill="currentColor"/>
            </svg>
            <span>New token every 24h</span>
          </div>
          <div className="value-prop">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 1L12.5 6.5L18 7.5L14 11.5L15 17L10 14.5L5 17L6 11.5L2 7.5L7.5 6.5L10 1Z" fill="currentColor"/>
            </svg>
            <span>50x leverage perps</span>
          </div>
          <div className="value-prop highlight">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 1L12.5 6.5L18 7.5L14 11.5L15 17L10 14.5L5 17L6 11.5L2 7.5L7.5 6.5L10 1Z" fill="currentColor"/>
            </svg>
            <span>Holders earn 40% of fees</span>
          </div>
        </div>

        {/* Countdown */}
        <div className="countdown-section">
          <div className="countdown-header">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M8 4V8L11 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <span>Genesis token drops in</span>
          </div>
          <div className="countdown-grid">
            <div className="countdown-item">
              <div className="countdown-value">{String(countdown.days).padStart(2, '0')}</div>
              <div className="countdown-label">Days</div>
            </div>
            <span className="countdown-sep">:</span>
            <div className="countdown-item">
              <div className="countdown-value">{String(countdown.hours).padStart(2, '0')}</div>
              <div className="countdown-label">Hours</div>
            </div>
            <span className="countdown-sep">:</span>
            <div className="countdown-item">
              <div className="countdown-value">{String(countdown.minutes).padStart(2, '0')}</div>
              <div className="countdown-label">Mins</div>
            </div>
            <span className="countdown-sep">:</span>
            <div className="countdown-item highlight">
              <div className="countdown-value">{String(countdown.seconds).padStart(2, '0')}</div>
              <div className="countdown-label">Secs</div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="cta-section">
          <button 
            className={`cta-main ${notified ? 'success' : ''}`}
            onClick={handleNotify}
            disabled={notified}
          >
            <span className="cta-bg"></span>
            <span className="cta-content">
              {notified ? (
                <>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M4 10L8 14L16 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span>You're on the list!</span>
                </>
              ) : (
                <>
                  <span>Join Waitlist</span>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M4 10H16M16 10L11 5M16 10L11 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </>
              )}
            </span>
          </button>
          
          {/* Social proof */}
          <div className="social-proof">
            <div className="avatar-stack">
              <div className="avatar"></div>
              <div className="avatar"></div>
              <div className="avatar"></div>
              <div className="avatar"></div>
              <div className="avatar"></div>
            </div>
            <span className="proof-text">
              <strong>{waitlistCount.toLocaleString()}+</strong> degens already waiting
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="stats-row">
          <div className="stat-card">
            <span className="stat-value green">1%</span>
            <span className="stat-label">Entry</span>
          </div>
          <div className="stat-card">
            <span className="stat-value orange">20%</span>
            <span className="stat-label">Exit Tax</span>
          </div>
          <div className="stat-card">
            <span className="stat-value purple">50x</span>
            <span className="stat-label">Leverage</span>
          </div>
          <div className="stat-card gold-card">
            <span className="stat-value gold">40%</span>
            <span className="stat-label">Fee Share</span>
          </div>
        </div>

        {/* Trust */}
        <div className="trust-bar">
          <div className="trust-item">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1L13 4V6.5C13 10.1 10.4 13.4 7 14C3.6 13.4 1 10.1 1 6.5V4L7 1Z" stroke="currentColor" strokeWidth="1.2"/>
              <path d="M4 7L6 9L10 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>On-Chain</span>
          </div>
          <div className="trust-divider"></div>
          <div className="trust-item">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <rect x="2" y="4" width="10" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.2"/>
              <path d="M4.5 4V3C4.5 1.9 5.4 1 6.5 1H7.5C8.6 1 9.5 1.9 9.5 3V4" stroke="currentColor" strokeWidth="1.2"/>
            </svg>
            <span>Non-Custodial</span>
          </div>
          <div className="trust-divider"></div>
          <div className="trust-item">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.2"/>
              <path d="M7 3V7L9.5 8.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
            <span>Base L2</span>
          </div>
        </div>
      </div>
    </div>
  );
}
