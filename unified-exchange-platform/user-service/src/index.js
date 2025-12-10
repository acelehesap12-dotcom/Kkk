// 👑 UNIFIED EXCHANGE - USER SERVICE
// Full-Featured Auth, Profile, K99 Token Integration
// PostgreSQL (Neon) + Redis (Upstash) Backend

const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const crypto = require('crypto');
const { db, cache, initializeDatabase } = require('../../shared/database');
const { k99Service, K99_CONFIG } = require('../../shared/k99-token');
const coldWalletService = require('../../shared/cold-wallet');

const app = express();
app.use(express.json());
app.use(cors({
  origin: ['http://localhost:3000', 'https://k99-exchange.xyz', 'https://www.k99-exchange.xyz'],
  credentials: true
}));

// ============================================
// CONFIGURATION
// ============================================

const SECRET_KEY = process.env.JWT_SECRET || 'k99-super-secret-jwt-key-2024';
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'k99-refresh-secret-2024';
const ADMIN_EMAIL = 'berkecansuskun1998@gmail.com';

// Token expiry
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';

// ============================================
// MIDDLEWARE
// ============================================

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    // Check if token is blacklisted
    const isBlacklisted = await cache.get(`blacklist:${token}`);
    if (isBlacklisted) {
      return res.status(401).json({ error: 'Token has been revoked' });
    }

    const decoded = jwt.verify(token, SECRET_KEY);
    
    // Check if user is frozen
    const user = await db.query('SELECT is_frozen FROM users WHERE id = $1', [decoded.id]);
    if (user.rows[0]?.is_frozen) {
      return res.status(403).json({ error: 'Account is frozen' });
    }

    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

const rateLimit = (limit, windowSeconds) => {
  return async (req, res, next) => {
    const key = `ratelimit:${req.ip}:${req.path}`;
    const current = await cache.get(key);
    
    if (current && parseInt(current) >= limit) {
      return res.status(429).json({ error: 'Too many requests, please try again later' });
    }
    
    await cache.set(key, (parseInt(current) || 0) + 1, windowSeconds);
    next();
  };
};

// ============================================
// AUTH ROUTES
// ============================================

