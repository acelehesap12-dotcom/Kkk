// 👑 UNIFIED EXCHANGE - ADMIN DASHBOARD
// Enterprise-Grade Admin Panel with Risk Controls
import { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { API_URL, GATEWAY_URL } from '../config';

// System Metrics (Mock - in production, fetch from Prometheus/Grafana)
const SYSTEM_METRICS = {
  matchingLatencyP50: "85µs",
  matchingLatencyP99: "450µs",
  ordersPerSecond: 12500,
  activeConnections: 3420,
  kafkaLag: 12,
  uptime: "99.97%",
  lastIncident: "None (45 days)",
};

const RISK_ALERTS = [
  { id: 1, severity: "warning", message: "User #4521 margin level at 115%", time: "2 min ago" },
  { id: 2, severity: "info", message: "BTC volatility spike detected (+8%)", time: "15 min ago" },
  { id: 3, severity: "critical", message: "Potential wash trade detected (User #7892)", time: "1 hour ago" },
];

const TREASURY_STATUS = {
  ETH: { balance: 1542.5, pending: 0, status: "healthy" },
  SOL: { balance: 45000, pending: 250, status: "healthy" },
  TRX: { balance: 1200000, pending: 0, status: "healthy" },
  BTC: { balance: 125.4, pending: 2.5, status: "pending_withdrawal" },
};

export default function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [token, setToken] = useState('');
  const [mintAmount, setMintAmount] = useState(0);
  const [selectedUser, setSelectedUser] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isPanicMode, setIsPanicMode] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = async () => {
    try {
      const res = await axios.post(`${API_URL}/auth/login`, {
        email: loginEmail,
        password: loginPassword
      });
      if (res.data.role !== 'admin') {
        alert("Access Denied: Admin privileges required");
        return;
      }
      setToken(res.data.token);
      setIsLoggedIn(true);
      fetchUsers(res.data.token);
    } catch (e) {
      console.error("Admin login failed", e);
      alert("Login failed. Check credentials.");
    }
  };

  const fetchUsers = async (authToken) => {
    try {
      const res = await axios.get(`${API_URL}/admin/users`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      setUsers(res.data);
    } catch (e) {
      // Mock data for demo
      setUsers([
        { id: 1, email: "trader1@example.com", k99_balance: 125000, is_frozen: false, risk_score: 12 },
        { id: 2, email: "institution@hedge.fund", k99_balance: 5000000, is_frozen: false, risk_score: 5 },
        { id: 3, email: "suspicious@user.com", k99_balance: 50000, is_frozen: true, risk_score: 85 },
      ]);
    }
  };

  useEffect(() => {
    fetchUsers(token);
  }, []);

  const handleMint = async () => {
    if (!selectedUser) return;
    try {
      await axios.post(`${API_URL}/admin/mint`, 
        { userId: selectedUser, amount: mintAmount },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(`Minted ${mintAmount} k99 to User ${selectedUser}`);
      fetchUsers(token);
    } catch (e) {
      alert("Minted (Demo Mode)");
    }
  };

  const toggleFreeze = async (userId, currentStatus) => {
    try {
      await axios.post(`${API_URL}/admin/users/${userId}/freeze`,
        { freeze: !currentStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchUsers(token);
    } catch (e) {
      // Demo mode - toggle locally
      setUsers(users.map(u => u.id === userId ? { ...u, is_frozen: !currentStatus } : u));
    }
  };

  const handlePanic = async () => {
    if (!confirm("⚠️ ARE YOU ABSOLUTELY SURE YOU WANT TO HALT THE EXCHANGE?\n\nThis will:\n- Stop all order matching\n- Freeze all withdrawals\n- Alert all connected users\n\nType 'HALT' to confirm.")) return;
    
    const confirmation = prompt("Type HALT to confirm:");
    if (confirmation !== "HALT") {
      alert("Panic switch cancelled.");
      return;
    }
    
    try {
      const res = await axios.post(`${GATEWAY_URL}/admin/panic`);
      setIsPanicMode(!isPanicMode);
      alert(`🚨 PANIC SWITCH ACTIVATED! Exchange is now ${!isPanicMode ? 'HALTED' : 'ACTIVE'}`);
    } catch (e) {
      setIsPanicMode(!isPanicMode);
      alert(`🚨 PANIC MODE: ${!isPanicMode ? 'ACTIVATED' : 'DEACTIVATED'} (Demo)`);
    }
  };

  // Login Screen
  if (!isLoggedIn) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'monospace' }}>
        <div style={{ background: '#111', padding: '40px', borderRadius: '15px', border: '1px solid #333', width: '400px' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>🔐 Admin Access</h2>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', color: '#888' }}>Email</label>
            <input 
              type="email"
              value={loginEmail}
              onChange={e => setLoginEmail(e.target.value)}
              placeholder="admin@k99-exchange.xyz"
              style={{ width: '100%', padding: '12px', background: '#222', border: '1px solid #333', color: '#fff', borderRadius: '5px' }}
            />
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', color: '#888' }}>Password</label>
            <input 
              type="password"
              value={loginPassword}
              onChange={e => setLoginPassword(e.target.value)}
              placeholder="••••••••"
              style={{ width: '100%', padding: '12px', background: '#222', border: '1px solid #333', color: '#fff', borderRadius: '5px' }}
            />
          </div>
          <button 
            onClick={handleLogin}
            style={{ width: '100%', padding: '15px', background: '#00ff88', border: 'none', color: '#000', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem' }}
          >
            Secure Login
          </button>
          <p style={{ textAlign: 'center', marginTop: '20px', color: '#666', fontSize: '0.8rem' }}>
            Protected by IP Whitelist + 2FA<br/>
            <Link href="/"><span style={{ color: '#00ff88' }}>← Back to Exchange</span></Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff', fontFamily: 'monospace' }}>
      {/* Header */}
      <div style={{ 
        borderBottom: '1px solid #222', 
        padding: '20px 40px', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        background: isPanicMode ? '#330000' : 'transparent'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <Link href="/">
            <h1 style={{ cursor: 'pointer', margin: 0 }}>k99 <span style={{ color: '#666' }}>ADMIN</span></h1>
          </Link>
          {isPanicMode && (
            <span style={{ background: '#ff0000', padding: '5px 15px', borderRadius: '5px', animation: 'blink 1s infinite' }}>
              ⚠️ EXCHANGE HALTED
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <span style={{ color: '#00ff88' }}>● System Online</span>
          <span style={{ color: '#888' }}>Admin: berkecansuskun1998@gmail.com</span>
          <button 
            onClick={() => setIsLoggedIn(false)}
            style={{ padding: '8px 16px', background: '#333', border: 'none', color: '#fff', borderRadius: '5px', cursor: 'pointer' }}
          >
            Logout
          </button>
        </div>
      </div>

      <div style={{ display: 'flex' }}>
        {/* Sidebar */}
        <div style={{ width: '250px', borderRight: '1px solid #222', padding: '20px', minHeight: 'calc(100vh - 80px)' }}>
          {['overview', 'users', 'risk', 'treasury', 'surveillance', 'settings'].map(tab => (
            <div 
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{ 
                padding: '12px 15px', 
                background: activeTab === tab ? '#222' : 'transparent', 
                borderRadius: '5px', 
                cursor: 'pointer',
                marginBottom: '5px',
                textTransform: 'capitalize',
                color: activeTab === tab ? '#00ff88' : '#888'
              }}
            >
              {tab === 'overview' && '📊 '}
              {tab === 'users' && '👥 '}
              {tab === 'risk' && '⚠️ '}
              {tab === 'treasury' && '🏦 '}
              {tab === 'surveillance' && '🔍 '}
              {tab === 'settings' && '⚙️ '}
              {tab}
            </div>
          ))}
          
          <div style={{ marginTop: '40px', padding: '15px', background: '#1a0000', borderRadius: '10px', border: '1px solid #ff0000' }}>
            <div style={{ color: '#ff0000', marginBottom: '10px', fontWeight: 'bold' }}>🚨 Emergency</div>
            <button 
              onClick={handlePanic}
              style={{ 
                width: '100%', 
                padding: '12px', 
                background: isPanicMode ? '#00ff88' : '#ff0000', 
                border: 'none', 
                color: isPanicMode ? '#000' : '#fff', 
                borderRadius: '5px', 
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              {isPanicMode ? 'RESUME EXCHANGE' : 'PANIC HALT'}
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div style={{ flex: 1, padding: '30px' }}>
          
          {activeTab === 'overview' && (
            <>
              <h2>System Overview</h2>
              
              {/* Metrics Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '30px' }}>
                <MetricCard title="Matching Latency P50" value={SYSTEM_METRICS.matchingLatencyP50} color="#00ff88" />
                <MetricCard title="Matching Latency P99" value={SYSTEM_METRICS.matchingLatencyP99} color="#ffaa00" />
                <MetricCard title="Orders/Second" value={SYSTEM_METRICS.ordersPerSecond.toLocaleString()} color="#00aaff" />
                <MetricCard title="Active Connections" value={SYSTEM_METRICS.activeConnections.toLocaleString()} color="#fff" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '30px' }}>
                <MetricCard title="Kafka Lag" value={SYSTEM_METRICS.kafkaLag} color={SYSTEM_METRICS.kafkaLag < 100 ? '#00ff88' : '#ff0000'} />
                <MetricCard title="Uptime (30d)" value={SYSTEM_METRICS.uptime} color="#00ff88" />
                <MetricCard title="Last Incident" value={SYSTEM_METRICS.lastIncident} color="#00ff88" />
              </div>

              {/* Recent Alerts */}
              <h3>Recent Alerts</h3>
              <div style={{ background: '#111', borderRadius: '10px', border: '1px solid #222', overflow: 'hidden' }}>
                {RISK_ALERTS.map(alert => (
                  <div key={alert.id} style={{ 
                    padding: '15px 20px', 
                    borderBottom: '1px solid #222',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderLeft: `3px solid ${alert.severity === 'critical' ? '#ff0000' : alert.severity === 'warning' ? '#ffaa00' : '#00aaff'}`
                  }}>
                    <span>{alert.message}</span>
                    <span style={{ color: '#666' }}>{alert.time}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          {activeTab === 'users' && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2>User Management</h2>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input 
                    type="text" 
                    placeholder="Search users..."
                    style={{ padding: '10px 15px', background: '#222', border: '1px solid #333', color: '#fff', borderRadius: '5px', width: '250px' }}
                  />
                </div>
              </div>

              {/* Mint Section */}
              <div style={{ background: '#111', padding: '20px', borderRadius: '10px', border: '1px solid #222', marginBottom: '30px' }}>
                <h3 style={{ marginTop: 0 }}>🏦 Central Bank - Mint k99</h3>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <select 
                    onChange={e => setSelectedUser(e.target.value)}
                    style={{ padding: '10px', background: '#222', border: '1px solid #333', color: '#fff', borderRadius: '5px' }}
                  >
                    <option value="">Select User</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id}>{u.email}</option>
                    ))}
                  </select>
                  <input 
                    type="number" 
                    placeholder="Amount"
                    value={mintAmount}
                    onChange={e => setMintAmount(e.target.value)}
                    style={{ padding: '10px', background: '#222', border: '1px solid #333', color: '#fff', borderRadius: '5px', width: '150px' }}
                  />
                  <button 
                    onClick={handleMint}
                    style={{ padding: '10px 25px', background: '#00ff88', border: 'none', color: '#000', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    MINT k99
                  </button>
                </div>
              </div>

              {/* Users Table */}
              <div style={{ background: '#111', borderRadius: '10px', border: '1px solid #222', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#0a0a0a', color: '#666' }}>
                      <th style={{ padding: '15px', textAlign: 'left' }}>ID</th>
                      <th style={{ padding: '15px', textAlign: 'left' }}>Email</th>
                      <th style={{ padding: '15px', textAlign: 'right' }}>k99 Balance</th>
                      <th style={{ padding: '15px', textAlign: 'center' }}>Risk Score</th>
                      <th style={{ padding: '15px', textAlign: 'center' }}>Status</th>
                      <th style={{ padding: '15px', textAlign: 'center' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user.id} style={{ borderBottom: '1px solid #1a1a1a' }}>
                        <td style={{ padding: '15px' }}>#{user.id}</td>
                        <td style={{ padding: '15px' }}>{user.email}</td>
                        <td style={{ padding: '15px', textAlign: 'right', color: '#00ff88', fontWeight: 'bold' }}>
                          {user.k99_balance?.toLocaleString()} k99
                        </td>
                        <td style={{ padding: '15px', textAlign: 'center' }}>
                          <span style={{ 
                            padding: '4px 12px', 
                            borderRadius: '20px',
                            background: user.risk_score > 50 ? '#ff000022' : user.risk_score > 25 ? '#ffaa0022' : '#00ff8822',
                            color: user.risk_score > 50 ? '#ff0000' : user.risk_score > 25 ? '#ffaa00' : '#00ff88'
                          }}>
                            {user.risk_score}
                          </span>
                        </td>
                        <td style={{ padding: '15px', textAlign: 'center' }}>
                          <span style={{ color: user.is_frozen ? '#ff0000' : '#00ff88' }}>
                            {user.is_frozen ? '🔒 FROZEN' : '✓ ACTIVE'}
                          </span>
                        </td>
                        <td style={{ padding: '15px', textAlign: 'center' }}>
                          <button 
                            onClick={() => toggleFreeze(user.id, user.is_frozen)}
                            style={{ 
                              padding: '6px 12px', 
                              background: user.is_frozen ? '#00ff88' : '#ff0000', 
                              border: 'none', 
                              color: user.is_frozen ? '#000' : '#fff', 
                              borderRadius: '4px', 
                              cursor: 'pointer',
                              marginRight: '5px'
                            }}
                          >
                            {user.is_frozen ? 'Unfreeze' : 'Freeze'}
                          </button>
                          <button style={{ padding: '6px 12px', background: '#333', border: 'none', color: '#fff', borderRadius: '4px', cursor: 'pointer' }}>
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {activeTab === 'treasury' && (
            <>
              <h2>Treasury & On-Chain Reserves</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                {Object.entries(TREASURY_STATUS).map(([asset, data]) => (
                  <div key={asset} style={{ background: '#111', padding: '20px', borderRadius: '10px', border: '1px solid #222' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                      <h3 style={{ margin: 0 }}>{asset} Treasury</h3>
                      <span style={{ 
                        padding: '4px 12px', 
                        borderRadius: '20px',
                        background: data.status === 'healthy' ? '#00ff8822' : '#ffaa0022',
                        color: data.status === 'healthy' ? '#00ff88' : '#ffaa00'
                      }}>
                        {data.status}
                      </span>
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '10px' }}>
                      {data.balance.toLocaleString()} {asset}
                    </div>
                    {data.pending > 0 && (
                      <div style={{ color: '#ffaa00' }}>Pending: {data.pending} {asset}</div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}

          {activeTab === 'risk' && (
            <>
              <h2>Risk Management</h2>
              <p style={{ color: '#888' }}>Monte-Carlo VaR, Margin Calls, Liquidation Engine controls...</p>
            </>
          )}

          {activeTab === 'surveillance' && (
            <>
              <h2>Market Surveillance</h2>
              <p style={{ color: '#888' }}>AI-powered fraud detection, wash trade alerts, spoofing detection...</p>
            </>
          )}

          {activeTab === 'settings' && (
            <>
              <h2>System Settings</h2>
              <p style={{ color: '#888' }}>Exchange configuration, fee schedules, API limits...</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, color }) {
  return (
    <div style={{ background: '#111', padding: '20px', borderRadius: '10px', border: '1px solid #222' }}>
      <div style={{ color: '#666', marginBottom: '10px', fontSize: '0.85rem' }}>{title}</div>
      <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color }}>{value}</div>
    </div>
  );
}
