# 💸 Bedava Dağıtım Rehberi (Free Tier Deployment Guide)

Bu sistemi tamamen ücretsiz (Free Tier) kaynaklarla çalıştırmak mümkündür, ancak mikroservis mimarisi nedeniyle bazı stratejik değişiklikler gerektirir.

## 🏗️ Mimari Stratejisi

Normalde bu sistem 6+ konteyner ve Kafka gerektirir. Ücretsiz servislerde (Render, Railway, Vercel) bu kadar kaynağı tek seferde bulmak zordur. Bu yüzden sistemi **Hibrit** bir yapıya dönüştüreceğiz.

### 1. Frontend (Vercel)
Frontend tamamen statik/SSR uyumludur ve Vercel üzerinde sonsuza kadar ücretsiz barındırılabilir.

**Adımlar:**
1. Bu repoyu GitHub hesabınıza forklayın.
2. [Vercel.com](https://vercel.com) üzerinde yeni proje oluşturun.
3. Reponuzu seçin.
4. **Project Name:** `k99-exchange-frontend` (Sadece küçük harf, rakam ve tire kullanın. Boşluk veya büyük harf yasak!)
5. Root Directory olarak `unified-exchange-platform/frontend` seçin.
6. Build Command: `npm run build`
7. Output Directory: `out` (Eğer `next.config.js` içinde `output: 'export'` varsa) veya default.
8. **Deploy** butonuna basın.

### 2. Backend (Render / Railway)
Backend servisleri (Go, Rust, Python) için [Render.com](https://render.com) veya [Railway.app](https://railway.app) kullanabiliriz.

**Zorluk:** Kafka ve Veritabanı.
* **Veritabanı:** [Neon.tech](https://neon.tech) (Ücretsiz Postgres) kullanın.
* **Kafka:** [Confluent Cloud](https://confluent.cloud) (Ücretsiz Tier) veya [Upstash Kafka](https://upstash.com) (Serverless Kafka) kullanın.

**Önerilen Kurulum (Lite Versiyon):**
Tüm mikroservisleri tek tek deploy etmek yerine, sadece **Order Gateway** ve **Matching Engine**'i deploy edin.

1. **Render.com** üzerinde "Web Service" oluşturun.
2. Docker ortamını seçin.
3. `unified-exchange-platform/order-gateway` klasörünü bağlayın.
4. Environment Variable olarak Kafka ve DB URL'lerini girin.

### 3. En Kolay Yöntem: GitHub Codespaces (Şu an buradasınız!)
GitHub Codespaces size aylık 60-120 saat ücretsiz tam donanımlı bir Linux sanal makinesi verir.

**Nasıl Çalıştırılır?**
1. Ana dizindeki `start-local.sh` dosyasını çalıştırın:
   ```bash
   bash start-local.sh
   ```
2. Portlar sekmesinden (Ports) uygulamanızı görebilirsiniz.

## 🚀 Tek Komutla Çalıştırma (Local/Codespaces)

Sizin için kök dizine `start-local.sh` adında bir script hazırladım. Terminale şunu yazmanız yeterli:

```bash
bash start-local.sh
```

Bu komut:
1. Doğru klasöre gider.
2. Docker konteynerlerini inşa eder.
3. Tüm sistemi (Frontend + Backend + DB) ayağa kaldırır.
.