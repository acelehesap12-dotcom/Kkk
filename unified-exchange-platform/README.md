# Unified Exchange Platform

## 👑 Tier-1 Financial Exchange Architecture

Bu proje, yüksek frekanslı ticaret (HFT), çoklu varlık desteği ve sıfır güven (Zero-Trust) güvenlik mimarisine sahip, üretime hazır bir borsa platformudur.

### 📂 Proje Yapısı

```
unified-exchange-platform/
├── argocd/                 # GitOps Dağıtım Manifestleri (App-of-Apps)
├── matching-engine/        # Rust tabanlı Yüksek Performanslı Eşleşme Motoru (<100µs)
├── risk-engine/            # Python tabanlı Risk ve Likidasyon Motoru (Monte-Carlo VaR)
├── settlement-service/     # TypeScript tabanlı Takas ve Reorg Yönetimi
├── quant-studio/           # Kullanıcı Algoritmaları için İzole Sandbox (Docker + AST Security)
├── scripts/                # Dağıtım ve Chaos Engineering Scriptleri
├── terraform/              # IaC (AWS EKS, Vault, Kafka, TimescaleDB)
└── docker-compose.yml      # Yerel Geliştirme Ortamı
```

### 🚀 Hızlı Başlangıç (Local)

1. **Altyapıyı Başlat:**
   ```bash
   docker-compose up -d
   ```

2. **Sandbox Testi:**
   ```bash
   # Quant Studio Sandbox'ını test et (Ağ erişimi kapalı)
   docker-compose run --rm quant-sandbox
   ```

### 🛡️ Güvenlik Özellikleri

*   **Vault Entegrasyonu:** Tüm hassas veriler (Cüzdan Private Key'leri, DB şifreleri) HashiCorp Vault üzerinde saklanır.
*   **Network Isolation:** Quant Studio konteynerları `network: none` modunda çalışır.
*   **Signed Images:** CI/CD pipeline'ında imajlar Cosign ile imzalanır.
*   **Panic Switch:** Risk motorunda acil durum durdurma mekanizması mevcuttur.

### 🏗️ Mimari Bileşenler

1.  **Matching Engine (Rust):** `io_uring` ve Zero-Allocation prensipleriyle tasarlanmıştır. 8 varlık sınıfını destekler.
2.  **Settlement (Node.js):** Blockchain reorg durumlarını izler ve ledger rollback işlemlerini yönetir.
3.  **Risk Engine (Python):** 3 aşamalı likidasyon şelalesi (İptal -> TWAP -> Sigorta Fonu).

---
*CTO & Senior Principal Architect*
