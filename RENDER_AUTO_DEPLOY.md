# 🚀 K99 Exchange - Render Otomatik Deploy Kurulumu

## 📋 Adım 1: Render Blueprint'i Bağla

1. **Render Dashboard'a git:** https://dashboard.render.com
2. **"New" → "Blueprint"** tıkla
3. **GitHub repo seç:** `acelehesap12-dotcom/Kkk`
4. **Branch:** `main`
5. **"Apply"** tıkla

Render otomatik olarak `render.yaml` dosyasını okuyacak ve tüm servisleri oluşturacak.

---

## 📋 Adım 2: Environment Variables Ayarla

Render Dashboard'da her servis için şu değişkenleri ayarla:

### Tüm Servisler İçin Ortak:
```
DATABASE_URL = postgresql://neondb_owner:npg_DIp7hzOyG6JM@ep-empty-salad-aggyutnl-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require

REDIS_URL = https://exact-tadpole-7870.upstash.io

REDIS_TOKEN = AR6-AAImcDFiN2U0M2FiZGI3NWQ0NGZiOGVkZGU1OGUxOTY4ODc3M3AxNzg3MA
```

### Her Servis İçin Render'da:
1. Servise tıkla → "Environment" sekmesi
2. "Add Environment Variable" tıkla
3. Yukarıdaki değerleri gir
4. "Save Changes" tıkla

---

## 📋 Adım 3: Deploy Hook Oluştur (GitHub Actions İçin)

1. Render Dashboard → Herhangi bir servis (örn: k99-user-service)
2. **"Settings"** sekmesi
3. **"Deploy Hook"** bölümüne git
4. **"Create Deploy Hook"** tıkla
5. Hook URL'ini kopyala (şuna benzer):
   ```
   https://api.render.com/deploy/srv-xxxxxxxxxxxxx?key=yyyyyyyyy
   ```

---

## 📋 Adım 4: GitHub Secret Ekle

1. GitHub repo'na git: https://github.com/acelehesap12-dotcom/Kkk
2. **Settings → Secrets and variables → Actions**
3. **"New repository secret"** tıkla
4. Şu secretları ekle:

| Secret Adı | Değer |
|------------|-------|
| `RENDER_DEPLOY_HOOK_URL` | Render'dan aldığın hook URL'i |
| `DATABASE_URL` | `postgresql://neondb_owner:npg_DIp7hzOyG6JM@ep-empty-salad-aggyutnl-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require` |
| `REDIS_URL` | `https://exact-tadpole-7870.upstash.io` |
| `REDIS_TOKEN` | `AR6-AAImcDFiN2U0M2FiZGI3NWQ0NGZiOGVkZGU1OGUxOTY4ODc3M3AxNzg3MA` |

---

## 📋 Adım 5: Otomatik Deploy Test Et

```bash
# Herhangi bir değişiklik yap ve push et
git add -A
git commit -m "trigger: auto deploy test"
git push
```

GitHub Actions otomatik çalışacak:
1. ✅ Frontend → GitHub Pages'e deploy
2. ✅ Backend → Render'a deploy hook ile tetikleme
3. ✅ Health check yapacak

---

## 🔧 Alternatif: Manuel Render Deploy

Render CLI kullanarak:
```bash
# Render CLI kur
npm install -g render-cli

# Login
render login

# Deploy
render deploy
```

---

## 📊 Servis URL'leri (Deploy Sonrası)

| Servis | URL |
|--------|-----|
| Frontend | https://k99-exchange.xyz |
| User Service | https://k99-user-service.onrender.com |
| Order Gateway | https://k99-order-gateway.onrender.com |
| Market Data | https://k99-market-data.onrender.com |
| Risk Engine | https://k99-risk-engine.onrender.com |
| Quant Studio | https://k99-quant-studio.onrender.com |

---

## ⚠️ Önemli Notlar

1. **Free Tier Limitleri:** Render free tier'da servisler 15 dakika inaktif kalınca uyur
2. **İlk Deploy:** İlk deploy 5-10 dakika sürebilir
3. **Docker Build:** Go ve Python servisleri Docker ile build edilir

---

## 🐛 Sorun Giderme

### "Build failed" hatası:
- Render Dashboard → Service → Events → Build logs'u kontrol et

### "Service crashed" hatası:
- Environment variables doğru mu kontrol et
- PORT değişkeni doğru ayarlanmış mı

### GitHub Action başarısız:
- Actions sekmesinde hata loglarını kontrol et
- RENDER_DEPLOY_HOOK_URL secret'ı eklendi mi?
