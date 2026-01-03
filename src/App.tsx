import { useState, useMemo } from 'react';
import type { MemeToken } from './types';
import { Header } from './components/Header';
import { TokenHero } from './components/TokenHero';
import { PreLaunchHero } from './components/PreLaunchHero';
import { StockChart } from './components/StockChart';
import { TradingPanel } from './components/TradingPanel';
import { Portfolio } from './components/Portfolio';
import { Leaderboard } from './components/Watchlist';
import { HodlerRewards } from './components/HodlerRewards';
import { TokenHistory } from './components/TokenHistory';
import { isPreLaunch, todayToken, firstToken, nextToken, pastTokens, mockPositions, mockSpotHoldings, mockLeaderboard, generateMemeChartData } from './data/mockData';
import { CalendarIcon, TreasuryIcon, AnalyticsIcon, LightningIcon, RewardsIcon, GiftIcon, VaultIcon, FlameIcon, TargetIcon, HomeIcon, ChartIcon, BriefcaseIcon, TrophyIcon } from './components/icons/PulseIcons';
import './App.css';

function App() {
  const [currentTab, setCurrentTab] = useState('home');
  const [isConnected, setIsConnected] = useState(false);
  const [selectedToken, setSelectedToken] = useState(todayToken);
  
  const chartData = useMemo(() => generateMemeChartData(24), []);

  const handleConnect = () => {
    setIsConnected(!isConnected);
  };

  const handleTrade = () => {
    setCurrentTab('trade');
  };

  const handleTokenSelect = (token: MemeToken) => {
    setSelectedToken(token);
    setCurrentTab('trade');
  };

  return (
    <div className="app">
      <Header 
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        isConnected={isConnected}
        onConnect={handleConnect}
      />
      
      <main className="main-content">
        {currentTab === 'home' && (
          <div className="home-view">
            {isPreLaunch ? (
              <>
                <PreLaunchHero />
                <HodlerRewards isConnected={isConnected} />
                <TokenHistory 
                  tokens={[]} 
                  nextToken={firstToken}
                  onTokenSelect={handleTokenSelect}
                  isPreLaunch={true}
                />
              </>
            ) : (
              <>
                <TokenHero token={todayToken} onTrade={handleTrade} />
                <HodlerRewards isConnected={isConnected} />
                <TokenHistory 
                  tokens={pastTokens} 
                  nextToken={nextToken}
                  onTokenSelect={handleTokenSelect}
                />
                <StockChart data={chartData} token={todayToken} />
              </>
            )}
          </div>
        )}

        {currentTab === 'trade' && (
          <div className={`trade-view ${isPreLaunch ? 'prelaunch' : ''}`}>
            {isPreLaunch ? (
              <div className="prelaunch-trade-message">
                <svg width="56" height="56" viewBox="0 0 48 48" fill="none" className="prelaunch-message-icon">
                  <defs>
                    <linearGradient id="chartGradient" x1="0%" y1="100%" x2="0%" y2="0%">
                      <stop offset="0%" stopColor="#00c805" stopOpacity="0" />
                      <stop offset="100%" stopColor="#00c805" stopOpacity="0.2" />
                    </linearGradient>
                  </defs>
                  <line x1="8" y1="12" x2="8" y2="40" stroke="#2a2a2a" strokeWidth="1" />
                  <line x1="8" y1="40" x2="40" y2="40" stroke="#2a2a2a" strokeWidth="1" />
                  <line x1="8" y1="20" x2="40" y2="20" stroke="#1a1a1a" strokeWidth="1" strokeDasharray="2 2" />
                  <line x1="8" y1="30" x2="40" y2="30" stroke="#1a1a1a" strokeWidth="1" strokeDasharray="2 2" />
                  <path d="M12 32 L18 28 L24 30 L30 18 L36 22 L36 40 L12 40 Z" fill="url(#chartGradient)" />
                  <path d="M12 32 L18 28 L24 30 L30 18 L36 22" stroke="#3a3a3a" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="4 2" />
                  <circle cx="24" cy="26" r="8" fill="none" stroke="#3a3a3a" strokeWidth="1.5" />
                  <path d="M24 22V26L27 28" stroke="#3a3a3a" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                <h2>Trading Opens at Launch</h2>
                <p>The trading panel will be available once the first token launches. Check back soon!</p>
              </div>
            ) : (
              <>
                <div className="trade-left">
                  <StockChart data={chartData} token={selectedToken} />
                </div>
                <div className="trade-right">
                  <TradingPanel token={selectedToken} />
                </div>
              </>
            )}
          </div>
        )}

        {currentTab === 'portfolio' && (
          <div className="portfolio-view">
            <Portfolio 
              positions={isPreLaunch ? [] : mockPositions} 
              spotHoldings={isPreLaunch ? [] : mockSpotHoldings} 
              isPreLaunch={isPreLaunch}
            />
          </div>
        )}

        {currentTab === 'leaderboard' && (
          <div className="leaderboard-view">
            <Leaderboard entries={isPreLaunch ? [] : mockLeaderboard} isPreLaunch={isPreLaunch} />
          </div>
        )}

        {currentTab === 'info' && (
          <div className="info-view">
            <div className="info-header">
              <h1 className="info-title">How Pulse Works</h1>
              <p className="info-subtitle">Daily meme token launches with spot trading & leveraged perps</p>
            </div>

            <div className="info-cards">
              <div className="info-card">
                <div className="info-card-icon"><CalendarIcon size={32} /></div>
                <h3>Daily Token Launches</h3>
                <p>Every day at 00:00 UTC, the protocol automatically launches one new meme token. Themes are selected from trending X topics, community suggestions, or algorithm picks.</p>
              </div>

              <div className="info-card">
                <div className="info-card-icon"><TreasuryIcon size={32} /></div>
                <h3>Initial Seed & Pool</h3>
                <p>Each token starts with $100-500 from the protocol treasury, creating a Uniswap v3 pool. The same pool backs both spot trading and perps hedging.</p>
              </div>

              <div className="info-card">
                <div className="info-card-icon"><AnalyticsIcon size={32} /></div>
                <h3>Dynamic Tax System</h3>
                <div className="tax-explainer">
                  <div className="tax-stage">
                    <span className="tax-label">At Launch</span>
                    <span className="buy-rate">1% Buy</span>
                    <span className="sell-rate">20% Sell</span>
                  </div>
                  <span className="tax-arrow">→</span>
                  <div className="tax-stage">
                    <span className="tax-label">At $10k TVL</span>
                    <span className="buy-rate">5% Buy</span>
                    <span className="sell-rate">5% Sell</span>
                  </div>
                </div>
                <p style={{marginTop: '12px'}}>Asymmetric taxes at launch prevent early dumps. As TVL grows to $10k, taxes converge to 5%/5%, rewarding early believers.</p>
              </div>

              <div className="info-card">
                <div className="info-card-icon"><LightningIcon size={32} /></div>
                <h3>Leveraged Perps (up to 50x)</h3>
                <p>Go long or short with up to 50x leverage. Open positions with USDC margin. Liquidation occurs when losses approach your margin.</p>
              </div>

              <div className="info-card highlight">
                <div className="info-card-icon"><RewardsIcon size={32} /></div>
                <h3>Holder Rewards</h3>
                <p><strong>Holders earn fees.</strong> 40% of all trading fees are redistributed to holders who buy and don't sell. Daily snapshots track your holdings for airdrop eligibility.</p>
              </div>

              <div className="info-card">
                <div className="info-card-icon"><GiftIcon size={32} /></div>
                <h3>Airdrop Eligibility</h3>
                <p>The platform takes random daily snapshots of token holders. If you're holding tokens and maintain a clean record, you're building eligibility for the $PULSE token airdrop.</p>
              </div>

              <div className="info-card">
                <div className="info-card-icon"><VaultIcon size={32} /></div>
                <h3>Treasury Growth</h3>
                <p>40% of fees go to the treasury, accumulating toward the main token launch. When the treasury hits the target, $PULSE launches and gets distributed to holders.</p>
              </div>

              <div className="info-card">
                <div className="info-card-icon"><FlameIcon size={32} /></div>
                <h3>Fee Distribution</h3>
                <div className="fee-breakdown">
                  <div className="fee-item"><span className="fee-percent">40%</span> Treasury</div>
                  <div className="fee-item"><span className="fee-percent">40%</span> Holders</div>
                  <div className="fee-item"><span className="fee-percent">15%</span> Seed Contributors</div>
                  <div className="fee-item"><span className="fee-percent">5%</span> Burn</div>
                </div>
              </div>

              <div className="info-card highlight">
                <div className="info-card-icon"><TargetIcon size={32} /></div>
                <h3>The Daily Game</h3>
                <p>Enter early, size your positions, build hype on X—ride it up or get stopped out. Hold your winners for rewards. Fresh opportunities every day.</p>
              </div>
            </div>
          </div>
        )}
      </main>

      <nav className="mobile-nav">
        <button className={`mobile-nav-btn ${currentTab === 'home' ? 'active' : ''}`} onClick={() => setCurrentTab('home')}>
          <span className="nav-icon"><HomeIcon size={20} /></span>
          <span>Home</span>
        </button>
        <button className={`mobile-nav-btn ${currentTab === 'trade' ? 'active' : ''}`} onClick={() => setCurrentTab('trade')}>
          <span className="nav-icon"><ChartIcon size={20} /></span>
          <span>Trade</span>
        </button>
        <button className={`mobile-nav-btn ${currentTab === 'portfolio' ? 'active' : ''}`} onClick={() => setCurrentTab('portfolio')}>
          <span className="nav-icon"><BriefcaseIcon size={20} /></span>
          <span>Portfolio</span>
        </button>
        <button className={`mobile-nav-btn ${currentTab === 'leaderboard' ? 'active' : ''}`} onClick={() => setCurrentTab('leaderboard')}>
          <span className="nav-icon"><TrophyIcon size={20} /></span>
          <span>Ranks</span>
        </button>
      </nav>
    </div>
  );
}

export default App;
