// Custom SVG icons for Pulse - Elite trading platform aesthetic

interface IconProps {
  size?: number;
  className?: string;
}

// Main Pulse logo icon - animated pulse ring
export function PulseIcon({ size = 64, className = '' }: IconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 64 64" 
      fill="none" 
      className={`pulse-logo ${className}`}
    >
      <defs>
        <linearGradient id="pulseGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00c805" />
          <stop offset="100%" stopColor="#00ff3c" />
        </linearGradient>
      </defs>
      
      {/* Animated outer pulse ring */}
      <circle 
        cx="32" cy="32" r="28" 
        stroke="url(#pulseGradient)" 
        strokeWidth="1.5" 
        fill="none"
        className="pulse-ring-outer"
      />
      
      {/* Animated middle pulse ring */}
      <circle 
        cx="32" cy="32" r="22" 
        stroke="url(#pulseGradient)" 
        strokeWidth="1.5" 
        fill="none"
        className="pulse-ring-middle"
      />
      
      {/* Static inner ring */}
      <circle 
        cx="32" cy="32" r="16" 
        stroke="url(#pulseGradient)" 
        strokeWidth="2" 
        fill="none"
        opacity="0.8"
      />
      
      {/* Core circle */}
      <circle 
        cx="32" cy="32" r="10" 
        fill="url(#pulseGradient)"
        className="pulse-core"
      />
      
      {/* Heartbeat line */}
      <path 
        d="M18 32 L24 32 L26 26 L29 38 L32 28 L35 36 L38 32 L46 32" 
        stroke="#000" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        fill="none"
        className="pulse-line"
      />
    </svg>
  );
}

// Countdown/Timer icon for pre-launch states
export function CountdownIcon({ size = 48, className = '' }: IconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 48 48" 
      fill="none" 
      className={className}
    >
      <defs>
        <linearGradient id="countdownGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3a3a3a" />
          <stop offset="100%" stopColor="#2a2a2a" />
        </linearGradient>
      </defs>
      {/* Outer circle */}
      <circle cx="24" cy="24" r="22" stroke="#2a2a2a" strokeWidth="2" fill="none" />
      {/* Progress arc */}
      <circle 
        cx="24" cy="24" r="22" 
        stroke="#00c805" 
        strokeWidth="2" 
        fill="none"
        strokeDasharray="138.2"
        strokeDashoffset="34.5"
        strokeLinecap="round"
        transform="rotate(-90 24 24)"
        opacity="0.8"
      />
      {/* Inner circle */}
      <circle cx="24" cy="24" r="16" fill="url(#countdownGradient)" />
      {/* Clock hands */}
      <line x1="24" y1="24" x2="24" y2="14" stroke="#6b6b6b" strokeWidth="2" strokeLinecap="round" />
      <line x1="24" y1="24" x2="30" y2="24" stroke="#6b6b6b" strokeWidth="2" strokeLinecap="round" />
      {/* Center dot */}
      <circle cx="24" cy="24" r="2" fill="#6b6b6b" />
    </svg>
  );
}

// Trading chart icon for trade tab
export function TradingIcon({ size = 48, className = '' }: IconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 48 48" 
      fill="none" 
      className={className}
    >
      <defs>
        <linearGradient id="chartGradient" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#00c805" stopOpacity="0" />
          <stop offset="100%" stopColor="#00c805" stopOpacity="0.2" />
        </linearGradient>
      </defs>
      {/* Background grid */}
      <line x1="8" y1="12" x2="8" y2="40" stroke="#1a1a1a" strokeWidth="1" />
      <line x1="8" y1="40" x2="40" y2="40" stroke="#1a1a1a" strokeWidth="1" />
      <line x1="8" y1="20" x2="40" y2="20" stroke="#1a1a1a" strokeWidth="1" strokeDasharray="2 2" />
      <line x1="8" y1="30" x2="40" y2="30" stroke="#1a1a1a" strokeWidth="1" strokeDasharray="2 2" />
      {/* Chart area fill */}
      <path 
        d="M12 32 L18 28 L24 30 L30 18 L36 22 L36 40 L12 40 Z" 
        fill="url(#chartGradient)"
      />
      {/* Chart line */}
      <path 
        d="M12 32 L18 28 L24 30 L30 18 L36 22" 
        stroke="#00c805" 
        strokeWidth="2.5" 
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Data points */}
      <circle cx="12" cy="32" r="2.5" fill="#00c805" />
      <circle cx="18" cy="28" r="2.5" fill="#00c805" />
      <circle cx="24" cy="30" r="2.5" fill="#00c805" />
      <circle cx="30" cy="18" r="2.5" fill="#00c805" />
      <circle cx="36" cy="22" r="2.5" fill="#00c805" />
    </svg>
  );
}

