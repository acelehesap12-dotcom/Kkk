// 👑 COLD WALLET MANAGEMENT
// Secure cold wallet transfers and verification
// Multi-chain support: ETH, BTC, SOL, TRX, USDT

const crypto = require('crypto');
const { db, cache } = require('./database');

// ============================================
// PLATFORM TREASURY WALLETS
// ============================================

const TREASURY_WALLETS = {
  ETH: {
    address: '0x163c9a26d23B6acfc1A7F89F0a3c06fbc0099e8c',
    chain: 'Ethereum',
    explorer: 'https://etherscan.io/address/'
  },
  SOL: {
    address: 'Gp4itYfndMfxB4FfAbKhJ3jLyKaXNEk41fwxvd92pUCw',
    chain: 'Solana',
    explorer: 'https://solscan.io/account/'
  },
  TRX: {
    address: 'THbevzJMCeEwb5WGfZBNaR9m9rLhcVT2T1',
    chain: 'Tron',
    explorer: 'https://tronscan.org/#/address/'
  },
  BTC: {
    address: 'bc1pzmd9k29a2uv37psjp4xlsdfuzy3a5jrvsxv9l6d8c0kvm46e9n8s7xlfax',
    chain: 'Bitcoin',
    explorer: 'https://blockchair.com/bitcoin/address/'
  },
  USDT_ETH: {
    address: '0x163c9a26d23B6acfc1A7F89F0a3c06fbc0099e8c',
    chain: 'Ethereum (ERC-20)',
    explorer: 'https://etherscan.io/address/'
  },
  USDT_TRX: {
    address: 'THbevzJMCeEwb5WGfZBNaR9m9rLhcVT2T1',
    chain: 'Tron (TRC-20)',
    explorer: 'https://tronscan.org/#/address/'
  }
};

// Minimum withdrawal amounts
const MINIMUM_WITHDRAWALS = {
  BTC: 0.0001,
  ETH: 0.001,
  SOL: 0.01,
  TRX: 10,
  USDT: 10
};

// Withdrawal fees
const WITHDRAWAL_FEES = {
  BTC: 0.0001,
  ETH: 0.002,
  SOL: 0.01,
  TRX: 1,
  USDT_ETH: 5,
  USDT_TRX: 1
};

// ============================================
// COLD WALLET SERVICE
// ============================================

class ColdWalletService {

  // Register user's cold wallet
  async registerWallet(userId, currency, address, label = '') {
    // Validate address format
    if (!this.validateAddress(address, currency)) {
      throw new Error(`Invalid ${currency} wallet address`);
    }

    // Check if already exists
    const existing = await db.query(
      `SELECT id FROM cold_wallets WHERE user_id = $1 AND currency = $2 AND address = $3`,
      [userId, currency, address]
    );

    if (existing.rows.length > 0) {
      throw new Error('Wallet already registered');
    }

    // Generate verification code
    const verificationCode = crypto.randomBytes(3).toString('hex').toUpperCase();

    const result = await db.query(`
      INSERT INTO cold_wallets (user_id, currency, address, label, verification_code, is_verified)
      VALUES ($1, $2, $3, $4, $5, false)
      RETURNING *
    `, [userId, currency, address, label, verificationCode]);

    return {
      wallet: result.rows[0],
      verificationCode,
      instructions: `To verify this wallet, send a micro-transaction with memo/tag: ${verificationCode}`
    };
  }

  // Validate address format
  validateAddress(address, currency) {
    const patterns = {
      BTC: /^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,62}$/,
      ETH: /^0x[a-fA-F0-9]{40}$/,
      SOL: /^[1-9A-HJ-NP-Za-km-z]{32,44}$/,
      TRX: /^T[a-zA-Z0-9]{33}$/,
      USDT: /^(0x[a-fA-F0-9]{40}|T[a-zA-Z0-9]{33})$/
    };

    const pattern = patterns[currency.toUpperCase()];
    if (!pattern) return true; // Unknown currency, skip validation
    
