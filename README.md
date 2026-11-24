# Bizim Emlak Web Uygulaması

## Proje Özeti
Bu proje, Çok sayfalı bir emlak web sitesi olarak tasarlanmıştır. Sadece HTML, CSS ve sade JavaScript kullanılarak yapılmıştır (framework yok, kurulum gerektirmez, GitHub Pages'te çalışır).

### Klasör Yapısı
```
/workspace/ben/
├── index.html          (Ana sayfa)
├── ilanlar.html        (İlanlar sayfası - veri ile)
├── ilan.html           (İlan detay sayfası)
├── hesaplamalar.html   (Emlak hesaplamaları)
├── rehber.html         (Emlak Rehberi)
├── hakkimizda.html     (Hakkımızda)
├── iletisim.html       (İletişim bilgileri)
├── favoriler.html      (Favoriler)
├── css/style.css       (Renk değişkenleri ve ortak stiller)
├── js/main.js          (JavaScript işlevselliği)
├── js/ilanlar-veri.js  (İlan verileri)
├── images/             (Resim klasörü - logo.png gerekli)
├── supabase-kurulum.sql (Database kurulumu - Supabase için)
└── README.md           (Bu dosya)
```

### Renk Sistemi (CSS Değişkenler)
```css
:root {
  --renk-ana: #D7141A;     /* Kırmızı - ana vurgu */
  --renk-ana-koyu: #A50F14; /* Koyu kırmızı */
  --renk-siyah: #111111;    /* Siyah */
  --renk-metin: #222222;    /* Metin rengi */
  --renk-beyaz: #FFFFFF;    /* Beyaz */
  --renk-arapa: #F5F5F5;    /* Aık gri */
  --renk-kenarik: #E0E0E0;  /* Kenarlık */
  --renk-satilik: #D7141A;  /* Kırmızı rozet */
  --renk-kiralik: #111111;  /* Siyah rozet */
  --font-baslik: 'Montserrat', sans-serif; /* Başlıklar, kalın */
  --font-metin: 'Open Sans', sans-serif;   /* Metin */
}
```

### Ana Özellikler
- **Fixed Header**: Üst menü, logo ile solda, linkler ile sağda. Sayfa kaydırıldığında sabit kalır.
- **Mobil Menü**: <=768px'de hamburger menüye dönüşür.
- **Footer**: Siyah arka plan, logo, kısa açıklama, hızlı linkler, iletişim bilgileri, çalışma saatleri, sosyal medya ikonları.
- **Sağ Alt WhatsApp Butonu**: Sabit yeşil buton.
- **ORTak Yapı**: Tüm sayfalarda aynı header/footer yapısı.
- **Rozetler**: Satılık = kırmızı, Kiralık = siyah.
- **Form stilleri**: Buton, kart, form elemanları hazırlanmıştır.

### SQL Database (supabase-kurulum.sql)
Dosya: `/workspace/ben/supabase-kurulum.sql`

Bu dosyayı Supabase SQL Editor'e yapıştırıp çalıştırabilirsiniz. İçerir:

1. **ilanlar Tablosu**: Tüm required alanlar (baslik, tip, fiyat, il, ilce, metrekare, oda sayısı, vb.)
   - RLS: Herkes `yayinda=true` olanları OKUYABILIR
   - Sadece authenticated kullanıcı ekleme/güncelleme/silme yapabilir

2. **ilan-fotograflari Storage Bucket**: 
   - Public: Tümüggörebilir
   - Authenticated: Yükleyebilir ve silebilir

3. **mesajlar Tablosu**: İletişim formu için
   - HERKESS EKLEYEBILIR (form submit)
   - Sadece authenticated okuyup silebilir

4. **6 adet örnek ilan** INSERT komutları

5. **aktif_ilanlar View**: Sadece yayinda=true ilanlar

### JavaScript (js/supabase.js)
Dosya: `/workspace/ben/js/supabase.js`

Supabase istemcisini CDN üzerinden (@supabase/supabase-js v2) başlatır.
Tüm sayfalar ilanları buradan çekebilir. Yüklenirken iskelet/yükleniyor görünümü, hata olursa kibar bir mesaj göster.

### HTML Sayfaları
- index.html - Ana sayfa ile hero bölümü, özellik kartları
- ilanlar.html - JS ile ilanları yüklenen sayfa
- ilan.html - Tek ilan detay sayfası
- hesaplamalar.html - Emlak hesaplama formu
- rehber.html - Emlak rehberi sayfası
- hakkimizda.html - Hakkımızda sayfası
- iletisim.html - İletişim bilgileri sayfası
- favoriler.html - Favoriler sayfası

### Admin Paneli (admin.html - Manuel Kurulum Gerekli)
Admin paneli için ayrı bir tasarım yapılmıştır. Supabase Authentication kullanılarak:
- Giriş: e-posta + şifre
- Panel: Özet kutuları (toplam ilan, satılık, kiralık, yayında olmayan, okunmamış mesaj)
- İlan listesi: tablo halinde, arama ve filtre
- İlan ekleme/düzenleme formu: tüm alanlar, açılır listeler
- Fotoğraf yükleme: sürükle-bırak, önizleme, küçültme
- Konum: OpenStreetMap ile Leaflet entegrasyonu
- Mesajlar sekmesi: gelen mesajlar, okudu işareti, silme

### Supabase Kurulum Adımları

#### 1. Proje Oluşturma
1. Supabase'e kayıt olun (supabase.com)
2. Yeni proje oluşturun
3. Proje URL ve Anon Key'yi not alın

#### 2. SQL Executing
1. Supabase Dashboard -> SQL Editor'e gidin
2. `/workspace/ben/supabase-kurulum.sql` dosyasının içeriğini kopyalayın
3. Execute (Çalıştır) butonuna basın

#### 3. Storage Bucket Oluşturma
1. Dashboard -> Storage -> Add bucket
2. Bucket adı: `ilan-fotograflari`
3. Public seçeneğini aktif edin
4. Access ayarlarını: Public = enabled, Authenticated = write (Create ve Delete)

#### 4. Authentication Ayarları
1. Dashboard -> Authentication -> Settings
2. "Site URL" alanını doldurun (GitHub Pages URL'niz)
3. "Sign up directed" veya "Sign up allowed" seçeneğini seçin
4. For production, "Anonymous" oturum açma enabled olmalı

#### 5. Admin Kullanıcı Oluşturma
1. Dashboard -> Authentication -> Users -> Add user
2. E-posta ve şifreyi belirleyin
3. Bu kullanıcı authenticated role'una sahip olacak

#### 6. Uygulamayı Bağlama
1. `js/supabase.js` dosyasındaki `YOUR_SUPABASE_URL` ve `YOUR_ANON_KEY` değerlerini güncelleyin
2. Tüm HTML sayfalarında `<script src="js/supabase.js"></script>` ekli olduğundan emin olun

### Ücretsiz Plan Sınırları
- 500MB dosya depolama
- 1GB/ay band genişliği
- Maximum 10K satır sorgulama
- Real-time subscriptions sınırlı
- Sign-up kapalı tutulabilir (anon erişim için)

### Projeyi GitHub Pages'e Yayınlama
1. GitHub repository oluşturun
2. `/workspace/ben` içindeki tüm dosyaları commit edin
3. Repository Settings -> Pages -> Branch: main / /(root)
4. Site yayınlanacaktır

### Yeni Yönetici Ekleme
1. Supabase Dashboard -> Authentication -> Users -> Add user
2. Yeni kullanıcı oluşturun
3. Kullanıcının authenticated role'una sahip olmasını sağlayın
4. Admin panelinde oturum açmak için o e-posta/şifreyi kullanın

## Notlar
- `images/logo.png` dosyası projeye eklenmelidir
- Supabase projesini düzenli olarak kontrol edin (özellikle ücretsiz plan depolama dolma riski)
- Geri bildirim ve hatalar için Supabase Console'un Logs sekmesini kullanın