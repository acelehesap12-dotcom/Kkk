// 👑 K99 TOKEN - PLATFORM VIRTUAL CURRENCY
// Commission payments, rewards, and internal transfers
// PostgreSQL backed with Redis caching

const { db, cache } = require('./database');

// ============================================
// K99 TOKEN CONFIGURATION
// ============================================

const K99_CONFIG = {
  SYMBOL: 'K99',
  NAME: 'K99 Token',
  DECIMALS: 8,
  
  // Initial allocation
  SIGNUP_BONUS: 1000,           // New user bonus
  REFERRAL_BONUS: 500,          // Referrer bonus
  REFERRAL_SIGNUP_BONUS: 250,   // Referred user bonus
  
  // Trading rewards
  TRADE_REWARD_RATE: 0.001,     // 0.1% of trade volume as K99
  MAKER_REWARD_RATE: 0.002,     // 0.2% for makers
  
  // Commission rates (in K99)
  COMMISSION_RATES: {
    Crypto: 0.001,     // 0.1%
    Forex: 0.00005,    // 0.005%
    Stock: 0.0001,     // 0.01%
    ETF: 0.0001,       // 0.01%
    Bond: 0.00005,     // 0.005%
    Commodity: 0.0001, // 0.01%
    Option: 0.0005,    // 0.05%
    Future: 0.0002     // 0.02%
  },
  
  // K99/USD exchange rate (for display)
  USD_RATE: 0.10,  // 1 K99 = $0.10
  
  // Treasury wallet (platform reserve)
  TREASURY_ADDRESS: 'K99-TREASURY-0x163c9a26d23B6acfc1A7F89F0a3c06fbc0099e8c'
};

// ============================================
// K99 TOKEN SERVICE
// ============================================

class K99TokenService {
  
  // Get user's K99 balance
  async getBalance(userId) {
    const cacheKey = `k99:balance:${userId}`;
    
    return cache.getOrSet(cacheKey, async () => {
      const result = await db.query(
        `SELECT balance FROM k99_balances WHERE user_id = $1`,
        [userId]
      );
      
      if (result.rows.length === 0) {
        // Create balance record if not exists
        await db.query(
          `INSERT INTO k99_balances (user_id, balance) VALUES ($1, 0) ON CONFLICT DO NOTHING`,
          [userId]
        );
        return 0;
      }
      
      return parseFloat(result.rows[0].balance) || 0;
    }, 60);
  }