// Portfolio/Wallet icon
export function PortfolioIcon({ size = 48, className = '' }: IconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 48 48" 
      fill="none" 
      className={className}
    >
      <defs>
        <linearGradient id="portfolioGlow" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00c805" />
          <stop offset="100%" stopColor="#00ff3c" />
        </linearGradient>
        <filter id="portfolioFilter">
          <feGaussianBlur stdDeviation="1.5" result="blur"/>
          <feMerge>
            <feMergeNode in="blur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      {/* Outer circle */}
      <circle cx="24" cy="24" r="20" fill="none" stroke="url(#portfolioGlow)" strokeWidth="2" opacity="0.3"/>
      {/* Inner circle */}
      <circle cx="24" cy="24" r="14" fill="#0a0a0a" stroke="url(#portfolioGlow)" strokeWidth="2"/>
      {/* Chart bars */}
      <rect x="17" y="26" width="4" height="8" rx="1" fill="#00c805" opacity="0.6"/>
      <rect x="22" y="22" width="4" height="12" rx="1" fill="#00c805" opacity="0.8"/>
      <rect x="27" y="18" width="4" height="16" rx="1" fill="#00c805" filter="url(#portfolioFilter)"/>
      {/* Trend line */}
      <path d="M17 28L22 24L27 20L31 16" stroke="#00ff3c" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.8"/>
      {/* Dot at end */}
      <circle cx="31" cy="16" r="2" fill="#00ff3c"/>
    </svg>
  );
}

// Leaderboard/Trophy icon
export function LeaderboardIcon({ size = 48, className = '' }: IconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 48 48" 
      fill="none" 
      className={className}
    >
      <defs>
        <linearGradient id="trophyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3a3a3a" />
          <stop offset="100%" stopColor="#2a2a2a" />
        </linearGradient>
        <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFD700" />
          <stop offset="100%" stopColor="#FFA500" />
        </linearGradient>
      </defs>
      {/* Trophy cup */}
      <path 
        d="M16 8 L32 8 L30 24 C30 28 27 30 24 30 C21 30 18 28 18 24 L16 8 Z" 
        fill="url(#trophyGradient)" 
        stroke="#4a4a4a" 
        strokeWidth="1.5"
      />
      {/* Left handle */}
      <path 
        d="M16 12 C12 12 10 16 10 18 C10 20 12 22 16 22" 
        fill="none" 
        stroke="#4a4a4a" 
        strokeWidth="1.5"
      />
      {/* Right handle */}
      <path 
        d="M32 12 C36 12 38 16 38 18 C38 20 36 22 32 22" 
        fill="none" 
        stroke="#4a4a4a" 
        strokeWidth="1.5"
      />
      {/* Stem */}
      <rect x="22" y="30" width="4" height="6" fill="#3a3a3a" />
      {/* Base */}
      <rect x="18" y="36" width="12" height="4" rx="1" fill="#3a3a3a" stroke="#4a4a4a" strokeWidth="1" />
      {/* Star/badge */}
      <circle cx="24" cy="18" r="5" fill="#1a1a1a" stroke="#00c805" strokeWidth="1.5" />
      <text x="24" y="21" textAnchor="middle" fill="#00c805" fontSize="8" fontWeight="bold">1</text>
    </svg>
  );
}

