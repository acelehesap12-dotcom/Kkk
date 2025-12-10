// 👑 UNIFIED EXCHANGE - DATABASE & CACHE SERVICE
// PostgreSQL (Neon) + Redis (Upstash) Integration

const { Pool } = require('pg');
const { Redis } = require('@upstash/redis');

// ============================================
// POSTGRESQL CONNECTION (Neon)
// ============================================

const DATABASE_URL = process.env.DATABASE_URL || 
  'postgresql://neondb_owner:npg_DIp7hzOyG6JM@ep-empty-salad-aggyutnl-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require';

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

// Test connection
pool.on('connect', () => {
  console.log('✅ PostgreSQL (Neon) connected');
});

pool.on('error', (err) => {
  console.error('❌ PostgreSQL error:', err);
});

// ============================================
// REDIS CONNECTION (Upstash)
// ============================================

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL || 'https://exact-tadpole-7870.upstash.io',
  token: process.env.UPSTASH_REDIS_TOKEN || 'AR6-AAImcDFiN2U0M2FiZGI3NWQ0NGZiOGVkZGU1OGUxOTY4ODc3M3AxNzg3MA',
});

// ============================================
// DATABASE SCHEMA INITIALIZATION
// ============================================

const initSchema = async () => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Users table with K99 balance
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'user',
        display_name VARCHAR(100),
        timezone VARCHAR(50) DEFAULT 'UTC',
        referral_code VARCHAR(50) UNIQUE,
        referred_by INTEGER REFERENCES users(id),
        email_verified BOOLEAN DEFAULT FALSE,
        k99_balance DECIMAL(20, 8) DEFAULT 1000.00,
        usdt_balance DECIMAL(20, 8) DEFAULT 0,
        is_frozen BOOLEAN DEFAULT FALSE,
        kyc_verified BOOLEAN DEFAULT FALSE,
        two_factor_enabled BOOLEAN DEFAULT FALSE,
        last_login TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // Wallets table - multi-chain support
    await client.query(`
      CREATE TABLE IF NOT EXISTS wallets (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        chain VARCHAR(50) NOT NULL,
        address VARCHAR(255) NOT NULL,
        is_cold BOOLEAN DEFAULT FALSE,
        balance DECIMAL(30, 18) DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(user_id, chain)
      );
    `);

    // Deposits table
    await client.query(`
      CREATE TABLE IF NOT EXISTS deposits (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        tx_hash VARCHAR(255) UNIQUE,
        chain VARCHAR(50) NOT NULL,
        asset VARCHAR(50) NOT NULL,
        amount DECIMAL(30, 18) NOT NULL,
        from_address VARCHAR(255),
        to_address VARCHAR(255),
        confirmations INTEGER DEFAULT 0,
        required_confirmations INTEGER DEFAULT 12,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        confirmed_at TIMESTAMPTZ
      );
    `);

    // Withdrawals table
    await client.query(`
      CREATE TABLE IF NOT EXISTS withdrawals (
        id VARCHAR(100) PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        wallet_id INTEGER REFERENCES cold_wallets(id),
        tx_hash VARCHAR(255),
        chain VARCHAR(50),
        currency VARCHAR(50) NOT NULL,
        network VARCHAR(50),
        amount DECIMAL(30, 18) NOT NULL,
        fee DECIMAL(30, 18) DEFAULT 0,
        destination_address VARCHAR(255) NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        rejection_reason TEXT,
        processed_by INTEGER REFERENCES users(id),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        processed_at TIMESTAMPTZ
      );
    `);

    // Orders table
    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        symbol VARCHAR(50) NOT NULL,
        side VARCHAR(10) NOT NULL,
        order_type VARCHAR(20) NOT NULL,
        price DECIMAL(30, 18),
        quantity DECIMAL(30, 18) NOT NULL,
        filled_quantity DECIMAL(30, 18) DEFAULT 0,
        status VARCHAR(20) DEFAULT 'open',
        leverage INTEGER DEFAULT 1,
        margin_type VARCHAR(20) DEFAULT 'cross',
        stop_price DECIMAL(30, 18),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // Trades table
    await client.query(`
      CREATE TABLE IF NOT EXISTS trades (
        id SERIAL PRIMARY KEY,
        order_id INTEGER REFERENCES orders(id),
        user_id INTEGER REFERENCES users(id),
        symbol VARCHAR(50) NOT NULL,
        side VARCHAR(10) NOT NULL,
        price DECIMAL(30, 18) NOT NULL,
        quantity DECIMAL(30, 18) NOT NULL,
        fee DECIMAL(30, 18) DEFAULT 0,
        fee_asset VARCHAR(20) DEFAULT 'K99',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // Positions table (for margin/futures)
    await client.query(`
      CREATE TABLE IF NOT EXISTS positions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        symbol VARCHAR(50) NOT NULL,
        side VARCHAR(10) NOT NULL,
        size DECIMAL(30, 18) NOT NULL,
        entry_price DECIMAL(30, 18) NOT NULL,
        mark_price DECIMAL(30, 18),
        liquidation_price DECIMAL(30, 18),
        leverage INTEGER DEFAULT 1,
        margin_type VARCHAR(20) DEFAULT 'cross',
        unrealized_pnl DECIMAL(30, 18) DEFAULT 0,
        realized_pnl DECIMAL(30, 18) DEFAULT 0,
        status VARCHAR(20) DEFAULT 'open',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(user_id, symbol)
      );
    `);

    // K99 Token transactions
    await client.query(`
      CREATE TABLE IF NOT EXISTS k99_transactions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        type VARCHAR(50) NOT NULL,
        amount DECIMAL(20, 8) NOT NULL,
        balance_after DECIMAL(20, 8),
        reason TEXT,
        reference_id VARCHAR(255),
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // K99 Balances table
    await client.query(`
      CREATE TABLE IF NOT EXISTS k99_balances (
        user_id INTEGER PRIMARY KEY REFERENCES users(id),
        balance DECIMAL(20, 8) DEFAULT 0,
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // User balances per currency
    await client.query(`
      CREATE TABLE IF NOT EXISTS balances (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        currency VARCHAR(20) NOT NULL,
        balance DECIMAL(30, 18) DEFAULT 0,
        available_balance DECIMAL(30, 18) DEFAULT 0,
        locked_balance DECIMAL(30, 18) DEFAULT 0,
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(user_id, currency)
      );
    `);

    // Market data cache
    await client.query(`
      CREATE TABLE IF NOT EXISTS market_data (
        symbol VARCHAR(50) PRIMARY KEY,
        asset_type VARCHAR(50) NOT NULL,
        price DECIMAL(30, 18),
        change_24h DECIMAL(10, 4),
        high_24h DECIMAL(30, 18),
        low_24h DECIMAL(30, 18),
        volume_24h DECIMAL(30, 18),
        market_cap DECIMAL(30, 18),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // Cold wallet addresses (user registered & treasury)
    await client.query(`
      CREATE TABLE IF NOT EXISTS cold_wallets (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        currency VARCHAR(50) NOT NULL,
        address VARCHAR(255) NOT NULL,
        label VARCHAR(100),
        chain VARCHAR(50),
        verification_code VARCHAR(20),
        verification_tx VARCHAR(255),
        is_verified BOOLEAN DEFAULT FALSE,
        verified_at TIMESTAMPTZ,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // Insert default cold wallets (Treasury)
    await client.query(`
      INSERT INTO cold_wallets (chain, address, label) VALUES
        ('ETH', '0x163c9a2E86974e63BE1758A45f13EAF22d26F46E', 'ETH Treasury'),
        ('SOL', 'Gp4itYbh9RVpeP6tLzaEaNBMPCPcU1V7Dg7q7nNzMJfL', 'SOL Treasury'),
        ('TRX', 'THbevzAdJ2sCAzmxrKWCuNEJvZmhVrFZV9', 'TRX Treasury'),
        ('BTC', 'bc1pzmd6r9e24awpx7vy9s8hs8qlzc7p75cjhxse3kq2kw8k7xs7glgqjwz9ws', 'BTC Treasury')
      ON CONFLICT DO NOTHING;
    `);

    // Indexes for performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
      CREATE INDEX IF NOT EXISTS idx_orders_symbol ON orders(symbol);
      CREATE INDEX IF NOT EXISTS idx_trades_user_id ON trades(user_id);
      CREATE INDEX IF NOT EXISTS idx_trades_symbol ON trades(symbol);
      CREATE INDEX IF NOT EXISTS idx_deposits_user_id ON deposits(user_id);
      CREATE INDEX IF NOT EXISTS idx_withdrawals_user_id ON withdrawals(user_id);
    `);

    await client.query('COMMIT');
    console.log('✅ Database schema initialized');
    
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Schema initialization failed:', err);
    throw err;
  } finally {
    client.release();
  }
};

