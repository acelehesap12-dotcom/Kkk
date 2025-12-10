// 👑 UNIFIED EXCHANGE - MARKETS OVERVIEW
import { useState, useEffect } from 'react';
import Link from 'next/link';

// All supported markets
const ALL_MARKETS = [
  // Crypto
  { symbol: "BTC-USD", name: "Bitcoin", type: "Crypto", price: 43250.00, change: 2.45, volume: "12.5B", high: 44100, low: 42800 },
  { symbol: "ETH-USD", name: "Ethereum", type: "Crypto", price: 2350.00, change: 3.21, volume: "5.2B", high: 2400, low: 2280 },
  { symbol: "SOL-USD", name: "Solana", type: "Crypto", price: 98.50, change: -1.25, volume: "1.8B", high: 102, low: 96 },
  
  // Forex
  { symbol: "EUR-USD", name: "Euro/USD", type: "Forex", price: 1.0852, change: 0.15, volume: "2.1T", high: 1.0875, low: 1.0820 },
  { symbol: "GBP-USD", name: "British Pound", type: "Forex", price: 1.2650, change: -0.08, volume: "1.5T", high: 1.2680, low: 1.2610 },
  { symbol: "USD-JPY", name: "USD/Yen", type: "Forex", price: 149.25, change: 0.32, volume: "1.8T", high: 149.80, low: 148.50 },
  
  // Stocks
  { symbol: "AAPL", name: "Apple Inc.", type: "Stock", price: 182.50, change: 1.85, volume: "52M", high: 184.20, low: 180.10 },
  { symbol: "TSLA", name: "Tesla Inc.", type: "Stock", price: 245.30, change: -2.15, volume: "98M", high: 252.00, low: 242.50 },
  { symbol: "NVDA", name: "NVIDIA", type: "Stock", price: 485.20, change: 4.25, volume: "45M", high: 492.00, low: 478.00 },
  { symbol: "MSFT", name: "Microsoft", type: "Stock", price: 378.50, change: 0.95, volume: "22M", high: 380.00, low: 375.20 },
  
  // ETFs
  { symbol: "SPY", name: "S&P 500 ETF", type: "ETF", price: 452.80, change: 0.65, volume: "85M", high: 454.50, low: 450.20 },
  { symbol: "QQQ", name: "Nasdaq 100 ETF", type: "ETF", price: 385.40, change: 1.12, volume: "42M", high: 388.00, low: 382.50 },
  
  // Commodities
  { symbol: "GOLD", name: "Gold", type: "Commodity", price: 2025.50, change: 0.85, volume: "180K", high: 2035.00, low: 2018.00 },
  { symbol: "OIL", name: "Crude Oil WTI", type: "Commodity", price: 72.45, change: -1.52, volume: "450K", high: 74.20, low: 71.80 },
  { symbol: "SILVER", name: "Silver", type: "Commodity", price: 23.85, change: 1.25, volume: "95K", high: 24.10, low: 23.50 },
  
  // Bonds
  { symbol: "US10Y", name: "US 10-Year Treasury", type: "Bond", price: 96.25, change: -0.15, volume: "2.5B", high: 96.50, low: 96.00 },
  { symbol: "US30Y", name: "US 30-Year Treasury", type: "Bond", price: 94.80, change: -0.22, volume: "1.2B", high: 95.10, low: 94.50 },
  
  // Options (Example)
  { symbol: "AAPL-C-185", name: "AAPL Call $185", type: "Option", price: 5.25, change: 12.50, volume: "15K", high: 5.80, low: 4.90 },
  { symbol: "TSLA-P-240", name: "TSLA Put $240", type: "Option", price: 8.45, change: -5.20, volume: "22K", high: 9.20, low: 8.10 },
  
  // Futures
  { symbol: "ES-FUT", name: "E-mini S&P 500", type: "Future", price: 4535.25, change: 0.45, volume: "1.2M", high: 4548.00, low: 4520.00 },
  { symbol: "NQ-FUT", name: "E-mini Nasdaq", type: "Future", price: 15820.50, change: 0.82, volume: "850K", high: 15900.00, low: 15750.00 },
];

const ASSET_TYPES = ["All", "Crypto", "Forex", "Stock", "ETF", "Commodity", "Bond", "Option", "Future"];