// Rocket icon for launches
export function RocketIcon({ size = 48, className = '' }: IconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 48 48" 
      fill="none" 
      className={className}
    >
      <defs>
        <linearGradient id="rocketGradient" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#2a2a2a" />
          <stop offset="100%" stopColor="#3a3a3a" />
        </linearGradient>
        <linearGradient id="flameGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#00c805" />
          <stop offset="50%" stopColor="#00ff3c" />
          <stop offset="100%" stopColor="#00c805" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Rocket body */}
      <path 
        d="M24 6 C24 6 32 14 32 26 L32 32 L28 36 L20 36 L16 32 L16 26 C16 14 24 6 24 6 Z" 
        fill="url(#rocketGradient)" 
        stroke="#4a4a4a" 
        strokeWidth="1.5"
      />
      {/* Window */}
      <circle cx="24" cy="20" r="4" fill="#1a1a1a" stroke="#00c805" strokeWidth="1.5" />
      {/* Left fin */}
      <path d="M16 28 L10 34 L12 36 L16 32" fill="#2a2a2a" stroke="#4a4a4a" strokeWidth="1" />
      {/* Right fin */}
      <path d="M32 28 L38 34 L36 36 L32 32" fill="#2a2a2a" stroke="#4a4a4a" strokeWidth="1" />
      {/* Flame */}
      <path 
        d="M20 36 L22 44 L24 40 L26 44 L28 36" 
        fill="url(#flameGradient)"
      />
    </svg>
  );
}

// Lock icon for awaiting launch
export function AwaitingIcon({ size = 48, className = '' }: IconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 48 48" 
      fill="none" 
      className={className}
    >
      <defs>
        <linearGradient id="lockGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2a2a2a" />
          <stop offset="100%" stopColor="#1a1a1a" />
        </linearGradient>
      </defs>
      {/* Lock body */}
      <rect x="12" y="22" width="24" height="18" rx="3" fill="url(#lockGradient)" stroke="#3a3a3a" strokeWidth="1.5" />
      {/* Lock shackle */}
      <path 
        d="M16 22 L16 16 C16 11.58 19.58 8 24 8 C28.42 8 32 11.58 32 16 L32 22" 
        fill="none" 
        stroke="#3a3a3a" 
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* Keyhole */}
      <circle cx="24" cy="29" r="3" fill="#3a3a3a" />
      <rect x="23" y="31" width="2" height="4" fill="#3a3a3a" />
      {/* Pulse ring */}
      <circle cx="24" cy="29" r="6" stroke="#00c805" strokeWidth="1" opacity="0.4" fill="none" />
    </svg>
  );
}

// Home icon
export function HomeIcon({ size = 20, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className}>
      <path d="M3 8L10 2L17 8V17C17 17.55 16.55 18 16 18H4C3.45 18 3 17.55 3 17V8Z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      <path d="M8 18V12H12V18" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  );
}

// Chart/Trading icon for mobile nav
export function ChartIcon({ size = 20, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className}>
      <path d="M3 15L7 10L11 13L17 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="17" cy="5" r="1.5" fill="currentColor"/>
    </svg>
  );
}

// Briefcase/Portfolio icon for mobile nav
export function BriefcaseIcon({ size = 20, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className}>
      <rect x="2" y="6" width="16" height="11" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      <path d="M6 6V4C6 2.9 6.9 2 8 2H12C13.1 2 14 2.9 14 4V6" stroke="currentColor" strokeWidth="1.5"/>
      <line x1="2" y1="10" x2="18" y2="10" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  );
}

// Trophy icon for mobile nav  
export function TrophyIcon({ size = 20, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className}>
      <path d="M6 3H14V7C14 9.76 11.76 12 9 12H11C8.24 12 6 9.76 6 7V3Z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      <path d="M6 5C4 5 3 6.5 3 7.5C3 8.5 4 9 6 9" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      <path d="M14 5C16 5 17 6.5 17 7.5C17 8.5 16 9 14 9" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      <line x1="10" y1="12" x2="10" y2="15" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="7" y="15" width="6" height="2" rx="0.5" stroke="currentColor" strokeWidth="1" fill="none"/>
    </svg>
  );
}

// Calendar icon for info cards
export function CalendarIcon({ size = 32, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
      <rect x="4" y="6" width="24" height="22" rx="3" stroke="#00c805" strokeWidth="1.5" fill="#1a1a1a"/>
      <line x1="4" y1="12" x2="28" y2="12" stroke="#00c805" strokeWidth="1.5"/>
      <line x1="10" y1="4" x2="10" y2="8" stroke="#00c805" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="22" y1="4" x2="22" y2="8" stroke="#00c805" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="10" cy="18" r="2" fill="#00c805"/>
      <circle cx="16" cy="18" r="2" fill="#3a3a3a"/>
      <circle cx="22" cy="18" r="2" fill="#3a3a3a"/>
      <circle cx="10" cy="24" r="2" fill="#3a3a3a"/>
    </svg>
  );
}

