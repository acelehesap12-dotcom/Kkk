// 👑 UNIFIED EXCHANGE - QUANT STUDIO
// User Strategy Builder, Backtest, Custom Indicators

import { useState, useEffect } from 'react';
import Link from 'next/link';

const SAMPLE_STRATEGIES = [
  { id: 1, name: "BTC Momentum", type: "Long Only", returns: "+45.2%", sharpe: 1.85, status: "active" },
  { id: 2, name: "Mean Reversion ETH", type: "Long/Short", returns: "+28.5%", sharpe: 1.42, status: "paper" },
  { id: 3, name: "Forex Carry Trade", type: "Multi-Asset", returns: "+12.8%", sharpe: 2.10, status: "backtest" },
];

const SAMPLE_INDICATORS = [
  { name: "RSI(14)", value: 62.5, signal: "Neutral" },
  { name: "MACD", value: "125.4", signal: "Bullish" },
  { name: "Bollinger Bands", value: "Upper", signal: "Overbought" },
  { name: "Volume Profile", value: "High", signal: "Accumulation" },
];

const SAMPLE_CODE = `# k99 Quant Studio - Strategy Template
# Language: Python (Sandboxed)

from k99_sdk import Strategy, Indicator, Order

class MyStrategy(Strategy):
    """
    Simple Moving Average Crossover Strategy
    """
    
    def __init__(self):
        self.fast_period = 20
        self.slow_period = 50
        self.position_size = 0.1  # 10% of portfolio
        
    def on_bar(self, bar):
        # Calculate indicators
        fast_ma = Indicator.SMA(bar.close, self.fast_period)
        slow_ma = Indicator.SMA(bar.close, self.slow_period)
        
        # Entry Logic
        if fast_ma > slow_ma and not self.has_position():
            self.buy(
                symbol=bar.symbol,
                quantity=self.position_size,
                order_type="MARKET"
            )
            
        # Exit Logic
        elif fast_ma < slow_ma and self.has_position():
            self.sell(
                symbol=bar.symbol,
                quantity=self.position_size,
                order_type="MARKET"
            )
            
    def on_fill(self, fill):
        self.log(f"Order filled: {fill.symbol} @ {fill.price}")

# Register strategy
strategy = MyStrategy()
`;

