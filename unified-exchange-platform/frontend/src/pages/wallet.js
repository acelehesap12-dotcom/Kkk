// 👑 UNIFIED EXCHANGE - WALLET & TREASURY
import { useState, useEffect } from 'react';
import Link from 'next/link';

// Treasury Wallet Addresses (As specified)
const TREASURY_WALLETS = {
  ETH: { address: "0x163c9a2fa9eaf8ebc5bb5b8f8e916eb8f24230a1", balance: 1542.5, usdValue: 3624875 },
  SOL: { address: "Gp4itYBqqkNRNYtC22QAPyTThPB6Kzx8M1yy2rpXBGxbc", balance: 45000, usdValue: 4432500 },
  TRX: { address: "THbevzbdxMmUNaN3XFWPkaJe8oSq2C2739", balance: 1200000, usdValue: 120000 },
  BTC: { address: "bc1pzmdep9lzgzswy0nmepvwmexj286kufcfwjfy4fd6dwuedzltntxse9xmz8", balance: 125.4, usdValue: 5423550 }
};

const USER_BALANCES = [
  { asset: "k99", name: "k99 Credits", balance: 125000.00, usdValue: 125000.00, icon: "💎" },
  { asset: "USD", name: "US Dollar", balance: 50000.00, usdValue: 50000.00, icon: "💵" },
  { asset: "BTC", name: "Bitcoin", balance: 2.5, usdValue: 108125.00, icon: "₿" },
  { asset: "ETH", name: "Ethereum", balance: 15.0, usdValue: 35250.00, icon: "Ξ" },
  { asset: "SOL", name: "Solana", balance: 250.0, usdValue: 24625.00, icon: "◎" },
];

const RECENT_TRANSACTIONS = [
  { type: "deposit", asset: "ETH", amount: 5.0, status: "confirmed", time: "2 hours ago", txHash: "0x1234...5678" },
  { type: "withdraw", asset: "USD", amount: 10000, status: "pending", time: "5 hours ago", txHash: "—" },
  { type: "trade", asset: "BTC", amount: 0.5, status: "confirmed", time: "1 day ago", txHash: "—" },
  { type: "deposit", asset: "k99", amount: 50000, status: "confirmed", time: "2 days ago", txHash: "—" },
  { type: "staking", asset: "k99", amount: 10000, status: "locked", time: "5 days ago", txHash: "—" },
];

