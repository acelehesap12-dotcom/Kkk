# 🌐 DNS ve Domain Kurulum Rehberi (k99-exchange.xyz)

Hayırlı olsun! `k99-exchange.xyz` domainini Namecheap'ten aldınız. Şimdi bu domaini sistemimize bağlayacağız.

Bu işlem iki aşamalıdır:
1.  **Frontend (Web Sitesi):** `www.k99-exchange.xyz` -> Vercel
2.  **Backend (API'ler):** `api.k99-exchange.xyz` -> Render/Railway

---

## 1. Adım: Vercel Ayarları (Frontend)

1.  [Vercel Dashboard](https://vercel.com/dashboard)'a gidin ve projenizi seçin.
2.  **Settings** > **Domains** sekmesine tıklayın.
3.  Domain kutusuna `k99-exchange.xyz` yazın ve **Add** butonuna basın.
4.  Vercel size "Recommended" (Önerilen) seçeneği sunacaktır (genellikle `www.k99-exchange.xyz` ana domain, kök domain yönlendirmeli).
5.  Vercel size **Nameservers** (İsim Sunucuları) verecektir. Bunlar genellikle şöyledir:
    *   `ns1.vercel-dns.com`
    *   `ns2.vercel-dns.com`

## 2. Adım: Namecheap Ayarları (DNS Yönlendirme)

1.  [Namecheap Hesabınıza](https://www.namecheap.com/myaccount/login/) giriş yapın.
2.  **Domain List**'e gidin ve `k99-exchange.xyz` yanındaki **Manage** butonuna basın.
3.  **Nameservers** kısmını bulun.
4.  Açılır menüden **Custom DNS** seçeneğini seçin.
5.  Vercel'in size verdiği adresleri (yukarıdaki gibi) buraya girin:
    *   Satır 1: `ns1.vercel-dns.com`
    *   Satır 2: `ns2.vercel-dns.com`
6.  Yeşil tik işaretine basarak kaydedin.

*Not: Bu işlemin dünya geneline yayılması (propagation) 24-48 saat sürebilir, ancak genellikle 1 saat içinde aktif olur.*

---

## 3. Adım: Backend Subdomain Ayarları (API & Gateway)

Frontend Vercel'e bağlandıktan sonra, Backend servisleri için (Render veya Railway kullanıyorsanız) DNS kayıtları eklememiz gerekecek.

Bunu **Vercel Dashboard** üzerinden yapacağız (çünkü Nameserver'ları Vercel'e taşıdık).

1.  Vercel Dashboard > Proje > Settings > Domains sayfasına gidin.
2.  Eğer Backend'i **Render.com**'da barındırıyorsanız:
    *   Render dashboard'unda servisinize gidin > Settings > Custom Domains.
    *   `api.k99-exchange.xyz` ekleyin.
    *   Render size bir `CNAME` kaydı veya `A` kaydı verecektir.
3.  Vercel DNS Ayarlarına geri dönün (veya Namecheap'te "Advanced DNS" kullanıyorsanız oraya):
    *   **Type:** `CNAME`
    *   **Name:** `api`
    *   **Value:** `[Render'ın verdiği adres]` (örn: `onrender.com` ile biten adres)
    *   **TTL:** `Auto` veya `3600`

Aynı işlemi `gateway` için de yapın:
    *   **Type:** `CNAME`
    *   **Name:** `gateway`
    *   **Value:** `[Render'ın verdiği adres]`

---

## ✅ Kontrol Listesi

- [ ] `frontend/src/config.js` dosyası güncellendi (Ben yaptım).
- [ ] Namecheap'te Nameserver'lar Vercel'e yönlendirildi.
- [ ] Vercel'de domain doğrulandı.
- [ ] Backend servisleri (API ve Gateway) için subdomainler (api, gateway) oluşturuldu.

Artık siteniz `https://www.k99-exchange.xyz` adresinde yayına girmeye hazır! 🚀
