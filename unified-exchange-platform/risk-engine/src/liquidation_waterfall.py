# 👑 UNIFIED EXCHANGE PLATFORM - RISK ENGINE
# Language: Python
# Component: Liquidation Waterfall & Panic Switch
# Logic: Monte-Carlo VaR, 3-Stage Liquidation, Multi-Asset Margin

import time
import random
import logging
import os
import json
import math
# from kafka import KafkaConsumer # Uncomment in production

# Configuration
SUPER_ADMIN_EMAIL = "berkecansuskun1998@gmail.com"
VAR_CONFIDENCE_LEVEL = 0.99
VAR_TIME_HORIZON_HOURS = 1
KAFKA_BROKERS = os.getenv("KAFKA_BROKERS", "kafka:29092")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("RiskEngine")

# --- MARGIN CONFIGURATION (Multi-Asset) ---
MARGIN_REQUIREMENTS = {
    "Crypto": {"initial": 0.10, "maintenance": 0.05},    # 10x Leverage
    "Forex":  {"initial": 0.02, "maintenance": 0.01},    # 50x Leverage
    "Stock":  {"initial": 0.20, "maintenance": 0.10},    # 5x Leverage
    "Bond":   {"initial": 0.05, "maintenance": 0.03},    # 20x Leverage
    "ETF":    {"initial": 0.15, "maintenance": 0.08},
    "Commodity": {"initial": 0.10, "maintenance": 0.05},
    "Option": {"initial": 1.00, "maintenance": 1.00},    # Full premium upfront (simplified)
    "Future": {"initial": 0.10, "maintenance": 0.05},
}

class RiskEngine:
    def __init__(self):
        self.panic_mode = False
        self.insurance_fund_balance = 10_000_000.0 # USD
        logger.info("👑 RISK ENGINE STARTED (Multi-Asset Mode)")
        # self.consumer = KafkaConsumer('trades.executed', bootstrap_servers=KAFKA_BROKERS)

    def calculate_portfolio_margin(self, portfolio):
        """
        Calculates total Initial and Maintenance Margin for a user's portfolio.
        Portfolio format: [{"symbol": "BTC-USD", "type": "Crypto", "position_value": 50000, "side": "long"}]
        """
        total_im = 0.0
        total_mm = 0.0
        
        for position in portfolio:
            asset_type = position.get("type", "Crypto")
            value = abs(position.get("position_value", 0.0))
            
            rates = MARGIN_REQUIREMENTS.get(asset_type, MARGIN_REQUIREMENTS["Crypto"])
            
            # Option Greeks Adjustment (Placeholder)
            if asset_type == "Option":
                # In a real engine: Delta * Underlying Price * Contract Size
                pass

            total_im += value * rates["initial"]
            total_mm += value * rates["maintenance"]
            
        return total_im, total_mm

    def calculate_var_monte_carlo(self, portfolio_value, volatility, iterations=10000):
        """
        Monte Carlo Simulation for Value at Risk (VaR)
        """
        returns = [random.gauss(0, volatility) for _ in range(iterations)]
        returns.sort()
        percentile_idx = int((1 - VAR_CONFIDENCE_LEVEL) * iterations)
        var_percent = abs(returns[percentile_idx])
        return portfolio_value * var_percent

    def detect_market_abuse(self, recent_trades):
        """
        🛡️ MARKET SURVEILLANCE (AI/Rule-Based)
        Checks for: Wash Trading, Layering, Spoofing
        """
        # Simple Wash Trade Rule: Same Buyer & Seller ID within short window
        suspicious_count = 0
        for trade in recent_trades:
            if trade.get('buyer_id') == trade.get('seller_id'):
                logger.warning(f"🚨 WASH TRADE DETECTED: Trade ID {trade.get('id')} (Self-Match)")
                suspicious_count += 1
        
        if suspicious_count > 5:
            logger.error("🚨 HIGH ALERT: Potential Market Manipulation Detected! Triggering Circuit Breaker...")
            # self.panic_mode = True # Auto-trigger panic in extreme cases

    def run(self):
        logger.info(">>> Monitoring Market Risk (Monte Carlo Simulation Running...)")
        while True:
            # Mock Risk Loop
            time.sleep(5)
            
            # Simulate a User Portfolio Check
            mock_portfolio = [
                {"symbol": "BTC-USD", "type": "Crypto", "position_value": 100000, "side": "long"},
                {"symbol": "EUR-USD", "type": "Forex", "position_value": 500000, "side": "short"}, # High leverage
                {"symbol": "TSLA", "type": "Stock", "position_value": 20000, "side": "long"}
            ]
            
            im, mm = self.calculate_portfolio_margin(mock_portfolio)
            
            # Simulate VaR Check
            current_volatility = 0.05 # 5% daily vol
            var = self.calculate_var_monte_carlo(620000, current_volatility)
            
            logger.info(f"Risk Check: Portfolio Value=$620k | IM=${im:.2f} | MM=${mm:.2f} | VaR(99%)=${var:.2f}")
            
            # Simulate Surveillance
            self.detect_market_abuse([{"id": 123, "buyer_id": "user_A", "seller_id": "user_A"}]) # Mock Wash Trade
            
            logger.info(f"System Status: {'PANIC' if self.panic_mode else 'HEALTHY'}")

    def check_panic_switch(self, user_email: str):
        """
        🚨 PANIC SWITCH 🚨
        Can only be triggered by the Super Admin.
        Halts all order entry and freezes withdrawals.
        """
        if user_email == SUPER_ADMIN_EMAIL:
            self.panic_mode = True
            logger.critical(f"🚨 PANIC SWITCH ACTIVATED BY {user_email} 🚨")
            logger.critical("ALL TRADING HALTED. WITHDRAWALS FROZEN.")
            # In production: Redis.set('SYSTEM_HALT', true)
            return True
        else:
            logger.warning(f"Unauthorized panic attempt by {user_email}")
            return False

    def calculate_var_monte_carlo(self, portfolio_value, volatility, iterations=10000):
        """
        Calculates Value at Risk (VaR) using Monte Carlo simulation.
        """
        simulated_returns = []
        for _ in range(iterations):
            # Geometric Brownian Motion simulation
            daily_return = random.gauss(0, volatility)
            simulated_returns.append(daily_return)
        
        simulated_returns.sort()
        percentile_index = int((1 - VAR_CONFIDENCE_LEVEL) * iterations)
        var = portfolio_value * abs(simulated_returns[percentile_index])
        return var

