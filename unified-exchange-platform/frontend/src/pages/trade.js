// 👑 UNIFIED EXCHANGE - TRADING INTERFACE
import { useState, useEffect, useRef } from 'react';

export default function Trade() {
  const [price, setPrice] = useState(50000);
  const [ws, setWs] = useState(null);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    // Connect to Order Gateway WebSocket
    const socket = new WebSocket('ws://localhost:8080/ws/orders');
    
    socket.onopen = () => {
      addLog('Connected to Matching Engine Gateway');
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      addLog(`Received: ${JSON.stringify(data)}`);
    };

    setWs(socket);

    return () => socket.close();
  }, []);

  const addLog = (msg) => {
    setLogs(prev => [msg, ...prev].slice(0, 10));
  };

  const sendOrder = (side) => {
    if (!ws) return;
    const order = {
      user_id: "user_1", // Mock
      symbol: "BTC-USD",
      side: side,
      price: parseFloat(price),
      quantity: 1.0,
      order_type: "limit"
    };
    ws.send(JSON.stringify(order));
    addLog(`Sent ${side.toUpperCase()} Order @ ${price}`);
  };

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#000', color: '#fff', fontFamily: 'monospace' }}>
      {/* Chart Area */}
      <div style={{ flex: 3, borderRight: '1px solid #333', padding: '20px' }}>
        <h2>BTC-USD Perpetual</h2>
        <div style={{ height: '400px', background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          [TradingView Chart Placeholder]
        </div>
        <h3>Live Logs</h3>
        <div style={{ fontFamily: 'monospace', color: '#888' }}>
          {logs.map((log, i) => <div key={i}>{log}</div>)}
        </div>
      </div>

      {/* Order Entry */}
      <div style={{ flex: 1, padding: '20px', backgroundColor: '#1a1a1a' }}>
        <h3>Place Order</h3>
        <div style={{ marginBottom: '10px' }}>
          <label>Price (USD)</label>
          <input 
            type="number" 
            value={price} 
            onChange={e => setPrice(e.target.value)}
            style={{ width: '100%', padding: '10px', background: '#333', border: 'none', color: 'white' }}
          />
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={() => sendOrder('buy')}
            style={{ flex: 1, padding: '15px', background: '#00ff88', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
          >
            BUY / LONG
          </button>
          <button 
            onClick={() => sendOrder('sell')}
            style={{ flex: 1, padding: '15px', background: '#ff0055', border: 'none', cursor: 'pointer', fontWeight: 'bold', color: 'white' }}
          >
            SELL / SHORT
          </button>
        </div>
      </div>
    </div>
  );
}
