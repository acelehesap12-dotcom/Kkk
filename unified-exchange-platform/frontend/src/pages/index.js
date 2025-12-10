import Link from 'next/link';

export default function Home() {
  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#fff', fontFamily: 'Arial' }}>
      
      {/* HERO SECTION */}
      <div style={{ 
        height: '90vh', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        background: 'radial-gradient(circle at center, #1a1a1a 0%, #000 100%)',
        textAlign: 'center',
        padding: '20px'
      }}>
        <h1 style={{ fontSize: '5rem', marginBottom: '10px', background: 'linear-gradient(to right, #fff, #666)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          k99 EXCHANGE
        </h1>
        <p style={{ fontSize: '1.5rem', color: '#888', maxWidth: '600px', marginBottom: '40px' }}>
          The world's fastest <b>Zero-Mock</b> trading platform. Powered by Rust Matching Engine and Go Order Gateway.
        </p>
        
        <div style={{ display: 'flex', gap: '20px' }}>
          <Link href="/trade">
            <button style={{ padding: '15px 40px', fontSize: '1.2rem', background: '#00ff88', color: '#000', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
              Start Trading Now
            </button>
          </Link>
          <Link href="/admin">
            <button style={{ padding: '15px 40px', fontSize: '1.2rem', background: 'transparent', border: '1px solid #333', color: '#fff', borderRadius: '5px', cursor: 'pointer' }}>
              View Live Ledger
            </button>
          </Link>
        </div>
      </div>

      {/* FEATURES SECTION */}
      <div style={{ padding: '100px 20px', maxWidth: '1200px', margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', fontSize: '2.5rem', marginBottom: '60px' }}>Why k99?</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px' }}>
          <FeatureCard 
            icon="⚡" 
            title="Microsecond Latency" 
            desc="Built with Rust & Tokio. Our matching engine processes orders in under 100µs." 
          />
          <FeatureCard 
            icon="🛡️" 
            title="Institutional Risk" 
            desc="Real-time Monte Carlo VaR calculation and 3-stage liquidation waterfall." 
          />
          <FeatureCard 
            icon="🔗" 
            title="Blockchain Settlement" 
            desc="Automated settlement service handling reorgs and ledger rollbacks." 
          />
        </div>
      </div>

      {/* FOOTER */}
      <footer style={{ borderTop: '1px solid #333', padding: '40px', textAlign: 'center', color: '#666' }}>
        <p>&copy; 2025 k99 Unified Exchange Platform. All systems operational.</p>
      </footer>
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
