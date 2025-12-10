// 👑 UNIFIED EXCHANGE - PORTFOLIO DASHBOARD
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { API_URL } from '../config';

// Mock Portfolio Data (In production, fetch from API)
const MOCK_POSITIONS = [
  { symbol: "BTC-USD", type: "Crypto", side: "long", quantity: 2.5, avgPrice: 42500, currentPrice: 43200, pnl: 1750 },
  { symbol: "ETH-USD", type: "Crypto", side: "long", quantity: 15, avgPrice: 2200, currentPrice: 2350, pnl: 2250 },
  { symbol: "EUR-USD", type: "Forex", side: "short", quantity: 100000, avgPrice: 1.0850, currentPrice: 1.0820, pnl: 300 },
  { symbol: "AAPL", type: "Stock", side: "long", quantity: 50, avgPrice: 175, currentPrice: 182, pnl: 350 },
  { symbol: "GOLD", type: "Commodity", side: "long", quantity: 10, avgPrice: 1950, currentPrice: 2020, pnl: 700 },
];

const MOCK_BALANCES = {
  k99: 125000.00,
  USD: 50000.00,
  BTC: 2.5,
  ETH: 15.0,
};

export default function Portfolio() {
  const [positions, setPositions] = useState(MOCK_POSITIONS);
  const [balances, setBalances] = useState(MOCK_BALANCES);
  const [totalPnL, setTotalPnL] = useState(0);
  const [marginUsed, setMarginUsed] = useState(0);
  const [marginAvailable, setMarginAvailable] = useState(0);

  useEffect(() => {
    // Calculate totals
    const pnl = positions.reduce((sum, p) => sum + p.pnl, 0);
    setTotalPnL(pnl);
    
    // Mock margin calculation
    const used = positions.reduce((sum, p) => sum + (p.quantity * p.currentPrice * 0.1), 0); // 10% margin
    setMarginUsed(used);
    setMarginAvailable(balances.k99 - used);
  }, [positions, balances]);

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
          <Link href="/portfolio"><span style={{ color: '#00ff88', cursor: 'pointer' }}>Portfolio</span></Link>
          <Link href="/wallet"><span style={{ color: '#888', cursor: 'pointer' }}>Wallet</span></Link>
          <Link href="/quant-studio"><span style={{ color: '#888', cursor: 'pointer' }}>Quant Studio</span></Link>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ padding: '40px', maxWidth: '1400px', margin: '0 auto' }}>
        
        {/* Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '40px' }}>
          <SummaryCard title="Total Equity" value={`$${(balances.k99 + totalPnL).toLocaleString()}`} color="#fff" />
          <SummaryCard title="Unrealized P&L" value={`${totalPnL >= 0 ? '+' : ''}$${totalPnL.toLocaleString()}`} color={totalPnL >= 0 ? '#00ff88' : '#ff0055'} />
          <SummaryCard title="Margin Used" value={`$${marginUsed.toLocaleString()}`} color="#ffaa00" />
          <SummaryCard title="Available Margin" value={`$${marginAvailable.toLocaleString()}`} color="#00aaff" />
        </div>

        {/* Positions Table */}
        <div style={{ background: '#111', borderRadius: '10px', border: '1px solid #222', overflow: 'hidden' }}>
          <div style={{ padding: '20px', borderBottom: '1px solid #222', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0 }}>Open Positions</h2>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button style={{ padding: '8px 16px', background: '#222', border: 'none', color: '#fff', borderRadius: '4px', cursor: 'pointer' }}>All</button>
              <button style={{ padding: '8px 16px', background: 'transparent', border: '1px solid #333', color: '#888', borderRadius: '4px', cursor: 'pointer' }}>Crypto</button>
              <button style={{ padding: '8px 16px', background: 'transparent', border: '1px solid #333', color: '#888', borderRadius: '4px', cursor: 'pointer' }}>Forex</button>
              <button style={{ padding: '8px 16px', background: 'transparent', border: '1px solid #333', color: '#888', borderRadius: '4px', cursor: 'pointer' }}>Stocks</button>
            </div>
          </div>
          
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#0a0a0a', color: '#666' }}>
                <th style={{ padding: '15px', textAlign: 'left' }}>Symbol</th>
                <th style={{ padding: '15px', textAlign: 'left' }}>Type</th>
                <th style={{ padding: '15px', textAlign: 'left' }}>Side</th>
                <th style={{ padding: '15px', textAlign: 'right' }}>Quantity</th>
                <th style={{ padding: '15px', textAlign: 'right' }}>Avg Price</th>
                <th style={{ padding: '15px', textAlign: 'right' }}>Current Price</th>
                <th style={{ padding: '15px', textAlign: 'right' }}>P&L</th>
                <th style={{ padding: '15px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {positions.map((pos, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #1a1a1a' }}>
                  <td style={{ padding: '15px', fontWeight: 'bold' }}>{pos.symbol}</td>
                  <td style={{ padding: '15px' }}>
                    <span style={{ padding: '4px 8px', background: '#222', borderRadius: '4px', fontSize: '0.8rem' }}>{pos.type}</span>
                  </td>
                  <td style={{ padding: '15px' }}>
                    <span style={{ color: pos.side === 'long' ? '#00ff88' : '#ff0055' }}>{pos.side.toUpperCase()}</span>
                  </td>
                  <td style={{ padding: '15px', textAlign: 'right' }}>{pos.quantity}</td>
                  <td style={{ padding: '15px', textAlign: 'right' }}>${pos.avgPrice.toLocaleString()}</td>
                  <td style={{ padding: '15px', textAlign: 'right' }}>${pos.currentPrice.toLocaleString()}</td>
                  <td style={{ padding: '15px', textAlign: 'right', color: pos.pnl >= 0 ? '#00ff88' : '#ff0055', fontWeight: 'bold' }}>
                    {pos.pnl >= 0 ? '+' : ''}${pos.pnl.toLocaleString()}
                  </td>
                  <td style={{ padding: '15px', textAlign: 'center' }}>
                    <button style={{ padding: '6px 12px', background: '#ff0055', border: 'none', color: '#fff', borderRadius: '4px', cursor: 'pointer', marginRight: '5px' }}>Close</button>
                    <button style={{ padding: '6px 12px', background: '#333', border: 'none', color: '#fff', borderRadius: '4px', cursor: 'pointer' }}>Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Risk Metrics */}
        <div style={{ marginTop: '40px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div style={{ background: '#111', borderRadius: '10px', border: '1px solid #222', padding: '20px' }}>
            <h3 style={{ marginTop: 0, marginBottom: '20px' }}>Risk Metrics</h3>
            <div style={{ display: 'grid', gap: '15px' }}>
              <RiskMetric label="Portfolio VaR (99%, 1-day)" value="$2,450" status="normal" />
              <RiskMetric label="Expected Shortfall" value="$3,120" status="normal" />
              <RiskMetric label="Margin Level" value="245%" status="healthy" />
              <RiskMetric label="Liquidation Price (BTC)" value="$28,500" status="warning" />
            </div>
          </div>
          
          <div style={{ background: '#111', borderRadius: '10px', border: '1px solid #222', padding: '20px' }}>
            <h3 style={{ marginTop: 0, marginBottom: '20px' }}>Asset Allocation</h3>
            <div style={{ display: 'grid', gap: '10px' }}>
              <AllocationBar asset="Crypto" percentage={65} color="#f7931a" />
              <AllocationBar asset="Forex" percentage={15} color="#00aaff" />
              <AllocationBar asset="Stocks" percentage={12} color="#00ff88" />
              <AllocationBar asset="Commodities" percentage={8} color="#ffaa00" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ title, value, color }) {
  return (
    <div style={{ background: '#111', borderRadius: '10px', border: '1px solid #222', padding: '20px' }}>
      <div style={{ color: '#666', marginBottom: '10px', fontSize: '0.9rem' }}>{title}</div>
      <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color }}>{value}</div>
    </div>
  );
}

function RiskMetric({ label, value, status }) {
  const colors = { healthy: '#00ff88', normal: '#fff', warning: '#ffaa00', danger: '#ff0055' };
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ color: '#888' }}>{label}</span>
      <span style={{ color: colors[status], fontWeight: 'bold' }}>{value}</span>
    </div>
  );
}

function AllocationBar({ asset, percentage, color }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
        <span style={{ color: '#888' }}>{asset}</span>
        <span style={{ color: '#fff' }}>{percentage}%</span>
      </div>
      <div style={{ height: '8px', background: '#222', borderRadius: '4px', overflow: 'hidden' }}>
        <div style={{ width: `${percentage}%`, height: '100%', background: color, borderRadius: '4px' }}></div>
      </div>
    </div>
  );
}
