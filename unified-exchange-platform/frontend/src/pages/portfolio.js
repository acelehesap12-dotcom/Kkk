// 👑 UNIFIED EXCHANGE - PORTFOLIO DASHBOARD
// Real-time portfolio tracking with live P&L

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import { marketData } from '../lib/api';

export default function Portfolio() {
  const [positions, setPositions] = useState([]);
  const [balances, setBalances] = useState({});
  const [marketPrices, setMarketPrices] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');

  // Fetch market prices for P&L calculation
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await marketData.getAllMarkets();
        
        // Flatten all prices
        const prices = {};
        Object.entries(data.crypto).forEach(([k, v]) => prices[k] = v.price);
        Object.entries(data.stocks).forEach(([k, v]) => prices[k] = v.price);
        setMarketPrices(prices);

        // Demo positions (in production, fetch from API)
        setPositions([
          { symbol: 'BTC-USD', type: 'Crypto', side: 'long', quantity: 2.5, avgPrice: 95000, leverage: 1 },
          { symbol: 'ETH-USD', type: 'Crypto', side: 'long', quantity: 15, avgPrice: 3200, leverage: 1 },
          { symbol: 'SOL-USD', type: 'Crypto', side: 'short', quantity: 50, avgPrice: 210, leverage: 3 },
          { symbol: 'AAPL', type: 'Stock', side: 'long', quantity: 100, avgPrice: 240, leverage: 1 },
          { symbol: 'NVDA', type: 'Stock', side: 'long', quantity: 50, avgPrice: 135, leverage: 1 },
          { symbol: 'GOLD', type: 'Commodity', side: 'long', quantity: 5, avgPrice: 2650, leverage: 1 },
        ]);

        setBalances({
          USD: 125000,
          BTC: 2.5,
          ETH: 15,
          SOL: 50,
        });

        setLoading(false);
      } catch (error) {
        console.error('Portfolio fetch error:', error);
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  // Calculate P&L for each position
  const positionsWithPnL = useMemo(() => {
    return positions.map(pos => {
      const currentPrice = marketPrices[pos.symbol] || pos.avgPrice;
      const notional = pos.quantity * pos.avgPrice;
      const currentValue = pos.quantity * currentPrice;
      
      let pnl, pnlPercent;
      if (pos.side === 'long') {
        pnl = (currentPrice - pos.avgPrice) * pos.quantity * pos.leverage;
        pnlPercent = ((currentPrice - pos.avgPrice) / pos.avgPrice) * 100 * pos.leverage;
      } else {
        pnl = (pos.avgPrice - currentPrice) * pos.quantity * pos.leverage;
        pnlPercent = ((pos.avgPrice - currentPrice) / pos.avgPrice) * 100 * pos.leverage;
      }

      return {
        ...pos,
        currentPrice,
        notional,
        currentValue,
        pnl,
        pnlPercent,
        margin: notional / pos.leverage,
      };
    });
  }, [positions, marketPrices]);

  // Filter positions
  const filteredPositions = useMemo(() => {
    if (activeFilter === 'All') return positionsWithPnL;
    return positionsWithPnL.filter(p => p.type === activeFilter);
  }, [positionsWithPnL, activeFilter]);

  // Portfolio stats
  const stats = useMemo(() => {
    const totalPnL = positionsWithPnL.reduce((sum, p) => sum + p.pnl, 0);
    const totalNotional = positionsWithPnL.reduce((sum, p) => sum + p.notional, 0);
    const totalMargin = positionsWithPnL.reduce((sum, p) => sum + p.margin, 0);
    const winningPositions = positionsWithPnL.filter(p => p.pnl > 0).length;
    
    return {
      equity: balances.USD + totalPnL,
      unrealizedPnL: totalPnL,
      marginUsed: totalMargin,
      marginAvailable: balances.USD - totalMargin,
      marginLevel: totalMargin > 0 ? (balances.USD / totalMargin) * 100 : 0,
      winRate: positionsWithPnL.length > 0 ? (winningPositions / positionsWithPnL.length) * 100 : 0,
    };
  }, [positionsWithPnL, balances]);

  // Asset allocation
  const allocation = useMemo(() => {
    const byType = {};
    positionsWithPnL.forEach(p => {
      byType[p.type] = (byType[p.type] || 0) + p.currentValue;
    });
    const total = Object.values(byType).reduce((a, b) => a + b, 0);
    return Object.entries(byType).map(([type, value]) => ({
      type,
      value,
      percentage: total > 0 ? (value / total) * 100 : 0,
    }));
  }, [positionsWithPnL]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '32px', marginBottom: '16px' }}>⏳</div>
          <div style={{ color: '#888' }}>Loading portfolio...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
      <Navbar />

      <div style={{ padding: '40px', maxWidth: '1600px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '32px', marginBottom: '8px' }}>Portfolio</h1>
          <p style={{ color: '#888' }}>Track your positions and performance in real-time</p>
        </div>

        {/* Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
          <SummaryCard 
            label="Total Equity" 
            value={`$${stats.equity.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
            subValue={`${stats.unrealizedPnL >= 0 ? '+' : ''}$${stats.unrealizedPnL.toLocaleString(undefined, { minimumFractionDigits: 2 })} today`}
            subColor={stats.unrealizedPnL >= 0 ? '#00ff88' : '#ff0055'}
          />
          <SummaryCard 
            label="Unrealized P&L" 
            value={`${stats.unrealizedPnL >= 0 ? '+' : ''}$${stats.unrealizedPnL.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
            valueColor={stats.unrealizedPnL >= 0 ? '#00ff88' : '#ff0055'}
          />
          <SummaryCard 
            label="Margin Used" 
            value={`$${stats.marginUsed.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
            subValue={`${stats.marginLevel.toFixed(1)}% margin level`}
          />
          <SummaryCard 
            label="Available" 
            value={`$${stats.marginAvailable.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
            subValue={`Win Rate: ${stats.winRate.toFixed(0)}%`}
          />
        </div>

        {/* Positions Section */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
          {/* Positions Table */}
          <div style={{ background: '#111', borderRadius: '12px', border: '1px solid #222', overflow: 'hidden' }}>
            <div style={{ padding: '20px', borderBottom: '1px solid #222', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '18px' }}>Open Positions ({filteredPositions.length})</h2>
              <div style={{ display: 'flex', gap: '8px' }}>
                {['All', 'Crypto', 'Stock', 'Commodity'].map(f => (
                  <button
                    key={f}
                    onClick={() => setActiveFilter(f)}
                    style={{
                      padding: '6px 14px',
                      background: activeFilter === f ? '#222' : 'transparent',
                      border: '1px solid #333',
                      color: activeFilter === f ? '#fff' : '#666',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '13px',
                    }}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#0a0a0a', color: '#666', fontSize: '12px', textTransform: 'uppercase' }}>
                  <th style={{ padding: '14px 16px', textAlign: 'left' }}>Symbol</th>
                  <th style={{ padding: '14px 16px', textAlign: 'left' }}>Side</th>
                  <th style={{ padding: '14px 16px', textAlign: 'right' }}>Size</th>
                  <th style={{ padding: '14px 16px', textAlign: 'right' }}>Entry</th>
                  <th style={{ padding: '14px 16px', textAlign: 'right' }}>Mark</th>
                  <th style={{ padding: '14px 16px', textAlign: 'right' }}>P&L</th>
                  <th style={{ padding: '14px 16px', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPositions.map((pos, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #1a1a1a' }}>
                    <td style={{ padding: '16px' }}>
                      <div style={{ fontWeight: 'bold' }}>{pos.symbol}</div>
                      <div style={{ fontSize: '12px', color: '#666' }}>{pos.type}</div>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: '600',
                        background: pos.side === 'long' ? '#00ff8820' : '#ff005520',
                        color: pos.side === 'long' ? '#00ff88' : '#ff0055',
                      }}>
                        {pos.side.toUpperCase()} {pos.leverage > 1 && `${pos.leverage}x`}
                      </span>
                    </td>
                    <td style={{ padding: '16px', textAlign: 'right', fontFamily: 'monospace' }}>{pos.quantity}</td>
                    <td style={{ padding: '16px', textAlign: 'right', fontFamily: 'monospace' }}>${pos.avgPrice.toLocaleString()}</td>
                    <td style={{ padding: '16px', textAlign: 'right', fontFamily: 'monospace' }}>${pos.currentPrice.toLocaleString()}</td>
                    <td style={{ padding: '16px', textAlign: 'right' }}>
                      <div style={{ color: pos.pnl >= 0 ? '#00ff88' : '#ff0055', fontWeight: 'bold', fontFamily: 'monospace' }}>
                        {pos.pnl >= 0 ? '+' : ''}${pos.pnl.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </div>
                      <div style={{ fontSize: '12px', color: pos.pnl >= 0 ? '#00ff88' : '#ff0055' }}>
                        ({pos.pnlPercent >= 0 ? '+' : ''}{pos.pnlPercent.toFixed(2)}%)
                      </div>
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center' }}>
                      <button style={{
                        padding: '6px 14px',
                        background: '#ff0055',
                        border: 'none',
                        color: '#fff',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: '600',
                        marginRight: '8px',
                      }}>
                        Close
                      </button>
                      <Link href={`/trade?symbol=${pos.symbol}`}>
                        <button style={{
                          padding: '6px 14px',
                          background: '#222',
                          border: '1px solid #333',
                          color: '#fff',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px',
                        }}>
                          Trade
                        </button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Right Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Asset Allocation */}
            <div style={{ background: '#111', borderRadius: '12px', border: '1px solid #222', padding: '20px' }}>
              <h3 style={{ margin: '0 0 20px 0', fontSize: '16px' }}>Asset Allocation</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {allocation.map((a, i) => (
                  <AllocationBar key={i} asset={a.type} percentage={a.percentage} color={getTypeColor(a.type)} />
                ))}
              </div>
            </div>

            {/* Risk Metrics */}
            <div style={{ background: '#111', borderRadius: '12px', border: '1px solid #222', padding: '20px' }}>
              <h3 style={{ margin: '0 0 20px 0', fontSize: '16px' }}>Risk Metrics</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <RiskMetric label="Portfolio VaR (99%, 1-day)" value="$4,250" status="normal" />
                <RiskMetric label="Expected Shortfall" value="$6,120" status="normal" />
                <RiskMetric label="Margin Level" value={`${stats.marginLevel.toFixed(1)}%`} status={stats.marginLevel > 150 ? 'healthy' : 'warning'} />
                <RiskMetric label="Max Drawdown" value="-8.5%" status="normal" />
              </div>
            </div>

            {/* Quick Actions */}
            <div style={{ background: '#111', borderRadius: '12px', border: '1px solid #222', padding: '20px' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '16px' }}>Quick Actions</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <Link href="/trade" style={{ textDecoration: 'none' }}>
                  <button style={{ width: '100%', padding: '12px', background: '#00ff88', border: 'none', color: '#000', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                    New Position
                  </button>
                </Link>
                <button style={{ width: '100%', padding: '12px', background: '#222', border: '1px solid #333', color: '#fff', borderRadius: '8px', cursor: 'pointer' }}>
                  Close All Positions
                </button>
                <Link href="/wallet" style={{ textDecoration: 'none' }}>
                  <button style={{ width: '100%', padding: '12px', background: '#222', border: '1px solid #333', color: '#fff', borderRadius: '8px', cursor: 'pointer' }}>
                    Deposit Funds
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ===================== COMPONENTS =====================

function SummaryCard({ label, value, subValue, valueColor, subColor }) {
  return (
    <div style={{ background: '#111', borderRadius: '12px', border: '1px solid #222', padding: '20px' }}>
      <div style={{ color: '#666', fontSize: '13px', marginBottom: '8px' }}>{label}</div>
      <div style={{ fontSize: '24px', fontWeight: 'bold', color: valueColor || '#fff', marginBottom: '4px' }}>{value}</div>
      {subValue && <div style={{ fontSize: '13px', color: subColor || '#666' }}>{subValue}</div>}
    </div>
  );
}

function AllocationBar({ asset, percentage, color }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '13px' }}>
        <span style={{ color: '#888' }}>{asset}</span>
        <span style={{ color, fontWeight: '600' }}>{percentage.toFixed(1)}%</span>
      </div>
      <div style={{ height: '6px', background: '#222', borderRadius: '3px', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${percentage}%`, background: color, borderRadius: '3px' }} />
      </div>
    </div>
  );
}

function RiskMetric({ label, value, status }) {
  const statusColors = { healthy: '#00ff88', normal: '#00aaff', warning: '#ffaa00', critical: '#ff0055' };
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ color: '#888', fontSize: '13px' }}>{label}</span>
      <span style={{ color: statusColors[status], fontWeight: '600', fontFamily: 'monospace' }}>{value}</span>
    </div>
  );
}

function getTypeColor(type) {
  const colors = { Crypto: '#f7931a', Forex: '#00aaff', Stock: '#00ff88', Commodity: '#ffaa00', Bond: '#ff5588' };
  return colors[type] || '#888';
}