export default function Wallet() {
  const [activeTab, setActiveTab] = useState('balances');
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  const totalBalance = USER_BALANCES.reduce((sum, b) => sum + b.usdValue, 0);
  const totalTreasury = Object.values(TREASURY_WALLETS).reduce((sum, w) => sum + w.usdValue, 0);

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff', fontFamily: 'monospace' }}>
      {/* Header */}
      <div style={{ borderBottom: '1px solid #222', padding: '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href="/">
          <h1 style={{ cursor: 'pointer', margin: 0 }}>k99 <span style={{ color: '#666' }}>EXCHANGE</span></h1>
        </Link>
        <div style={{ display: 'flex', gap: '20px' }}>
          <Link href="/markets"><span style={{ color: '#888', cursor: 'pointer' }}>Markets</span></Link>
          <Link href="/trade"><span style={{ color: '#888', cursor: 'pointer' }}>Trade</span></Link>
          <Link href="/portfolio"><span style={{ color: '#888', cursor: 'pointer' }}>Portfolio</span></Link>
          <Link href="/wallet"><span style={{ color: '#00ff88', cursor: 'pointer' }}>Wallet</span></Link>
          <Link href="/quant-studio"><span style={{ color: '#888', cursor: 'pointer' }}>Quant Studio</span></Link>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ padding: '40px', maxWidth: '1400px', margin: '0 auto' }}>
        
        {/* Total Balance Card */}
        <div style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', borderRadius: '15px', padding: '30px', marginBottom: '30px', border: '1px solid #333' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ color: '#888', marginBottom: '10px' }}>Total Balance</div>
              <div style={{ fontSize: '3rem', fontWeight: 'bold' }}>${totalBalance.toLocaleString()}</div>
              <div style={{ color: '#00ff88', marginTop: '10px' }}>+$2,450.00 (0.72%) today</div>
            </div>
            <div style={{ display: 'flex', gap: '15px' }}>
              <button 
                onClick={() => setShowDepositModal(true)}
                style={{ padding: '15px 30px', background: '#00ff88', border: 'none', color: '#000', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem' }}
              >
                Deposit
              </button>
              <button 
                onClick={() => setShowWithdrawModal(true)}
                style={{ padding: '15px 30px', background: 'transparent', border: '1px solid #00ff88', color: '#00ff88', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem' }}
              >
                Withdraw
              </button>
              <button style={{ padding: '15px 30px', background: '#222', border: 'none', color: '#fff', borderRadius: '8px', cursor: 'pointer', fontSize: '1rem' }}>
                Transfer
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', borderBottom: '1px solid #222', paddingBottom: '20px' }}>
          {['balances', 'transactions', 'staking', 'treasury'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '10px 25px',
                background: activeTab === tab ? '#222' : 'transparent',
                border: 'none',
                color: activeTab === tab ? '#fff' : '#666',
                borderRadius: '8px',
                cursor: 'pointer',
                textTransform: 'capitalize',
                fontWeight: activeTab === tab ? 'bold' : 'normal'
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'balances' && (
          <div style={{ background: '#111', borderRadius: '10px', border: '1px solid #222', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#0a0a0a', color: '#666' }}>
                  <th style={{ padding: '15px', textAlign: 'left' }}>Asset</th>
                  <th style={{ padding: '15px', textAlign: 'right' }}>Balance</th>
                  <th style={{ padding: '15px', textAlign: 'right' }}>USD Value</th>
                  <th style={{ padding: '15px', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {USER_BALANCES.map((b, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #1a1a1a' }}>
                    <td style={{ padding: '15px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '1.5rem' }}>{b.icon}</span>
                        <div>
                          <div style={{ fontWeight: 'bold' }}>{b.asset}</div>
                          <div style={{ color: '#666', fontSize: '0.9rem' }}>{b.name}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '15px', textAlign: 'right', fontWeight: 'bold' }}>{b.balance.toLocaleString()}</td>
                    <td style={{ padding: '15px', textAlign: 'right', color: '#00ff88' }}>${b.usdValue.toLocaleString()}</td>
                    <td style={{ padding: '15px', textAlign: 'center' }}>
                      <button style={{ padding: '6px 12px', background: '#222', border: 'none', color: '#fff', borderRadius: '4px', cursor: 'pointer', marginRight: '5px' }}>Deposit</button>
                      <button style={{ padding: '6px 12px', background: '#222', border: 'none', color: '#fff', borderRadius: '4px', cursor: 'pointer', marginRight: '5px' }}>Withdraw</button>
                      <Link href="/trade"><button style={{ padding: '6px 12px', background: '#00ff88', border: 'none', color: '#000', borderRadius: '4px', cursor: 'pointer' }}>Trade</button></Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'transactions' && (
          <div style={{ background: '#111', borderRadius: '10px', border: '1px solid #222', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#0a0a0a', color: '#666' }}>
                  <th style={{ padding: '15px', textAlign: 'left' }}>Type</th>
                  <th style={{ padding: '15px', textAlign: 'left' }}>Asset</th>
                  <th style={{ padding: '15px', textAlign: 'right' }}>Amount</th>
                  <th style={{ padding: '15px', textAlign: 'center' }}>Status</th>
                  <th style={{ padding: '15px', textAlign: 'right' }}>Time</th>
                  <th style={{ padding: '15px', textAlign: 'right' }}>TX Hash</th>
                </tr>
              </thead>
              <tbody>
                {RECENT_TRANSACTIONS.map((tx, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #1a1a1a' }}>
                    <td style={{ padding: '15px' }}>
                      <span style={{ 
                        padding: '4px 10px', 
                        background: tx.type === 'deposit' ? '#00ff8822' : tx.type === 'withdraw' ? '#ff005522' : '#ffaa0022',
                        color: tx.type === 'deposit' ? '#00ff88' : tx.type === 'withdraw' ? '#ff0055' : '#ffaa00',
                        borderRadius: '4px',
                        textTransform: 'capitalize'
                      }}>
                        {tx.type}
                      </span>
                    </td>
                    <td style={{ padding: '15px', fontWeight: 'bold' }}>{tx.asset}</td>
                    <td style={{ padding: '15px', textAlign: 'right' }}>{tx.amount.toLocaleString()}</td>
                    <td style={{ padding: '15px', textAlign: 'center' }}>
                      <span style={{ 
                        padding: '4px 10px', 
                        background: tx.status === 'confirmed' ? '#00ff8822' : tx.status === 'pending' ? '#ffaa0022' : '#55aaff22',
                        color: tx.status === 'confirmed' ? '#00ff88' : tx.status === 'pending' ? '#ffaa00' : '#55aaff',
                        borderRadius: '4px',
                        textTransform: 'capitalize'
                      }}>
                        {tx.status}
                      </span>
                    </td>
                    <td style={{ padding: '15px', textAlign: 'right', color: '#888' }}>{tx.time}</td>
                    <td style={{ padding: '15px', textAlign: 'right', color: '#666' }}>{tx.txHash}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'staking' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div style={{ background: '#111', borderRadius: '10px', border: '1px solid #222', padding: '30px' }}>
              <h3 style={{ marginTop: 0 }}>k99 Staking</h3>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '20px' }}>12.5% APY</div>
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ color: '#888' }}>Your Staked</span>
                  <span style={{ fontWeight: 'bold' }}>10,000 k99</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ color: '#888' }}>Rewards Earned</span>
                  <span style={{ color: '#00ff88' }}>+125 k99</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#888' }}>Lock Period</span>
                  <span>30 days remaining</span>
                </div>
              </div>
              <button style={{ width: '100%', padding: '15px', background: '#00ff88', border: 'none', color: '#000', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                Stake More k99
              </button>
            </div>
            
            <div style={{ background: '#111', borderRadius: '10px', border: '1px solid #222', padding: '30px' }}>
              <h3 style={{ marginTop: 0 }}>Staking Tiers</h3>
              <div style={{ display: 'grid', gap: '15px' }}>
                <StakingTier name="Bronze" minStake="1,000" apy="8%" benefits="Reduced fees" />
                <StakingTier name="Silver" minStake="10,000" apy="10%" benefits="Priority support" />
                <StakingTier name="Gold" minStake="50,000" apy="12.5%" benefits="Market maker rebates" />
                <StakingTier name="Platinum" minStake="100,000" apy="15%" benefits="Full API access" />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'treasury' && (
          <div>
            <div style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)', borderRadius: '10px', border: '1px solid #333', padding: '30px', marginBottom: '30px' }}>
              <h3 style={{ marginTop: 0 }}>🔐 Proof of Reserves</h3>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '10px' }}>${totalTreasury.toLocaleString()}</div>
              <div style={{ color: '#00ff88' }}>Fully Backed 1:1 | Last Audit: Dec 10, 2025</div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
              {Object.entries(TREASURY_WALLETS).map(([asset, data]) => (
                <div key={asset} style={{ background: '#111', borderRadius: '10px', border: '1px solid #222', padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <h3 style={{ margin: 0 }}>{asset} Treasury</h3>
                    <span style={{ color: '#00ff88' }}>${data.usdValue.toLocaleString()}</span>
                  </div>
                  <div style={{ marginBottom: '10px' }}>
                    <span style={{ color: '#888' }}>Balance: </span>
                    <span style={{ fontWeight: 'bold' }}>{data.balance.toLocaleString()} {asset}</span>
                  </div>
                  <div style={{ 
                    padding: '10px', 
                    background: '#0a0a0a', 
                    borderRadius: '5px', 
                    fontSize: '0.8rem', 
                    color: '#666',
                    wordBreak: 'break-all'
                  }}>
                    {data.address}
                  </div>
                  <a 
                    href={`https://etherscan.io/address/${data.address}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ color: '#00aaff', fontSize: '0.9rem', marginTop: '10px', display: 'block' }}
                  >
                    View on Explorer →
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Deposit Modal (Simplified) */}
      {showDepositModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#111', borderRadius: '15px', padding: '30px', width: '400px', border: '1px solid #333' }}>
            <h2 style={{ marginTop: 0 }}>Deposit Funds</h2>
            <select style={{ width: '100%', padding: '10px', background: '#222', border: 'none', color: '#fff', borderRadius: '5px', marginBottom: '15px' }}>
              <option>Select Asset</option>
              <option>BTC - Bitcoin</option>
              <option>ETH - Ethereum</option>
              <option>SOL - Solana</option>
              <option>USD - Bank Transfer</option>
            </select>
            <div style={{ padding: '20px', background: '#0a0a0a', borderRadius: '8px', textAlign: 'center', marginBottom: '15px' }}>
              <div style={{ color: '#888', marginBottom: '10px' }}>Deposit Address</div>
              <div style={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>0x163c9a2fa9eaf8ebc5bb5b8f8e916eb8f24230a1</div>
            </div>
            <button onClick={() => setShowDepositModal(false)} style={{ width: '100%', padding: '15px', background: '#333', border: 'none', color: '#fff', borderRadius: '8px', cursor: 'pointer' }}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function StakingTier({ name, minStake, apy, benefits }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: '#0a0a0a', borderRadius: '8px' }}>
      <div>
        <div style={{ fontWeight: 'bold' }}>{name}</div>
        <div style={{ color: '#666', fontSize: '0.8rem' }}>Min: {minStake} k99</div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ color: '#00ff88', fontWeight: 'bold' }}>{apy}</div>
        <div style={{ color: '#888', fontSize: '0.8rem' }}>{benefits}</div>
      </div>
    </div>
  );
}
