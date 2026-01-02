import { useState, useMemo } from 'react';
import { Header } from './components/Header';
import { TokenHero } from './components/TokenHero';
import { StockChart } from './components/StockChart';
import { TradingPanel } from './components/TradingPanel';
import { Portfolio } from './components/Portfolio';
import { Leaderboard } from './components/Watchlist';
import { todayToken, mockPositions, mockSpotHoldings, mockLeaderboard, generateMemeChartData } from './data/mockData';
import './App.css';

function App() {
  const [currentTab, setCurrentTab] = useState('home');
  const [isConnected, setIsConnected] = useState(false);
  
  const chartData = useMemo(() => generateMemeChartData(24), []);

  const handleConnect = () => {
    setIsConnected(!isConnected);
  };

  const handleTrade = () => {
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
            <TokenHero token={todayToken} onTrade={handleTrade} />
            <StockChart data={chartData} token={todayToken} />
          </div>
        )}

        {currentTab === 'trade' && (
          <div className="trade-view">
            <div className="trade-left">
              <StockChart data={chartData} token={todayToken} />
            </div>
            <div className="trade-right">
              <TradingPanel token={todayToken} />
            </div>
          </div>
        )}

        {currentTab === 'portfolio' && (
          <div className="portfolio-view">
            <Portfolio positions={mockPositions} spotHoldings={mockSpotHoldings} />
          </div>
        )}

        {currentTab === 'leaderboard' && (
          <div className="leaderboard-view">
            <Leaderboard entries={mockLeaderboard} />
          </div>
        )}

        {currentTab === 'info' && (
          <div className="info-view">
            <div className="info-header">
              <h1 className="info-title">🎰 How PerpCasino Works</h1>
              <p className="info-subtitle">Daily meme token launches with spot trading & leveraged perps</p>
            </div>

            <div className="info-cards">
              <div className="info-card">
                <div className="info-card-icon">📅</div>
                <h3>Daily Token Launches</h3>
                <p>Every day at 00:00 UTC, the protocol bot automatically launches one new meme token. Themes are selected from trending X topics, community suggestions, or fun algorithm picks.</p>
              </div>

              <div className="info-card">
                <div className="info-card-icon">💰</div>
                <h3>Initial Seed & Pool</h3>
                <p>Each token starts with $100-500 from the protocol treasury, creating a Uniswap v3 pool. The same pool backs both spot trading and perps hedging.</p>
              </div>

              <div className="info-card">
                <div className="info-card-icon">📊</div>
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
              </div>

              <div className="info-card">
                <div className="info-card-icon">⚡</div>
                <h3>Leveraged Perps (up to 50x)</h3>
                <p>Go long or short with up to 50x leverage. Open positions with USDC margin. Liquidation occurs when losses approach your margin.</p>
              </div>

              <div className="info-card highlight">
                <div className="info-card-icon">🎯</div>
                <h3>The Daily Game</h3>
                <p>Snipe early, bet big, hype on X, and either moon or get rekt. It's a daily event casino — come back tomorrow for fresh opportunities!</p>
              </div>
            </div>
          </div>
        )}
      </main>

      <nav className="mobile-nav">
        <button className={`mobile-nav-btn ${currentTab === 'home' ? 'active' : ''}`} onClick={() => setCurrentTab('home')}>
          <span className="nav-icon">🏠</span>
          <span>Home</span>
        </button>
        <button className={`mobile-nav-btn ${currentTab === 'trade' ? 'active' : ''}`} onClick={() => setCurrentTab('trade')}>
          <span className="nav-icon">📈</span>
          <span>Trade</span>
        </button>
        <button className={`mobile-nav-btn ${currentTab === 'portfolio' ? 'active' : ''}`} onClick={() => setCurrentTab('portfolio')}>
          <span className="nav-icon">💼</span>
          <span>Portfolio</span>
        </button>
        <button className={`mobile-nav-btn ${currentTab === 'leaderboard' ? 'active' : ''}`} onClick={() => setCurrentTab('leaderboard')}>
          <span className="nav-icon">🏆</span>
          <span>Ranks</span>
        </button>
      </nav>
    </div>
  );
}

export default App;
