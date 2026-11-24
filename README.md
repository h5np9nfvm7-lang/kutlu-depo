# Bizim Emlak Web Sitesi

Osmaniye'deki Bizim Emlak ofisi için hazırlanmış emlak sitesi ve yönetim paneli.
Site **GitHub Pages**'te, ilanlar, mesajlar ve fotoğraflar **Supabase**'de tutulur. İkisi de ücretsiz planla çalışır.

## Sayfalar

| Sayfa | Ne işe yarar |
|---|---|
| `index.html` | Ana sayfa: arama, kategoriler, öne çıkan ve son ilanlar |
| `ilanlar.html` | Tüm ilanlar, filtreler, sıralama |
| `ilan.html?id=1` | İlan detayı: galeri, harita, kredi hesabı, "sizi arayalım" formu |
| `hesaplamalar.html` | Kredi, tapu harcı, kira getirisi, bütçe hesaplama |
| `rehber.html` | Emlak rehberi, sözlük, sık sorulan sorular |
| `hakkimizda.html` / `iletisim.html` | Firma bilgileri, iletişim ve mülk teklif formu |
| `favoriler.html` | Ziyaretçinin favorileri ve karşılaştırma |
| `admin.html` | **Yönetim paneli** (menüde görünmez) |

## İlk kurulum (bir kere yapılır)

1. **Yönetici hesabı:** Supabase'de **Authentication → Users → Add user** ile e-posta ve şifrenizi ekleyin.
2. **Kayıtları kapatın:** **Authentication → Sign In / Providers** sayfasında **"Allow new users to sign up"** seçeneğini kapatın.
3. **Veritabanı:** Supabase'de **SQL Editor → New query** açın. `supabase-kurulum.sql` dosyasının tamamını yapıştırıp **Run** düğmesine basın. "Success" yazmalı.
4. **Yayına alma:** GitHub'da deponun **Settings → Pages** bölümüne girin. **Branch: main** ve **/(root)** seçip **Save** düğmesine basın.
   Site birkaç dakika içinde `https://h5np9nfvm7-lang.github.io/kutlu-depo/` adresinde açılır.

> ⚠️ "Anonymous sign-ins" seçeneğini **açmayın**. Sitenin çalışması için gerekli değil.

## Günlük kullanım: Yönetim paneli

Adres: `https://h5np9nfvm7-lang.github.io/kutlu-depo/admin.html`

- **Yeni ilan:** Fotoğrafları sürükleyip bırakın, bilgileri doldurun ve **İlanı Kaydet** düğmesine basın. Fotoğraflar otomatik olarak küçültülür.
- **İlanı gizlemek:** İlanlar listesinde "Yayında" düğmesine tıklayın. İlan silinmez, sadece sitede görünmez olur.
- **Öne çıkarmak:** "Öne çıkar" düğmesine tıklayın. İlan ana sayfada en üstte görünür.
- **Mesajlar:** Sitedeki formlardan gelen mesajlar burada toplanır. Buradan arayabilir veya WhatsApp'tan yazabilirsiniz.
- **Site Ayarları:** Telefon, WhatsApp, adres, **çalışma saatleri** (yaz/kış), tecrübe yılı, hakkımızda yazısı, hizmetler, duyuru bandı ve sosyal medya adresleri buradan değiştirilir.

## Yeni yönetici eklemek

Supabase'de **Authentication → Users → Add user** ile kişiyi ekleyin. Ardından `supabase-kurulum.sql` dosyasını SQL Editor'de tekrar çalıştırın. Mevcut ilanlarınız silinmez.

## Ücretsiz plan hakkında

- Supabase ücretsiz planda **1 GB fotoğraf alanı** ve **500 MB veritabanı** var. Fotoğraflar küçültüldüğü için yüzlerce ilana yeter.
- Supabase, **bir hafta boyunca hiç kullanılmayan** ücretsiz projeleri duraklatır. Site ziyaret edildikçe bu genellikle olmaz. Duraklatmadan önce uyarı e-postası gelir; Supabase paneline girmeniz duraklatmayı önler.

## Dosyalar (teknik)

- `js/config.js`: Supabase adresi ve herkese açık anahtar. **Gizli (secret / service_role) anahtar ASLA buraya yazılmaz.**
- `css/style.css`: Renkler en üstteki `:root` bölümünde.
- `rehber.html`: Rehber yazıları doğrudan bu dosyada. Değiştirmek için dosyayı düzenleyin.
- `supabase-kurulum.sql`: Tablolar ve güvenlik kuralları. Ziyaretçiler sadece yayındaki ilanları görebilir ve mesaj gönderebilir. Ekleme, silme ve düzenleme yalnızca yöneticilere açıktır.
