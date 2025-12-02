mod asset_traits;

use asset_traits::{AssetBehavior, CryptoAsset, Order, OrderBook, OrderType, Side};
use std::time::{SystemTime, UNIX_EPOCH};
use rdkafka::config::ClientConfig;
use rdkafka::consumer::{StreamConsumer, Consumer};
use rdkafka::producer::{FutureProducer, FutureRecord};
use rdkafka::message::Message;
use futures::StreamExt;
use std::env;
use log::{info, warn, error};

#[tokio::main]
async fn main() {
    env_logger::init();
    info!("👑 UNIFIED EXCHANGE MATCHING ENGINE STARTED");
    
    // 1. Initialize Asset Traits
    info!(">>> Initializing Asset Traits...");
    let crypto_behavior = Box::new(CryptoAsset);
    let mut order_book = OrderBook::new(crypto_behavior);

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
                        info!("Received Order: {:?}", order_req);
                        
                        // Convert JSON to Internal Order Struct (Simplified)
                        let order = Order {
                            id: 1, // Should be parsed from JSON
                            price: (order_req["price"].as_f64().unwrap_or(0.0) * 100.0) as u64, // Float to Int
                            quantity: (order_req["quantity"].as_f64().unwrap_or(0.0) * 100.0) as u64,
                            side: if order_req["side"] == "buy" { Side::Buy } else { Side::Sell },
                            order_type: OrderType::Limit,
                            timestamp: SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_secs(),
                        };

                        // Match Order
                        order_book.match_order(order.clone());

                        // Emit Trade Event (Mock Execution)
                        let trade_event = serde_json::json!({
                            "symbol": order_req["symbol"],
                            "price": order_req["price"],
                            "quantity": order_req["quantity"],
                            "timestamp": order.timestamp
                        });

                        let _ = producer.send(
                            FutureRecord::to(output_topic)
                                .payload(&trade_event.to_string())
                                .key("trade_key"),
                            std::time::Duration::from_secs(0),
                        ).await;
                        
                        info!(">>> Trade Executed & Published to '{}'", output_topic);
                    }
                }
            }
            Err(e) => warn!("Kafka Error: {}", e),
        }
    }
}

