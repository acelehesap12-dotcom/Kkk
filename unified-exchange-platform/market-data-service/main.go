package main

import (
	"encoding/json"
	"log"
	"math/rand"
	"net/http"
	"os"
	"sync"
	"time"
)

// 👑 UNIFIED EXCHANGE - MARKET DATA SERVICE
// Language: Go
// Purpose: Real-time market data aggregation and OHLCV candles
// Note: Kafka-free version for Render.com deployment

type Trade struct {
	Symbol    string  `json:"symbol"`
	Price     float64 `json:"price"`
	Quantity  float64 `json:"quantity"`
	Timestamp int64   `json:"timestamp"`
}

type Candle struct {
	Symbol    string  `json:"symbol"`
	Open      float64 `json:"open"`
	High      float64 `json:"high"`
	Low       float64 `json:"low"`
	Close     float64 `json:"close"`
	Volume    float64 `json:"volume"`
	Timestamp int64   `json:"timestamp"`
}

type MarketTicker struct {
	Symbol    string  `json:"symbol"`
	Price     float64 `json:"price"`
	Change24h float64 `json:"change_24h"`
	Volume24h float64 `json:"volume_24h"`
	High24h   float64 `json:"high_24h"`
	Low24h    float64 `json:"low_24h"`
}

var (
	tickers     = make(map[string]MarketTicker)
	tickerMutex sync.RWMutex
	trades      = make([]Trade, 0)
	tradesMutex sync.RWMutex
)

func main() {
	log.Println("👑 MARKET DATA SERVICE STARTED")

	// Initialize mock tickers
	initTickers()

	// Start price update goroutine
	go updatePrices()

	// HTTP Server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8081"
	}

	http.HandleFunc("/health", handleHealth)
	http.HandleFunc("/", handleRoot)
	http.HandleFunc("/tickers", handleTickers)
	http.HandleFunc("/ticker", handleTicker)
	http.HandleFunc("/trades", handleTrades)
	http.HandleFunc("/candles", handleCandles)

	log.Printf(">>> Listening on :%s", port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}

func initTickers() {
	symbols := []string{
		"BTC-USD", "ETH-USD", "SOL-USD", "XRP-USD", "DOGE-USD",
		"EUR-USD", "GBP-USD", "JPY-USD",
		"AAPL", "GOOGL", "MSFT", "TSLA",
		"GOLD", "SILVER", "OIL",
	}

	basePrices := map[string]float64{
		"BTC-USD": 105000, "ETH-USD": 3900, "SOL-USD": 220, "XRP-USD": 2.3, "DOGE-USD": 0.42,
		"EUR-USD": 1.05, "GBP-USD": 1.27, "JPY-USD": 0.0067,
		"AAPL": 195, "GOOGL": 175, "MSFT": 430, "TSLA": 380,
		"GOLD": 2650, "SILVER": 31, "OIL": 71,
	}

	tickerMutex.Lock()
	for _, s := range symbols {
		price := basePrices[s]
		if price == 0 {
			price = 100
		}
		tickers[s] = MarketTicker{
			Symbol:    s,
			Price:     price,
			Change24h: (rand.Float64() - 0.5) * 10,
			Volume24h: rand.Float64() * 1000000,
			High24h:   price * 1.05,
			Low24h:    price * 0.95,
		}
	}
	tickerMutex.Unlock()
}

func updatePrices() {
	for {
		time.Sleep(2 * time.Second)

		tickerMutex.Lock()
		for symbol, ticker := range tickers {
			// Random price movement (-0.5% to +0.5%)
			change := (rand.Float64() - 0.5) * 0.01
			ticker.Price *= (1 + change)
			ticker.Change24h += change * 100
			if ticker.Price > ticker.High24h {
				ticker.High24h = ticker.Price
			}
			if ticker.Price < ticker.Low24h {
				ticker.Low24h = ticker.Price
			}
			ticker.Volume24h += rand.Float64() * 1000
			tickers[symbol] = ticker
		}
		tickerMutex.Unlock()
	}
}

func handleHealth(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"status":  "healthy",
		"service": "market-data-service",
		"version": "2.1.0",
		"tickers": len(tickers),
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
		"service":   "K99 Exchange - Market Data Service",
		"version":   "2.1.0",
		"endpoints": []string{"/health", "/tickers", "/ticker?symbol=BTC-USD", "/trades", "/candles"},
	})
}

func handleTickers(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")

	tickerMutex.RLock()
	result := make([]MarketTicker, 0, len(tickers))
	for _, t := range tickers {
		result = append(result, t)
	}
	tickerMutex.RUnlock()

	json.NewEncoder(w).Encode(result)
}

func handleTicker(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")

	symbol := r.URL.Query().Get("symbol")
	if symbol == "" {
		symbol = "BTC-USD"
	}

	tickerMutex.RLock()
	ticker, exists := tickers[symbol]
	tickerMutex.RUnlock()

	if !exists {
		http.Error(w, "Symbol not found", http.StatusNotFound)
		return
	}

	json.NewEncoder(w).Encode(ticker)
}

func handleTrades(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")

	// Generate mock recent trades
	symbol := r.URL.Query().Get("symbol")
	if symbol == "" {
		symbol = "BTC-USD"
	}

	tickerMutex.RLock()
	ticker := tickers[symbol]
	tickerMutex.RUnlock()

	mockTrades := make([]Trade, 10)
	for i := 0; i < 10; i++ {
		mockTrades[i] = Trade{
			Symbol:    symbol,
			Price:     ticker.Price * (1 + (rand.Float64()-0.5)*0.001),
			Quantity:  rand.Float64() * 10,
			Timestamp: time.Now().Add(-time.Duration(i) * time.Minute).Unix(),
		}
	}

	json.NewEncoder(w).Encode(mockTrades)
}

func handleCandles(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")

	symbol := r.URL.Query().Get("symbol")
	if symbol == "" {
		symbol = "BTC-USD"
	}

	tickerMutex.RLock()
	ticker := tickers[symbol]
	tickerMutex.RUnlock()

	// Generate mock candles (last 24 hours, 1h interval)
	candles := make([]Candle, 24)
	basePrice := ticker.Price
	for i := 23; i >= 0; i-- {
		open := basePrice * (1 + (rand.Float64()-0.5)*0.02)
		close := basePrice * (1 + (rand.Float64()-0.5)*0.02)
		high := max(open, close) * (1 + rand.Float64()*0.01)
		low := min(open, close) * (1 - rand.Float64()*0.01)

		candles[23-i] = Candle{
			Symbol:    symbol,
			Open:      open,
			High:      high,
			Low:       low,
			Close:     close,
			Volume:    rand.Float64() * 100000,
			Timestamp: time.Now().Add(-time.Duration(i) * time.Hour).Unix(),
		}
		basePrice = close
	}

	json.NewEncoder(w).Encode(candles)
}

func max(a, b float64) float64 {
	if a > b {
		return a
	}
	return b
}

func min(a, b float64) float64 {
	if a < b {
		return a
	}
	return b
}