  // Credit K99 to user (for rewards, bonuses)
  async credit(userId, amount, reason, referenceId = null) {
    if (amount <= 0) throw new Error('Amount must be positive');
    
    const client = await db.connect();
    
    try {
      await client.query('BEGIN');
      
      // Update balance
      const result = await client.query(`
        INSERT INTO k99_balances (user_id, balance)
        VALUES ($1, $2)
        ON CONFLICT (user_id) DO UPDATE SET
          balance = k99_balances.balance + $2,
          updated_at = NOW()
        RETURNING balance
      `, [userId, amount]);
      
      // Record transaction
      await client.query(`
        INSERT INTO k99_transactions (
          user_id, type, amount, reason, reference_id, balance_after
        ) VALUES ($1, 'credit', $2, $3, $4, $5)
      `, [userId, amount, reason, referenceId, result.rows[0].balance]);
      
      await client.query('COMMIT');
      
      // Clear cache
      await cache.delete(`k99:balance:${userId}`);
      
      return {
        success: true,
        newBalance: parseFloat(result.rows[0].balance)
      };
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Debit K99 from user (for commissions, transfers)
  async debit(userId, amount, reason, referenceId = null) {
    if (amount <= 0) throw new Error('Amount must be positive');
    
    const client = await db.connect();
    
    try {
      await client.query('BEGIN');
      
      // Check balance
      const balanceResult = await client.query(
        'SELECT balance FROM k99_balances WHERE user_id = $1 FOR UPDATE',
        [userId]
      );
      
      const currentBalance = parseFloat(balanceResult.rows[0]?.balance) || 0;
      
      if (currentBalance < amount) {
        throw new Error(`Insufficient K99 balance. Required: ${amount}, Available: ${currentBalance}`);
      }
      
      // Update balance
      const result = await client.query(`
        UPDATE k99_balances
        SET balance = balance - $2, updated_at = NOW()
        WHERE user_id = $1
        RETURNING balance
      `, [userId, amount]);
      
      // Record transaction
      await client.query(`
        INSERT INTO k99_transactions (
          user_id, type, amount, reason, reference_id, balance_after
        ) VALUES ($1, 'debit', $2, $3, $4, $5)
      `, [userId, amount, reason, referenceId, result.rows[0].balance]);
      
      await client.query('COMMIT');
      
      // Clear cache
      await cache.delete(`k99:balance:${userId}`);
      
      return {
        success: true,
        newBalance: parseFloat(result.rows[0].balance)
      };
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Transfer K99 between users
  async transfer(fromUserId, toUserId, amount, note = '') {
    if (amount <= 0) throw new Error('Amount must be positive');
    
    const client = await db.connect();
    
    try {
      await client.query('BEGIN');
      
      // Check sender balance
      const senderBalance = await client.query(
        'SELECT balance FROM k99_balances WHERE user_id = $1 FOR UPDATE',
        [fromUserId]
      );
      
      const available = parseFloat(senderBalance.rows[0]?.balance) || 0;
      
      if (available < amount) {
        throw new Error(`Insufficient K99 balance`);
      }
      
      // Debit sender
      await client.query(`
        UPDATE k99_balances SET balance = balance - $2 WHERE user_id = $1
      `, [fromUserId, amount]);
      
      // Credit receiver
      await client.query(`
        INSERT INTO k99_balances (user_id, balance)
        VALUES ($1, $2)
        ON CONFLICT (user_id) DO UPDATE SET balance = k99_balances.balance + $2
      `, [toUserId, amount]);
      
      // Record transactions
      const transferId = `TRF-${Date.now()}-${Math.random().toString(36).substr(2, 8)}`;
      
      await client.query(`
        INSERT INTO k99_transactions (user_id, type, amount, reason, reference_id)
        VALUES ($1, 'transfer_out', $2, $3, $4)
      `, [fromUserId, amount, `Transfer to user: ${note}`, transferId]);
      
      await client.query(`
        INSERT INTO k99_transactions (user_id, type, amount, reason, reference_id)
        VALUES ($1, 'transfer_in', $2, $3, $4)
      `, [toUserId, amount, `Transfer from user: ${note}`, transferId]);
      
      await client.query('COMMIT');
      
      // Clear caches
      await cache.delete(`k99:balance:${fromUserId}`);
      await cache.delete(`k99:balance:${toUserId}`);
      
      return { success: true, transferId };
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Calculate and deduct commission for a trade
  async deductCommission(userId, tradeVolume, assetType, orderId) {
    const rate = K99_CONFIG.COMMISSION_RATES[assetType] || 0.001;
    const commissionUSD = tradeVolume * rate;
    const commissionK99 = commissionUSD / K99_CONFIG.USD_RATE;
    
    try {
      await this.debit(
        userId,
        commissionK99,
        `Trading commission: ${assetType}`,
        orderId
      );
      
      return {
        success: true,
        commissionK99: commissionK99,
        commissionUSD: commissionUSD
      };
      
    } catch (error) {
      // If insufficient K99, convert from USD balance
      console.log(`K99 insufficient, using USD balance for commission`);
      return {
        success: false,
        commissionK99: 0,
        commissionUSD: commissionUSD,
        useUSD: true
      };
    }
  }

  // Award trading rewards
  async awardTradeReward(userId, tradeVolume, isMaker = false, orderId) {
    const rate = isMaker ? K99_CONFIG.MAKER_REWARD_RATE : K99_CONFIG.TRADE_REWARD_RATE;
    const rewardUSD = tradeVolume * rate;
    const rewardK99 = rewardUSD / K99_CONFIG.USD_RATE;
    
    await this.credit(
      userId,
      rewardK99,
      `Trading reward: ${isMaker ? 'Maker' : 'Taker'}`,
      orderId
    );
    
    return { rewardK99, rewardUSD };
  }

  // Signup bonus
  async awardSignupBonus(userId) {
    return this.credit(
      userId,
      K99_CONFIG.SIGNUP_BONUS,
      'Signup bonus'
    );
  }

  // Referral bonus
  async awardReferralBonus(referrerId, newUserId) {
    await this.credit(
      referrerId,
      K99_CONFIG.REFERRAL_BONUS,
      'Referral bonus',
      `REF-${newUserId}`
    );
    
    await this.credit(
      newUserId,
      K99_CONFIG.REFERRAL_SIGNUP_BONUS,
      'Referral signup bonus',
      `REF-${referrerId}`
    );
    
    return { referrerBonus: K99_CONFIG.REFERRAL_BONUS, newUserBonus: K99_CONFIG.REFERRAL_SIGNUP_BONUS };
  }

  // Get transaction history
  async getTransactionHistory(userId, limit = 50, offset = 0) {
    const result = await db.query(`
      SELECT * FROM k99_transactions
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `, [userId, limit, offset]);
    
    return result.rows;
  }

  // Get K99 stats for a user
  async getUserStats(userId) {
    const result = await db.query(`
      SELECT
        (SELECT balance FROM k99_balances WHERE user_id = $1) as balance,
        (SELECT COALESCE(SUM(amount), 0) FROM k99_transactions WHERE user_id = $1 AND type = 'credit') as total_earned,
        (SELECT COALESCE(SUM(amount), 0) FROM k99_transactions WHERE user_id = $1 AND type = 'debit') as total_spent,
        (SELECT COUNT(*) FROM k99_transactions WHERE user_id = $1) as transaction_count
    `, [userId]);
    
    const stats = result.rows[0];
    
    return {
      balance: parseFloat(stats.balance) || 0,
      balanceUSD: (parseFloat(stats.balance) || 0) * K99_CONFIG.USD_RATE,
      totalEarned: parseFloat(stats.total_earned) || 0,
      totalSpent: parseFloat(stats.total_spent) || 0,
      transactionCount: parseInt(stats.transaction_count) || 0,
      usdRate: K99_CONFIG.USD_RATE
    };
  }

  // Platform stats
  async getPlatformStats() {
    const cacheKey = 'k99:platform:stats';
    
    return cache.getOrSet(cacheKey, async () => {
      const result = await db.query(`
        SELECT
          (SELECT COALESCE(SUM(balance), 0) FROM k99_balances) as total_supply,
          (SELECT COUNT(*) FROM k99_balances WHERE balance > 0) as holders,
          (SELECT COALESCE(SUM(amount), 0) FROM k99_transactions WHERE created_at > NOW() - INTERVAL '24 hours') as volume_24h,
          (SELECT COUNT(*) FROM k99_transactions WHERE created_at > NOW() - INTERVAL '24 hours') as transactions_24h
      `);
      
      const stats = result.rows[0];
      
      return {
        symbol: K99_CONFIG.SYMBOL,
        name: K99_CONFIG.NAME,
        totalSupply: parseFloat(stats.total_supply) || 0,
        holders: parseInt(stats.holders) || 0,
        volume24h: parseFloat(stats.volume_24h) || 0,
        transactions24h: parseInt(stats.transactions_24h) || 0,
        usdRate: K99_CONFIG.USD_RATE,
        marketCap: (parseFloat(stats.total_supply) || 0) * K99_CONFIG.USD_RATE
      };
    }, 300); // Cache 5 minutes
  }
}

// Export singleton instance
const k99Service = new K99TokenService();

module.exports = {
  k99Service,
  K99_CONFIG
};
