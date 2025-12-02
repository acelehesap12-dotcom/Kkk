package main

import (
	"encoding/json"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/confluentinc/confluent-kafka-go/kafka"
	"github.com/gorilla/websocket"
)

// 👑 UNIFIED EXCHANGE - ORDER GATEWAY
// Language: Go
// Purpose: High-concurrency WebSocket Gateway for Order Entry
// Protocol: JSON over WSS (FIX support planned)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true }, // Dev only
}

type OrderRequest struct {
	UserID    string  `json:"user_id"`
	Symbol    string  `json:"symbol"`
	Side      string  `json:"side"` // "buy" or "sell"
	Price     float64 `json:"price"`
	Quantity  float64 `json:"quantity"`
	OrderType string  `json:"order_type"` // "limit", "market"
	Timestamp int64   `json:"timestamp"`
}

func main() {
	log.Println("👑 ORDER GATEWAY STARTED")

	// Kafka Producer Config
	p, err := kafka.NewProducer(&kafka.ConfigMap{
		"bootstrap.servers": os.Getenv("KAFKA_BROKERS"),
		"client.id":         "order-gateway",
		"acks":              "all",
	})
	if err != nil {
		log.Printf("Failed to create producer: %s\n", err)
		// Continue for dev without Kafka if needed, or panic
	} else {
		defer p.Close()
	}

	http.HandleFunc("/ws/orders", func(w http.ResponseWriter, r *http.Request) {
		handleConnection(w, r, p)
	})

	log.Println(">>> Listening on :8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}

func handleConnection(w http.ResponseWriter, r *http.Request, p *kafka.Producer) {
	ws, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("Upgrade error:", err)
		return
	}
	defer ws.Close()

	for {
		_, message, err := ws.ReadMessage()
		if err != nil {
			log.Println("Read error:", err)
			break
		}

		// 1. Parse Order
		var order OrderRequest
		if err := json.Unmarshal(message, &order); err != nil {
			ws.WriteJSON(map[string]string{"error": "Invalid JSON"})
			continue
		}

		// 2. Enrich & Validate (Mock Auth)
		order.Timestamp = time.Now().UnixNano()
		
		// 3. Push to Kafka (Order Ingestion Topic)
		topic := "orders.ingest"
		if p != nil {
			value, _ := json.Marshal(order)
			p.Produce(&kafka.Message{
				TopicPartition: kafka.TopicPartition{Topic: &topic, Partition: kafka.PartitionAny},
				Value:          value,
			}, nil)
			log.Printf(">>> Order Pushed to Kafka: %s %s @ %f", order.Side, order.Symbol, order.Price)
		}

		// 4. Ack to Client
		ws.WriteJSON(map[string]string{"status": "received", "order_id": "temp-123"})
	}
}
