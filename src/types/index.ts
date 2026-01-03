export interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: string;
}

export interface PortfolioItem {
  symbol: string;
  name: string;
  shares: number;
  avgCost: number;
  currentPrice: number;
  totalValue: number;
  totalReturn: number;
  returnPercent: number;
}

export interface ChartData {
  time: string;
  value: number;
}

export interface WatchlistItem {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

export interface OrderType {
  type: 'buy' | 'sell';
  orderType: 'market' | 'limit';
  symbol: string;
  shares: number;
  limitPrice?: number;
}

export interface MemeToken {
  id: string;
  name: string;
  ticker: string;
  description: string;
  theme: string;
  image: string;
  price: number;
  priceChange24h: number;
  priceChangePercent24h: number;
  tvl: number;
  volume24h: number;
  launchTime: Date;
  buyTax: number;
  sellTax: number;
  maxLeverage: number;
  fundingRate?: number;
  openInterest?: number;
}

export interface Position {
  id: string;
  tokenId: string;
  tokenName: string;
  tokenTicker: string;
  type: 'long' | 'short';
  leverage: number;
  entryPrice: number;
  currentPrice: number;
  size: number;
  margin: number;
  pnl: number;
  pnlPercent: number;
  liquidationPrice: number;
  timestamp: Date;
}

export interface SpotHolding {
  tokenId: string;
  tokenName: string;
  tokenTicker: string;
  tokenImage: string;
  amount: number;
  avgBuyPrice: number;
  currentPrice: number;
  value: number;
  pnl: number;
  pnlPercent: number;
}

export interface LeaderboardEntry {
  rank: number;
  address: string;
  displayName: string;
  pnl: number;
  trades: number;
  winRate: number;
  biggestPosition?: {
    type: 'long' | 'short';
    leverage: number;
    token: string;
  };
}

export interface TradeType {
  mode: 'spot' | 'perps';
  direction: 'buy' | 'sell' | 'long' | 'short';
  amount: number;
  leverage?: number;
}

export interface PortfolioStats {
  totalValue: number;
  totalPnl: number;
  totalPnlPercent: number;
  openPositions: number;
  spotHoldings: number;
}

// Platform treasury stats
export interface TreasuryStats {
  totalBalance: number;
  tokensLaunched: number;
  totalVolumeAllTime: number;
  feesCollected: number;
  nextLaunchSeed: number;
  targetForMainLaunch: number;
}

// User's airdrop eligibility tracking
export interface AirdropEligibility {
  isEligible: boolean;
  tokensHeld: number;
  totalTokensLaunched: number;
  snapshotsPassed: number;
  totalSnapshots: number;
  holdingStreak: number;
  neverSold: boolean;
  estimatedAllocation: number;
}

// Individual token holding record for airdrop tracking
export interface TokenHoldingRecord {
  tokenId: string;
  tokenTicker: string;
  isHolding: boolean;
  hasSold: boolean;
  snapshotsCaptured: number;
  firstBuyTime?: Date;
}

// Fee distribution breakdown
export interface FeeDistribution {
  treasuryPercent: number;
  holdersPercent: number;
  seedContributorsPercent: number;
  burnPercent: number;
}

// HODLer rewards info
export interface HodlerRewards {
  totalEarned: number;
  pendingRewards: number;
  lastClaimTime?: Date;
  multiplier: number; // Based on holding duration
}