// Register
app.post('/auth/register', rateLimit(10, 3600), async (req, res) => {
  const { email, password, referralCode } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 12);
    const role = email === ADMIN_EMAIL ? 'admin' : 'user';
    
    // Create user
    const result = await db.query(`
      INSERT INTO users (email, password_hash, role, email_verified, created_at)
      VALUES ($1, $2, $3, false, NOW())
      RETURNING id, email, role, created_at
    `, [email, hashedPassword, role]);

    const user = result.rows[0];

    // Initialize K99 balance
    await k99Service.awardSignupBonus(user.id);

    // Handle referral
    if (referralCode) {
      const referrer = await db.query(
        'SELECT id FROM users WHERE referral_code = $1',
        [referralCode]
      );
      
      if (referrer.rows.length > 0) {
        await k99Service.awardReferralBonus(referrer.rows[0].id, user.id);
        await db.query(
          'UPDATE users SET referred_by = $1 WHERE id = $2',
          [referrer.rows[0].id, user.id]
        );
      }
    }

    // Generate referral code for new user
    const userReferralCode = `K99-${user.id}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
    await db.query(
      'UPDATE users SET referral_code = $1 WHERE id = $2',
      [userReferralCode, user.id]
    );

    // Generate tokens
    const accessToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      SECRET_KEY,
      { expiresIn: ACCESS_TOKEN_EXPIRY }
    );

    const refreshToken = jwt.sign(
      { id: user.id, type: 'refresh' },
      REFRESH_SECRET,
      { expiresIn: REFRESH_TOKEN_EXPIRY }
    );

    // Store refresh token
    await cache.set(`refresh:${user.id}`, refreshToken, 7 * 24 * 3600);

    res.status(201).json({
      user: { ...user, k99Balance: K99_CONFIG.SIGNUP_BONUS },
      accessToken,
      refreshToken,
      message: `Welcome! You received ${K99_CONFIG.SIGNUP_BONUS} K99 signup bonus!`
    });

  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ error: 'Email already registered' });
    }
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
app.post('/auth/login', rateLimit(20, 900), async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await db.query(
      'SELECT id, email, password_hash, role, is_frozen FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];

    if (user.is_frozen) {
      return res.status(403).json({ error: 'Account is frozen. Contact support.' });
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last login
    await db.query(
      'UPDATE users SET last_login = NOW() WHERE id = $1',
      [user.id]
    );

    // Get K99 balance
    const k99Balance = await k99Service.getBalance(user.id);

    // Generate tokens
    const accessToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      SECRET_KEY,
      { expiresIn: ACCESS_TOKEN_EXPIRY }
    );

    const refreshToken = jwt.sign(
      { id: user.id, type: 'refresh' },
      REFRESH_SECRET,
      { expiresIn: REFRESH_TOKEN_EXPIRY }
    );

    await cache.set(`refresh:${user.id}`, refreshToken, 7 * 24 * 3600);

    res.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        k99Balance
      },
      accessToken,
      refreshToken
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Refresh Token
app.post('/auth/refresh', async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ error: 'Refresh token required' });
  }

  try {
    const decoded = jwt.verify(refreshToken, REFRESH_SECRET);
    
    // Verify stored token
    const storedToken = await cache.get(`refresh:${decoded.id}`);
    if (storedToken !== refreshToken) {
      return res.status(403).json({ error: 'Invalid refresh token' });
    }

    // Get user
    const result = await db.query(
      'SELECT id, email, role FROM users WHERE id = $1',
      [decoded.id]
    );

    if (result.rows.length === 0) {
      return res.status(403).json({ error: 'User not found' });
    }

    const user = result.rows[0];

    // Generate new access token
    const accessToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      SECRET_KEY,
      { expiresIn: ACCESS_TOKEN_EXPIRY }
    );

    res.json({ accessToken });

  } catch (err) {
    res.status(403).json({ error: 'Invalid refresh token' });
  }
});

// Logout
app.post('/auth/logout', authenticateToken, async (req, res) => {
  const token = req.headers['authorization'].split(' ')[1];
  
  // Blacklist access token
  await cache.set(`blacklist:${token}`, 'true', 900); // 15 min
  
  // Delete refresh token
  await cache.delete(`refresh:${req.user.id}`);

  res.json({ message: 'Logged out successfully' });
});

// ============================================
// USER PROFILE ROUTES
// ============================================

// Get profile
app.get('/user/profile', authenticateToken, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT id, email, role, referral_code, email_verified, created_at, last_login
      FROM users WHERE id = $1
    `, [req.user.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result.rows[0];
    const k99Stats = await k99Service.getUserStats(user.id);

    res.json({
      ...user,
      k99: k99Stats
    });

  } catch (err) {
    console.error('Profile error:', err);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update profile
app.put('/user/profile', authenticateToken, async (req, res) => {
  const { displayName, timezone } = req.body;

  try {
    await db.query(`
      UPDATE users SET display_name = $1, timezone = $2 WHERE id = $3
    `, [displayName, timezone, req.user.id]);

    res.json({ message: 'Profile updated' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Change password
app.post('/user/change-password', authenticateToken, async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (newPassword.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters' });
  }

  try {
    const result = await db.query(
      'SELECT password_hash FROM users WHERE id = $1',
      [req.user.id]
    );

    const valid = await bcrypt.compare(currentPassword, result.rows[0].password_hash);
    if (!valid) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    const newHash = await bcrypt.hash(newPassword, 12);
    await db.query(
      'UPDATE users SET password_hash = $1 WHERE id = $2',
      [newHash, req.user.id]
    );

    // Invalidate all sessions
    await cache.delete(`refresh:${req.user.id}`);

    res.json({ message: 'Password changed. Please login again.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to change password' });
  }
});

// ============================================
// K99 TOKEN ROUTES
// ============================================

// Get K99 balance
app.get('/k99/balance', authenticateToken, async (req, res) => {
  const stats = await k99Service.getUserStats(req.user.id);
  res.json(stats);
});

// Get K99 transaction history
app.get('/k99/transactions', authenticateToken, async (req, res) => {
  const limit = parseInt(req.query.limit) || 50;
  const offset = parseInt(req.query.offset) || 0;
  
  const transactions = await k99Service.getTransactionHistory(req.user.id, limit, offset);
  res.json(transactions);
});

// Transfer K99 to another user
app.post('/k99/transfer', authenticateToken, async (req, res) => {
  const { toEmail, amount, note } = req.body;

  if (!toEmail || !amount || amount <= 0) {
    return res.status(400).json({ error: 'Valid recipient email and amount required' });
  }

  try {
    // Find recipient
    const recipient = await db.query(
      'SELECT id FROM users WHERE email = $1',
      [toEmail]
    );

    if (recipient.rows.length === 0) {
      return res.status(404).json({ error: 'Recipient not found' });
    }

    if (recipient.rows[0].id === req.user.id) {
      return res.status(400).json({ error: 'Cannot transfer to yourself' });
    }

    const result = await k99Service.transfer(
      req.user.id,
      recipient.rows[0].id,
      amount,
      note
    );

    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get platform K99 stats
app.get('/k99/stats', async (req, res) => {
  const stats = await k99Service.getPlatformStats();
  res.json(stats);
});

// ============================================
// WALLET ROUTES
// ============================================

// Get balances
app.get('/wallet/balances', authenticateToken, async (req, res) => {
  const result = await db.query(`
    SELECT currency, balance, available_balance, locked_balance
    FROM balances WHERE user_id = $1
    ORDER BY balance DESC
  `, [req.user.id]);

  res.json(result.rows);
});

// Get deposit address
app.get('/wallet/deposit/:currency', authenticateToken, async (req, res) => {
  try {
    const address = coldWalletService.getDepositAddress(
      req.params.currency,
      req.query.network
    );
    res.json(address);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Register cold wallet
app.post('/wallet/cold-wallet', authenticateToken, async (req, res) => {
  const { currency, address, label } = req.body;

  try {
    const result = await coldWalletService.registerWallet(
      req.user.id,
      currency,
      address,
      label
    );
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get registered wallets
app.get('/wallet/cold-wallets', authenticateToken, async (req, res) => {
  const wallets = await coldWalletService.getUserWallets(req.user.id);
  res.json(wallets);
});

// Verify wallet
app.post('/wallet/cold-wallet/:id/verify', authenticateToken, async (req, res) => {
  try {
    const result = await coldWalletService.verifyWallet(
      req.params.id,
      req.body.txHash
    );
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Create withdrawal
app.post('/wallet/withdraw', authenticateToken, async (req, res) => {
  const { walletId, currency, amount, network } = req.body;

  try {
    const result = await coldWalletService.createWithdrawal(
      req.user.id,
      walletId,
      currency,
      amount,
      network
    );
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get withdrawal history
app.get('/wallet/withdrawals', authenticateToken, async (req, res) => {
  const history = await coldWalletService.getWithdrawalHistory(
    req.user.id,
    req.query.status
  );
  res.json(history);
});

// Get treasury addresses
app.get('/wallet/treasury', async (req, res) => {
  res.json(coldWalletService.getTreasuryWallets());
});

// ============================================
// ADMIN ROUTES
// ============================================

// List all users
app.get('/admin/users', authenticateToken, requireAdmin, async (req, res) => {
  const result = await db.query(`
    SELECT u.id, u.email, u.role, u.is_frozen, u.created_at, u.last_login,
           k.balance as k99_balance
    FROM users u
    LEFT JOIN k99_balances k ON u.id = k.user_id
    ORDER BY u.created_at DESC
  `);
  res.json(result.rows);
});

// Freeze/unfreeze user
app.post('/admin/users/:id/freeze', authenticateToken, requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { freeze } = req.body;

  await db.query('UPDATE users SET is_frozen = $1 WHERE id = $2', [freeze, id]);
  
  // Invalidate user sessions
  await cache.delete(`refresh:${id}`);

  res.json({ message: `User ${id} frozen: ${freeze}` });
});

// Mint K99
app.post('/admin/k99/mint', authenticateToken, requireAdmin, async (req, res) => {
  const { userId, amount, reason } = req.body;

  try {
    const result = await k99Service.credit(userId, amount, `Admin mint: ${reason}`);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get pending withdrawals
app.get('/admin/withdrawals/pending', authenticateToken, requireAdmin, async (req, res) => {
  const withdrawals = await coldWalletService.getPendingWithdrawals();
  res.json(withdrawals);
});

// Process withdrawal
app.post('/admin/withdrawals/:id/process', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await coldWalletService.processWithdrawal(
      req.params.id,
      req.body.txHash,
      req.user.id
    );
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Reject withdrawal
app.post('/admin/withdrawals/:id/reject', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await coldWalletService.rejectWithdrawal(
      req.params.id,
      req.body.reason,
      req.user.id
    );
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Platform stats
app.get('/admin/stats', authenticateToken, requireAdmin, async (req, res) => {
  const result = await db.query(`
    SELECT
      (SELECT COUNT(*) FROM users) as total_users,
      (SELECT COUNT(*) FROM users WHERE created_at > NOW() - INTERVAL '24 hours') as new_users_24h,
      (SELECT COUNT(*) FROM users WHERE last_login > NOW() - INTERVAL '24 hours') as active_users_24h,
      (SELECT COUNT(*) FROM orders WHERE created_at > NOW() - INTERVAL '24 hours') as orders_24h,
      (SELECT COUNT(*) FROM trades WHERE created_at > NOW() - INTERVAL '24 hours') as trades_24h,
      (SELECT COALESCE(SUM(total), 0) FROM trades WHERE created_at > NOW() - INTERVAL '24 hours') as volume_24h
  `);

  const k99Stats = await k99Service.getPlatformStats();

  res.json({
    ...result.rows[0],
    k99: k99Stats
  });
});

// ============================================
// HEALTH CHECK
// ============================================

app.get('/health', async (req, res) => {
  try {
    await db.query('SELECT 1');
    res.json({ status: 'healthy', service: 'user-service' });
  } catch (err) {
    res.status(500).json({ status: 'unhealthy', error: err.message });
  }
});

// ============================================
// START SERVER
// ============================================

const PORT = process.env.PORT || 3001;

const start = async () => {
  try {
    // Initialize database
    await initializeDatabase();
    console.log('✅ Database initialized');

    app.listen(PORT, () => {
      console.log(`👑 USER SERVICE running on port ${PORT}`);
      console.log(`📊 K99 Token System: Active`);
      console.log(`🔐 Cold Wallet Management: Active`);
    });
  } catch (err) {
    console.error('❌ Failed to start service:', err);
    process.exit(1);
  }
};

start();
