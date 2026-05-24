# SeaSRO Drop Tracker

Silkroad (110cap) drop listesini filtreleyip takip eden panel. Veri: [110cap.seasro.com/logging/drop](https://110cap.seasro.com/logging/drop).

## Yerel geliştirme

```bash
npm install
npm run start          # API (3001) + Vite (5173) — Windows
# veya ayrı terminallerde:
npm run server
npm run dev
```

Panel: http://localhost:5173

## 7/24 tarama (Vercel)

Vercel’de sürekli process yok; tarama **`/api/cron/scrape`** ile yapılır, veri **Vercel Blob**’da kalır.

| Bileşen | Görev |
|--------|--------|
| `GET /api/drops` | Önbellek + canlı site |
| `GET /api/cron/scrape` | Site tarama |
| Vercel Blob | Kalıcı `drops-cache.json` |

### Vercel deploy (Hobby uyumlu)

1. [Vercel](https://vercel.com) → **Add New → Project** → GitHub `SeaSroDropTracker`
2. Framework: **Vite** (otomatik algılanır) → **Deploy**
3. Deploy başarılı olduktan sonra:
   - **Storage** → **Blob** → Create → bu projeye **Connect**
   - **Settings → Environment Variables** → ekle:
     - `CRON_SECRET` = örn. `openssl rand -hex 32` ile ürettiğin uzun şifre
   - **Deployments** → son deploy → **⋯** → **Redeploy** (env + blob sonrası şart)
4. Panel: `https://PROJE-ADI.vercel.app`

> **Hobby cron limiti:** Vercel Hobby’de cron **günde 1 kez** çalışır (`0 6 * * *` = her gün 06:00 UTC). Saatlik tarama için aşağıdaki **cron-job.org** kullan.

### Sık tarama (ücretsiz, önerilen)

[cron-job.org](https://cron-job.org) → Create cron job:

- **URL:** `https://PROJE-ADI.vercel.app/api/cron/scrape`
- **Schedule:** her 10–15 dakika
- **Request headers:**  
  `Authorization` = `Bearer CRON_SECRET_DEĞERİN`

Vercel’in kendi cron’unu kapatmak istersen `vercel.json` içindeki `"crons"` dizisini `[]` yapıp redeploy et.

### Deploy hata alırsan

| Hata | Çözüm |
|------|--------|
| Cron günde 1’den fazla | `vercel.json` schedule `0 6 * * *` olmalı (repo güncel mi kontrol et) |
| Build fail | Vercel log → `npm run build` yerelde çalışıyor mu |
| 0 drop | Blob bağlı mı + `CRON_SECRET` + cron-job veya manuel scrape URL’si |

### İlk veri (664+ kayıt) — Blob’a yükle

Yerelde `server/drops-cache.json` varsa:

```bash
# Vercel → Storage → Blob → .env.local veya terminal:
set BLOB_READ_WRITE_TOKEN=vercel_blob_...
npm run upload-blob
```

Sonra paneli yenile. Veya deploy sonrası tarayıcıdan (CRON_SECRET ile):

`https://PROJE.vercel.app/api/cron/scrape`

### Sağlık kontrolü

`https://PROJE.vercel.app/api/health` → `cached`, `blob: true` olmalı.

## Komutlar

| Komut | Açıklama |
|--------|----------|
| `npm run dev` | Frontend |
| `npm run server` | Yerel API |
| `npm run build` | Production build |
| `npm run import-html` | HTML dosyasından cache |
| `npm run stop` | 3001 / 5173 portlarını kapat |

## Lisans

MIT — © 2026 · @aRuzas
