import Link from 'next/link';

export default function Home() {
  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#fff', fontFamily: 'Arial' }}>
      
      {/* NAVBAR */}
      <nav style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        padding: '20px 40px', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        background: 'rgba(0,0,0,0.8)',
        backdropFilter: 'blur(10px)',
        zIndex: 100,
        borderBottom: '1px solid #222'
      }}>
        <h2 style={{ margin: 0 }}>k99 <span style={{ color: '#666' }}>EXCHANGE</span></h2>
        <div style={{ display: 'flex', gap: '30px' }}>
          <Link href="/markets"><span style={{ color: '#888', cursor: 'pointer' }}>Markets</span></Link>
          <Link href="/trade"><span style={{ color: '#888', cursor: 'pointer' }}>Trade</span></Link>
          <Link href="/portfolio"><span style={{ color: '#888', cursor: 'pointer' }}>Portfolio</span></Link>
          <Link href="/wallet"><span style={{ color: '#888', cursor: 'pointer' }}>Wallet</span></Link>
          <Link href="/quant-studio"><span style={{ color: '#888', cursor: 'pointer' }}>Quant Studio</span></Link>
          <Link href="/admin"><span style={{ color: '#888', cursor: 'pointer' }}>Admin</span></Link>
        </div>
        <div style={{ display: 'flex', gap: '15px' }}>
          <button style={{ padding: '10px 20px', background: 'transparent', border: '1px solid #333', color: '#fff', borderRadius: '5px', cursor: 'pointer' }}>
            Login
          </button>
          <button style={{ padding: '10px 20px', background: '#00ff88', color: '#000', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
            Get Started
          </button>
        </div>
      </nav>

      {/* HERO SECTION */}
      <div style={{ 
        height: '100vh', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        background: 'radial-gradient(circle at center, #1a1a1a 0%, #000 100%)',
        textAlign: 'center',
        padding: '20px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Animated Background Grid */}
        <div style={{ 
          position: 'absolute', 
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundImage: 'linear-gradient(rgba(0,255,136,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,136,0.03) 1px, transparent 1px)',
          backgroundSize: '50px 50px',
          animation: 'pulse 4s ease-in-out infinite'
        }}></div>
        
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ color: '#00ff88', fontSize: '1rem', marginBottom: '20px', letterSpacing: '3px' }}>
            INSTITUTIONAL-GRADE TRADING
          </div>
          <h1 style={{ fontSize: '5rem', marginBottom: '10px', background: 'linear-gradient(to right, #fff, #666)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            k99 EXCHANGE
          </h1>
          <p style={{ fontSize: '1.5rem', color: '#888', maxWidth: '700px', marginBottom: '20px' }}>
            The world's fastest <b style={{ color: '#00ff88' }}>Zero-Mock</b> multi-asset trading platform.
          </p>
          <p style={{ fontSize: '1rem', color: '#666', maxWidth: '600px', marginBottom: '40px' }}>
            Crypto • Forex • Stocks • ETFs • Bonds • Commodities • Options • Futures
          </p>
          
          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
            <Link href="/trade">
              <button style={{ padding: '18px 50px', fontSize: '1.2rem', background: '#00ff88', color: '#000', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                Start Trading Now
              </button>
            </Link>
            <Link href="/markets">
              <button style={{ padding: '18px 50px', fontSize: '1.2rem', background: 'transparent', border: '1px solid #333', color: '#fff', borderRadius: '8px', cursor: 'pointer' }}>
                View Markets
              </button>
            </Link>
          </div>
        </div>

        {/* Stats Bar */}
        <div style={{ 
          position: 'absolute', 
          bottom: '50px', 
          display: 'flex', 
          gap: '60px',
          padding: '20px 40px',
          background: 'rgba(17,17,17,0.8)',
          borderRadius: '15px',
          border: '1px solid #222'
        }}>
          <StatItem label="24h Volume" value="$28.5B" />
          <StatItem label="Active Traders" value="125,458" />
          <StatItem label="Markets" value="8 Classes" />
          <StatItem label="Avg Latency" value="< 1ms" />
        </div>
      </div>

      {/* ASSET CLASSES SECTION */}
      <div style={{ padding: '100px 20px', background: '#0a0a0a' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontSize: '2.5rem', marginBottom: '20px' }}>Trade 8 Asset Classes</h2>
          <p style={{ textAlign: 'center', color: '#888', marginBottom: '60px' }}>One platform. All markets. Institutional execution.</p>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
            <AssetClassCard icon="₿" name="Crypto" pairs="500+" color="#f7931a" />
            <AssetClassCard icon="$" name="Forex" pairs="65+" color="#00aaff" />
            <AssetClassCard icon="📈" name="Stocks" pairs="5000+" color="#00ff88" />
            <AssetClassCard icon="📊" name="ETFs" pairs="1500+" color="#aa55ff" />
            <AssetClassCard icon="📄" name="Bonds" pairs="200+" color="#ff5588" />
            <AssetClassCard icon="🥇" name="Commodities" pairs="50+" color="#ffaa00" />
            <AssetClassCard icon="📋" name="Options" pairs="10000+" color="#55ffaa" />
            <AssetClassCard icon="📅" name="Futures" pairs="100+" color="#ff8855" />
          </div>
        </div>
      </div>

      {/* FEATURES SECTION */}
      <div style={{ padding: '100px 20px', maxWidth: '1200px', margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', fontSize: '2.5rem', marginBottom: '60px' }}>Why k99?</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px' }}>
          <FeatureCard 
            icon="⚡" 
            title="Microsecond Latency" 
            desc="Built with Rust & Tokio. Our matching engine processes orders in under 100µs with kernel bypass optimizations." 
          />
          <FeatureCard 
            icon="🛡️" 
            title="Institutional Risk Engine" 
            desc="Real-time Monte Carlo VaR, 3-stage liquidation waterfall, cross/isolated margin, and portfolio-level risk management." 
          />
          <FeatureCard 
            icon="🔗" 
            title="On-Chain Settlement" 
            desc="Automated settlement with reorg handling, merkle-proof verification, and real-time proof-of-reserves." 
          />
          <FeatureCard 
            icon="🤖" 
            title="AI Market Surveillance" 
            desc="Real-time detection of spoofing, layering, wash trading, and front-running with regulator-grade reporting." 
          />
          <FeatureCard 
            icon="📊" 
            title="Quant Studio" 
            desc="Build, backtest, and deploy your own trading strategies with our Python-based strategy builder." 
          />
          <FeatureCard 
            icon="🔐" 
            title="Enterprise Security" 
            desc="HSM key management, Zero-Trust VPN, hardware 2FA, and SOC2/ISO27001 compliance ready." 
          />
        </div>
      </div>

      {/* SLO SECTION */}
      <div style={{ padding: '100px 20px', background: '#0a0a0a' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontSize: '2.5rem', marginBottom: '60px' }}>Performance Guarantees</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '30px' }}>
            <SLOCard metric="Matching Latency P50" value="< 100µs" />
            <SLOCard metric="End-to-End P99" value="< 50ms" />
            <SLOCard metric="Market Data Delivery" value="< 10ms" />
            <SLOCard metric="System Availability" value="99.95%" />
          </div>
        </div>
      </div>

      {/* CTA SECTION */}
      <div style={{ padding: '100px 20px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '3rem', marginBottom: '20px' }}>Ready to Trade?</h2>
        <p style={{ color: '#888', marginBottom: '40px', fontSize: '1.2rem' }}>Join 125,000+ traders on the fastest multi-asset exchange.</p>
        <Link href="/trade">
          <button style={{ padding: '20px 60px', fontSize: '1.3rem', background: '#00ff88', color: '#000', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
            Launch Trading Terminal
          </button>
        </Link>
      </div>

      {/* FOOTER */}
      <footer style={{ borderTop: '1px solid #222', padding: '60px 40px', background: '#0a0a0a' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '40px' }}>
          <div>
            <h3 style={{ marginBottom: '20px' }}>k99 Exchange</h3>
            <p style={{ color: '#666', lineHeight: '1.8' }}>Institutional-grade multi-asset trading platform with microsecond execution.</p>
          </div>
          <div>
            <h4 style={{ color: '#888', marginBottom: '15px' }}>Products</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', color: '#666' }}>
              <Link href="/trade"><span style={{ cursor: 'pointer' }}>Spot Trading</span></Link>
              <Link href="/trade"><span style={{ cursor: 'pointer' }}>Margin Trading</span></Link>
              <Link href="/quant-studio"><span style={{ cursor: 'pointer' }}>Quant Studio</span></Link>
              <span>API Access</span>
            </div>
          </div>
          <div>
            <h4 style={{ color: '#888', marginBottom: '15px' }}>Resources</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', color: '#666' }}>
              <span>Documentation</span>
              <span>API Reference</span>
              <span>SDKs</span>
              <span>Status Page</span>
            </div>
          </div>
          <div>
            <h4 style={{ color: '#888', marginBottom: '15px' }}>Legal</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', color: '#666' }}>
              <span>Terms of Service</span>
              <span>Privacy Policy</span>
              <span>Risk Disclosure</span>
              <span>Compliance</span>
            </div>
          </div>
        </div>
        <div style={{ textAlign: 'center', marginTop: '60px', paddingTop: '30px', borderTop: '1px solid #222', color: '#666' }}>
          <p>&copy; 2025 k99 Unified Exchange Platform. All systems operational.</p>
        </div>
      </footer>
    </div>
  );
}

function StatItem({ label, value }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#00ff88' }}>{value}</div>
      <div style={{ color: '#666', fontSize: '0.9rem' }}>{label}</div>
    </div>
  );
}

function AssetClassCard({ icon, name, pairs, color }) {
  return (
    <div style={{ 
      padding: '25px', 
      background: '#111', 
      borderRadius: '10px', 
      border: '1px solid #222',
      textAlign: 'center',
      transition: 'all 0.3s ease'
    }}>
      <div style={{ fontSize: '2.5rem', marginBottom: '15px' }}>{icon}</div>
      <h3 style={{ marginBottom: '5px', color }}>{name}</h3>
      <div style={{ color: '#666' }}>{pairs} pairs</div>
    </div>
  );
}

function FeatureCard({ icon, title, desc }) {
  return (
    <div style={{ padding: '30px', background: '#111', borderRadius: '10px', border: '1px solid #222' }}>
      <div style={{ fontSize: '3rem', marginBottom: '20px' }}>{icon}</div>
      <h3 style={{ fontSize: '1.5rem', marginBottom: '10px', color: '#fff' }}>{title}</h3>
      <p style={{ color: '#888', lineHeight: '1.6' }}>{desc}</p>
    </div>
  );
}

function SLOCard({ metric, value }) {
  return (
    <div style={{ padding: '30px', background: '#111', borderRadius: '10px', border: '1px solid #00ff8833', textAlign: 'center' }}>
      <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#00ff88', marginBottom: '10px' }}>{value}</div>
      <div style={{ color: '#888' }}>{metric}</div>
    </div>
  );
}