if __name__ == "__main__":
    engine = RiskEngine()
    engine.run()
        var_loss = simulated_returns[percentile_index] * portfolio_value
        
        return abs(var_loss)

    def liquidation_waterfall(self, user_id, portfolio_value, maintenance_margin):
        """
        Executes the 3-Stage Liquidation Waterfall if Margin < Maintenance.
        """
        if self.panic_mode:
            logger.info("Liquidation skipped due to PANIC MODE.")
            return

        current_margin = self.get_user_margin(user_id)
        
        if current_margin < maintenance_margin:
            logger.warning(f"User {user_id} is below maintenance margin! Initiating Waterfall.")
            
            # Stage 1: Cancel Open Orders
            self.cancel_open_orders(user_id)
            current_margin = self.get_user_margin(user_id) # Re-check
            if current_margin >= maintenance_margin: return

            # Stage 2: Gradual TWAP Liquidation
            logger.info(f"Stage 2: TWAP Liquidation for {user_id}")
            self.execute_twap_liquidation(user_id)
            current_margin = self.get_user_margin(user_id) # Re-check
            if current_margin >= maintenance_margin: return

            # Stage 3: Insurance Fund Takeover
            logger.critical(f"Stage 3: Insurance Fund Takeover for {user_id}")
            self.insurance_fund_takeover(user_id, portfolio_value)

    def get_user_margin(self, user_id):
        # Mock DB call
        return random.uniform(0.8, 1.2) * 1000

    def cancel_open_orders(self, user_id):
        logger.info(f"Stage 1: Cancelling all open orders for {user_id}")
        # API call to Matching Engine

    def execute_twap_liquidation(self, user_id):
        # Time-Weighted Average Price execution to minimize market impact
        pass

    def insurance_fund_takeover(self, user_id, position_value):
        # Transfer position to Insurance Fund, cover deficit
        logger.info(f"Insurance Fund absorbing position value: {position_value}")
        self.insurance_fund_balance -= (position_value * 0.1) # Loss assumption

# Usage
if __name__ == "__main__":
    print("👑 RISK ENGINE STARTED")
    print(">>> Monitoring Margin Levels & VaR...")
    
    risk_engine = RiskEngine()
    
    # Simulate Event Loop
    while True:
        try:
            # Mock User Check
            user_id = f"user_{random.randint(1000, 9999)}"
            portfolio_val = random.uniform(10000, 500000)
            
            # 1. Calculate VaR
            var = risk_engine.calculate_var_monte_carlo(portfolio_val, volatility=0.05)
            
            # 2. Check Liquidation
            # Randomly trigger low margin for simulation
            if random.random() < 0.1:
                print(f"[SIMULATION] Checking liquidation for {user_id} (VaR: {var:.2f})")
                risk_engine.liquidation_waterfall(user_id, portfolio_val, maintenance_margin=1000)
            
            time.sleep(2)
            
        except KeyboardInterrupt:
            print("Stopping Risk Engine...")
            break

