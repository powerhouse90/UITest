import type { ChartData, MemeToken, Position, SpotHolding, LeaderboardEntry, TreasuryStats, AirdropEligibility, TokenHoldingRecord, FeeDistribution, HodlerRewards } from '../types';

// Today's featured meme token
export const todayToken: MemeToken = {
  id: 'pepe-trump-2026',
  name: 'Pepe Trump',
  ticker: '$PTRUMP',
  description: 'The most tremendous meme token. Believe me, nobody does memes better.',
  theme: '🐸 Political Meme',
  image: '🐸',
  price: 0.00004269,
  priceChange24h: 0.00001337,
  priceChangePercent24h: 45.67,
  tvl: 4200,
  volume24h: 12500,
  launchTime: new Date(),
  buyTax: 1.8,
  sellTax: 17.2,
  maxLeverage: 50,
  fundingRate: 0.0001,
  openInterest: 125000,
};

// Past tokens for history
export const pastTokens: MemeToken[] = [
  {
    id: 'doge-elon',
    name: 'Doge Elon',
    ticker: '$DELON',
    description: 'To Mars and beyond with the Dogefather',
    theme: '🚀 Space Meme',
    image: '🐕',
    price: 0.00012,
    priceChange24h: -0.00003,
    priceChangePercent24h: -20.0,
    tvl: 15000,
    volume24h: 45000,
    launchTime: new Date(Date.now() - 86400000),
    buyTax: 5,
    sellTax: 5,
    maxLeverage: 50,
    fundingRate: -0.0002,
    openInterest: 85000,
  },
  {
    id: 'cat-wif-hat',
    name: 'Cat Wif Hat',
    ticker: '$CWH',
    description: 'The classiest cat in crypto',
    theme: '🎩 Fashion Meme',
    image: '🐱',
    price: 0.00089,
    priceChange24h: 0.00045,
    priceChangePercent24h: 102.3,
    tvl: 28000,
    volume24h: 89000,
    launchTime: new Date(Date.now() - 172800000),
    buyTax: 5,
    sellTax: 5,
    maxLeverage: 50,
    fundingRate: 0.0005,
    openInterest: 320000,
  },
];

// User's open perps positions
export const mockPositions: Position[] = [
  {
    id: 'pos-1',
    tokenId: 'pepe-trump-2026',
    tokenName: 'Pepe Trump',
    tokenTicker: '$PTRUMP',
    type: 'long',
    leverage: 20,
    entryPrice: 0.00003500,
    currentPrice: 0.00004269,
    size: 500,
    margin: 25,
    pnl: 109.86,
    pnlPercent: 439.43,
    liquidationPrice: 0.00001925,
    timestamp: new Date(Date.now() - 3600000),
  },
  {
    id: 'pos-2',
    tokenId: 'doge-elon',
    tokenName: 'Doge Elon',
    tokenTicker: '$DELON',
    type: 'short',
    leverage: 10,
    entryPrice: 0.00015,
    currentPrice: 0.00012,
    size: 200,
    margin: 20,
    pnl: 40.0,
    pnlPercent: 200.0,
    liquidationPrice: 0.000165,
    timestamp: new Date(Date.now() - 7200000),
  },
];

// User's spot holdings
export const mockSpotHoldings: SpotHolding[] = [
  {
    tokenId: 'pepe-trump-2026',
    tokenName: 'Pepe Trump',
    tokenTicker: '$PTRUMP',
    tokenImage: '🐸',
    amount: 5000000,
    avgBuyPrice: 0.00003200,
    currentPrice: 0.00004269,
    value: 213.45,
    pnl: 53.45,
    pnlPercent: 33.41,
  },
  {
    tokenId: 'cat-wif-hat',
    tokenName: 'Cat Wif Hat',
    tokenTicker: '$CWH',
    tokenImage: '🐱',
    amount: 250000,
    avgBuyPrice: 0.00065,
    currentPrice: 0.00089,
    value: 222.50,
    pnl: 60.0,
    pnlPercent: 36.92,
  },
];