// ============================================
// REDIS CACHE HELPERS
// ============================================

const cache = {
  // Get cached data or fetch from source
  async getOrSet(key, fetchFn, ttlSeconds = 60) {
    try {
      const cached = await redis.get(key);
      if (cached) {
        return typeof cached === 'string' ? JSON.parse(cached) : cached;
      }
      
      const data = await fetchFn();
      await redis.setex(key, ttlSeconds, JSON.stringify(data));
      return data;
    } catch (err) {
      console.error('Cache error:', err);
      return fetchFn();
    }
  },

  // Set cache with TTL
  async set(key, value, ttlSeconds = 60) {
    try {
      await redis.setex(key, ttlSeconds, JSON.stringify(value));
    } catch (err) {
      console.error('Cache set error:', err);
    }
  },

  // Get from cache
  async get(key) {
    try {
      const data = await redis.get(key);
      return data ? (typeof data === 'string' ? JSON.parse(data) : data) : null;
    } catch (err) {
      console.error('Cache get error:', err);
      return null;
    }
  },

  // Delete from cache
  async del(key) {
    try {
      await redis.del(key);
    } catch (err) {
      console.error('Cache del error:', err);
    }
  },

  // Alias for del
  async delete(key) {
    return this.del(key);
  },

  // Rate limiting
  async checkRateLimit(key, limit, windowSeconds) {
    try {
      const current = await redis.incr(key);
      if (current === 1) {
        await redis.expire(key, windowSeconds);
      }
      return current <= limit;
    } catch (err) {
      console.error('Rate limit error:', err);
      return true;
    }
  },

  // Pub/Sub for real-time updates
  async publish(channel, message) {
    try {
      await redis.publish(channel, JSON.stringify(message));
    } catch (err) {
      console.error('Publish error:', err);
    }
  }
};