export default function Markets() {
  const [filter, setFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [markets, setMarkets] = useState(ALL_MARKETS);

  useEffect(() => {
    let filtered = ALL_MARKETS;
    
    if (filter !== "All") {
      filtered = filtered.filter(m => m.type === filter);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(m => 
        m.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setMarkets(filtered);
  }, [filter, searchTerm]);

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff', fontFamily: 'monospace' }}>
      {/* Header */}
      <div style={{ borderBottom: '1px solid #222', padding: '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href="/">
          <h1 style={{ cursor: 'pointer', margin: 0 }}>k99 <span style={{ color: '#666' }}>EXCHANGE</span></h1>
        </Link>
        <div style={{ display: 'flex', gap: '20px' }}>
          <Link href="/markets"><span style={{ color: '#00ff88', cursor: 'pointer' }}>Markets</span></Link>
          <Link href="/trade"><span style={{ color: '#888', cursor: 'pointer' }}>Trade</span></Link>
          <Link href="/portfolio"><span style={{ color: '#888', cursor: 'pointer' }}>Portfolio</span></Link>
          <Link href="/wallet"><span style={{ color: '#888', cursor: 'pointer' }}>Wallet</span></Link>
          <Link href="/quant-studio"><span style={{ color: '#888', cursor: 'pointer' }}>Quant Studio</span></Link>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ padding: '40px', maxWidth: '1400px', margin: '0 auto' }}>
        <h2 style={{ marginBottom: '30px' }}>Markets Overview</h2>
        
        {/* Filters */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {ASSET_TYPES.map(type => (
              <button 
                key={type}
                onClick={() => setFilter(type)}
                style={{ 
                  padding: '10px 20px', 
                  background: filter === type ? '#00ff88' : '#222', 
                  border: 'none', 
                  color: filter === type ? '#000' : '#fff', 
                  borderRadius: '20px', 
                  cursor: 'pointer',
                  fontWeight: filter === type ? 'bold' : 'normal'
                }}
              >
                {type}
              </button>
            ))}
          </div>
          
          <input 
            type="text"
            placeholder="Search markets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ padding: '10px 20px', background: '#111', border: '1px solid #333', borderRadius: '20px', color: '#fff', width: '250px' }}
          />
        </div>

        {/* Markets Table */}
        <div style={{ background: '#111', borderRadius: '10px', border: '1px solid #222', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#0a0a0a', color: '#666' }}>
                <th style={{ padding: '15px', textAlign: 'left' }}>Symbol</th>
                <th style={{ padding: '15px', textAlign: 'left' }}>Name</th>
                <th style={{ padding: '15px', textAlign: 'left' }}>Type</th>
                <th style={{ padding: '15px', textAlign: 'right' }}>Price</th>
                <th style={{ padding: '15px', textAlign: 'right' }}>24h Change</th>
                <th style={{ padding: '15px', textAlign: 'right' }}>Volume</th>
                <th style={{ padding: '15px', textAlign: 'right' }}>High</th>
                <th style={{ padding: '15px', textAlign: 'right' }}>Low</th>
                <th style={{ padding: '15px', textAlign: 'center' }}>Trade</th>
              </tr>
            </thead>
            <tbody>
              {markets.map((market, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #1a1a1a' }}>
                  <td style={{ padding: '15px', fontWeight: 'bold' }}>{market.symbol}</td>
                  <td style={{ padding: '15px', color: '#888' }}>{market.name}</td>
                  <td style={{ padding: '15px' }}>
                    <TypeBadge type={market.type} />
                  </td>
                  <td style={{ padding: '15px', textAlign: 'right', fontWeight: 'bold' }}>
                    ${market.price.toLocaleString()}
                  </td>
                  <td style={{ padding: '15px', textAlign: 'right', color: market.change >= 0 ? '#00ff88' : '#ff0055' }}>
                    {market.change >= 0 ? '+' : ''}{market.change}%
                  </td>
                  <td style={{ padding: '15px', textAlign: 'right', color: '#888' }}>{market.volume}</td>
                  <td style={{ padding: '15px', textAlign: 'right', color: '#00ff88' }}>${market.high.toLocaleString()}</td>
                  <td style={{ padding: '15px', textAlign: 'right', color: '#ff0055' }}>${market.low.toLocaleString()}</td>
                  <td style={{ padding: '15px', textAlign: 'center' }}>
                    <Link href={`/trade?symbol=${market.symbol}`}>
                      <button style={{ padding: '8px 16px', background: '#00ff88', border: 'none', color: '#000', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                        Trade
                      </button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Market Stats */}
        <div style={{ marginTop: '40px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
          <StatCard title="Total Markets" value="21" icon="📊" />
          <StatCard title="24h Volume" value="$28.5T" icon="💹" />
          <StatCard title="Active Traders" value="12,458" icon="👥" />
          <StatCard title="Avg Latency" value="< 1ms" icon="⚡" />
        </div>
      </div>
    </div>
  );
}

function TypeBadge({ type }) {
  const colors = {
    Crypto: '#f7931a',
    Forex: '#00aaff',
    Stock: '#00ff88',
    ETF: '#aa55ff',
    Commodity: '#ffaa00',
    Bond: '#ff5588',
    Option: '#55ffaa',
    Future: '#ff8855'
  };
  
  return (
    <span style={{ 
      padding: '4px 10px', 
      background: `${colors[type]}22`, 
      color: colors[type], 
      borderRadius: '4px', 
      fontSize: '0.8rem',
      border: `1px solid ${colors[type]}44`
    }}>
      {type}
    </span>
  );
}

function StatCard({ title, value, icon }) {
  return (
    <div style={{ background: '#111', borderRadius: '10px', border: '1px solid #222', padding: '20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
      <div style={{ fontSize: '2rem' }}>{icon}</div>
      <div>
        <div style={{ color: '#666', fontSize: '0.9rem' }}>{title}</div>
        <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{value}</div>
      </div>
    </div>
  );
}
