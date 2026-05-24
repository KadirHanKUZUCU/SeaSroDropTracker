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

Vercel sunucusuz ortamda sürekli process çalışmaz; **Cron Job** periyodik olarak `/api/cron/scrape` çağırır, yeni droplar **Vercel Blob** içinde birikir.

| Bileşen | Görev |
|--------|--------|
| `GET /api/drops` | Önbellek + canlı site merge |
| `GET /api/cron/scrape` | Saatlik tarama (cron) |
| Vercel Blob | `drops-cache.json` kalıcı depo |

### Vercel deploy

1. Repoyu GitHub’a push et.
2. [Vercel](https://vercel.com) → Import → `KadirHanKUZUCU/SeaSroDropTracker`
3. **Storage** → Blob → Create → projeye bağla (`BLOB_READ_WRITE_TOKEN` otomatik eklenir).
4. **Settings → Environment Variables:**
   - `CRON_SECRET` — rastgele uzun bir string (cron güvenliği)
5. Deploy.

Cron `vercel.json` içinde **saatte bir** (`0 * * * *`) tanımlı. Daha sık tarama için [cron-job.org](https://cron-job.org) ile:

`GET https://SENIN-PROJE.vercel.app/api/cron/scrape`  
Header: `Authorization: Bearer CRON_SECRET_DEĞERİN`

### İlk veri (664+ kayıt)

Yerelde `server/drops-cache.json` varsa Blob’a yüklemek için Vercel Blob token ile `npm run import-html` sonrası deploy, veya panel açıkken birkaç saat cron + yenileme.

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