// ============================================
// DATABASE QUERY HELPERS
// ============================================

const db = {
  pool,
  
  async connect() {
    return pool.connect();
  },
  
  async query(text, params) {
    const start = Date.now();
    try {
      const result = await pool.query(text, params);
      const duration = Date.now() - start;
      if (duration > 100) {
        console.log('Slow query:', { text, duration });
      }
      return result;
    } catch (err) {
      console.error('Query error:', err);
      throw err;
    }
  },

  async getUser(userId) {
    const result = await this.query(
      'SELECT id, email, role, k99_balance, usdt_balance, is_frozen, kyc_verified FROM users WHERE id = $1',
      [userId]
    );
    return result.rows[0];
  },

  async updateK99Balance(userId, amount, type, description) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Update balance
      const result = await client.query(
        'UPDATE users SET k99_balance = k99_balance + $1, updated_at = NOW() WHERE id = $2 RETURNING k99_balance',
        [amount, userId]
      );
      
      // Log transaction
      await client.query(
        'INSERT INTO k99_transactions (user_id, type, amount, balance_after, description) VALUES ($1, $2, $3, $4, $5)',
        [userId, type, amount, result.rows[0].k99_balance, description]
      );
      
      await client.query('COMMIT');
      return result.rows[0].k99_balance;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },

  async getColdWallets() {
    const result = await this.query(
      'SELECT chain, address, label FROM cold_wallets WHERE is_active = TRUE'
    );
    return result.rows;
  }
};

module.exports = {
  pool,
  redis,
  cache,
  db,
  initSchema,
  initializeDatabase: initSchema
};
