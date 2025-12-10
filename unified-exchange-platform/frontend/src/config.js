// 👑 K99 EXCHANGE - CONFIGURATION
// Environment-based API endpoints

const isProd = process.env.NODE_ENV === 'production';

// API Endpoints
export const API_URL = isProd 
    ? 'https://api.k99-exchange.xyz' 
    : 'http://localhost:3001';

export const GATEWAY_URL = isProd
    ? 'https://gateway.k99-exchange.xyz'
    : 'http://localhost:8080';

export const WS_URL = isProd
    ? 'wss://gateway.k99-exchange.xyz/ws/orders'
    : 'ws://localhost:8080/ws/orders';

export const MARKET_DATA_URL = isProd
    ? 'https://market.k99-exchange.xyz'
    : 'http://localhost:8081';

// K99 Token Configuration
export const K99_CONFIG = {
  SYMBOL: 'K99',
  NAME: 'K99 Token',
  USD_RATE: 0.10,
  SIGNUP_BONUS: 1000,
  REFERRAL_BONUS: 500
};

// Treasury Wallet Addresses (for deposits)
export const TREASURY_WALLETS = {
  ETH: '0x163c9a26d23B6acfc1A7F89F0a3c06fbc0099e8c',
  SOL: 'Gp4itYfndMfxB4FfAbKhJ3jLyKaXNEk41fwxvd92pUCw',
  TRX: 'THbevzJMCeEwb5WGfZBNaR9m9rLhcVT2T1',
  BTC: 'bc1pzmd9k29a2uv37psjp4xlsdfuzy3a5jrvsxv9l6d8c0kvm46e9n8s7xlfax'
};

// Asset Classes
export const ASSET_CLASSES = [
  { id: 'crypto', name: 'Kripto', icon: '₿' },
  { id: 'forex', name: 'Forex', icon: '💱' },
  { id: 'stocks', name: 'Hisse', icon: '📈' },
  { id: 'etfs', name: 'ETF', icon: '📊' },
  { id: 'bonds', name: 'Tahvil', icon: '📜' },
  { id: 'commodities', name: 'Emtia', icon: '🥇' },
  { id: 'options', name: 'Opsiyon', icon: '⚖️' },
  { id: 'futures', name: 'Vadeli', icon: '📅' }
];

// Supported Chains for deposits/withdrawals
export const SUPPORTED_CHAINS = [
  { id: 'ETH', name: 'Ethereum (ERC-20)', confirmations: 12 },
  { id: 'SOL', name: 'Solana', confirmations: 30 },
  { id: 'TRX', name: 'Tron (TRC-20)', confirmations: 20 },
  { id: 'BTC', name: 'Bitcoin', confirmations: 3 }
];