export default function QuantStudio() {
  const [activeTab, setActiveTab] = useState('strategies');
  const [code, setCode] = useState(SAMPLE_CODE);
  const [backtestResults, setBacktestResults] = useState(null);
  const [isRunning, setIsRunning] = useState(false);

  const runBacktest = () => {
    setIsRunning(true);
    // Simulate backtest
    setTimeout(() => {
      setBacktestResults({
        totalReturn: 45.2,
        sharpeRatio: 1.85,
        maxDrawdown: -12.5,
        winRate: 58.3,
        trades: 142,
        profitFactor: 1.72
      });
      setIsRunning(false);
    }, 2000);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff', fontFamily: 'monospace' }}>
      {/* Header */}
      <div style={{ borderBottom: '1px solid #222', padding: '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href="/">
          <h1 style={{ cursor: 'pointer', margin: 0 }}>k99 <span style={{ color: '#666' }}>EXCHANGE</span></h1>
        </Link>
        <div style={{ display: 'flex', gap: '20px' }}>
          <Link href="/markets"><span style={{ color: '#888', cursor: 'pointer' }}>Markets</span></Link>
          <Link href="/trade"><span style={{ color: '#888', cursor: 'pointer' }}>Trade</span></Link>
          <Link href="/portfolio"><span style={{ color: '#888', cursor: 'pointer' }}>Portfolio</span></Link>
          <Link href="/wallet"><span style={{ color: '#888', cursor: 'pointer' }}>Wallet</span></Link>
          <Link href="/quant-studio"><span style={{ color: '#00ff88', cursor: 'pointer' }}>Quant Studio</span></Link>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ display: 'flex', height: 'calc(100vh - 80px)' }}>
        
        {/* Left Sidebar */}
        <div style={{ width: '280px', borderRight: '1px solid #222', padding: '20px' }}>
          <h3 style={{ marginTop: 0, marginBottom: '20px' }}>📊 Quant Studio</h3>
          
          <div style={{ marginBottom: '30px' }}>
            <div style={{ color: '#666', marginBottom: '10px', fontSize: '0.9rem' }}>WORKSPACE</div>
            {['strategies', 'indicators', 'backtest', 'alerts'].map(tab => (
              <div 
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{ 
                  padding: '10px 15px', 
                  background: activeTab === tab ? '#222' : 'transparent', 
                  borderRadius: '5px', 
                  cursor: 'pointer',
                  marginBottom: '5px',
                  textTransform: 'capitalize',
                  color: activeTab === tab ? '#00ff88' : '#888'
                }}
              >
                {tab === 'strategies' && '📈 '}
                {tab === 'indicators' && '📉 '}
                {tab === 'backtest' && '🔬 '}
                {tab === 'alerts' && '🔔 '}
                {tab}
              </div>
            ))}
          </div>

          <div>
            <div style={{ color: '#666', marginBottom: '10px', fontSize: '0.9rem' }}>MY STRATEGIES</div>
            {SAMPLE_STRATEGIES.map(s => (
              <div key={s.id} style={{ padding: '10px', background: '#111', borderRadius: '5px', marginBottom: '10px', border: '1px solid #222' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 'bold' }}>{s.name}</span>
                  <span style={{ 
                    padding: '2px 8px', 
                    background: s.status === 'active' ? '#00ff8822' : s.status === 'paper' ? '#ffaa0022' : '#55aaff22',
                    color: s.status === 'active' ? '#00ff88' : s.status === 'paper' ? '#ffaa00' : '#55aaff',
                    borderRadius: '10px',
                    fontSize: '0.7rem'
                  }}>
                    {s.status}
                  </span>
                </div>
                <div style={{ color: '#00ff88', fontSize: '0.9rem', marginTop: '5px' }}>{s.returns}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          
          {/* Toolbar */}
          <div style={{ borderBottom: '1px solid #222', padding: '10px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button style={{ padding: '8px 16px', background: '#222', border: 'none', color: '#fff', borderRadius: '5px', cursor: 'pointer' }}>📄 New</button>
              <button style={{ padding: '8px 16px', background: '#222', border: 'none', color: '#fff', borderRadius: '5px', cursor: 'pointer' }}>💾 Save</button>
              <button style={{ padding: '8px 16px', background: '#222', border: 'none', color: '#fff', borderRadius: '5px', cursor: 'pointer' }}>📂 Load</button>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                onClick={runBacktest}
                disabled={isRunning}
                style={{ padding: '8px 20px', background: '#00ff88', border: 'none', color: '#000', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                {isRunning ? '⏳ Running...' : '▶️ Run Backtest'}
              </button>
              <button style={{ padding: '8px 20px', background: '#ffaa00', border: 'none', color: '#000', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
                📝 Paper Trade
              </button>
            </div>
          </div>

          {/* Code Editor */}
          <div style={{ flex: 1, display: 'flex' }}>
            <div style={{ flex: 1, padding: '20px' }}>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  background: '#0d0d0d', 
                  border: '1px solid #333', 
                  borderRadius: '8px',
                  color: '#00ff88',
                  fontFamily: 'monospace',
                  fontSize: '0.9rem',
                  padding: '15px',
                  resize: 'none'
                }}
              />
            </div>

            {/* Results Panel */}
            <div style={{ width: '350px', borderLeft: '1px solid #222', padding: '20px', overflowY: 'auto' }}>
              <h3 style={{ marginTop: 0 }}>Results</h3>
              
              {backtestResults ? (
                <div>
                  <div style={{ display: 'grid', gap: '15px', marginBottom: '30px' }}>
                    <ResultCard label="Total Return" value={`+${backtestResults.totalReturn}%`} color="#00ff88" />
                    <ResultCard label="Sharpe Ratio" value={backtestResults.sharpeRatio.toFixed(2)} color="#fff" />
                    <ResultCard label="Max Drawdown" value={`${backtestResults.maxDrawdown}%`} color="#ff0055" />
                    <ResultCard label="Win Rate" value={`${backtestResults.winRate}%`} color="#00aaff" />
                    <ResultCard label="Total Trades" value={backtestResults.trades} color="#fff" />
                    <ResultCard label="Profit Factor" value={backtestResults.profitFactor.toFixed(2)} color="#ffaa00" />
                  </div>
                  
                  <div style={{ background: '#111', borderRadius: '8px', padding: '15px', border: '1px solid #222' }}>
                    <h4 style={{ marginTop: 0 }}>Equity Curve</h4>
                    <div style={{ height: '150px', background: '#0a0a0a', borderRadius: '5px', display: 'flex', alignItems: 'flex-end', padding: '10px', gap: '2px' }}>
                      {/* Simple bar chart visualization */}
                      {[35, 42, 38, 55, 48, 62, 58, 72, 68, 85, 78, 95, 88, 100, 92].map((h, i) => (
                        <div key={i} style={{ flex: 1, background: h > 50 ? '#00ff88' : '#ff0055', height: `${h}%`, borderRadius: '2px' }}></div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ color: '#666', textAlign: 'center', marginTop: '50px' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '20px' }}>🔬</div>
                  <div>Run a backtest to see results</div>
                </div>
              )}

              {/* Live Indicators */}
              <div style={{ marginTop: '30px' }}>
                <h4>Live Indicators</h4>
                <div style={{ display: 'grid', gap: '10px' }}>
                  {SAMPLE_INDICATORS.map((ind, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: '#111', borderRadius: '5px', border: '1px solid #222' }}>
                      <span style={{ color: '#888' }}>{ind.name}</span>
                      <span style={{ color: ind.signal === 'Bullish' ? '#00ff88' : ind.signal === 'Bearish' ? '#ff0055' : '#ffaa00' }}>
                        {ind.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ResultCard({ label, value, color }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: '#111', borderRadius: '5px', border: '1px solid #222' }}>
      <span style={{ color: '#888' }}>{label}</span>
      <span style={{ color, fontWeight: 'bold' }}>{value}</span>
    </div>
  );
}
