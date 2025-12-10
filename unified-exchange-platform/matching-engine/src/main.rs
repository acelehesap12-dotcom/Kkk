mod asset_traits;

use asset_traits::{
    AssetBehavior, CryptoAsset, ForexAsset, StockAsset, BondAsset, ETFAsset, CommodityAsset, OptionAsset, FutureAsset,
    Order, OrderBook, OrderType, Side
};
use std::time::{SystemTime, UNIX_EPOCH};
use rdkafka::config::ClientConfig;
use rdkafka::consumer::{StreamConsumer, Consumer};
use rdkafka::producer::{FutureProducer, FutureRecord};
use rdkafka::message::Message;
use futures::StreamExt;
use std::env;
use std::collections::HashMap;
use log::{info, warn, error};

#[tokio::main]
async fn main() {
    env_logger::init();
    info!("👑 UNIFIED EXCHANGE MATCHING ENGINE STARTED");
    
    // 1. Initialize Asset Traits & Order Books
    info!(">>> Initializing Multi-Asset Order Books...");
    let mut books: HashMap<String, OrderBook> = HashMap::new();

    // Initialize one book per supported symbol
    // In a real system, this would be dynamic or loaded from config
    books.insert("BTC-USD".to_string(), OrderBook::new(Box::new(CryptoAsset)));
    books.insert("ETH-USD".to_string(), OrderBook::new(Box::new(CryptoAsset)));
    
    books.insert("EUR-USD".to_string(), OrderBook::new(Box::new(ForexAsset)));
    books.insert("GBP-USD".to_string(), OrderBook::new(Box::new(ForexAsset)));
    
    books.insert("AAPL".to_string(), OrderBook::new(Box::new(StockAsset)));
    books.insert("TSLA".to_string(), OrderBook::new(Box::new(StockAsset)));
    
    books.insert("US10Y".to_string(), OrderBook::new(Box::new(BondAsset)));
    
    books.insert("SPY".to_string(), OrderBook::new(Box::new(ETFAsset)));
    
    books.insert("GOLD".to_string(), OrderBook::new(Box::new(CommodityAsset)));
    books.insert("OIL".to_string(), OrderBook::new(Box::new(CommodityAsset)));
    
    books.insert("TSLA-OPT".to_string(), OrderBook::new(Box::new(OptionAsset)));
    
    books.insert("ES-FUT".to_string(), OrderBook::new(Box::new(FutureAsset)));

    info!(">>> Initialized {} Order Books.", books.len());

    // 2. Kafka Configuration
    let brokers = env::var("KAFKA_BROKERS").unwrap_or_else(|_| "kafka:9092".to_string());
    let group_id = "matching-engine-group";
    let input_topic = "orders.ingest";
    let output_topic = "trades.executed";

    info!(">>> Connecting to Kafka at {}", brokers);

    // Consumer
    let consumer: StreamConsumer = ClientConfig::new()
        .set("group.id", group_id)
        .set("bootstrap.servers", &brokers)
        .set("enable.partition.eof", "false")
        .set("session.timeout.ms", "6000")
        .set("enable.auto.commit", "true")
        .create()
        .expect("Consumer creation failed");

    consumer.subscribe(&[input_topic]).expect("Can't subscribe to specified topic");

    // Producer
    let producer: FutureProducer = ClientConfig::new()
        .set("bootstrap.servers", &brokers)
        .set("message.timeout.ms", "5000")
        .create()
        .expect("Producer creation failed");

    info!(">>> Matching Engine Ready. Consuming from '{}'...", input_topic);

    // 3. Event Loop
    let mut message_stream = consumer.stream();

    while let Some(message) = message_stream.next().await {
        match message {
            Ok(m) => {
                if let Some(payload) = m.payload() {
                    // Parse Order
                    if let Ok(order_req) = serde_json::from_slice::<serde_json::Value>(payload) {
                        let symbol = order_req["symbol"].as_str().unwrap_or("BTC-USD");
                        
                        if let Some(book) = books.get_mut(symbol) {
                            info!("Received Order for {}: {:?}", symbol, order_req);
                            
                            // Convert JSON to Internal Order Struct (Simplified)
                            let order = Order {
                                id: order_req["id"].as_str().unwrap_or("0").parse::<u64>().unwrap_or(0),
                                price: (order_req["price"].as_f64().unwrap_or(0.0) * 100.0) as u64, // Float to Int
                                quantity: (order_req["quantity"].as_f64().unwrap_or(0.0) * 100.0) as u64,
                                side: if order_req["side"] == "buy" { Side::Buy } else { Side::Sell },
                                order_type: OrderType::Limit,
                                timestamp: SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_secs(),
                            };

                            // Match Order
                            book.match_order(order.clone());

                            // Emit Trade Event (Mock Execution)
                            let trade_event = serde_json::json!({
                                "symbol": symbol,
                                "price": order_req["price"],
                                "quantity": order_req["quantity"],
                                "timestamp": order.timestamp,
                                "asset_type": format!("{:?}", book.asset_behavior.get_type())
                            });

                            let _ = producer.send(
                                FutureRecord::to(output_topic)
                                    .payload(&trade_event.to_string())
                                    .key("trade_key"),
                                std::time::Duration::from_secs(0),
                            ).await;
                            
                            info!(">>> Trade Executed & Published to '{}'", output_topic);
                        } else {
                            warn!("No OrderBook found for symbol: {}", symbol);
                        }
                    }
                }
            }
            Err(e) => warn!("Kafka Error: {}", e),
        }
    }
}
