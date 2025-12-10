// 👑 UNIFIED EXCHANGE - PROFESSIONAL NAVBAR COMPONENT
// Consistent navigation across all pages

import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';

const colors = {
  primary: '#00ff88',
  primaryDark: '#00cc6a',
  bgPrimary: '#0a0a0a',
  bgSecondary: '#111111',
  border: '#333333',
  textPrimary: '#ffffff',
  textSecondary: '#888888',
  textMuted: '#666666',
  success: '#00ff88',
  danger: '#ff0055',
};

const NAV_LINKS = [
  { href: '/markets', label: 'Markets', icon: '📊' },
  { href: '/trade', label: 'Trade', icon: '⚡' },
  { href: '/portfolio', label: 'Portfolio', icon: '💼' },
  { href: '/wallet', label: 'Wallet', icon: '💰' },
  { href: '/quant-studio', label: 'Quant Studio', icon: '🧪' },
];

export default function Navbar() {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    
    // Check auth
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('user');
      if (stored) setUser(JSON.parse(stored));
    }
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path) => router.pathname === path;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    router.push('/');
  };

  return (
    <>
      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 32px',
        background: scrolled ? 'rgba(10, 10, 10, 0.95)' : 'rgba(10, 10, 10, 0.8)',
        backdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${scrolled ? colors.border : 'transparent'}`,
        transition: 'all 0.2s ease',
        zIndex: 200,
      }}>
        {/* Logo */}
        <Link href="/" style={{ textDecoration: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <div style={{
              width: '36px',
              height: '36px',
              background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%)`,
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              fontSize: '18px',
              color: colors.bgPrimary,
            }}>
              K
            </div>
            <span style={{ fontSize: '18px', fontWeight: 'bold', color: colors.textPrimary }}>
              k99 <span style={{ color: colors.textMuted, fontWeight: 'normal' }}>EXCHANGE</span>
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          {NAV_LINKS.map(link => (
            <Link 
              key={link.href} 
              href={link.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                color: isActive(link.href) ? colors.primary : colors.textSecondary,
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: isActive(link.href) ? '600' : 'normal',
                transition: 'all 0.1s ease',
                padding: '4px 8px',
                borderRadius: '6px',
                background: isActive(link.href) ? `${colors.primary}15` : 'transparent',
              }}
            >
              <span style={{ fontSize: '14px' }}>{link.icon}</span>
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right Section */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Network Status */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '4px 10px',
            background: colors.bgSecondary,
            borderRadius: '20px',
            fontSize: '11px',
            color: colors.textSecondary,
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: colors.success,
              boxShadow: `0 0 8px ${colors.success}`,
            }} />
            Mainnet
          </div>

          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Link href="/admin" style={{ textDecoration: 'none' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '4px 12px',
                  background: colors.bgSecondary,
                  border: `1px solid ${colors.border}`,
                  borderRadius: '8px',
                  cursor: 'pointer',
                }}>
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, ${colors.primary} 0%, #00aaff 100%)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '13px',
                    fontWeight: 'bold',
                    color: colors.bgPrimary,
                  }}>
                    {user?.email?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span style={{ color: colors.textPrimary, fontSize: '13px' }}>
                    {user?.email?.split('@')[0] || 'User'}
                  </span>
                </div>
              </Link>
              
              <button
                onClick={handleLogout}
                style={{
                  padding: '6px 14px',
                  background: 'transparent',
                  border: `1px solid ${colors.border}`,
                  color: colors.textSecondary,
                  borderRadius: '8px',
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                Logout
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Link href="/login" style={{ textDecoration: 'none' }}>
                <button style={{
                  padding: '8px 20px',
                  background: 'transparent',
                  border: `1px solid ${colors.border}`,
                  color: colors.textPrimary,
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                }}>
                  Login
                </button>
              </Link>
              
              <Link href="/register" style={{ textDecoration: 'none' }}>
                <button style={{
                  padding: '8px 20px',
                  background: colors.primary,
                  border: 'none',
                  color: colors.bgPrimary,
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                }}>
                  Get Started
                </button>
              </Link>
            </div>
          )}
        </div>
      </nav>
      
      {/* Spacer for fixed navbar */}
      <div style={{ height: '64px' }} />
    </>
  );
}

// Compact navbar for trading pages
export function TradeNavbar({ symbol, markPrice, change24h, volume24h, connected }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 20px',
      height: '50px',
      background: '#161b22',
      borderBottom: '1px solid #30363d',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <span style={{ fontSize: '18px', fontWeight: 'bold', color: colors.primary }}>
            ⚡ k99
          </span>
        </Link>
        
        <div style={{ height: '20px', width: '1px', background: '#30363d' }} />
        
        <span style={{ fontSize: '16px', fontWeight: 'bold', color: colors.textPrimary }}>
          {symbol || 'BTC-USD'}
        </span>
      </div>

      <div style={{ display: 'flex', gap: '32px' }}>
        <MetricItem label="Mark Price" value={markPrice ? `$${markPrice.toLocaleString()}` : '---'} />
        <MetricItem 
          label="24h Change" 
          value={change24h !== undefined ? `${change24h >= 0 ? '+' : ''}${change24h.toFixed(2)}%` : '---'} 
          color={change24h >= 0 ? colors.success : colors.danger}
        />
        <MetricItem label="24h Volume" value={volume24h || '---'} />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: connected ? colors.success : colors.danger,
          }} />
          <span style={{ fontSize: '12px', color: colors.textSecondary }}>
            {connected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
        <Link href="/markets" style={{ color: colors.textSecondary, textDecoration: 'none', fontSize: '13px' }}>Markets</Link>
        <Link href="/portfolio" style={{ color: colors.textSecondary, textDecoration: 'none', fontSize: '13px' }}>Portfolio</Link>
      </div>
    </div>
  );
}

function MetricItem({ label, value, color }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <span style={{ fontSize: '11px', color: colors.textMuted, marginBottom: '2px' }}>{label}</span>
      <span style={{ fontSize: '14px', fontWeight: 'bold', color: color || colors.textPrimary }}>{value}</span>
    </div>
  );
}
