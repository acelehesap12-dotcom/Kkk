// 👑 UNIFIED EXCHANGE - REGISTER PAGE
import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function Register() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (!formData.acceptTerms) {
      setError('Please accept the terms and conditions');
      return;
    }

    setLoading(true);

    try {
      // Demo registration
      localStorage.setItem('token', 'demo_token_' + Date.now());
      localStorage.setItem('user', JSON.stringify({ email: formData.email, id: 'user_' + Date.now() }));
      
      router.push('/portfolio');
    } catch (err) {
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0a',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
    }}>
      {/* Background Pattern */}
      <div style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundImage: 'linear-gradient(rgba(0,255,136,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,136,0.02) 1px, transparent 1px)',
        backgroundSize: '50px 50px',
        pointerEvents: 'none',
      }} />

      <div style={{
        width: '100%',
        maxWidth: '420px',
        padding: '40px',
        position: 'relative',
        zIndex: 1,
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <div style={{
              width: '64px',
              height: '64px',
              background: 'linear-gradient(135deg, #00ff88 0%, #00cc6a 100%)',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '32px',
              fontWeight: 'bold',
              color: '#0a0a0a',
              margin: '0 auto 16px',
            }}>
              K
            </div>
          </Link>
          <h1 style={{ color: '#fff', fontSize: '28px', marginBottom: '8px' }}>Create Account</h1>
          <p style={{ color: '#666', fontSize: '15px' }}>Start trading on k99 Exchange today</p>
        </div>

        {/* Register Form */}
        <form onSubmit={handleRegister}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', color: '#888', fontSize: '13px', marginBottom: '8px' }}>
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              style={{
                width: '100%',
                padding: '14px 16px',
                background: '#111',
                border: '1px solid #333',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '15px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', color: '#888', fontSize: '13px', marginBottom: '8px' }}>
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="At least 8 characters"
              style={{
                width: '100%',
                padding: '14px 16px',
                background: '#111',
                border: '1px solid #333',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '15px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', color: '#888', fontSize: '13px', marginBottom: '8px' }}>
              Confirm Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              style={{
                width: '100%',
                padding: '14px 16px',
                background: '#111',
                border: '1px solid #333',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '15px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Terms Checkbox */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                name="acceptTerms"
                checked={formData.acceptTerms}
                onChange={handleChange}
                style={{ marginTop: '3px' }}
              />
              <span style={{ color: '#888', fontSize: '13px', lineHeight: '1.5' }}>
                I agree to the{' '}
                <Link href="/terms" style={{ color: '#00ff88', textDecoration: 'none' }}>Terms of Service</Link>
                {' '}and{' '}
                <Link href="/privacy" style={{ color: '#00ff88', textDecoration: 'none' }}>Privacy Policy</Link>
              </span>
            </label>
          </div>

          {error && (
            <div style={{
              padding: '12px 16px',
              background: '#ff005520',
              border: '1px solid #ff005550',
              borderRadius: '8px',
              color: '#ff0055',
              fontSize: '14px',
              marginBottom: '20px',
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '16px',
              background: loading ? '#00cc6a' : '#00ff88',
              border: 'none',
              borderRadius: '8px',
              color: '#0a0a0a',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginBottom: '24px',
            }}
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        {/* Features */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr', 
          gap: '16px', 
          marginBottom: '32px',
          padding: '20px',
          background: '#111',
          borderRadius: '12px',
          border: '1px solid #222',
        }}>
          <Feature icon="⚡" text="Microsecond Latency" />
          <Feature icon="🛡️" text="Institutional Security" />
          <Feature icon="📊" text="8 Asset Classes" />
          <Feature icon="💰" text="Zero Hidden Fees" />
        </div>

        {/* Login Link */}
        <p style={{ textAlign: 'center', color: '#666', fontSize: '14px' }}>
          Already have an account?{' '}
          <Link href="/login" style={{ color: '#00ff88', textDecoration: 'none', fontWeight: '600' }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

function Feature({ icon, text }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <span style={{ fontSize: '16px' }}>{icon}</span>
      <span style={{ color: '#888', fontSize: '12px' }}>{text}</span>
    </div>
  );
}
