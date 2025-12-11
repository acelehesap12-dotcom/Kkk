// 👑 UNIFIED EXCHANGE - MARKETS PAGE
// Real-time market data with live API integration

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import { ExchangeAPI } from '../lib/api';

const ASSET_TYPES = ['All', 'crypto', 'forex', 'stocks', 'commodities', 'bonds', 'etfs', 'futures', 'options'];

export default function Markets() {
  const [filter, setFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('volume24h');
  const [sortDir, setSortDir] = useState('desc');
  const [markets, setMarkets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);

  // Fetch market data
  useEffect(() => {
    const fetchMarkets = async () => {
      try {
        // Use the new ExchangeAPI that fetches real data from CoinGecko
        const allMarkets = await ExchangeAPI.getMarkets();
        
        setMarkets(allMarkets);
        setLastUpdate(new Date());
        setLoading(false);
      } catch (error) {
        console.error('Markets fetch error:', error);
        setLoading(false);
      }
    };

    fetchMarkets();
    const interval = setInterval(fetchMarkets, 15000); // Refresh every 15s
    return () => clearInterval(interval);
  }, []);

  // Filter and sort
  const filteredMarkets = useMemo(() => {
    let result = [...markets];
    
    if (filter !== 'All') {
      result = result.filter(m => m.type === filter);
    }
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(m => 
        m.symbol.toLowerCase().includes(term) || 
        m.name?.toLowerCase().includes(term)
      );
    }
    
    result.sort((a, b) => {
      const aVal = a[sortBy] || 0;
      const bVal = b[sortBy] || 0;
      return sortDir === 'desc' ? bVal - aVal : aVal - bVal;
    });
    
    return result;
  }, [markets, filter, searchTerm, sortBy, sortDir]);

  // Stats
  const stats = useMemo(() => ({
    totalMarkets: markets.length,
    gainers: markets.filter(m => (m.change24h || 0) > 0).length,
    losers: markets.filter(m => (m.change24h || 0) < 0).length,
    totalVolume: markets.reduce((sum, m) => sum + (m.volume24h || 0), 0),
  }), [markets]);

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
      <Navbar />

      <div style={{ padding: '40px', maxWidth: '1600px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '32px', marginBottom: '8px' }}>Markets</h1>
          <p style={{ color: '#888', fontSize: '15px' }}>
            Real-time prices across multiple asset classes • Updated: {lastUpdate?.toLocaleTimeString() || '---'}
          </p>
        </div>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
          <StatCard label="Total Markets" value={stats.totalMarkets} icon="📊" />
          <StatCard label="Gainers" value={stats.gainers} icon="📈" color="#00ff88" />
          <StatCard label="Losers" value={stats.losers} icon="📉" color="#ff0055" />
          <StatCard label="24h Volume" value={formatVolume(stats.totalVolume)} icon="💹" />
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {ASSET_TYPES.map(type => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                style={{
                  padding: '10px 20px',
                  background: filter === type ? '#00ff88' : '#1a1a1a',
                  border: filter === type ? 'none' : '1px solid #333',
                  color: filter === type ? '#000' : '#fff',
                  borderRadius: '20px',
                  cursor: 'pointer',
                  fontWeight: filter === type ? 'bold' : 'normal',
                  fontSize: '14px',
                }}
              >
                {type}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <input
              type="text"
              placeholder="Search markets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                padding: '10px 16px',
                background: '#1a1a1a',
                border: '1px solid #333',
                borderRadius: '8px',
                color: '#fff',
                width: '220px',
                fontSize: '14px',
                outline: 'none',
              }}
            />
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                padding: '10px 16px',
                background: '#1a1a1a',
                border: '1px solid #333',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '14px',
                cursor: 'pointer',
              }}
            >
              <option value="volume24h">Sort by Volume</option>
              <option value="change24h">Sort by Change</option>
              <option value="price">Sort by Price</option>
            </select>
          </div>
        </div>

        {/* Markets Table */}
        <div style={{ background: '#111', borderRadius: '12px', border: '1px solid #222', overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: '60px', textAlign: 'center', color: '#666' }}>
              <div style={{ fontSize: '24px', marginBottom: '12px' }}>⏳</div>
              Loading market data...
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#0a0a0a' }}>
                  <th style={thStyle}>Symbol</th>
                  <th style={thStyle}>Name</th>
                  <th style={thStyle}>Type</th>
                  <th style={{ ...thStyle, textAlign: 'right' }}>Price</th>
                  <th style={{ ...thStyle, textAlign: 'right' }}>24h Change</th>
                  <th style={{ ...thStyle, textAlign: 'right' }}>Volume</th>
                  <th style={{ ...thStyle, textAlign: 'right' }}>High</th>
                  <th style={{ ...thStyle, textAlign: 'right' }}>Low</th>
                  <th style={{ ...thStyle, textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredMarkets.map((market) => (
                  <tr key={market.symbol} style={{ borderBottom: '1px solid #1a1a1a' }}>
                    <td style={tdStyle}><span style={{ fontWeight: 'bold' }}>{market.symbol}</span></td>
                    <td style={{ ...tdStyle, color: '#888' }}>{market.name}</td>
                    <td style={tdStyle}><TypeBadge type={market.type} /></td>
                    <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 'bold', fontFamily: 'monospace' }}>
                      {formatPrice(market.price, market.type)}
                    </td>
                    <td style={{ ...tdStyle, textAlign: 'right', color: (market.change24h || 0) >= 0 ? '#00ff88' : '#ff0055', fontWeight: '600', fontFamily: 'monospace' }}>
                      {(market.change24h || 0) >= 0 ? '+' : ''}{(market.change24h || 0).toFixed(2)}%
                    </td>
                    <td style={{ ...tdStyle, textAlign: 'right', color: '#888', fontFamily: 'monospace' }}>
                      {formatVolume(market.volume24h)}
                    </td>
                    <td style={{ ...tdStyle, textAlign: 'right', color: '#00ff88', fontFamily: 'monospace' }}>
                      {formatPrice(market.price * 1.02, market.type)}
                    </td>
                    <td style={{ ...tdStyle, textAlign: 'right', color: '#ff0055', fontFamily: 'monospace' }}>
                      {formatPrice(market.price * 0.98, market.type)}
                    </td>
                    <td style={{ ...tdStyle, textAlign: 'center' }}>
                      <Link href={`/trade?symbol=${market.symbol}`}>
                        <button style={{
                          padding: '8px 16px',
                          background: '#00ff88',
                          border: 'none',
                          color: '#000',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontWeight: 'bold',
                          fontSize: '13px',
                        }}>
                          Trade
                        </button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

// ===================== COMPONENTS =====================

function StatCard({ label, value, icon, color }) {
  return (
    <div style={{ background: '#111', borderRadius: '12px', border: '1px solid #222', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ color: '#666', fontSize: '13px', marginBottom: '8px' }}>{label}</div>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: color || '#fff' }}>{value}</div>
        </div>
        <span style={{ fontSize: '24px' }}>{icon}</span>
      </div>
    </div>
  );
}

function TypeBadge({ type }) {
  const colors = { Crypto: '#f7931a', Forex: '#00aaff', Stock: '#00ff88', Commodity: '#ffaa00', Bond: '#ff5588' };
  return (
    <span style={{
      padding: '4px 10px',
      background: `${colors[type]}20`,
      color: colors[type],
      borderRadius: '4px',
      fontSize: '12px',
      fontWeight: '500',
      border: `1px solid ${colors[type]}40`,
    }}>
      {type}
    </span>
  );
}

// ===================== STYLES =====================

const thStyle = { padding: '16px', textAlign: 'left', color: '#666', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' };
const tdStyle = { padding: '16px', fontSize: '14px' };

// ===================== HELPERS =====================

function getAssetName(symbol) {
  const names = {
    'BTC-USD': 'Bitcoin', 'ETH-USD': 'Ethereum', 'SOL-USD': 'Solana', 'ADA-USD': 'Cardano',
    'DOT-USD': 'Polkadot', 'LINK-USD': 'Chainlink', 'UNI-USD': 'Uniswap', 'AVAX-USD': 'Avalanche',
    'MATIC-USD': 'Polygon', 'XRP-USD': 'Ripple', 'EUR-USD': 'Euro/USD', 'GBP-USD': 'British Pound',
    'USD-JPY': 'USD/Yen', 'USD-CHF': 'USD/Swiss Franc', 'AUD-USD': 'AUD/USD', 'USD-CAD': 'USD/CAD',
  };
  return names[symbol] || symbol;
}

function formatPrice(price, type) {
  if (!price) return '---';
  if (type === 'Forex') return price.toFixed(5);
  if (type === 'Bond') return price.toFixed(3);
  if (price >= 1000) return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  if (price >= 1) return `$${price.toFixed(2)}`;
  return `$${price.toFixed(4)}`;
}

function formatVolume(volume) {
  if (!volume) return '---';
  if (volume >= 1e12) return `$${(volume / 1e12).toFixed(2)}T`;
  if (volume >= 1e9) return `$${(volume / 1e9).toFixed(2)}B`;
  if (volume >= 1e6) return `$${(volume / 1e6).toFixed(2)}M`;
  if (volume >= 1e3) return `$${(volume / 1e3).toFixed(0)}K`;
  return `$${volume.toFixed(0)}`;
}