// Money/Treasury icon for info cards
export function TreasuryIcon({ size = 32, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
      <rect x="4" y="10" width="24" height="16" rx="2" stroke="#00c805" strokeWidth="1.5" fill="#1a1a1a"/>
      <path d="M4 14L28 14" stroke="#00c805" strokeWidth="1.5"/>
      <circle cx="16" cy="20" r="4" stroke="#00c805" strokeWidth="1.5" fill="none"/>
      <text x="16" y="23" textAnchor="middle" fill="#00c805" fontSize="6" fontWeight="bold">$</text>
      <rect x="8" y="6" width="16" height="4" rx="1" stroke="#3a3a3a" strokeWidth="1" fill="#1a1a1a"/>
    </svg>
  );
}

// Analytics/Chart icon for info cards
export function AnalyticsIcon({ size = 32, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
      <rect x="4" y="20" width="5" height="8" rx="1" fill="#00c805" opacity="0.6"/>
      <rect x="11" y="14" width="5" height="14" rx="1" fill="#00c805" opacity="0.8"/>
      <rect x="18" y="8" width="5" height="20" rx="1" fill="#00c805"/>
      <rect x="25" y="4" width="3" height="24" rx="1" fill="#3a3a3a"/>
      <path d="M4 18L10 12L16 14L26 4" stroke="#00c805" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

// Lightning/Perps icon for info cards
export function LightningIcon({ size = 32, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
      <path d="M18 4L8 18H15L13 28L24 14H17L18 4Z" fill="#00c805" stroke="#00c805" strokeWidth="1.5" strokeLinejoin="round"/>
    </svg>
  );
}

// Medal/Trophy icon for rewards
export function RewardsIcon({ size = 32, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
      <circle cx="16" cy="13" r="9" stroke="#00c805" strokeWidth="1.5" fill="#1a1a1a"/>
      <path d="M12 22L10 28L16 25L22 28L20 22" stroke="#00c805" strokeWidth="1.5" fill="none"/>
      <path d="M13 10L16 7L19 10L16 13L13 10Z" fill="#00c805"/>
      <circle cx="16" cy="13" r="3" fill="none" stroke="#00c805" strokeWidth="1"/>
    </svg>
  );
}

// Gift icon for airdrops
export function GiftIcon({ size = 32, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
      <rect x="4" y="12" width="24" height="16" rx="2" stroke="#00c805" strokeWidth="1.5" fill="#1a1a1a"/>
      <rect x="4" y="12" width="24" height="4" fill="#2a2a2a" stroke="#00c805" strokeWidth="1.5"/>
      <line x1="16" y1="12" x2="16" y2="28" stroke="#00c805" strokeWidth="1.5"/>
      <path d="M16 12C16 12 12 8 10 8C8 8 6 10 8 12C9 13 16 12 16 12Z" stroke="#00c805" strokeWidth="1.5" fill="none"/>
      <path d="M16 12C16 12 20 8 22 8C24 8 26 10 24 12C23 13 16 12 16 12Z" stroke="#00c805" strokeWidth="1.5" fill="none"/>
    </svg>
  );
}

// Vault icon for treasury info
export function VaultIcon({ size = 32, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
      <rect x="4" y="6" width="24" height="20" rx="3" stroke="#00c805" strokeWidth="1.5" fill="#1a1a1a"/>
      <circle cx="16" cy="16" r="6" stroke="#00c805" strokeWidth="1.5" fill="none"/>
      <circle cx="16" cy="16" r="2" fill="#00c805"/>
      <line x1="16" y1="10" x2="16" y2="12" stroke="#00c805" strokeWidth="1"/>
      <line x1="16" y1="20" x2="16" y2="22" stroke="#00c805" strokeWidth="1"/>
      <line x1="10" y1="16" x2="12" y2="16" stroke="#00c805" strokeWidth="1"/>
      <line x1="20" y1="16" x2="22" y2="16" stroke="#00c805" strokeWidth="1"/>
      <rect x="24" y="14" width="3" height="4" rx="1" fill="#3a3a3a"/>
    </svg>
  );
}

// Flame icon for burns
export function FlameIcon({ size = 32, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
      <path d="M16 4C16 4 24 12 24 20C24 24.42 20.42 28 16 28C11.58 28 8 24.42 8 20C8 12 16 4 16 4Z" fill="url(#flameGrad)" stroke="#ff5000" strokeWidth="1.5"/>
      <path d="M16 14C16 14 20 18 20 22C20 24.2 18.2 26 16 26C13.8 26 12 24.2 12 22C12 18 16 14 16 14Z" fill="#ff5000"/>
      <defs>
        <linearGradient id="flameGrad" x1="16" y1="4" x2="16" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ff5000"/>
          <stop offset="1" stopColor="#ff8c00"/>
        </linearGradient>
      </defs>
    </svg>
  );
}

// Target icon for daily game
export function TargetIcon({ size = 32, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
      <circle cx="16" cy="16" r="12" stroke="#00c805" strokeWidth="1.5" fill="none" opacity="0.3"/>
      <circle cx="16" cy="16" r="8" stroke="#00c805" strokeWidth="1.5" fill="none" opacity="0.6"/>
      <circle cx="16" cy="16" r="4" stroke="#00c805" strokeWidth="1.5" fill="none"/>
      <circle cx="16" cy="16" r="1.5" fill="#00c805"/>
      <line x1="16" y1="2" x2="16" y2="6" stroke="#00c805" strokeWidth="1.5"/>
      <line x1="16" y1="26" x2="16" y2="30" stroke="#00c805" strokeWidth="1.5"/>
      <line x1="2" y1="16" x2="6" y2="16" stroke="#00c805" strokeWidth="1.5"/>
      <line x1="26" y1="16" x2="30" y2="16" stroke="#00c805" strokeWidth="1.5"/>
    </svg>
  );
}

// Pie chart icon for fee distribution
export function PieChartIcon({ size = 32, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
      {/* 40% slice - Treasury */}
      <path d="M16 16 L16 4 A12 12 0 0 1 27.4 20.4 Z" fill="#00c805"/>
      {/* 40% slice - Holders */}
      <path d="M16 16 L27.4 20.4 A12 12 0 0 1 4.6 20.4 Z" fill="#00c805" opacity="0.7"/>
      {/* 15% slice - Seed */}
      <path d="M16 16 L4.6 20.4 A12 12 0 0 1 10 5.4 Z" fill="#00c805" opacity="0.5"/>
      {/* 5% slice - Burn */}
      <path d="M16 16 L10 5.4 A12 12 0 0 1 16 4 Z" fill="#00c805" opacity="0.3"/>
      {/* Center circle */}
      <circle cx="16" cy="16" r="4" fill="#0a0a0a"/>
    </svg>
  );
}

// Long position icon (up arrow)
export function LongIcon({ size = 20, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className}>
      <path d="M10 3L16 10H12V17H8V10H4L10 3Z" fill="#00c805"/>
    </svg>
  );
}

// Short position icon (down arrow)
export function ShortIcon({ size = 20, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className}>
      <path d="M10 17L4 10H8V3H12V10H16L10 17Z" fill="#ff5000"/>
    </svg>
  );
}

// Diamond/Gem icon for holdings
export function DiamondIcon({ size = 32, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
      <path d="M16 4L6 12L16 28L26 12L16 4Z" fill="#1a1a1a" stroke="#00c805" strokeWidth="1.5"/>
      <path d="M6 12H26" stroke="#00c805" strokeWidth="1.5"/>
      <path d="M16 4L12 12L16 28L20 12L16 4Z" fill="#00c805" opacity="0.2"/>
    </svg>
  );
}

// Coins icon for spot holdings section title
export function CoinsIcon({ size = 20, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className}>
      <circle cx="8" cy="10" r="5" stroke="#00c805" strokeWidth="1.5" fill="#1a1a1a"/>
      <circle cx="12" cy="8" r="5" stroke="#00c805" strokeWidth="1.5" fill="#1a1a1a"/>
      <text x="12" y="10" textAnchor="middle" fill="#00c805" fontSize="6" fontWeight="bold">$</text>
    </svg>
  );
}

