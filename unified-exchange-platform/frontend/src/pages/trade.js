// 👑 UNIFIED EXCHANGE - PROFESSIONAL TRADING TERMINAL
import { useState, useEffect, useRef } from 'react';
import { WS_URL } from '../config';
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

const ASSETS = [
  { symbol: "BTC-USD", type: "Crypto" },
  { symbol: "ETH-USD", type: "Crypto" },
  { symbol: "EUR-USD", type: "Forex" },
  { symbol: "GBP-USD", type: "Forex" },
  { symbol: "AAPL", type: "Stock" },
  { symbol: "TSLA", type: "Stock" },
  { symbol: "US10Y", type: "Bond" },
  { symbol: "SPY", type: "ETF" },
  { symbol: "GOLD", type: "Commodity" },
  { symbol: "OIL", type: "Commodity" },
  { symbol: "TSLA-OPT", type: "Option" },
  { symbol: "ES-FUT", type: "Future" }
];

// Mock Order Book Data Generator
const generateOrderBook = (basePrice) => {
  const bids = [];
  const asks = [];
  for (let i = 1; i <= 15; i++) {
    bids.push({ price: basePrice - i * (basePrice * 0.0005), size: Math.random() * 2 + 0.1 });
    asks.push({ price: basePrice + i * (basePrice * 0.0005), size: Math.random() * 2 + 0.1 });
  }
  return { bids, asks };
};

