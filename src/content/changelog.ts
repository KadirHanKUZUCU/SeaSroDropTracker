export const APP_VERSION = '1.0'

export interface ChangelogEntry {
  title: string
  items: string[]
}

export const CHANGELOG: ChangelogEntry[] = [
  {
    title: 'Liste ve sıralama',
    items: [
      '“En yeni” sırası artık resmi drop sayfasıyla aynı mantıkta — en son düşen item üstte.',
      '600+ eski drop kaydı geri yüklendi; sitede görünmeyen geçmiş droplar da panelde duruyor.',
      'Sayfalama eklendi: çok kayıt varken sayfa kasması azaldı (50’şer gösterim).',
      'Derece, oyuncu adı ve “en yeni”ye göre sıralama seçenekleri eklendi.',
    ],
  },
  {
    title: 'Filtreler ve kullanım',
    items: [
      'Oyuncu adına veya Top 3’e tıklayınca o oyuncunun dropları filtreleniyor.',
      '“X / Y gösteriliyor” ile kaç kayıt listelendiği net görünüyor.',
      'Son ziyaretten sonra gelen yeni droplar için “+N yeni drop” rozeti eklendi.',
      'Mobilde filtreler alttan açılan çekmece (drawer) ile kullanılıyor.',
      'Filtre listesindeki eski görünümlü kaydırma çubuğu kaldırıldı.',
    ],
  },
  {
    title: 'Güncelleme ve arka plan',
    items: [
      'Drop listesi yaklaşık her 10 dakikada otomatik güncelleniyor.',
      'Veriler sunucuda saklanıyor; sayfa kapansa bile geçmiş kayıtlar kaybolmuyor.',
      'Önbellek yanlışlıkla silinmesin diye koruma eklendi.',
    ],
  },
  {
    title: 'Görünüm ve hatalar',
    items: [
      'Oyuncu resmi bulunamayınca konsolu dolduran yüzlerce hata giderildi; yerine isim harfi gösteriliyor.',
      'Aynı item’ın listede birden fazla görünmesi (çoğaltma) düzeltildi.',
      'Silah ve ekipman isimleri (Glavie, crossbow, staff vb.) daha doğru yazılıyor.',
      'Canlı site açılamadığında sade mesaj gösteriliyor; teknik Blob/cron yazıları gizlendi.',
    ],
  },
]
