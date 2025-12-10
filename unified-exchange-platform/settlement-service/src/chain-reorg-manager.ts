// 👑 UNIFIED EXCHANGE PLATFORM - SETTLEMENT SERVICE
// Language: TypeScript
// Purpose: Consumes Executed Trades & Updates User Balances (k99)

import { Kafka } from 'kafkajs';
import { Pool } from 'pg';

// Configuration
const KAFKA_BROKERS = (process.env.KAFKA_BROKERS || 'kafka:29092').split(',');
const DATABASE_URL = process.env.DATABASE_URL || 'postgres://admin_user:super_secure_password_placeholder@localhost:5432/exchange_management';

// Initialize Clients
const kafka = new Kafka({ clientId: 'settlement-service', brokers: KAFKA_BROKERS });
const consumer = kafka.consumer({ groupId: 'settlement-group' });
const pool = new Pool({ connectionString: DATABASE_URL });

interface Trade {
    symbol: string;
    price: number;
    quantity: number;
    timestamp: number;
    buyer_id?: string; // In a real engine, trade event includes buyer/seller IDs
    seller_id?: string;
}

async function start() {
    console.log("👑 SETTLEMENT SERVICE STARTED");
    
    // 1. Connect to DB
    try {
        await pool.connect();
        console.log(">>> Connected to Management DB");
    } catch (e) {
        console.error("Failed to connect to DB", e);
        return;
    }

    // 2. Connect to Kafka
    await consumer.connect();
    await consumer.subscribe({ topic: 'trades.executed', fromBeginning: false });
    console.log(">>> Subscribed to 'trades.executed'");

    // 3. Process Trades
    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            if (!message.value) return;
            
            try {
                const tradeData = JSON.parse(message.value.toString());
                console.log(`[SETTLEMENT] Processing Trade: ${tradeData.symbol} @ ${tradeData.price}`);
                
                // MOCK LOGIC: Since our Matching Engine is simple and doesn't emit Buyer/Seller IDs yet,
                // we will simulate a settlement for a demo user.
                // In production: tradeData would have buyer_id and seller_id.
                
                await settleTrade(tradeData);

            } catch (e) {
                console.error("Error processing trade:", e);
            }
        },
    });
}

async function settleTrade(trade: any) {
    const totalValue = trade.price * trade.quantity;
    
    // Transaction: Buyer pays k99, Seller gets k99
    // For this demo, we'll just deduct fee from a "System" account or log it.
    // Let's assume we update the "admin" user's balance as a fee collector for visibility.
    
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        // Example: 1% Fee collected by Exchange
        const fee = totalValue * 0.01;
        
        // Update Admin Balance (Fee Collection)
        await client.query(
            'UPDATE users SET k99_balance = k99_balance + $1 WHERE role = $2',
            [fee, 'admin']
        );

        await client.query('COMMIT');
        console.log(`✅ Trade Settled. Fee Collected: ${fee} k99`);
    } catch (e) {
        await client.query('ROLLBACK');
        console.error("Settlement Failed:", e);
    } finally {
        client.release();
    }
}

start().catch(console.error);

            height: height,
            transactions: []
        };
        
        // Simulate a reorg every 10 blocks
        if (height % 10 === 0) {
            console.log(`[SIMULATION] Injecting Reorg Event at height ${height}`);
            // Send a block with same height but different hash
             reorgManager.onNewBlock({
                ...mockBlock,
                hash: "0xDIFFERENT_HASH_FOR_REORG"
            });
        } else {
            reorgManager.onNewBlock(mockBlock);
        }
    }, 3000);
}

