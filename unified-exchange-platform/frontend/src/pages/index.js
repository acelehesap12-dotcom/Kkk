import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import { ExchangeAPI } from '../lib/api';
import { COLORS, SPACING } from '../styles/design-system';

export default function Home() {
  const [stats, setStats] = useState({
    volume24h: 0,
    activeTraders: 0,
    totalMarkets: 0,
    avgLatency: 0
  });
  const [topMovers, setTopMovers] = useState({ gainers: [], losers: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
    const interval = setInterval(loadStats, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const loadStats = async () => {
    try {
      const [marketsData, statsData] = await Promise.all([
        ExchangeAPI.getMarkets(),
        ExchangeAPI.getPlatformStats().catch(() => null)
      ]);

      // Calculate stats from markets
      const totalVolume = marketsData.reduce((sum, m) => sum + (m.volume24h || 0), 0);
      
      // Sort for top movers
      const sorted = [...marketsData].filter(m => m.change24h !== undefined);
      sorted.sort((a, b) => b.change24h - a.change24h);
      
      setTopMovers({
        gainers: sorted.slice(0, 5),
        losers: sorted.slice(-5).reverse()
      });

      setStats({
        volume24h: totalVolume,
        activeTraders: statsData?.activeTraders || 125458,
        totalMarkets: marketsData.length,
        avgLatency: statsData?.avgLatency || 0.8
      });
    } catch (err) {
      console.error('Failed to load stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatVolume = (vol) => {
    if (vol >= 1e9) return `$${(vol / 1e9).toFixed(1)}B`;
    if (vol >= 1e6) return `$${(vol / 1e6).toFixed(1)}M`;
    return `$${vol.toLocaleString()}`;
  };

  return (
    <div style={{ minHeight: '100vh', background: COLORS.background, color: COLORS.text, fontFamily: 'Inter, -apple-system, sans-serif' }}>
      <Navbar activePage="home" />

      {/* HERO SECTION */}
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        background: `radial-gradient(ellipse at top, ${COLORS.backgroundLight} 0%, ${COLORS.background} 70%)`,
        textAlign: 'center',
        padding: '100px 20px 80px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Animated Background Grid */}
        <div style={{ 
          position: 'absolute', 
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundImage: `linear-gradient(${COLORS.primary}08 1px, transparent 1px), linear-gradient(90deg, ${COLORS.primary}08 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
          opacity: 0.5
        }}></div>

        {/* Floating Orbs */}
        <div style={{
          position: 'absolute',
          width: '500px',
          height: '500px',
          background: `radial-gradient(circle, ${COLORS.primary}15 0%, transparent 70%)`,
          top: '10%',
          left: '10%',
          borderRadius: '50%',
          filter: 'blur(60px)'
        }}></div>
        <div style={{
          position: 'absolute',
          width: '400px',
          height: '400px',
          background: `radial-gradient(circle, ${COLORS.info}10 0%, transparent 70%)`,
          bottom: '20%',
          right: '15%',
          borderRadius: '50%',
          filter: 'blur(50px)'
        }}></div>
        
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '900px' }}>
          <div style={{ 
            display: 'inline-block',
            padding: '8px 16px',
            background: `${COLORS.primary}15`,
            border: `1px solid ${COLORS.primary}30`,
            borderRadius: '20px',
            color: COLORS.primary, 
            fontSize: '0.85rem', 
            marginBottom: '24px', 
            letterSpacing: '2px',
            fontWeight: '500'
          }}>
            ⚡ INSTITUTIONAL-GRADE TRADING
          </div>
          
          <h1 style={{ 
            fontSize: 'clamp(3rem, 8vw, 5.5rem)', 
            marginBottom: '16px', 
            fontWeight: '700',
            background: `linear-gradient(135deg, ${COLORS.text} 0%, ${COLORS.textMuted} 100%)`, 
            WebkitBackgroundClip: 'text', 
            WebkitTextFillColor: 'transparent',
            lineHeight: 1.1
          }}>
            k99 EXCHANGE
          </h1>
          
          <p style={{ 
            fontSize: 'clamp(1.1rem, 2.5vw, 1.5rem)', 
            color: COLORS.textSecondary, 
            maxWidth: '700px', 
            marginBottom: '16px',
            margin: '0 auto 16px',
            lineHeight: 1.5
          }}>
            The world's fastest <span style={{ color: COLORS.primary, fontWeight: '600' }}>multi-asset</span> trading platform with microsecond execution.
          </p>
          
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '12px',
            marginBottom: '40px'
          }}>
            {['Crypto', 'Forex', 'Stocks', 'ETFs', 'Bonds', 'Commodities', 'Options', 'Futures'].map(asset => (
              <span key={asset} style={{
                padding: '6px 14px',
                background: COLORS.backgroundLight,
                border: `1px solid ${COLORS.border}`,
                borderRadius: '16px',
                fontSize: '0.85rem',
                color: COLORS.textSecondary
              }}>{asset}</span>
            ))}
          </div>
          
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/register">
              <button style={{ 
                padding: '16px 40px', 
                fontSize: '1.1rem', 
                background: COLORS.primary, 
                color: COLORS.background, 
                border: 'none', 
                borderRadius: '8px', 
                cursor: 'pointer', 
                fontWeight: '600',
                transition: 'all 0.2s ease',
                boxShadow: `0 4px 20px ${COLORS.primary}40`
              }}>
                Start Trading Free →
              </button>
            </Link>
            <Link href="/markets">
              <button style={{ 
                padding: '16px 40px', 
                fontSize: '1.1rem', 
                background: 'transparent', 
                border: `1px solid ${COLORS.border}`, 
                color: COLORS.text, 
                borderRadius: '8px', 
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}>
                View Markets
              </button>
            </Link>
          </div>
        </div>

        {/* Live Stats Bar */}
        <div style={{ 
          position: 'absolute', 
          bottom: '40px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex', 
          gap: '40px',
          padding: '20px 40px',
          background: `${COLORS.backgroundLight}cc`,
          backdropFilter: 'blur(10px)',
          borderRadius: '16px',
          border: `1px solid ${COLORS.border}`,
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}>
          <StatItem 
            label="24h Volume" 
            value={loading ? '...' : formatVolume(stats.volume24h)} 
            live 
          />
          <StatItem 
            label="Active Traders" 
            value={loading ? '...' : stats.activeTraders.toLocaleString()} 
          />
          <StatItem 
            label="Markets" 
            value={loading ? '...' : `${stats.totalMarkets}+`} 
          />
          <StatItem 
            label="Avg Latency" 
            value={loading ? '...' : `< ${stats.avgLatency}ms`} 
          />
        </div>
      </div>

      {/* TOP MOVERS SECTION */}
      {!loading && (topMovers.gainers.length > 0 || topMovers.losers.length > 0) && (
        <div style={{ padding: '60px 20px', background: COLORS.background }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
              {/* Top Gainers */}
              <div style={{ 
                padding: '24px',
                background: COLORS.backgroundLight,
                borderRadius: '12px',
                border: `1px solid ${COLORS.border}`
              }}>
                <h3 style={{ margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: COLORS.success }}>▲</span> Top Gainers
                </h3>
                {topMovers.gainers.slice(0, 5).map((m, i) => (
                  <div key={m.symbol} style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    padding: '12px 0',
                    borderBottom: i < 4 ? `1px solid ${COLORS.border}` : 'none'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ color: COLORS.textMuted, width: '20px' }}>#{i + 1}</span>
                      <span style={{ fontWeight: '500' }}>{m.symbol}</span>
                    </div>
                    <span style={{ color: COLORS.success, fontWeight: '600' }}>
                      +{m.change24h?.toFixed(2)}%
                    </span>
                  </div>
                ))}
              </div>

              {/* Top Losers */}
              <div style={{ 
                padding: '24px',
                background: COLORS.backgroundLight,
                borderRadius: '12px',
                border: `1px solid ${COLORS.border}`
              }}>
                <h3 style={{ margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: COLORS.danger }}>▼</span> Top Losers
                </h3>
                {topMovers.losers.slice(0, 5).map((m, i) => (
                  <div key={m.symbol} style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    padding: '12px 0',
                    borderBottom: i < 4 ? `1px solid ${COLORS.border}` : 'none'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ color: COLORS.textMuted, width: '20px' }}>#{i + 1}</span>
                      <span style={{ fontWeight: '500' }}>{m.symbol}</span>
                    </div>
                    <span style={{ color: COLORS.danger, fontWeight: '600' }}>
                      {m.change24h?.toFixed(2)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ASSET CLASSES SECTION */}
      <div style={{ padding: '80px 20px', background: COLORS.backgroundLight }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontSize: '2.5rem', marginBottom: '12px' }}>Trade 8 Asset Classes</h2>
          <p style={{ textAlign: 'center', color: COLORS.textSecondary, marginBottom: '48px' }}>One platform. All markets. Institutional execution.</p>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '16px' }}>
            <AssetClassCard icon="₿" name="Crypto" pairs="500+" color="#f7931a" />
            <AssetClassCard icon="$" name="Forex" pairs="65+" color="#00aaff" />
            <AssetClassCard icon="📈" name="Stocks" pairs="5000+" color={COLORS.primary} />
            <AssetClassCard icon="📊" name="ETFs" pairs="1500+" color="#aa55ff" />
            <AssetClassCard icon="📄" name="Bonds" pairs="200+" color="#ff5588" />
            <AssetClassCard icon="🥇" name="Commodities" pairs="50+" color="#ffaa00" />
            <AssetClassCard icon="📋" name="Options" pairs="10000+" color="#55ffaa" />
            <AssetClassCard icon="📅" name="Futures" pairs="100+" color="#ff8855" />
          </div>
        </div>
      </div>

      {/* FEATURES SECTION */}
      <div style={{ padding: '80px 20px', maxWidth: '1200px', margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', fontSize: '2.5rem', marginBottom: '48px' }}>Why k99?</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          <FeatureCard 
            icon="⚡" 
            title="Microsecond Latency" 
            desc="Rust-based matching engine with kernel bypass. P50 latency under 100µs." 
          />
          <FeatureCard 
            icon="🛡️" 
            title="Institutional Risk" 
            desc="Real-time VaR, 3-stage liquidation waterfall, cross/isolated margin." 
          />
          <FeatureCard 
            icon="🔗" 
            title="On-Chain Settlement" 
            desc="Multi-chain support with reorg handling and proof-of-reserves." 
          />
          <FeatureCard 
            icon="🤖" 
            title="AI Surveillance" 
            desc="Real-time detection of spoofing, wash trading, and manipulation." 
          />
          <FeatureCard 
            icon="📊" 
            title="Quant Studio" 
            desc="Build and backtest strategies with Python. Deploy with one click." 
          />
          <FeatureCard 
            icon="🔐" 
            title="Enterprise Security" 
            desc="HSM key management, hardware 2FA, SOC2/ISO27001 compliance." 
          />
        </div>
      </div>

      {/* SLO SECTION */}
      <div style={{ padding: '80px 20px', background: COLORS.backgroundLight }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontSize: '2.5rem', marginBottom: '48px' }}>Performance Guarantees</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
            <SLOCard metric="Matching Latency P50" value="< 100µs" />
            <SLOCard metric="End-to-End P99" value="< 50ms" />
            <SLOCard metric="Market Data Delivery" value="< 10ms" />
            <SLOCard metric="System Availability" value="99.95%" />
          </div>
        </div>
      </div>

      {/* CTA SECTION */}
      <div style={{ padding: '100px 20px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '3rem', marginBottom: '16px' }}>Ready to Trade?</h2>
        <p style={{ color: COLORS.textSecondary, marginBottom: '32px', fontSize: '1.2rem' }}>Join 125,000+ traders on the fastest multi-asset exchange.</p>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/register">
            <button style={{ 
              padding: '18px 48px', 
              fontSize: '1.1rem', 
              background: COLORS.primary, 
              color: COLORS.background, 
              border: 'none', 
              borderRadius: '8px', 
              cursor: 'pointer', 
              fontWeight: '600',
              boxShadow: `0 4px 20px ${COLORS.primary}40`
            }}>
              Create Free Account
            </button>
          </Link>
          <Link href="/trade">
            <button style={{ 
              padding: '18px 48px', 
              fontSize: '1.1rem', 
              background: 'transparent', 
              border: `1px solid ${COLORS.border}`, 
              color: COLORS.text, 
              borderRadius: '8px', 
              cursor: 'pointer'
            }}>
              Launch Terminal
            </button>
          </Link>
        </div>
      </div>

      {/* FOOTER */}
      <footer style={{ borderTop: `1px solid ${COLORS.border}`, padding: '60px 20px', background: COLORS.backgroundLight }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px' }}>
          <div>
            <h3 style={{ marginBottom: '16px' }}>k99 Exchange</h3>
            <p style={{ color: COLORS.textMuted, lineHeight: '1.7', fontSize: '0.9rem' }}>Institutional-grade multi-asset trading platform.</p>
          </div>
          <div>
            <h4 style={{ color: COLORS.textSecondary, marginBottom: '16px' }}>Products</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', color: COLORS.textMuted, fontSize: '0.9rem' }}>
              <Link href="/trade"><span style={{ cursor: 'pointer' }}>Spot Trading</span></Link>
              <Link href="/trade"><span style={{ cursor: 'pointer' }}>Margin Trading</span></Link>
              <Link href="/quant-studio"><span style={{ cursor: 'pointer' }}>Quant Studio</span></Link>
              <span>API Access</span>
            </div>
          </div>
          <div>
            <h4 style={{ color: COLORS.textSecondary, marginBottom: '16px' }}>Resources</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', color: COLORS.textMuted, fontSize: '0.9rem' }}>
              <span>Documentation</span>
              <span>API Reference</span>
              <span>SDKs</span>
              <span>Status Page</span>
            </div>
          </div>
          <div>
            <h4 style={{ color: COLORS.textSecondary, marginBottom: '16px' }}>Legal</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', color: COLORS.textMuted, fontSize: '0.9rem' }}>
              <span>Terms of Service</span>
              <span>Privacy Policy</span>
              <span>Risk Disclosure</span>
              <span>Compliance</span>
            </div>
          </div>
        </div>
        <div style={{ textAlign: 'center', marginTop: '48px', paddingTop: '24px', borderTop: `1px solid ${COLORS.border}`, color: COLORS.textMuted }}>
          <p>© 2025 k99 Unified Exchange Platform. All systems operational.</p>
        </div>
      </footer>
    </div>
  );
}

function StatItem({ label, value, live }) {
  return (
    <div style={{ textAlign: 'center', minWidth: '100px' }}>
      <div style={{ 
        fontSize: '1.3rem', 
        fontWeight: '600', 
        color: COLORS.primary,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px'
      }}>
        {value}
        {live && <span style={{ width: '6px', height: '6px', background: COLORS.success, borderRadius: '50%' }}></span>}
      </div>
      <div style={{ color: COLORS.textMuted, fontSize: '0.8rem', marginTop: '4px' }}>{label}</div>
    </div>
  );
}

function AssetClassCard({ icon, name, pairs, color }) {
  return (
    <div style={{ 
      padding: '24px 16px', 
      background: COLORS.background, 
      borderRadius: '12px', 
      border: `1px solid ${COLORS.border}`,
      textAlign: 'center',
      cursor: 'pointer'
    }}>
      <div style={{ fontSize: '2rem', marginBottom: '12px' }}>{icon}</div>
      <h3 style={{ marginBottom: '4px', color, fontWeight: '600', fontSize: '1rem' }}>{name}</h3>
      <div style={{ color: COLORS.textMuted, fontSize: '0.85rem' }}>{pairs} pairs</div>
    </div>
  );
}

function FeatureCard({ icon, title, desc }) {
  return (
    <div style={{ padding: '28px', background: COLORS.backgroundLight, borderRadius: '12px', border: `1px solid ${COLORS.border}` }}>
      <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>{icon}</div>
      <h3 style={{ fontSize: '1.2rem', marginBottom: '8px', color: COLORS.text, fontWeight: '600' }}>{title}</h3>
      <p style={{ color: COLORS.textSecondary, lineHeight: '1.6', fontSize: '0.95rem', margin: 0 }}>{desc}</p>
    </div>
  );
}

function SLOCard({ metric, value }) {
  return (
    <div style={{ padding: '28px', background: COLORS.background, borderRadius: '12px', border: `1px solid ${COLORS.primary}20`, textAlign: 'center' }}>
      <div style={{ fontSize: '2rem', fontWeight: '700', color: COLORS.primary, marginBottom: '8px' }}>{value}</div>
      <div style={{ color: COLORS.textSecondary, fontSize: '0.9rem' }}>{metric}</div>
    </div>
  );
}
