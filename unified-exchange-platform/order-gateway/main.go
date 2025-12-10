package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"sync"
	"time"

	"github.com/confluentinc/confluent-kafka-go/kafka"
	"github.com/gorilla/websocket"
)

// 👑 UNIFIED EXCHANGE - ORDER GATEWAY
// Language: Go
// Purpose: High-concurrency WebSocket Gateway for Order Entry
// Protocol: JSON over WSS (FIX support planned)

var (
	upgrader = websocket.Upgrader{
		CheckOrigin: func(r *http.Request) bool { return true }, // Dev only
	}
	isTradingHalted bool
	haltMutex       sync.RWMutex

	// Client Management
	clients    = make(map[*websocket.Conn]bool)
	clientsMux sync.Mutex
)

type OrderRequest struct {
	ID        string  `json:"id"`
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
		"security.protocol": os.Getenv("SECURITY_PROTOCOL"), // For Upstash
		"sasl.mechanism":    os.Getenv("SASL_MECHANISM"),    // For Upstash
		"sasl.username":     os.Getenv("KAFKA_USERNAME"),    // For Upstash
		"sasl.password":     os.Getenv("KAFKA_PASSWORD"),    // For Upstash
	})
	if err != nil {
		log.Printf("Failed to create producer: %s\n", err)
	} else {
		defer p.Close()
	}

	// Kafka Consumer (For Trades)
	go consumeTrades()

	http.HandleFunc("/ws/orders", func(w http.ResponseWriter, r *http.Request) {
		handleConnection(w, r, p)
	})

	// 🏥 HEALTH CHECK ENDPOINT
	http.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Header().Set("Access-Control-Allow-Origin", "*")
		json.NewEncoder(w).Encode(map[string]interface{}{
			"status":         "healthy",
			"service":        "order-gateway",
			"version":        "2.0.0",
			"trading_halted": isTradingHalted,
		})
	})

	// 🚨 PANIC SWITCH ENDPOINT
	http.HandleFunc("/admin/panic", func(w http.ResponseWriter, r *http.Request) {
		// CORS
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		if r.Method == "OPTIONS" {
			return
		}

		if r.Method != "POST" {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		haltMutex.Lock()
		isTradingHalted = !isTradingHalted
		newState := isTradingHalted
		haltMutex.Unlock()

		log.Printf("🚨 PANIC SWITCH TOGGLED: Trading Halted = %v", newState)
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]bool{"halted": newState})
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

	// Register Client
	clientsMux.Lock()
	clients[ws] = true
	clientsMux.Unlock()

	defer func() {
		clientsMux.Lock()
		delete(clients, ws)
		clientsMux.Unlock()
		ws.Close()
	}()

	for {
		_, message, err := ws.ReadMessage()
		if err != nil {
			log.Println("Read error:", err)
			break
		}

		// 0. Check Panic Switch
		haltMutex.RLock()
		halted := isTradingHalted
		haltMutex.RUnlock()
		if halted {
			ws.WriteJSON(map[string]string{"error": "TRADING HALTED BY ADMIN"})
			continue
		}

		// 1. Parse Order
		var order OrderRequest
		if err := json.Unmarshal(message, &order); err != nil {
			ws.WriteJSON(map[string]string{"error": "Invalid JSON"})
			continue
		}

		// 2. Enrich & Validate (Mock Auth)
		order.Timestamp = time.Now().UnixNano()
		order.ID = fmt.Sprintf("%d", order.Timestamp)

		// 3. Push to Kafka (Order Ingestion Topic)
		topic := "orders.ingest"
		if p != nil {
			value, _ := json.Marshal(order)
			p.Produce(&kafka.Message{
				TopicPartition: kafka.TopicPartition{Topic: &topic, Partition: kafka.PartitionAny},
				Value:          value,
			}, nil)
			log.Printf(">>> Order Pushed to Kafka: %s %s @ %f (ID: %s)", order.Side, order.Symbol, order.Price, order.ID)
		}

		// 4. Ack to Client
		ws.WriteJSON(map[string]string{"status": "received", "order_id": order.ID})
	}
}

func consumeTrades() {
	c, err := kafka.NewConsumer(&kafka.ConfigMap{
		"bootstrap.servers": os.Getenv("KAFKA_BROKERS"),
		"group.id":          "gateway-broadcaster",
		"auto.offset.reset": "latest",
		"security.protocol": os.Getenv("SECURITY_PROTOCOL"),
		"sasl.mechanism":    os.Getenv("SASL_MECHANISM"),
		"sasl.username":     os.Getenv("KAFKA_USERNAME"),
		"sasl.password":     os.Getenv("KAFKA_PASSWORD"),
	})

	if err != nil {
		log.Printf("Failed to create consumer: %s\n", err)
		return
	}

	c.SubscribeTopics([]string{"trades.executed"}, nil)

	for {
		msg, err := c.ReadMessage(-1)
		if err == nil {
			log.Printf(">>> Broadcasting Trade: %s", string(msg.Value))
			broadcastMessage(msg.Value)
		} else {
			log.Printf("Consumer error: %v\n", err)
		}
	}
}

func broadcastMessage(message []byte) {
	clientsMux.Lock()
	defer clientsMux.Unlock()

	for client := range clients {
		err := client.WriteMessage(websocket.TextMessage, message)
		if err != nil {
			log.Printf("Websocket error: %s", err)
			client.Close()
			delete(clients, client)
		}
	}
}
