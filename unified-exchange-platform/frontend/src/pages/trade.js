// 👑 UNIFIED EXCHANGE - TRADING INTERFACE
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
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
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

export default function Trade() {
  const [symbol, setSymbol] = useState("BTC-USD");
  const [price, setPrice] = useState(50000);
  const [quantity, setQuantity] = useState(1.0);
  const [orderType, setOrderType] = useState("limit");
  const [stopPrice, setStopPrice] = useState("");
  const [visibleQty, setVisibleQty] = useState("");
  
  const [ws, setWs] = useState(null);
  const [logs, setLogs] = useState([]);
  const [trades, setTrades] = useState([]);
  const [user, setUser] = useState(null);
  
  // Chart Data State
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        label: 'Price',
        data: [],
        borderColor: '#00ff88',
        backgroundColor: 'rgba(0, 255, 136, 0.5)',
        tension: 0.1,
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
        backgroundColor: 'rgba(0, 255, 136, 0.5)',
        tension: 0.1,
      }]
    });
    setTrades([]);
  }, [symbol]);

  useEffect(() => {
    // Get User from LocalStorage (set by Login)
    const token = localStorage.getItem('token');
    if (token) {
        // Decode token or fetch profile (Mock for now: assume we have user info)
        // In real app: await axios.get('/user/profile')
        setUser({ id: "user_" + Math.floor(Math.random() * 1000) }); // Temp random ID if not logged in
    }

    // Connect to Order Gateway WebSocket
    const socket = new WebSocket(WS_URL);
    
    socket.onopen = () => {
      addLog('Connected to Matching Engine Gateway');
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.symbol && data.price) {
        // Only process trades for the selected symbol
        // Note: In a real app, we would subscribe to specific channels
        // Here we filter client-side for simplicity
        if (data.symbol !== symbol) return;

        // It's a trade execution!
        setTrades(prev => [data, ...prev].slice(0, 20));
        
        // Update Chart
        setChartData(prev => {
          const newLabels = [...prev.labels, new Date().toLocaleTimeString()];
          const newData = [...prev.datasets[0].data, data.price];
          
          // Keep only last 20 points
          if (newLabels.length > 20) {
            newLabels.shift();
            newData.shift();
          }

          return {
            ...prev,
            labels: newLabels,
            datasets: [{ ...prev.datasets[0], data: newData }]
          };
        });

      } else {
        // It's a system message or ack
        // addLog(`Received: ${JSON.stringify(data)}`);
      }
    };

    setWs(socket);

    return () => socket.close();
  }, [symbol]); // Re-connect or re-filter when symbol changes (simplified)

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
      stop_price: stopPrice ? parseFloat(stopPrice) : null,
      visible_quantity: visibleQty ? parseFloat(visibleQty) : null
    };
    
    ws.send(JSON.stringify(order));
    addLog(`Sent ${side.toUpperCase()} ${orderType.toUpperCase()} Order for ${symbol}`);
  };

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#000', color: '#fff', fontFamily: 'monospace' }}>
      {/* Chart Area */}
      <div style={{ flex: 3, borderRight: '1px solid #333', padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2>{symbol} Perpetual</h2>
          <select 
            value={symbol} 
            onChange={(e) => setSymbol(e.target.value)}
            style={{ padding: '10px', background: '#222', color: '#fff', border: '1px solid #444', borderRadius: '4px' }}
          >
            {ASSETS.map(a => (
              <option key={a.symbol} value={a.symbol}>{a.symbol} ({a.type})</option>
            ))}
          </select>
        </div>

        <div style={{ height: '400px', background: '#111', padding: '10px', border: '1px solid #333', borderRadius: '8px' }}>
          <Line 
            data={chartData} 
            options={{
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                y: {
                  grid: { color: '#333' },
                  ticks: { color: '#888' }
                },
                x: {
                  grid: { display: false },
                  ticks: { display: false } // Hide time labels for cleaner look
                }
              },
              plugins: {
                legend: { display: false }
              }
            }} 
          />
        </div>
        
        <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
          <div style={{ flex: 1 }}>
            <h3>Recent Trades</h3>
            <div style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>
              {trades.map((trade, i) => (
                <div key={i} style={{ padding: '5px', borderBottom: '1px solid #222', color: '#00ff88' }}>
                  {new Date(trade.timestamp * 1000).toLocaleTimeString()} - {trade.price.toFixed(2)} ({trade.quantity})
                </div>
              ))}
              {trades.length === 0 && <div style={{ color: '#444' }}>No trades yet</div>}
            </div>
          </div>
          
          <div style={{ flex: 1 }}>
            <h3>System Logs</h3>
            <div style={{ fontFamily: 'monospace', color: '#888', fontSize: '0.8rem' }}>
              {logs.map((log, i) => <div key={i}>{log}</div>)}
            </div>
          </div>
        </div>
      </div>

      {/* Order Entry */}
      <div style={{ flex: 1, padding: '20px', backgroundColor: '#1a1a1a' }}>
        <h3>Place Order</h3>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', color: '#888' }}>Order Type</label>
          <select 
            value={orderType} 
            onChange={(e) => setOrderType(e.target.value)}
            style={{ width: '100%', padding: '10px', background: '#333', border: 'none', color: 'white', borderRadius: '4px' }}
          >
            <option value="limit">Limit</option>
            <option value="market">Market</option>
            <option value="stop">Stop Loss</option>
            <option value="iceberg">Iceberg</option>
          </select>
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label style={{ display: 'block', marginBottom: '5px', color: '#888' }}>Price (USD)</label>
          <input 
            type="number" 
            value={price} 
            onChange={e => setPrice(e.target.value)}
            disabled={orderType === 'market'}
            style={{ width: '100%', padding: '10px', background: '#333', border: 'none', color: 'white', borderRadius: '4px', opacity: orderType === 'market' ? 0.5 : 1 }}
          />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label style={{ display: 'block', marginBottom: '5px', color: '#888' }}>Quantity</label>
          <input 
            type="number" 
            value={quantity} 
            onChange={e => setQuantity(e.target.value)}
            style={{ width: '100%', padding: '10px', background: '#333', border: 'none', color: 'white', borderRadius: '4px' }}
          />
        </div>

        {orderType === 'stop' && (
          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block', marginBottom: '5px', color: '#ff5555' }}>Trigger Price</label>
            <input 
              type="number" 
              value={stopPrice} 
              onChange={e => setStopPrice(e.target.value)}
              placeholder="Trigger Price"
              style={{ width: '100%', padding: '10px', background: '#333', border: '1px solid #ff5555', color: 'white', borderRadius: '4px' }}
            />
          </div>
        )}

        {orderType === 'iceberg' && (
          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block', marginBottom: '5px', color: '#55aaff' }}>Visible Qty</label>
            <input 
              type="number" 
              value={visibleQty} 
              onChange={e => setVisibleQty(e.target.value)}
              placeholder="Visible Amount"
              style={{ width: '100%', padding: '10px', background: '#333', border: '1px solid #55aaff', color: 'white', borderRadius: '4px' }}
            />
          </div>
        )}

        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
          <button 
            onClick={() => sendOrder('buy')}
            style={{ flex: 1, padding: '15px', background: '#00ff88', border: 'none', cursor: 'pointer', fontWeight: 'bold', borderRadius: '4px' }}
          >
            BUY / LONG
          </button>
          <button 
            onClick={() => sendOrder('sell')}
            style={{ flex: 1, padding: '15px', background: '#ff0055', border: 'none', cursor: 'pointer', fontWeight: 'bold', color: 'white', borderRadius: '4px' }}
          >
            SELL / SHORT
          </button>
        </div>
      </div>
    </div>
  );
}
