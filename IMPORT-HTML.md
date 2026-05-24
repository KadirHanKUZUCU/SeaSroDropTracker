# HTML'den Toplu Import

650+ item'ı cache'e aktarmak için:

## 1. HTML dosyasını kaydet

Sohbette yapıştırdığın **tüm** `<div class="rank-item">...</div>` bloklarını (650+ adet) tek bir dosyaya kopyala:

**Dosya yolu:** `server/rank-items-full.html`

(veya proje kökü: `rank-items-full.html`)

## 2. Import çalıştır

```bash
cd "c:\Users\HAN\Desktop\sro items"
node scripts/import-html.js server/rank-items-full.html
```

## 3. Sunucuyu yeniden başlat

```bash
cd server
npm start
```

Frontend'de F5 — filtreler ve liste cache'den gelir.

## Alternatif: API ile (sunucu çalışırken)

```bash
curl -X POST http://localhost:3001/api/import-html ^
  -H "Content-Type: application/json" ^
  -d "{\"html\": \"$(Get-Content -Raw server/rank-items-full.html -Encoding UTF8)\"}"
```

(PowerShell'de `Get-Content` ile dosyayı okuyup gönder.)

## Mevcut kısmi dosya

`server/rank-items-html.html` içinde ~50 item varsa:

```bash
node scripts/import-html.js server/rank-items-html.html
```

Tam liste için `rank-items-full.html` oluşturup tekrar çalıştır.
