import { Award, Gift, TrendingUp, Clock, Check, X, Sparkles, Rocket } from 'lucide-react';
import { mockAirdropEligibility, mockHoldingRecords, mockHodlerRewards, feeDistribution, isPreLaunch } from '../data/mockData';
import './HodlerRewards.css';

interface HodlerRewardsProps {
  isConnected: boolean;
}

export function HodlerRewards({ isConnected }: HodlerRewardsProps) {
  const eligibility = mockAirdropEligibility;
  const holdingRecords = mockHoldingRecords;
  const rewards = mockHodlerRewards;

  // Pre-launch state - show what rewards will look like
  if (isPreLaunch) {
    return (
      <div className="hodler-rewards prelaunch">
        <div className="hodler-header">
          <Award className="hodler-icon" />
          <h2>Holder Rewards</h2>
          <span className="hodler-badge coming-soon">Coming Soon</span>
        </div>
        
        <div className="prelaunch-rewards-content">
          <Rocket size={48} className="prelaunch-icon" />
          <h3>Rewards Start at First Launch</h3>
          <p>Once the first token launches, you'll be able to earn rewards by holding tokens.</p>
          
          <div className="prelaunch-benefits">
            <div className="benefit-item">
              <Gift size={18} />
              <div>
                <strong>Airdrop Eligibility</strong>
                <span>Hold tokens to qualify for the $PULSE airdrop</span>
              </div>
            </div>
            <div className="benefit-item">
              <TrendingUp size={18} />
              <div>
                <strong>Fee Redistribution</strong>
                <span>Earn 40% of all trading fees as a holder</span>
              </div>
            </div>
            <div className="benefit-item">
              <Clock size={18} />
              <div>
                <strong>Daily Snapshots</strong>
                <span>Random snapshots track your holding status</span>
              </div>
            </div>
          </div>

          <div className="fee-preview">
            <h4>Fee Distribution</h4>
            <div className="fee-preview-bars">
              <div className="fee-bar">
                <span className="fee-label">Treasury</span>
                <div className="fee-progress"><div className="fee-fill treasury" style={{ width: '40%' }} /></div>
                <span className="fee-percent">40%</span>
              </div>
              <div className="fee-bar">
                <span className="fee-label">Holders</span>
                <div className="fee-progress"><div className="fee-fill holders" style={{ width: '40%' }} /></div>
                <span className="fee-percent">40%</span>
              </div>
              <div className="fee-bar">
                <span className="fee-label">Seed</span>
                <div className="fee-progress"><div className="fee-fill seed" style={{ width: '15%' }} /></div>
                <span className="fee-percent">15%</span>
              </div>
              <div className="fee-bar">
                <span className="fee-label">Burn</span>
                <div className="fee-progress"><div className="fee-fill burn" style={{ width: '5%' }} /></div>
                <span className="fee-percent">5%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="hodler-rewards">
        <div className="hodler-header">
          <Award className="hodler-icon" />
          <h2>Holder Rewards</h2>
        </div>
        <div className="connect-prompt">
          <Sparkles size={48} />
          <p>Connect your wallet to view your rewards and airdrop eligibility</p>
        </div>
      </div>
    );
  }

  return (
    <div className="hodler-rewards">
      <div className="hodler-header">
        <Award className="hodler-icon" />
        <h2>Holder Rewards</h2>
        <span className="hodler-badge">
          {eligibility.isEligible ? '✓ Eligible' : '✗ Not Eligible'}
        </span>
      </div>

      {/* Airdrop Eligibility Section */}
      <div className="eligibility-section">
        <h3>
          <Gift size={18} />
          Airdrop Eligibility
        </h3>
        
        <div className="eligibility-stats">
          <div className="eligibility-stat">
            <span className="stat-value">{eligibility.snapshotsPassed}</span>
            <span className="stat-label">Snapshots Passed</span>
            <span className="stat-sublabel">of {eligibility.totalSnapshots} total</span>
          </div>
          <div className="eligibility-stat">
            <span className="stat-value">{eligibility.tokensHeld}</span>
            <span className="stat-label">Tokens Held</span>
            <span className="stat-sublabel">of {eligibility.totalTokensLaunched} launched</span>
          </div>
          <div className="eligibility-stat">
            <span className="stat-value">{eligibility.holdingStreak}</span>
            <span className="stat-label">Day Streak</span>
            <span className="stat-sublabel">consecutive holds</span>
          </div>
          <div className={`eligibility-stat ${eligibility.neverSold ? 'positive' : 'negative'}`}>
            <span className="stat-value">{eligibility.neverSold ? '✓' : '✗'}</span>
            <span className="stat-label">Clean Record</span>
            <span className="stat-sublabel">no sells</span>
          </div>
        </div>

        <div className="estimated-allocation">
          <span className="allocation-label">Estimated Allocation</span>
          <span className="allocation-value">~{eligibility.estimatedAllocation.toLocaleString()} $PULSE</span>
        </div>

        <div className="eligibility-info">
          <p>Random daily snapshots track your holding status. Hold tokens without selling to maximize your airdrop.</p>
        </div>
      </div>

      {/* HODLer Rewards Section */}
      <div className="rewards-section">
        <h3>
          <TrendingUp size={18} />
          Fee Redistribution Rewards
        </h3>

        <div className="rewards-stats">
          <div className="reward-stat">
            <span className="reward-label">Total Earned</span>
            <span className="reward-value positive">${rewards.totalEarned.toFixed(2)}</span>
          </div>
          <div className="reward-stat">
            <span className="reward-label">Pending Rewards</span>
            <span className="reward-value">${rewards.pendingRewards.toFixed(2)}</span>
          </div>
          <div className="reward-stat">
            <span className="reward-label">Multiplier</span>
            <span className="reward-value multiplier">{rewards.multiplier}x</span>
          </div>
        </div>

        {rewards.pendingRewards > 0 && (
          <button className="claim-btn">
            <Gift size={16} />
            Claim ${rewards.pendingRewards.toFixed(2)}
          </button>
        )}

        <div className="fee-distribution">
          <h4>Fee Distribution</h4>
          <div className="distribution-bars">
            <div className="distribution-item">
              <span className="distribution-label">Treasury</span>
              <div className="distribution-bar">
                <div className="distribution-fill treasury" style={{ width: `${feeDistribution.treasuryPercent}%` }} />
              </div>
              <span className="distribution-percent">{feeDistribution.treasuryPercent}%</span>
            </div>
            <div className="distribution-item">
              <span className="distribution-label">Holders</span>
              <div className="distribution-bar">
                <div className="distribution-fill holders" style={{ width: `${feeDistribution.holdersPercent}%` }} />
              </div>
              <span className="distribution-percent">{feeDistribution.holdersPercent}%</span>
            </div>
            <div className="distribution-item">
              <span className="distribution-label">Seed</span>
              <div className="distribution-bar">
                <div className="distribution-fill seed" style={{ width: `${feeDistribution.seedContributorsPercent}%` }} />
              </div>
              <span className="distribution-percent">{feeDistribution.seedContributorsPercent}%</span>
            </div>
            <div className="distribution-item">
              <span className="distribution-label">Burn</span>
              <div className="distribution-bar">
                <div className="distribution-fill burn" style={{ width: `${feeDistribution.burnPercent}%` }} />
              </div>
              <span className="distribution-percent">{feeDistribution.burnPercent}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Token Holdings Status */}
      <div className="holdings-status">
        <h3>
          <Clock size={18} />
          Your Token Holdings
        </h3>
        
        <div className="holdings-list">
          {holdingRecords.map((record) => (
            <div key={record.tokenId} className={`holding-record ${record.hasSold ? 'sold' : record.isHolding ? 'holding' : ''}`}>
              <div className="holding-token">
                <span className="token-ticker">{record.tokenTicker}</span>
                {record.snapshotsCaptured > 0 && (
                  <span className="snapshot-count">📸 {record.snapshotsCaptured}</span>
                )}
              </div>
              <div className="holding-status">
                {record.hasSold ? (
                  <span className="status-badge sold">
                    <X size={12} />
                    Sold
                  </span>
                ) : record.isHolding ? (
                  <span className="status-badge holding">
                    <Check size={12} />
                    Holding
                  </span>
                ) : (
                  <span className="status-badge none">
                    Not Held
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
