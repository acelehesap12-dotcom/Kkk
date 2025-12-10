# 👑 k99 Unified Exchange Platform

**Tier-1 Multi-Asset Trading Platform (Zero-Mock / Production Ready)**

Bu proje, yüksek performanslı, mikroservis mimarisine sahip, gerçek zamanlı bir kripto para borsasıdır.

## 🚀 Canlı Linkler (Live Links)

*   **Frontend (Web Sitesi):** [https://www.k99-exchange.xyz](https://www.k99-exchange.xyz)
*   **API Gateway:** [https://gateway.k99-exchange.xyz](https://gateway.k99-exchange.xyz)
*   **User API:** [https://api.k99-exchange.xyz](https://api.k99-exchange.xyz)

## 🏗️ Mimari (Architecture)

Sistem 6 ana mikroservisten oluşur:

1.  **Frontend (Next.js):** Gerçek zamanlı grafikler ve alım-satım arayüzü.
2.  **Order Gateway (Go):** WebSocket üzerinden emir toplama ve Kafka'ya iletme.
3.  **Matching Engine (Rust):** <100µs gecikme ile emir eşleştirme.
4.  **Market Data Service (Go):** İşlemleri dinler ve TimescaleDB'ye kaydeder.
5.  **Settlement Service (TypeScript):** Bakiye güncellemeleri ve takas işlemleri.
6.  **Risk Engine (Python):** Gerçek zamanlı risk analizi ve Panic Switch.

## 🛠️ Kurulum ve Dağıtım

Detaylı kurulum rehberleri için aşağıdaki dosyalara bakınız:

*   [DEPLOY_FREE.md](./DEPLOY_FREE.md) - Bedava Dağıtım Rehberi (Vercel + Render)
*   [DNS_SETUP.md](./DNS_SETUP.md) - Domain ve DNS Ayarları
*   [RENDER_SETUP.md](./RENDER_SETUP.md) - Backend Kurulum Detayları

## 💻 Yerel Geliştirme (Local Development)

Sistemi kendi bilgisayarınızda veya GitHub Codespaces'te tek komutla başlatabilirsiniz:

```bash
bash start-local.sh
```