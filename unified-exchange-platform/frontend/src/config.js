// 👑 UNIFIED EXCHANGE - CONFIGURATION
// Bu dosya ortam değişkenlerine (Environment Variables) göre API adreslerini belirler.
// Localhost'ta çalışırken localhost, Production'da gerçek domain kullanılır.

const isProd = process.env.NODE_ENV === 'production';

export const API_URL = isProd 
    ? 'https://api.k99-exchange.xyz' // Backend API (User Service)
    : 'http://localhost:3000';

export const GATEWAY_URL = isProd
    ? 'https://gateway.k99-exchange.xyz' // Order Gateway
    : 'http://localhost:8080';

export const WS_URL = isProd
    ? 'wss://gateway.k99-exchange.xyz/ws/orders' // WebSocket
    : 'ws://localhost:8080/ws/orders';
