package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"sync"
	"time"

	"github.com/gorilla/websocket"
)

// 👑 UNIFIED EXCHANGE - ORDER GATEWAY
// Language: Go
// Purpose: High-concurrency WebSocket Gateway for Order Entry
// Note: Kafka-free version for Render.com deployment

var (
	upgrader = websocket.Upgrader{
		CheckOrigin: func(r *http.Request) bool { return true },
	}
	isTradingHalted bool
	haltMutex       sync.RWMutex

	// Client Management
	clients    = make(map[*websocket.Conn]bool)
	clientsMux sync.Mutex

	// In-memory order book
	orderBook   = make([]OrderRequest, 0)
	ordersMutex sync.RWMutex
)

type OrderRequest struct {
	ID        string  `json:"id"`
	UserID    string  `json:"user_id"`
	Symbol    string  `json:"symbol"`
	Side      string  `json:"side"`
	Price     float64 `json:"price"`
	Quantity  float64 `json:"quantity"`
	OrderType string  `json:"order_type"`
	Timestamp int64   `json:"timestamp"`
	Status    string  `json:"status"`
}

func main() {
	log.Println("👑 ORDER GATEWAY STARTED")

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	// WebSocket
	http.HandleFunc("/ws/orders", handleConnection)

	// REST Endpoints
	http.HandleFunc("/health", handleHealth)
	http.HandleFunc("/", handleRoot)
	http.HandleFunc("/admin/panic", handlePanic)
	http.HandleFunc("/orders", handleOrders)

	log.Printf(">>> Listening on :%s", port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}

func handleHealth(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"status":         "healthy",
		"service":        "order-gateway",
		"version":        "2.1.0",
		"trading_halted": isTradingHalted,
		"clients":        len(clients),
	})
}

func handleRoot(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path != "/" {
		http.NotFound(w, r)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"service":   "K99 Exchange - Order Gateway",
		"version":   "2.1.0",
		"endpoints": []string{"/health", "/ws/orders", "/orders", "/admin/panic"},
	})
}

func handlePanic(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
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

	log.Printf("🚨 PANIC SWITCH: Trading Halted = %v", newState)
	broadcastMessage([]byte(fmt.Sprintf(`{"type":"system","halted":%v}`, newState)))

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]bool{"halted": newState})
}

func handleOrders(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	ordersMutex.RLock()
	json.NewEncoder(w).Encode(orderBook)
	ordersMutex.RUnlock()
}

func handleConnection(w http.ResponseWriter, r *http.Request) {
	ws, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("Upgrade error:", err)
		return
	}

	clientsMux.Lock()
	clients[ws] = true
	clientsMux.Unlock()

	defer func() {
		clientsMux.Lock()
		delete(clients, ws)
		clientsMux.Unlock()
		ws.Close()
	}()

	// Welcome message
	ws.WriteJSON(map[string]interface{}{
		"type":    "connected",
		"message": "K99 Order Gateway",
		"time":    time.Now().Unix(),
	})

	for {
		_, message, err := ws.ReadMessage()
		if err != nil {
			log.Println("Read error:", err)
			break
		}

		haltMutex.RLock()
		halted := isTradingHalted
		haltMutex.RUnlock()
		if halted {
			ws.WriteJSON(map[string]string{"error": "TRADING HALTED"})
			continue
		}

		var order OrderRequest
		if err := json.Unmarshal(message, &order); err != nil {
			ws.WriteJSON(map[string]string{"error": "Invalid JSON"})
			continue
		}

		order.Timestamp = time.Now().UnixNano()
		order.ID = fmt.Sprintf("%d", order.Timestamp)
		order.Status = "open"

		ordersMutex.Lock()
		orderBook = append(orderBook, order)
		if len(orderBook) > 1000 {
			orderBook = orderBook[len(orderBook)-1000:]
		}
		ordersMutex.Unlock()

		log.Printf("📝 Order: %s %s %.4f @ %.2f", order.Side, order.Symbol, order.Quantity, order.Price)
		ws.WriteJSON(map[string]string{"status": "received", "order_id": order.ID})
		broadcastMessage(message)
	}
}

func broadcastMessage(message []byte) {
	clientsMux.Lock()
	defer clientsMux.Unlock()
	for client := range clients {
		if err := client.WriteMessage(websocket.TextMessage, message); err != nil {
			client.Close()
			delete(clients, client)
		}
	}
}
