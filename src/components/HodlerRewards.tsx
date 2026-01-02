import { Diamond, Gift, TrendingUp, Clock, Check, X, Sparkles } from 'lucide-react';
import { mockAirdropEligibility, mockHoldingRecords, mockHodlerRewards, feeDistribution } from '../data/mockData';
import './HodlerRewards.css';

interface HodlerRewardsProps {
  isConnected: boolean;
}

export function HodlerRewards({ isConnected }: HodlerRewardsProps) {
  const eligibility = mockAirdropEligibility;
  const holdingRecords = mockHoldingRecords;
  const rewards = mockHodlerRewards;

  if (!isConnected) {
    return (
      <div className="hodler-rewards">
        <div className="hodler-header">
          <Diamond className="hodler-icon" />
          <h2>Diamond Hands Rewards</h2>
        </div>
        <div className="connect-prompt">
          <Sparkles size={48} />
          <p>Connect your wallet to view your HODLer rewards and airdrop eligibility</p>
        </div>
      </div>
    );
  }

  return (
    <div className="hodler-rewards">
      <div className="hodler-header">
        <Diamond className="hodler-icon" />
        <h2>Diamond Hands Rewards</h2>
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
            <span className="stat-label">Never Sold</span>
            <span className="stat-sublabel">diamond hands</span>
          </div>
        </div>

        <div className="estimated-allocation">
          <span className="allocation-label">Estimated Allocation</span>
          <span className="allocation-value">~{eligibility.estimatedAllocation.toLocaleString()} $CASINO</span>
        </div>

        <div className="eligibility-info">
          <p>📸 Random daily snapshots track your holding status. Hold tokens without selling to maximize your airdrop!</p>
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
              <span className="distribution-label">HODLers</span>
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
                    HODLing
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
