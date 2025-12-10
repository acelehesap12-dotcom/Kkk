# 🚀 Backend Kurulum Rehberi (Render.com)

Vercel sadece Frontend (Web Sitesi) içindir. Backend (API, Veritabanı, Borsa Motoru) için **Render.com** kullanacağız. Ücretsiz ve Docker destekliyor.

## 1. Hazırlık: Veritabanı ve Kafka (Ücretsiz)

Backend servislerini kurmadan önce, onların bağlanacağı veritabanı ve mesajlaşma sistemini kurmalıyız.

### A. Veritabanı (Postgres) -> Neon.tech
1.  [Neon.tech](https://neon.tech) adresine gidin ve GitHub ile giriş yapın.
2.  Yeni bir proje oluşturun (Adı: `exchange-db`).
3.  Size bir **Connection String** verecek (örn: `postgres://kullanici:sifre@ep-xyz.neon.tech/neondb...`).
4.  Bu adresi kopyalayın, birazdan lazım olacak.

### B. Mesajlaşma (Kafka) -> Upstash
1.  [Upstash.com](https://upstash.com) adresine gidin ve giriş yapın.
2.  **Create Cluster** deyin.
3.  Type: **Kafka**.
4.  Name: `exchange-kafka`.
5.  Region: `EU-West-1` (veya size yakın olan).
6.  Cluster oluşunca **Details** sayfasında `REST API` ve `Bootstrap Servers` bilgilerini göreceksiniz.
    *   **Endpoint (Brokers):** `grizzly-kafka-xyz.upstash.io:9092` gibi bir adres.
    *   **Username:** `...`
    *   **Password:** `...`

---

## 2. Render.com Hesabı ve Kurulum

1.  [Render.com](https://render.com) adresine gidin ve GitHub hesabınızla giriş yapın.
2.  **New +** butonuna basın ve **Web Service** seçin.
3.  GitHub reponuzu (`Kkk` veya fork adınız) seçin.

### Servis 1: User Service (Üyelik Sistemi)
Bu servis kullanıcı kayıtlarını ve giriş işlemlerini yönetir.

*   **Name:** `user-service`
*   **Root Directory:** `unified-exchange-platform/user-service`
*   **Runtime:** `Node`
*   **Build Command:** `npm install`
*   **Start Command:** `npm start`
*   **Instance Type:** Free
*   **Environment Variables (Çevre Değişkenleri):**
    *   `DATABASE_URL`: (Neon.tech'ten aldığınız adres)
    *   `JWT_SECRET`: (Rastgele uzun bir şifre yazın, örn: `gizli_sifre_123`)

**Create Web Service** butonuna basın. Render size `https://user-service-xyz.onrender.com` gibi bir adres verecek.

### Servis 2: Order Gateway (Emir Kapısı)
Bu servis Frontend'den gelen alım-satım emirlerini karşılar.

*   **New +** -> **Web Service**
*   **Name:** `order-gateway`
*   **Root Directory:** `unified-exchange-platform/order-gateway`
*   **Runtime:** `Docker` (Go olduğu için Docker kullanacağız)
*   **Instance Type:** Free
*   **Environment Variables:**
    *   `KAFKA_BROKERS`: (Upstash'ten aldığınız Endpoint adresi)
    *   `KAFKA_USERNAME`: (Upstash Username)
    *   `KAFKA_PASSWORD`: (Upstash Password)
    *   `SASL_MECHANISM`: `SCRAM-SHA-256` (Upstash için gerekli)
    *   `SECURITY_PROTOCOL`: `SASL_SSL` (Upstash için gerekli)

**Create Web Service** butonuna basın. Render size `https://order-gateway-xyz.onrender.com` gibi bir adres verecek.

---

## 3. Son Adım: Bağlantıları Yapılandırma

Render'daki servisleriniz çalışmaya başladığında, size verilen adresleri alıp `DNS_SETUP.md` dosyasındaki gibi domaininize bağlayın.

*   `user-service` adresi -> `api.k99-exchange.xyz` (CNAME kaydı)
*   `order-gateway` adresi -> `gateway.k99-exchange.xyz` (CNAME kaydı)

Böylece sisteminiz tamamen bulutta çalışır hale gelecek! 🚀
