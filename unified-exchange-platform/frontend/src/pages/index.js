import Link from 'next/link';

export default function Home() {
  return (
    <div style={{ 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      background: 'linear-gradient(45deg, #000, #1a1a1a)', 
      color: 'white',
      fontFamily: 'Arial'
    }}>
      <h1 style={{ fontSize: '4rem', marginBottom: '20px' }}>👑 UNIFIED EXCHANGE</h1>
      <p style={{ fontSize: '1.5rem', color: '#888' }}>Tier-1 Multi-Asset Trading Platform</p>
      
      <div style={{ marginTop: '50px', display: 'flex', gap: '20px' }}>
        <Link href="/trade">
          <button style={{ padding: '20px 40px', fontSize: '1.2rem', background: '#00ff88', border: 'none', borderRadius: '50px', cursor: 'pointer' }}>
            Start Trading
          </button>
        </Link>
        <Link href="/admin">
          <button style={{ padding: '20px 40px', fontSize: '1.2rem', background: 'transparent', border: '2px solid #fff', color: 'white', borderRadius: '50px', cursor: 'pointer' }}>
            Admin Panel
          </button>
        </Link>
      </div>
    </div>
  );
}
