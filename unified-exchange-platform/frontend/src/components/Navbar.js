import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Navbar() {
  const router = useRouter();
  
  const navStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 2rem',
    background: 'rgba(0,0,0,0.8)',
    backdropFilter: 'blur(10px)',
    borderBottom: '1px solid #333',
    position: 'fixed',
    top: 0,
    width: '100%',
    zIndex: 1000
  };

  const linkStyle = (path) => ({
    color: router.pathname === path ? '#00ff88' : '#fff',
    textDecoration: 'none',
    marginLeft: '2rem',
    fontWeight: router.pathname === path ? 'bold' : 'normal',
    fontSize: '1.1rem'
  });

  return (
    <nav style={navStyle}>
      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fff', display: 'flex', alignItems: 'center' }}>
        <span style={{ marginRight: '10px' }}>👑</span> k99 Exchange
      </div>
      <div>
        <Link href="/" style={linkStyle('/')}>Home</Link>
        <Link href="/markets" style={linkStyle('/markets')}>Markets</Link>
        <Link href="/trade" style={linkStyle('/trade')}>Trade</Link>
        <Link href="/portfolio" style={linkStyle('/portfolio')}>Portfolio</Link>
        <Link href="/wallet" style={linkStyle('/wallet')}>Wallet</Link>
        <Link href="/quant-studio" style={linkStyle('/quant-studio')}>Quant Studio</Link>
        <Link href="/admin" style={linkStyle('/admin')}>Admin</Link>
      </div>
    </nav>
  );
}