export default function Trade() {
  const [symbol, setSymbol] = useState("BTC-USD");
  const [price, setPrice] = useState(50000);
  const [quantity, setQuantity] = useState(1.0);
  const [orderType, setOrderType] = useState("limit");
  const [stopPrice, setStopPrice] = useState("");
  
  const [ws, setWs] = useState(null);
  const [logs, setLogs] = useState([]);
  const [trades, setTrades] = useState([]);
  const [orderBook, setOrderBook] = useState({ bids: [], asks: [] });
  const [user, setUser] = useState(null);
  
  // New State for Positions
  const [positions, setPositions] = useState([
    { symbol: "BTC-USD", size: 0.5, entryPrice: 48000, markPrice: 50000, pnl: 1000, roe: 4.16 },
    { symbol: "ETH-USD", size: -10, entryPrice: 3500, markPrice: 3400, pnl: 1000, roe: 2.85 }
  ]);
  
  // Chart Data State
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        label: 'Price',
        data: [],
        borderColor: '#00ff88',
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 400);
          gradient.addColorStop(0, 'rgba(0, 255, 136, 0.2)');
          gradient.addColorStop(1, 'rgba(0, 255, 136, 0)');
          return gradient;
        },
        borderWidth: 2,
        pointRadius: 0,
        fill: true,
        tension: 0.4,
      },
    ],
  });

  // Reset chart when symbol changes
  useEffect(() => {
    setChartData({
      labels: [],
      datasets: [{
        label: `${symbol} Price`,
        data: [],
        borderColor: '#00ff88',
        backgroundColor: 'rgba(0, 255, 136, 0.1)',
        borderWidth: 2,
        pointRadius: 0,
        fill: true,
        tension: 0.4,
      }]
    });
    setTrades([]);
    setOrderBook(generateOrderBook(price)); // Initial mock book
  }, [symbol]);

  useEffect(() => {
    // Get User from LocalStorage (set by Login)
    const token = localStorage.getItem('token');
    if (token) {
        setUser({ id: "user_" + Math.floor(Math.random() * 1000) }); 
    }

    // Connect to Order Gateway WebSocket
    const socket = new WebSocket(WS_URL);
    
    socket.onopen = () => {
      addLog('Connected to Matching Engine Gateway');
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.symbol && data.price) {
        if (data.symbol !== symbol) return;

        // It's a trade execution!
        setTrades(prev => [data, ...prev].slice(0, 30));
        
        // Update Chart
        setChartData(prev => {
          const newLabels = [...prev.labels, new Date().toLocaleTimeString()];
          const newData = [...prev.datasets[0].data, data.price];
          
          if (newLabels.length > 50) {
            newLabels.shift();
            newData.shift();
          }

          return {
            ...prev,
            labels: newLabels,
            datasets: [{ ...prev.datasets[0], data: newData }]
          };
        });

        // Update Mock Order Book based on last price
        setOrderBook(generateOrderBook(data.price));

      } else {
        // System message
      }
    };

    setWs(socket);

    return () => socket.close();
  }, [symbol]);

  const addLog = (msg) => {
    setLogs(prev => [msg, ...prev].slice(0, 10));
  };

  const sendOrder = (side) => {
    if (!ws) return;
    
    const order = {
      user_id: user ? user.id : "guest",
      symbol: symbol,
      side: side,
      price: parseFloat(price),
      quantity: parseFloat(quantity),
      order_type: orderType,
      stop_price: stopPrice ? parseFloat(stopPrice) : null
    };
    
    ws.send(JSON.stringify(order));
    addLog(`Sent ${side.toUpperCase()} ${orderType.toUpperCase()} Order for ${symbol}`);
  };

  // --- STYLES ---
  const panelStyle = {
    background: '#161b22',
    border: '1px solid #30363d',
    borderRadius: '6px',
    padding: '12px',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  };

  const headerStyle = {
    margin: '0 0 10px 0',
    fontSize: '13px',
    color: '#8b949e',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    fontWeight: '600',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  };

  return (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: '280px 1fr 320px', 
      gridTemplateRows: '50px 1fr 250px',
      gap: '8px',
      height: '100vh', 
      backgroundColor: '#0d1117', 
      color: '#c9d1d9', 
      fontFamily: '"JetBrains Mono", "Fira Code", monospace',
      padding: '8px',
      boxSizing: 'border-box'
    }}>
      
      {/* 1. HEADER / NAVBAR */}
      <div style={{ gridColumn: '1 / -1', ...panelStyle, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <h1 style={{ margin: 0, fontSize: '18px', color: '#00ff88', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span>⚡</span> UNIFIED EXCHANGE
          </h1>
          <div style={{ height: '20px', width: '1px', background: '#30363d' }}></div>
          <select 
            value={symbol} 
            onChange={(e) => setSymbol(e.target.value)}
            style={{ padding: '6px 12px', background: '#21262d', color: '#fff', border: '1px solid #30363d', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            {ASSETS.map(a => (
              <option key={a.symbol} value={a.symbol}>{a.symbol} ({a.type})</option>
            ))}
          </select>
        </div>
        <div style={{ display: 'flex', gap: '30px', fontSize: '13px' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ color: '#8b949e', fontSize: '11px' }}>Mark Price</span>
            <span style={{ color: '#fff', fontWeight: 'bold' }}>{trades[0]?.price.toFixed(2) || '---'}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ color: '#8b949e', fontSize: '11px' }}>24h Change</span>
            <span style={{ color: '#3fb950', fontWeight: 'bold' }}>+2.45%</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ color: '#8b949e', fontSize: '11px' }}>24h Volume</span>
            <span style={{ color: '#fff', fontWeight: 'bold' }}>$1.2B</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ color: '#8b949e', fontSize: '11px' }}>Funding / 8h</span>
            <span style={{ color: '#ffab00', fontWeight: 'bold' }}>0.0100%</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
           <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: ws ? '#3fb950' : '#ff7b72' }}></div>
           <span style={{ fontSize: '12px', color: '#8b949e' }}>{ws ? 'Connected' : 'Disconnected'}</span>
        </div>
      </div>

      {/* 2. ORDER BOOK (LEFT) */}
      <div style={{ gridColumn: '1 / 2', gridRow: '2 / 4', ...panelStyle }}>
        <div style={headerStyle}>
          <span>Order Book</span>
          <span style={{ fontSize: '11px', opacity: 0.7 }}>Spread: 0.50</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#8b949e', fontSize: '11px', marginBottom: '8px', paddingBottom: '4px', borderBottom: '1px solid #21262d' }}>
          <span>Price (USD)</span>
          <span>Size ({symbol.split('-')[0]})</span>
          <span>Total</span>
        </div>
        <div style={{ flex: 1, overflowY: 'hidden', display: 'flex', flexDirection: 'column', gap: '1px' }}>
          {/* Asks (Red) */}
          <div style={{ display: 'flex', flexDirection: 'column-reverse', gap: '1px', flex: 1, justifyContent: 'flex-end' }}>
            {orderBook.asks.map((ask, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#ff7b72', position: 'relative', padding: '1px 0' }}>
                <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: `${Math.random() * 100}%`, background: 'rgba(255, 123, 114, 0.1)', zIndex: 0 }}></div>
                <span style={{ zIndex: 1 }}>{ask.price.toFixed(2)}</span>
                <span style={{ zIndex: 1, color: '#c9d1d9' }}>{ask.size.toFixed(4)}</span>
                <span style={{ zIndex: 1, color: '#8b949e' }}>{(ask.price * ask.size).toFixed(0)}</span>
              </div>
            ))}
          </div>
          
          <div style={{ margin: '12px 0', textAlign: 'center', fontSize: '18px', fontWeight: 'bold', color: trades[0]?.price > trades[1]?.price ? '#3fb950' : '#ff7b72', background: '#21262d', padding: '8px', borderRadius: '4px' }}>
            {trades[0]?.price.toFixed(2) || '---'} <span style={{ fontSize: '12px', color: '#8b949e' }}>USD</span>
          </div>

          {/* Bids (Green) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', flex: 1 }}>
            {orderBook.bids.map((bid, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#3fb950', position: 'relative', padding: '1px 0' }}>
                <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: `${Math.random() * 100}%`, background: 'rgba(63, 185, 80, 0.1)', zIndex: 0 }}></div>
                <span style={{ zIndex: 1 }}>{bid.price.toFixed(2)}</span>
                <span style={{ zIndex: 1, color: '#c9d1d9' }}>{bid.size.toFixed(4)}</span>
                <span style={{ zIndex: 1, color: '#8b949e' }}>{(bid.price * bid.size).toFixed(0)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. CHART (CENTER TOP) */}
      <div style={{ gridColumn: '2 / 3', gridRow: '2 / 3', ...panelStyle }}>
        <div style={headerStyle}>
          <span>Price Chart</span>
          <div style={{ display: 'flex', gap: '10px' }}>
            <span style={{ cursor: 'pointer', color: '#fff' }}>15m</span>
            <span style={{ cursor: 'pointer' }}>1H</span>
            <span style={{ cursor: 'pointer' }}>4H</span>
            <span style={{ cursor: 'pointer' }}>1D</span>
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
                  grid: { color: '#21262d' },
                  ticks: { color: '#8b949e' },
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
                  backgroundColor: '#161b22',
                  titleColor: '#c9d1d9',
                  bodyColor: '#c9d1d9',
                  borderColor: '#30363d',
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
        <div style={{ display: 'flex', gap: '20px', borderBottom: '1px solid #30363d', paddingBottom: '10px', marginBottom: '10px' }}>
          <span style={{ color: '#fff', fontWeight: 'bold', cursor: 'pointer', borderBottom: '2px solid #00ff88' }}>Positions (2)</span>
          <span style={{ color: '#8b949e', cursor: 'pointer' }}>Open Orders (0)</span>
          <span style={{ color: '#8b949e', cursor: 'pointer' }}>Order History</span>
          <span style={{ color: '#8b949e', cursor: 'pointer' }}>Trade History</span>
        </div>
        
        <div style={{ overflowY: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
            <thead>
              <tr style={{ color: '#8b949e' }}>
                <th style={{ padding: '8px 0' }}>Symbol</th>
                <th>Size</th>
                <th>Entry Price</th>
                <th>Mark Price</th>
                <th>Liq. Price</th>
                <th>Margin Ratio</th>
                <th>PNL (ROE%)</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {positions.map((pos, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #21262d' }}>
                  <td style={{ padding: '8px 0', fontWeight: 'bold' }}>{pos.symbol}</td>
                  <td style={{ color: pos.size > 0 ? '#3fb950' : '#ff7b72' }}>{pos.size}</td>
                  <td>{pos.entryPrice.toLocaleString()}</td>
                  <td>{pos.markPrice.toLocaleString()}</td>
                  <td style={{ color: '#ffab00' }}>{(pos.entryPrice * 0.8).toLocaleString()}</td>
                  <td>2.45%</td>
                  <td style={{ color: '#3fb950' }}>+${pos.pnl} ({pos.roe}%)</td>
                  <td>
                    <button style={{ background: '#21262d', border: '1px solid #30363d', color: '#c9d1d9', cursor: 'pointer', padding: '2px 6px', borderRadius: '2px' }}>Close</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. ORDER ENTRY (RIGHT TOP) */}
      <div style={{ gridColumn: '3 / 4', gridRow: '2 / 3', ...panelStyle }}>
        <div style={{ display: 'flex', gap: '2px', background: '#21262d', padding: '2px', borderRadius: '4px', marginBottom: '15px' }}>
          <button 
            onClick={() => setOrderType('limit')}
            style={{ flex: 1, padding: '6px', background: orderType === 'limit' ? '#30363d' : 'transparent', border: 'none', color: '#fff', cursor: 'pointer', borderRadius: '2px', fontSize: '12px' }}
          >Limit</button>
          <button 
            onClick={() => setOrderType('market')}
            style={{ flex: 1, padding: '6px', background: orderType === 'market' ? '#30363d' : 'transparent', border: 'none', color: '#fff', cursor: 'pointer', borderRadius: '2px', fontSize: '12px' }}
          >Market</button>
          <button 
            onClick={() => setOrderType('stop')}
            style={{ flex: 1, padding: '6px', background: orderType === 'stop' ? '#30363d' : 'transparent', border: 'none', color: '#fff', cursor: 'pointer', borderRadius: '2px', fontSize: '12px' }}
          >Stop</button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#8b949e', marginBottom: '5px' }}>
          <span>Avail:</span>
          <span style={{ color: '#fff' }}>100,000.00 USD</span>
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', marginBottom: '6px', color: '#8b949e', fontSize: '11px' }}>Price (USD)</label>
          <div style={{ display: 'flex', background: '#0d1117', border: '1px solid #30363d', borderRadius: '4px', alignItems: 'center' }}>
            <input 
              type="number" 
              value={price} 
              onChange={e => setPrice(e.target.value)}
              disabled={orderType === 'market'}
              style={{ flex: 1, padding: '10px', background: 'transparent', border: 'none', color: 'white', outline: 'none' }}
            />
            <span style={{ padding: '0 10px', color: '#8b949e', fontSize: '12px' }}>USD</span>
          </div>
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', marginBottom: '6px', color: '#8b949e', fontSize: '11px' }}>Quantity</label>
          <div style={{ display: 'flex', background: '#0d1117', border: '1px solid #30363d', borderRadius: '4px', alignItems: 'center' }}>
            <input 
              type="number" 
              value={quantity} 
              onChange={e => setQuantity(e.target.value)}
              style={{ flex: 1, padding: '10px', background: 'transparent', border: 'none', color: 'white', outline: 'none' }}
            />
            <span style={{ padding: '0 10px', color: '#8b949e', fontSize: '12px' }}>{symbol.split('-')[0]}</span>
          </div>
        </div>

        {/* Percentage Slider Mock */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '20px' }}>
          {[25, 50, 75, 100].map(pct => (
            <div key={pct} style={{ flex: 1, background: '#21262d', height: '4px', borderRadius: '2px', cursor: 'pointer' }}></div>
          ))}
        </div>

        {orderType === 'stop' && (
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '6px', color: '#ff7b72', fontSize: '11px' }}>Trigger Price</label>
            <input 
              type="number" 
              value={stopPrice} 
              onChange={e => setStopPrice(e.target.value)}
              style={{ width: '100%', padding: '10px', background: '#0d1117', border: '1px solid #ff7b72', color: 'white', borderRadius: '4px', boxSizing: 'border-box' }}
            />
          </div>
        )}

        <div style={{ display: 'flex', gap: '10px', marginTop: 'auto' }}>
          <button 
            onClick={() => sendOrder('buy')}
            style={{ flex: 1, padding: '12px', background: '#238636', border: 'none', cursor: 'pointer', fontWeight: 'bold', borderRadius: '4px', color: '#fff', fontSize: '14px' }}
          >
            Buy / Long
          </button>
          <button 
            onClick={() => sendOrder('sell')}
            style={{ flex: 1, padding: '12px', background: '#da3633', border: 'none', cursor: 'pointer', fontWeight: 'bold', color: 'white', borderRadius: '4px', fontSize: '14px' }}
          >
            Sell / Short
          </button>
        </div>
      </div>

      {/* 6. RECENT TRADES (RIGHT BOTTOM) */}
      <div style={{ gridColumn: '3 / 4', gridRow: '3 / 4', ...panelStyle }}>
        <h3 style={headerStyle}>Recent Trades</h3>
        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#8b949e', fontSize: '11px', marginBottom: '5px', paddingBottom: '5px', borderBottom: '1px solid #21262d' }}>
          <span>Time</span>
          <span>Price</span>
          <span>Qty</span>
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <div style={{ fontSize: '11px' }}>
            {trades.map((trade, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
                <span style={{ color: '#8b949e' }}>{new Date(trade.timestamp * 1000).toLocaleTimeString()}</span>
                <span style={{ color: trade.side === 'buy' ? '#3fb950' : '#ff7b72' }}>{trade.price.toFixed(2)}</span>
                <span style={{ color: '#c9d1d9' }}>{trade.quantity}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