    return pattern.test(address);
  }

  // Verify wallet ownership (after user sends micro-tx)
  async verifyWallet(walletId, txHash = null) {
    const result = await db.query(`
      UPDATE cold_wallets
      SET is_verified = true, verified_at = NOW(), verification_tx = $2
      WHERE id = $1
      RETURNING *
    `, [walletId, txHash]);

    if (result.rows.length === 0) {
      throw new Error('Wallet not found');
    }

    return result.rows[0];
  }

  // Get user's registered wallets
  async getUserWallets(userId) {
    const result = await db.query(`
      SELECT * FROM cold_wallets
      WHERE user_id = $1
      ORDER BY created_at DESC
    `, [userId]);

    return result.rows;
  }

  // Get verified wallets only
  async getVerifiedWallets(userId) {
    const result = await db.query(`
      SELECT * FROM cold_wallets
      WHERE user_id = $1 AND is_verified = true
      ORDER BY created_at DESC
    `, [userId]);

    return result.rows;
  }

  // Create withdrawal request
  async createWithdrawal(userId, walletId, currency, amount, network = null) {
    // Check minimum
    const minAmount = MINIMUM_WITHDRAWALS[currency.toUpperCase()] || 0;
    if (amount < minAmount) {
      throw new Error(`Minimum withdrawal: ${minAmount} ${currency}`);
    }

    // Get wallet
    const walletResult = await db.query(
      `SELECT * FROM cold_wallets WHERE id = $1 AND user_id = $2 AND is_verified = true`,
      [walletId, userId]
    );

    if (walletResult.rows.length === 0) {
      throw new Error('Wallet not found or not verified');
    }

    const wallet = walletResult.rows[0];

    // Check user balance
    const balanceResult = await db.query(
      `SELECT balance FROM balances WHERE user_id = $1 AND currency = $2`,
      [userId, currency]
    );

    const balance = parseFloat(balanceResult.rows[0]?.balance) || 0;
    const fee = this.getWithdrawalFee(currency, network);
    const totalRequired = amount + fee;

    if (balance < totalRequired) {
      throw new Error(`Insufficient balance. Required: ${totalRequired} ${currency} (including ${fee} fee)`);
    }

    const client = await db.connect();

    try {
      await client.query('BEGIN');

      // Deduct from balance
      await client.query(`
        UPDATE balances SET balance = balance - $3
        WHERE user_id = $1 AND currency = $2
      `, [userId, currency, totalRequired]);

      // Create withdrawal request
      const withdrawalId = `WD-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
      
      const result = await client.query(`
        INSERT INTO withdrawals (
          id, user_id, wallet_id, currency, amount, fee, network,
          destination_address, status, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending', NOW())
        RETURNING *
      `, [withdrawalId, userId, walletId, currency, amount, fee, network, wallet.address]);

      await client.query('COMMIT');

      // Clear cache
      await cache.delete(`balance:${userId}:${currency}`);

      return {
        withdrawal: result.rows[0],
        message: 'Withdrawal request submitted. Processing within 24 hours.'
      };

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Get withdrawal fee
  getWithdrawalFee(currency, network = null) {
    const key = network ? `${currency}_${network}` : currency;
    return WITHDRAWAL_FEES[key.toUpperCase()] || 0;
  }

  // Get withdrawal history
  async getWithdrawalHistory(userId, status = null) {
    let query = `
      SELECT w.*, cw.address, cw.label
      FROM withdrawals w
      JOIN cold_wallets cw ON w.wallet_id = cw.id
      WHERE w.user_id = $1
    `;

    const params = [userId];

    if (status) {
      query += ` AND w.status = $2`;
      params.push(status);
    }

    query += ` ORDER BY w.created_at DESC`;

    const result = await db.query(query, params);
    return result.rows;
  }

  // Admin: Process withdrawal
  async processWithdrawal(withdrawalId, txHash, adminId) {
    const result = await db.query(`
      UPDATE withdrawals
      SET status = 'completed', tx_hash = $2, processed_by = $3, processed_at = NOW()
      WHERE id = $1 AND status = 'pending'
      RETURNING *
    `, [withdrawalId, txHash, adminId]);

    if (result.rows.length === 0) {
      throw new Error('Withdrawal not found or already processed');
    }

    return result.rows[0];
  }

  // Admin: Reject withdrawal
  async rejectWithdrawal(withdrawalId, reason, adminId) {
    const client = await db.connect();

    try {
      await client.query('BEGIN');

      // Get withdrawal
      const withdrawal = await client.query(
        `SELECT * FROM withdrawals WHERE id = $1 AND status = 'pending'`,
        [withdrawalId]
      );

      if (withdrawal.rows.length === 0) {
        throw new Error('Withdrawal not found or already processed');
      }

      const wd = withdrawal.rows[0];

      // Refund balance
      await client.query(`
        UPDATE balances SET balance = balance + $3
        WHERE user_id = $1 AND currency = $2
      `, [wd.user_id, wd.currency, wd.amount + wd.fee]);

      // Update status
      await client.query(`
        UPDATE withdrawals
        SET status = 'rejected', rejection_reason = $2, processed_by = $3, processed_at = NOW()
        WHERE id = $1
      `, [withdrawalId, reason, adminId]);

      await client.query('COMMIT');

      // Clear cache
      await cache.delete(`balance:${wd.user_id}:${wd.currency}`);

      return { success: true };

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Get platform treasury info
  getTreasuryWallets() {
    return TREASURY_WALLETS;
  }

  // Get deposit address for a currency
  getDepositAddress(currency, network = null) {
    const key = network ? `${currency}_${network}` : currency;
    const wallet = TREASURY_WALLETS[key.toUpperCase()];
    
    if (!wallet) {
      throw new Error(`Unsupported currency: ${currency}`);
    }

    return {
      address: wallet.address,
      chain: wallet.chain,
      explorerUrl: wallet.explorer + wallet.address,
      minimumDeposit: MINIMUM_WITHDRAWALS[currency.toUpperCase()] || 0,
      confirmationsRequired: this.getConfirmations(currency)
    };
  }

  // Get required confirmations
  getConfirmations(currency) {
    const confirmations = {
      BTC: 3,
      ETH: 12,
      SOL: 30,
      TRX: 20,
      USDT: 12
    };
    return confirmations[currency.toUpperCase()] || 6;
  }

  // Get pending withdrawals (admin)
  async getPendingWithdrawals() {
    const result = await db.query(`
      SELECT w.*, cw.address, cw.label, u.email as user_email
      FROM withdrawals w
      JOIN cold_wallets cw ON w.wallet_id = cw.id
      JOIN users u ON w.user_id = u.id
      WHERE w.status = 'pending'
      ORDER BY w.created_at ASC
    `);

    return result.rows;
  }
}

module.exports = new ColdWalletService();
