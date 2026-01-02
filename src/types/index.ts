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