// Leaderboard data
export const mockLeaderboard: LeaderboardEntry[] = [
  {
    rank: 1,
    address: '0x1234...5678',
    displayName: 'DegenKing.eth',
    pnl: 12450.69,
    trades: 47,
    winRate: 72,
    biggestPosition: { type: 'long', leverage: 50, token: '$PTRUMP' },
  },
  {
    rank: 2,
    address: '0xabcd...efgh',
    displayName: 'MoonBoi',
    pnl: 8920.42,
    trades: 35,
    winRate: 68,
    biggestPosition: { type: 'long', leverage: 30, token: '$CWH' },
  },
  {
    rank: 3,
    address: '0x9876...5432',
    displayName: 'BasedTrader',
    pnl: 6543.21,
    trades: 62,
    winRate: 58,
    biggestPosition: { type: 'short', leverage: 20, token: '$DELON' },
  },
  {
    rank: 4,
    address: '0xfedc...ba98',
    displayName: 'LiquidationHunter',
    pnl: 4200.00,
    trades: 89,
    winRate: 51,
  },
  {
    rank: 5,
    address: '0x1111...2222',
    displayName: 'DiamondHands',
    pnl: 3150.75,
    trades: 23,
    winRate: 78,
  },
];

// Generate meme token chart data
export const generateMemeChartData = (hours: number = 24): ChartData[] => {
  const data: ChartData[] = [];
  let basePrice = 0.00002;
  const now = new Date();

  for (let i = hours * 12; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 5 * 60 * 1000);
    const volatility = 0.15;
    const trend = 0.52;
    const change = (Math.random() - (1 - trend)) * basePrice * volatility;
    basePrice = Math.max(0.00001, basePrice + change);
    data.push({
      time: Math.floor(date.getTime() / 1000) as unknown as string,
      value: basePrice,
    });
  }
  return data;
};

// Calculate tax based on TVL (1%/20% → 5%/5% as TVL grows to $10k)
export const calculateTax = (tvl: number): { buyTax: number; sellTax: number } => {
  const progress = Math.min(tvl / 10000, 1);
  const buyTax = 1 + progress * 4;
  const sellTax = 20 - progress * 15;
  return { buyTax, sellTax };
};

// Format time until next token launch
export const getTimeUntilNextLaunch = (): string => {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setUTCHours(24, 0, 0, 0);
  const diff = tomorrow.getTime() - now.getTime();
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

// Platform treasury stats
export const mockTreasuryStats: TreasuryStats = {
  totalBalance: 42069.50,
  tokensLaunched: 47,
  totalVolumeAllTime: 2450000,
  feesCollected: 89420.69,
  nextLaunchSeed: 350,
  targetForMainLaunch: 100000,
};

// User's airdrop eligibility
export const mockAirdropEligibility: AirdropEligibility = {
  isEligible: true,
  tokensHeld: 12,
  totalTokensLaunched: 47,
  snapshotsPassed: 38,
  totalSnapshots: 47,
  holdingStreak: 5,
  neverSold: true,
  estimatedAllocation: 2450,
};

// User's token holding records
export const mockHoldingRecords: TokenHoldingRecord[] = [
  {
    tokenId: 'pepe-trump-2026',
    tokenTicker: '$PTRUMP',
    isHolding: true,
    hasSold: false,
    snapshotsCaptured: 1,
    firstBuyTime: new Date(Date.now() - 3600000),
  },
  {
    tokenId: 'cat-wif-hat',
    tokenTicker: '$CWH',
    isHolding: true,
    hasSold: false,
    snapshotsCaptured: 3,
    firstBuyTime: new Date(Date.now() - 172800000),
  },
  {
    tokenId: 'doge-elon',
    tokenTicker: '$DELON',
    isHolding: false,
    hasSold: true,
    snapshotsCaptured: 0,
  },
];

// Fee distribution breakdown
export const feeDistribution: FeeDistribution = {
  treasuryPercent: 40,
  holdersPercent: 40,
  seedContributorsPercent: 15,
  burnPercent: 5,
};

// User's HODLer rewards
export const mockHodlerRewards: HodlerRewards = {
  totalEarned: 156.42,
  pendingRewards: 23.50,
  lastClaimTime: new Date(Date.now() - 86400000),
  multiplier: 1.5,
};
