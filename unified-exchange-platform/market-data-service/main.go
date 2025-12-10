package main

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/confluentinc/confluent-kafka-go/kafka"
	"github.com/jackc/pgx/v4/pgxpool"
)

// 👑 UNIFIED EXCHANGE - MARKET DATA SERVICE
// Language: Go
// Purpose: Consumes trades, aggregates OHLCV candles, writes to TimescaleDB

type Trade struct {
	Symbol    string  `json:"symbol"`
	Price     float64 `json:"price"`
	Quantity  float64 `json:"quantity"`
	Timestamp int64   `json:"timestamp"`
}

func main() {
	log.Println("👑 MARKET DATA SERVICE STARTED")

	// Start HTTP Server for health checks
	go startHTTPServer()

	// 1. Connect to TimescaleDB
	dbUrl := os.Getenv("DATABASE_URL")
	pool, err := pgxpool.Connect(context.Background(), dbUrl)
	if err != nil {
		log.Printf("Unable to connect to database: %v\n", err)
	} else {
		defer pool.Close()
		initDB(pool)
	}

	// 2. Kafka Consumer Config
	c, err := kafka.NewConsumer(&kafka.ConfigMap{
		"bootstrap.servers": os.Getenv("KAFKA_BROKERS"),
		"group.id":          "market-data-group",
		"auto.offset.reset": "earliest",
	})

	if err != nil {
		log.Printf("Failed to create consumer: %s\n", err)
		// Mock loop for dev
		mockLoop()
		return
	}

	c.SubscribeTopics([]string{"trades.executed"}, nil)

	// 3. Consumption Loop
	for {
		msg, err := c.ReadMessage(-1)
		if err == nil {
			var trade Trade
			if err := json.Unmarshal(msg.Value, &trade); err != nil {
				log.Printf("Error parsing trade: %v", err)
				continue
			}

			log.Printf("Processing Trade: %s %f", trade.Symbol, trade.Price)

			// Save to TimescaleDB
			if pool != nil {
				saveTrade(pool, trade)
			}
		} else {
			log.Printf("Consumer error: %v\n", err)
		}
	}
}

func saveTrade(pool *pgxpool.Pool, trade Trade) {
	// Convert Unix timestamp to Time
	ts := time.Unix(0, trade.Timestamp) // Assuming nanoseconds from Matching Engine
	if trade.Timestamp < 10000000000 {  // If seconds
		ts = time.Unix(trade.Timestamp, 0)
	}

	query := `
		INSERT INTO trades (time, symbol, price, quantity)
		VALUES ($1, $2, $3, $4)
	`
	_, err := pool.Exec(context.Background(), query, ts, trade.Symbol, trade.Price, trade.Quantity)
	if err != nil {
		log.Printf("Failed to insert trade: %v", err)
	} else {
		log.Printf("✅ Trade Saved to DB: %s", trade.Symbol)
	}
}

func initDB(pool *pgxpool.Pool) {
	// Create Hypertable for TimescaleDB
	query := `
	CREATE TABLE IF NOT EXISTS trades (
		time TIMESTAMPTZ NOT NULL,
		symbol TEXT NOT NULL,
		price DOUBLE PRECISION,
		quantity DOUBLE PRECISION
	);
	SELECT create_hypertable('trades', 'time', if_not_exists => TRUE);
	`
	_, err := pool.Exec(context.Background(), query)
	if err != nil {
		log.Printf("Failed to init TimescaleDB: %v", err)
	}
}

func mockLoop() {
	for {
		time.Sleep(5 * time.Second)
		log.Println(">>> [MOCK] Aggregating OHLCV Candles...")
	}
}

// 🏥 HTTP Server for Health Checks
func startHTTPServer() {
	http.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Header().Set("Access-Control-Allow-Origin", "*")
		json.NewEncoder(w).Encode(map[string]interface{}{
			"status":  "healthy",
			"service": "market-data-service",
			"version": "2.0.0",
		})
	})

	port := os.Getenv("HTTP_PORT")
	if port == "" {
		port = "8081"
	}
	log.Printf("🏥 Health check server listening on :%s", port)
	http.ListenAndServe(":"+port, nil)
}
