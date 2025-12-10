// 👑 UNIFIED EXCHANGE - PROFESSIONAL TRADING TERMINAL
import { useState, useEffect, useRef, useCallback } from 'react';
import { API_URL, WS_URL } from '../config';
import { ExchangeAPI } from '../lib/api';
import { useAuth, useWebSocket } from '../lib/hooks';
import { COLORS, SPACING } from '../styles/design-system';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Multi-asset symbol list
const ASSET_CATEGORIES = {
  Crypto: ['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'BNB/USDT', 'XRP/USDT', 'ADA/USDT'],
  Forex: ['EUR/USD', 'GBP/USD', 'USD/JPY', 'AUD/USD', 'USD/CHF'],
  Stocks: ['AAPL', 'TSLA', 'GOOGL', 'MSFT', 'AMZN', 'NVDA'],
  Commodities: ['GOLD', 'SILVER', 'OIL', 'NATGAS'],
  Indices: ['SPY', 'QQQ', 'DIA'],
  Futures: ['ES-FUT', 'NQ-FUT', 'CL-FUT']
};

// Generate realistic order book
const generateOrderBook = (basePrice, depth = 15) => {
  const bids = [];
  const asks = [];
  let cumBidSize = 0;
  let cumAskSize = 0;
  
  for (let i = 1; i <= depth; i++) {
    const bidSize = Math.random() * 3 + 0.1;
    const askSize = Math.random() * 3 + 0.1;
    cumBidSize += bidSize;
    cumAskSize += askSize;
    
    bids.push({ 
      price: basePrice * (1 - i * 0.0003), 
      size: bidSize,
      total: cumBidSize
    });
    asks.push({ 
      price: basePrice * (1 + i * 0.0003), 
      size: askSize,
      total: cumAskSize
    });
  }
  
  return { bids, asks, spread: (asks[0]?.price - bids[0]?.price).toFixed(2) };
};

export default function Trade() {
  const { user } = useAuth();
  const [symbol, setSymbol] = useState("BTC/USDT");
  const [assetType, setAssetType] = useState("Crypto");
  const [price, setPrice] = useState(50000);
  const [quantity, setQuantity] = useState(0.1);
  const [orderType, setOrderType] = useState("limit");
  const [stopPrice, setStopPrice] = useState("");
  const [leverage, setLeverage] = useState(10);
  const [marginType, setMarginType] = useState("cross");
  
  const [ws, setWs] = useState(null);
  const [connected, setConnected] = useState(false);
  const [logs, setLogs] = useState([]);
  const [trades, setTrades] = useState([]);
  const [orderBook, setOrderBook] = useState({ bids: [], asks: [], spread: '0' });
  const [marketData, setMarketData] = useState({
    price: 0,
    change24h: 0,
    high24h: 0,
    low24h: 0,
    volume24h: 0,
    fundingRate: 0.0001
  });
  
  // Positions & Orders
  const [positions, setPositions] = useState([]);
  const [openOrders, setOpenOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('positions');
  const [orderSubmitting, setOrderSubmitting] = useState(false);
  
  // Chart Data State
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [{
      label: 'Price',
      data: [],
      borderColor: COLORS.primary,
      backgroundColor: `${COLORS.primary}15`,
      borderWidth: 2,
      pointRadius: 0,
      fill: true,
      tension: 0.4,
    }],
  });
  const [timeframe, setTimeframe] = useState('15m');

  // Load market data and positions
  useEffect(() => {
    loadMarketData();
    loadPositions();
    loadOpenOrders();
  }, [symbol]);

  const loadMarketData = async () => {
    try {
      const markets = await ExchangeAPI.getMarkets();
      const market = markets.find(m => m.symbol === symbol);
      if (market) {
        setMarketData({
          price: market.price || 0,
          change24h: market.change24h || 0,
          high24h: market.high24h || market.price * 1.02,
          low24h: market.low24h || market.price * 0.98,
          volume24h: market.volume24h || 0,
          fundingRate: 0.0001
        });
        setPrice(market.price?.toFixed(2) || 50000);
        setOrderBook(generateOrderBook(market.price || 50000));
      }
    } catch (err) {
      // Use defaults
      setOrderBook(generateOrderBook(50000));
    }
  };

  const loadPositions = async () => {
    try {
      const data = await ExchangeAPI.getPositions();
      setPositions(data || []);
    } catch (err) {
      // Demo positions
      setPositions([
        { symbol: "BTC/USDT", size: 0.5, side: 'long', entryPrice: 48000, markPrice: 50000, pnl: 1000, roe: 4.16, liqPrice: 42000 },
        { symbol: "ETH/USDT", size: 10, side: 'short', entryPrice: 3500, markPrice: 3400, pnl: 1000, roe: 2.85, liqPrice: 4200 }
      ]);
    }
  };

  const loadOpenOrders = async () => {
    try {
      const data = await ExchangeAPI.getOrders();
      setOpenOrders(data || []);
    } catch (err) {
      setOpenOrders([]);
    }
  };

  // WebSocket connection
  useEffect(() => {
    const socket = new WebSocket(WS_URL);
    
    socket.onopen = () => {
      setConnected(true);
      addLog('✅ Connected to trading engine');
      socket.send(JSON.stringify({ action: 'subscribe', symbol }));
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'trade' && data.symbol === symbol) {
          handleTradeUpdate(data);
        } else if (data.type === 'orderbook') {
          // Real orderbook update
        } else if (data.type === 'fill') {
          addLog(`🎯 Order filled: ${data.side} ${data.quantity} @ ${data.price}`);
          loadPositions();
          loadOpenOrders();
        }
      } catch (e) {}
    };

    socket.onclose = () => {
      setConnected(false);
      addLog('❌ Disconnected from trading engine');
    };

    socket.onerror = () => {
      setConnected(false);
    };

    setWs(socket);
    return () => socket.close();
  }, [symbol]);

  const handleTradeUpdate = (data) => {
    setTrades(prev => [data, ...prev].slice(0, 50));
    
    // Update chart
    setChartData(prev => {
      const newLabels = [...prev.labels, new Date().toLocaleTimeString()];
      const newData = [...prev.datasets[0].data, data.price];
      
      if (newLabels.length > 60) {
        newLabels.shift();
        newData.shift();
      }

      return {
        ...prev,
        labels: newLabels,
        datasets: [{ ...prev.datasets[0], data: newData }]
      };
    });

    // Update order book
    setOrderBook(generateOrderBook(data.price));
    
    // Update market data
    setMarketData(prev => ({
      ...prev,
      price: data.price
    }));
  };

  const addLog = (msg) => {
    setLogs(prev => [{ time: new Date().toLocaleTimeString(), msg }, ...prev].slice(0, 20));
  };

  const submitOrder = async (side) => {
    if (!user) {
      addLog('⚠️ Please login to trade');
      return;
    }

    setOrderSubmitting(true);
    
    const order = {
      symbol,
      side,
      type: orderType,
      price: orderType === 'market' ? null : parseFloat(price),
      quantity: parseFloat(quantity),
      stopPrice: orderType === 'stop' ? parseFloat(stopPrice) : null,
      leverage,
      marginType
    };

    try {
      // Try real API
      await ExchangeAPI.placeOrder(order);
      addLog(`✅ ${side.toUpperCase()} order placed: ${quantity} ${symbol} @ ${orderType === 'market' ? 'MARKET' : price}`);
      loadOpenOrders();
    } catch (err) {
      // Send via WebSocket as fallback
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ ...order, user_id: user.id || 'guest' }));
        addLog(`📤 Order sent via WebSocket`);
      } else {
        addLog(`❌ Failed to place order`);
      }
    } finally {
      setOrderSubmitting(false);
    }
  };

  const closePosition = async (position) => {
    const side = position.side === 'long' ? 'sell' : 'buy';
    await submitOrder(side);
  };

  const cancelOrder = async (orderId) => {
    try {
      await ExchangeAPI.cancelOrder(orderId);
      addLog(`✅ Order ${orderId} cancelled`);
      loadOpenOrders();
    } catch (err) {
      addLog(`❌ Failed to cancel order`);
    }
  };

  // --- STYLES ---
  const panelStyle = {
    background: COLORS.backgroundLight,
    border: `1px solid ${COLORS.border}`,
    borderRadius: '8px',
    padding: '12px',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  };

  const headerStyle = {
    margin: '0 0 10px 0',
    fontSize: '12px',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: '1px',
    fontWeight: '600',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  };

  const allSymbols = Object.entries(ASSET_CATEGORIES).flatMap(([type, symbols]) => 
    symbols.map(s => ({ symbol: s, type }))
  );

  return (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: '260px 1fr 300px', 
      gridTemplateRows: '56px 1fr 220px',
      gap: '8px',
      height: '100vh', 
      backgroundColor: COLORS.background, 
      color: COLORS.text, 
      fontFamily: '"Inter", "JetBrains Mono", monospace',
      padding: '8px',
      boxSizing: 'border-box'
    }}>
      
      {/* 1. HEADER / NAVBAR */}
      <div style={{ gridColumn: '1 / -1', ...panelStyle, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <a href="/" style={{ textDecoration: 'none' }}>
            <h1 style={{ margin: 0, fontSize: '16px', color: COLORS.primary, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>⚡</span> k99 <span style={{ color: COLORS.textMuted }}>EXCHANGE</span>
            </h1>
          </a>
          <div style={{ height: '20px', width: '1px', background: COLORS.border }}></div>
          
          {/* Asset Type Selector */}
          <select 
            value={assetType} 
            onChange={(e) => {
              setAssetType(e.target.value);
              setSymbol(ASSET_CATEGORIES[e.target.value][0]);
            }}
            style={{ 
              padding: '6px 10px', 
              background: COLORS.background, 
              color: COLORS.textSecondary, 
              border: `1px solid ${COLORS.border}`, 
              borderRadius: '4px', 
              fontSize: '12px',
              cursor: 'pointer' 
            }}
          >
            {Object.keys(ASSET_CATEGORIES).map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          
          {/* Symbol Selector */}
          <select 
            value={symbol} 
            onChange={(e) => setSymbol(e.target.value)}
            style={{ 
              padding: '6px 12px', 
              background: COLORS.background, 
              color: COLORS.text, 
              border: `1px solid ${COLORS.border}`, 
              borderRadius: '4px', 
              fontWeight: '600', 
              cursor: 'pointer',
              fontSize: '13px'
            }}
          >
            {ASSET_CATEGORIES[assetType].map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        
        {/* Market Stats */}
        <div style={{ display: 'flex', gap: '24px', fontSize: '12px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <span style={{ color: COLORS.textMuted, fontSize: '10px' }}>Mark Price</span>
            <span style={{ color: COLORS.text, fontWeight: '600' }}>
              ${(marketData.price || trades[0]?.price || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <span style={{ color: COLORS.textMuted, fontSize: '10px' }}>24h Change</span>
            <span style={{ color: marketData.change24h >= 0 ? COLORS.success : COLORS.danger, fontWeight: '600' }}>
              {marketData.change24h >= 0 ? '+' : ''}{marketData.change24h?.toFixed(2)}%
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <span style={{ color: COLORS.textMuted, fontSize: '10px' }}>24h Volume</span>
            <span style={{ color: COLORS.text, fontWeight: '600' }}>
              ${(marketData.volume24h / 1e6).toFixed(1)}M
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <span style={{ color: COLORS.textMuted, fontSize: '10px' }}>Funding / 8h</span>
            <span style={{ color: COLORS.warning, fontWeight: '600' }}>
              {(marketData.fundingRate * 100).toFixed(4)}%
            </span>
          </div>
        </div>
        
        {/* Connection Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ 
            width: '8px', 
            height: '8px', 
            borderRadius: '50%', 
            background: connected ? COLORS.success : COLORS.danger,
            boxShadow: connected ? `0 0 8px ${COLORS.success}` : 'none'
          }}></div>
          <span style={{ fontSize: '11px', color: COLORS.textMuted }}>
            {connected ? 'Live' : 'Offline'}
          </span>
          {user && (
            <span style={{ 
              marginLeft: '12px',
              padding: '4px 10px',
              background: COLORS.background,
              border: `1px solid ${COLORS.border}`,
              borderRadius: '4px',
              fontSize: '11px',
              color: COLORS.textSecondary
            }}>
              {user.email || 'Trader'}
            </span>
          )}
        </div>
      </div>

      {/* 2. ORDER BOOK (LEFT) */}
      <div style={{ gridColumn: '1 / 2', gridRow: '2 / 4', ...panelStyle }}>
        <div style={headerStyle}>
          <span>Order Book</span>
          <span style={{ fontSize: '10px', color: COLORS.warning }}>Spread: ${orderBook.spread}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', color: COLORS.textMuted, fontSize: '10px', marginBottom: '6px', paddingBottom: '4px', borderBottom: `1px solid ${COLORS.border}` }}>
          <span>Price</span>
          <span>Size</span>
          <span>Total</span>
        </div>
        <div style={{ flex: 1, overflowY: 'hidden', display: 'flex', flexDirection: 'column', gap: '1px' }}>
          {/* Asks (Red) */}
          <div style={{ display: 'flex', flexDirection: 'column-reverse', gap: '1px', flex: 1, justifyContent: 'flex-end' }}>
            {orderBook.asks.slice(0, 12).map((ask, i) => {
              const maxTotal = Math.max(...orderBook.asks.map(a => a.total));
              const width = (ask.total / maxTotal) * 100;
              return (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: COLORS.danger, position: 'relative', padding: '2px 0' }}>
                  <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: `${width}%`, background: `${COLORS.danger}15`, zIndex: 0 }}></div>
                  <span style={{ zIndex: 1, fontFamily: 'monospace' }}>{ask.price.toFixed(2)}</span>
                  <span style={{ zIndex: 1, color: COLORS.textSecondary, fontFamily: 'monospace' }}>{ask.size.toFixed(4)}</span>
                  <span style={{ zIndex: 1, color: COLORS.textMuted, fontFamily: 'monospace' }}>{ask.total.toFixed(2)}</span>
                </div>
              );
            })}
          </div>
          
          {/* Spread / Current Price */}
          <div style={{ 
            margin: '8px 0', 
            textAlign: 'center', 
            fontSize: '16px', 
            fontWeight: '700', 
            color: trades.length > 1 && trades[0]?.price > trades[1]?.price ? COLORS.success : COLORS.danger, 
            background: COLORS.background, 
            padding: '8px', 
            borderRadius: '4px',
            border: `1px solid ${COLORS.border}`
          }}>
            ${(marketData.price || trades[0]?.price || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            <span style={{ fontSize: '10px', color: COLORS.textMuted, marginLeft: '6px' }}>USD</span>
          </div>

          {/* Bids (Green) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', flex: 1 }}>
            {orderBook.bids.slice(0, 12).map((bid, i) => {
              const maxTotal = Math.max(...orderBook.bids.map(b => b.total));
              const width = (bid.total / maxTotal) * 100;
              return (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: COLORS.success, position: 'relative', padding: '2px 0' }}>
                  <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: `${width}%`, background: `${COLORS.success}15`, zIndex: 0 }}></div>
                  <span style={{ zIndex: 1, fontFamily: 'monospace' }}>{bid.price.toFixed(2)}</span>
                  <span style={{ zIndex: 1, color: COLORS.textSecondary, fontFamily: 'monospace' }}>{bid.size.toFixed(4)}</span>
                  <span style={{ zIndex: 1, color: COLORS.textMuted, fontFamily: 'monospace' }}>{bid.total.toFixed(2)}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. CHART (CENTER TOP) */}
      <div style={{ gridColumn: '2 / 3', gridRow: '2 / 3', ...panelStyle }}>
        <div style={headerStyle}>
          <span>{symbol} Chart</span>
          <div style={{ display: 'flex', gap: '8px' }}>
            {['1m', '5m', '15m', '1H', '4H', '1D'].map(tf => (
              <span 
                key={tf}
                onClick={() => setTimeframe(tf)}
                style={{ 
                  cursor: 'pointer', 
                  color: timeframe === tf ? COLORS.primary : COLORS.textMuted,
                  fontWeight: timeframe === tf ? '600' : '400',
                  fontSize: '11px',
                  padding: '2px 6px',
                  background: timeframe === tf ? `${COLORS.primary}15` : 'transparent',
                  borderRadius: '3px'
                }}
              >
                {tf}
              </span>
            ))}
          </div>
        </div>
        <div style={{ flex: 1, position: 'relative' }}>
          <Line 
            data={chartData} 
            options={{
              responsive: true,
              maintainAspectRatio: false,
              animation: false,
              scales: {
                y: {
                  grid: { color: `${COLORS.border}50` },
                  ticks: { color: COLORS.textMuted, font: { size: 10 } },
                  position: 'right'
                },
                x: {
                  grid: { display: false },
                  ticks: { display: false }
                }
              },
              plugins: {
                legend: { display: false },
                tooltip: {
                  mode: 'index',
                  intersect: false,
                  backgroundColor: COLORS.backgroundLight,
                  titleColor: COLORS.text,
                  bodyColor: COLORS.text,
                  borderColor: COLORS.border,
                  borderWidth: 1
                }
              },
              interaction: {
                mode: 'nearest',
                axis: 'x',
                intersect: false
              }
            }} 
          />
        </div>
      </div>

      {/* 4. POSITIONS & ORDERS (CENTER BOTTOM) */}
      <div style={{ gridColumn: '2 / 3', gridRow: '3 / 4', ...panelStyle }}>
        <div style={{ display: 'flex', gap: '16px', borderBottom: `1px solid ${COLORS.border}`, paddingBottom: '10px', marginBottom: '10px' }}>
          {[
            { id: 'positions', label: `Positions (${positions.length})` },
            { id: 'orders', label: `Open Orders (${openOrders.length})` },
            { id: 'history', label: 'History' },
            { id: 'logs', label: 'Logs' }
          ].map(tab => (
            <span 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{ 
                color: activeTab === tab.id ? COLORS.text : COLORS.textMuted, 
                fontWeight: activeTab === tab.id ? '600' : '400',
                cursor: 'pointer',
                fontSize: '12px',
                borderBottom: activeTab === tab.id ? `2px solid ${COLORS.primary}` : '2px solid transparent',
                paddingBottom: '8px'
              }}
            >
              {tab.label}
            </span>
          ))}
        </div>
        
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {activeTab === 'positions' && (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', textAlign: 'left' }}>
              <thead>
                <tr style={{ color: COLORS.textMuted }}>
                  <th style={{ padding: '6px 0' }}>Symbol</th>
                  <th>Size</th>
                  <th>Entry</th>
                  <th>Mark</th>
                  <th>Liq. Price</th>
                  <th>PNL (ROE%)</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {positions.map((pos, i) => (
                  <tr key={i} style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                    <td style={{ padding: '8px 0', fontWeight: '600' }}>{pos.symbol}</td>
                    <td style={{ color: pos.side === 'long' ? COLORS.success : COLORS.danger }}>
                      {pos.side === 'long' ? '+' : '-'}{Math.abs(pos.size)}
                    </td>
                    <td>${pos.entryPrice?.toLocaleString()}</td>
                    <td>${pos.markPrice?.toLocaleString()}</td>
                    <td style={{ color: COLORS.warning }}>${pos.liqPrice?.toLocaleString()}</td>
                    <td style={{ color: pos.pnl >= 0 ? COLORS.success : COLORS.danger }}>
                      {pos.pnl >= 0 ? '+' : ''}${pos.pnl?.toLocaleString()} ({pos.roe?.toFixed(2)}%)
                    </td>
                    <td>
                      <button 
                        onClick={() => closePosition(pos)}
                        style={{ 
                          background: COLORS.background, 
                          border: `1px solid ${COLORS.border}`, 
                          color: COLORS.text, 
                          cursor: 'pointer', 
                          padding: '3px 8px', 
                          borderRadius: '3px',
                          fontSize: '10px'
                        }}
                      >
                        Close
                      </button>
                    </td>
                  </tr>
                ))}
                {positions.length === 0 && (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '20px', color: COLORS.textMuted }}>
                      No open positions
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}

          {activeTab === 'orders' && (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', textAlign: 'left' }}>
              <thead>
                <tr style={{ color: COLORS.textMuted }}>
                  <th style={{ padding: '6px 0' }}>Symbol</th>
                  <th>Type</th>
                  <th>Side</th>
                  <th>Price</th>
                  <th>Amount</th>
                  <th>Filled</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {openOrders.map((order, i) => (
                  <tr key={i} style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                    <td style={{ padding: '8px 0' }}>{order.symbol}</td>
                    <td>{order.type}</td>
                    <td style={{ color: order.side === 'buy' ? COLORS.success : COLORS.danger }}>{order.side}</td>
                    <td>${order.price?.toLocaleString()}</td>
                    <td>{order.amount}</td>
                    <td>{order.filled || 0}%</td>
                    <td>
                      <button 
                        onClick={() => cancelOrder(order.id)}
                        style={{ background: 'transparent', border: 'none', color: COLORS.danger, cursor: 'pointer', fontSize: '10px' }}
                      >
                        Cancel
                      </button>
                    </td>
                  </tr>
                ))}
                {openOrders.length === 0 && (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '20px', color: COLORS.textMuted }}>
                      No open orders
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}

          {activeTab === 'logs' && (
            <div style={{ fontFamily: 'monospace', fontSize: '10px' }}>
              {logs.map((log, i) => (
                <div key={i} style={{ padding: '4px 0', borderBottom: `1px solid ${COLORS.border}`, color: COLORS.textSecondary }}>
                  <span style={{ color: COLORS.textMuted }}>[{log.time}]</span> {log.msg}
                </div>
              ))}
              {logs.length === 0 && (
                <div style={{ textAlign: 'center', padding: '20px', color: COLORS.textMuted }}>
                  No logs yet
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      </div>

      {/* 5. ORDER ENTRY (RIGHT TOP) */}
      <div style={{ gridColumn: '3 / 4', gridRow: '2 / 3', ...panelStyle }}>
        {/* Margin Type Toggle */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
          <button 
            onClick={() => setMarginType('cross')}
            style={{ 
              flex: 1, 
              padding: '6px', 
              background: marginType === 'cross' ? COLORS.primary : 'transparent', 
              border: `1px solid ${marginType === 'cross' ? COLORS.primary : COLORS.border}`, 
              color: marginType === 'cross' ? COLORS.background : COLORS.textSecondary, 
              cursor: 'pointer', 
              borderRadius: '4px', 
              fontSize: '11px',
              fontWeight: '500'
            }}
          >Cross</button>
          <button 
            onClick={() => setMarginType('isolated')}
            style={{ 
              flex: 1, 
              padding: '6px', 
              background: marginType === 'isolated' ? COLORS.primary : 'transparent', 
              border: `1px solid ${marginType === 'isolated' ? COLORS.primary : COLORS.border}`, 
              color: marginType === 'isolated' ? COLORS.background : COLORS.textSecondary, 
              cursor: 'pointer', 
              borderRadius: '4px', 
              fontSize: '11px',
              fontWeight: '500'
            }}
          >Isolated</button>
          <div style={{ 
            padding: '6px 12px', 
            background: COLORS.background, 
            border: `1px solid ${COLORS.border}`, 
            borderRadius: '4px',
            fontSize: '11px',
            fontWeight: '600',
            color: COLORS.warning
          }}>{leverage}x</div>
        </div>

        {/* Order Type Tabs */}
        <div style={{ display: 'flex', gap: '2px', background: COLORS.background, padding: '3px', borderRadius: '6px', marginBottom: '12px' }}>
          {['limit', 'market', 'stop'].map(type => (
            <button 
              key={type}
              onClick={() => setOrderType(type)}
              style={{ 
                flex: 1, 
                padding: '7px', 
                background: orderType === type ? COLORS.backgroundLight : 'transparent', 
                border: 'none', 
                color: orderType === type ? COLORS.text : COLORS.textMuted, 
                cursor: 'pointer', 
                borderRadius: '4px', 
                fontSize: '11px',
                fontWeight: orderType === type ? '600' : '400',
                textTransform: 'capitalize'
              }}
            >{type}</button>
          ))}
        </div>

        {/* Available Balance */}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: COLORS.textMuted, marginBottom: '8px' }}>
          <span>Available:</span>
          <span style={{ color: COLORS.text }}>100,000.00 USDT</span>
        </div>

        {/* Price Input */}
        <div style={{ marginBottom: '10px' }}>
          <label style={{ display: 'block', marginBottom: '4px', color: COLORS.textMuted, fontSize: '10px' }}>Price</label>
          <div style={{ display: 'flex', background: COLORS.background, border: `1px solid ${COLORS.border}`, borderRadius: '6px', alignItems: 'center' }}>
            <input 
              type="number" 
              value={price} 
              onChange={e => setPrice(e.target.value)}
              disabled={orderType === 'market'}
              style={{ 
                flex: 1, 
                padding: '10px 12px', 
                background: 'transparent', 
                border: 'none', 
                color: orderType === 'market' ? COLORS.textMuted : COLORS.text, 
                outline: 'none',
                fontSize: '13px'
              }}
            />
            <span style={{ padding: '0 12px', color: COLORS.textMuted, fontSize: '11px' }}>USDT</span>
          </div>
        </div>

        {/* Quantity Input */}
        <div style={{ marginBottom: '10px' }}>
          <label style={{ display: 'block', marginBottom: '4px', color: COLORS.textMuted, fontSize: '10px' }}>Quantity</label>
          <div style={{ display: 'flex', background: COLORS.background, border: `1px solid ${COLORS.border}`, borderRadius: '6px', alignItems: 'center' }}>
            <input 
              type="number" 
              value={quantity} 
              onChange={e => setQuantity(e.target.value)}
              step="0.01"
              style={{ 
                flex: 1, 
                padding: '10px 12px', 
                background: 'transparent', 
                border: 'none', 
                color: COLORS.text, 
                outline: 'none',
                fontSize: '13px'
              }}
            />
            <span style={{ padding: '0 12px', color: COLORS.textMuted, fontSize: '11px' }}>{symbol.split('/')[0]}</span>
          </div>
        </div>

        {/* Percentage Buttons */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '12px' }}>
          {[25, 50, 75, 100].map(pct => (
            <button 
              key={pct}
              onClick={() => setQuantity((100000 / price * pct / 100 / leverage).toFixed(4))}
              style={{ 
                flex: 1, 
                padding: '6px', 
                background: COLORS.background, 
                border: `1px solid ${COLORS.border}`, 
                color: COLORS.textSecondary, 
                cursor: 'pointer', 
                borderRadius: '4px',
                fontSize: '10px'
              }}
            >{pct}%</button>
          ))}
        </div>

        {/* Leverage Slider */}
        <div style={{ marginBottom: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: COLORS.textMuted, marginBottom: '4px' }}>
            <span>Leverage</span>
            <span style={{ color: COLORS.warning }}>{leverage}x</span>
          </div>
          <input 
            type="range"
            min="1"
            max="100"
            value={leverage}
            onChange={(e) => setLeverage(Number(e.target.value))}
            style={{ width: '100%', accentColor: COLORS.primary }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: COLORS.textMuted }}>
            <span>1x</span>
            <span>25x</span>
            <span>50x</span>
            <span>75x</span>
            <span>100x</span>
          </div>
        </div>

        {/* Stop Price (conditional) */}
        {orderType === 'stop' && (
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', marginBottom: '4px', color: COLORS.danger, fontSize: '10px' }}>Trigger Price</label>
            <input 
              type="number" 
              value={stopPrice} 
              onChange={e => setStopPrice(e.target.value)}
              style={{ 
                width: '100%', 
                padding: '10px 12px', 
                background: COLORS.background, 
                border: `1px solid ${COLORS.danger}`, 
                color: COLORS.text, 
                borderRadius: '6px', 
                boxSizing: 'border-box',
                fontSize: '13px'
              }}
            />
          </div>
        )}

        {/* Buy/Sell Buttons */}
        <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
          <button 
            onClick={() => submitOrder('buy')}
            disabled={orderSubmitting}
            style={{ 
              flex: 1, 
              padding: '12px', 
              background: COLORS.success, 
              border: 'none', 
              cursor: orderSubmitting ? 'not-allowed' : 'pointer', 
              fontWeight: '600', 
              borderRadius: '6px', 
              color: '#fff', 
              fontSize: '13px',
              opacity: orderSubmitting ? 0.6 : 1
            }}
          >
            {orderSubmitting ? '...' : 'Buy / Long'}
          </button>
          <button 
            onClick={() => submitOrder('sell')}
            disabled={orderSubmitting}
            style={{ 
              flex: 1, 
              padding: '12px', 
              background: COLORS.danger, 
              border: 'none', 
              cursor: orderSubmitting ? 'not-allowed' : 'pointer', 
              fontWeight: '600', 
              color: 'white', 
              borderRadius: '6px', 
              fontSize: '13px',
              opacity: orderSubmitting ? 0.6 : 1
            }}
          >
            {orderSubmitting ? '...' : 'Sell / Short'}
          </button>
        </div>
      </div>

      {/* 6. RECENT TRADES (RIGHT BOTTOM) */}
      <div style={{ gridColumn: '3 / 4', gridRow: '3 / 4', ...panelStyle }}>
        <h3 style={headerStyle}>Recent Trades</h3>
        <div style={{ display: 'flex', justifyContent: 'space-between', color: COLORS.textMuted, fontSize: '10px', marginBottom: '6px', paddingBottom: '4px', borderBottom: `1px solid ${COLORS.border}` }}>
          <span>Time</span>
          <span>Price</span>
          <span>Qty</span>
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <div style={{ fontSize: '10px', fontFamily: 'monospace' }}>
            {trades.map((trade, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0' }}>
                <span style={{ color: COLORS.textMuted }}>
                  {trade.timestamp ? new Date(trade.timestamp * 1000).toLocaleTimeString() : new Date().toLocaleTimeString()}
                </span>
                <span style={{ color: trade.side === 'buy' ? COLORS.success : COLORS.danger }}>
                  {trade.price?.toFixed(2)}
                </span>
                <span style={{ color: COLORS.textSecondary }}>{trade.quantity?.toFixed(4)}</span>
              </div>
            ))}
            {trades.length === 0 && (
              <div style={{ textAlign: 'center', padding: '20px', color: COLORS.textMuted }}>
                Waiting for trades...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
