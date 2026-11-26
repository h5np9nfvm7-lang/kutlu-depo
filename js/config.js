/* ==========================================================
   BİZİM EMLAK - TEMEL AYARLAR
   ----------------------------------------------------------
   Supabase bağlantı bilgileri burada.
   Telefon, adres, çalışma saatleri, metinler vb. bilgilerin
   hepsini YÖNETİM PANELİNDEN (admin.html → Site Ayarları)
   değiştirebilirsiniz. Aşağıdaki VARSAYILAN_AYARLAR sadece
   veritabanına ulaşılamazsa kullanılan yedek bilgilerdir.
   ========================================================== */

window.BE_CONFIG = {
  // Supabase → Project Settings → API sayfasındaki bilgiler.
  // "publishable / anon" anahtar sitede görünebilir, sorun değil.
  // "secret / service_role" anahtarını ASLA buraya yazmayın!
  SUPABASE_URL: 'https://zcfdiskphrmwdxqnexio.supabase.co',
  SUPABASE_KEY: 'sb_publishable_085SzLY-pef-AHq6-qnBbQ_9MKLb2Mb',

  // Fotoğrafların saklandığı depolama alanının adı (SQL dosyasıyla aynı olmalı)
  FOTO_BUCKET: 'ilan-fotograflari'
};

window.BE_VARSAYILAN_AYARLAR = {
  firma_adi: 'Bizim Emlak',
  slogan: 'Siz hayal edin, biz gerçekleştirelim.',
  telefon: '0328 812 00 00',
  telefon2: '',
  whatsapp: '0328 812 00 00',
  eposta: '',
  adres: 'İstiklal Mah. Dr. Sadık Ahmet Cd. No:57 D:C, 80020 Osmaniye Merkez/Osmaniye',
  harita_arama: 'Dr. Sadık Ahmet Cd. No:57, İstiklal, 80020 Osmaniye Merkez/Osmaniye',
  calisma_saatleri: [
    { gun: 'Pazartesi', acik: true, baslangic: '08:30', bitis: '18:30' },
    { gun: 'Salı', acik: true, baslangic: '08:30', bitis: '18:30' },
    { gun: 'Çarşamba', acik: true, baslangic: '08:30', bitis: '18:30' },
    { gun: 'Perşembe', acik: true, baslangic: '08:30', bitis: '18:30' },
    { gun: 'Cuma', acik: true, baslangic: '08:30', bitis: '18:30' },
    { gun: 'Cumartesi', acik: true, baslangic: '08:30', bitis: '18:30' },
    { gun: 'Pazar', acik: false, baslangic: '', bitis: '' }
  ],
  calisma_notu: 'Çalışma saatlerimiz yaz ve kış dönemlerine göre değişebilir.',
  tecrube_yili: 26,
  hizmet_bolgesi: 'Osmaniye Merkez ve ilçeleri',
  danisman_adi: '',
  danismanlar: [], // { id, ad, unvan, telefon, whatsapp, foto } - Panel > Site Ayarları > Danışmanlar
  hero_baslik: 'Siz Hayal Edin, Biz Gerçekleştirelim',
  hero_alt: '26 yıllık tecrübemizle Osmaniye\'de satılık ve kiralık gayrimenkulde yanınızdayız.',
  hakkimizda_metni: 'Bizim Emlak olarak 26 yıldır Osmaniye\'de gayrimenkul alım, satım ve kiralama alanında hizmet veriyoruz. Müşterilerimizin doğru mülke, doğru fiyatla ve güvenle ulaşmasını en önemli işimiz olarak görüyoruz.\n\nBu metni yönetim panelinden kendi hikâyenizle değiştirebilirsiniz.',
  misyon: 'Alıcı ve satıcıyı dürüst, şeffaf ve hızlı bir süreçle buluşturmak.',
  vizyon: 'Osmaniye\'de akla gelen ilk güvenilir emlak ofisi olmak.',
  ilceler: ['Merkez', 'Kadirli', 'Düziçi', 'Bahçe', 'Toprakkale', 'Hasanbeyli', 'Sumbas'],
  hizmetler: [
    { baslik: 'Satış', aciklama: 'Mülkünüzü doğru fiyatla, doğru alıcıya ulaştırıyoruz.' },
    { baslik: 'Kiralama', aciklama: 'Güvenilir kiracı ve uygun ev arayanlar için aracılık.' },
    { baslik: 'Gayrimenkul Değerleme', aciklama: 'Bölge verilerine dayalı ücretsiz fiyat önerisi.' },
    { baslik: 'Yatırım Danışmanlığı', aciklama: 'Getirisi yüksek arsa ve konut fırsatları.' },
    { baslik: 'Tapu İşlemlerinde Destek', aciklama: 'Evrak hazırlığından tapu gününe kadar yanınızdayız.' }
  ],
  neden_biz: [
    { baslik: 'Güvenilir Hizmet', aciklama: 'Yılların verdiği tecrübe ve şeffaf çalışma anlayışı.' },
    { baslik: 'Ücretsiz Değerleme', aciklama: 'Mülkünüzün değerini ücretsiz olarak belirliyoruz.' },
    { baslik: 'Bölgeyi İyi Tanırız', aciklama: 'Osmaniye\'nin her mahallesini yakından biliyoruz.' },
    { baslik: 'Hızlı Sonuç', aciklama: 'Geniş müşteri ağımızla mülkünüzü kısa sürede değerlendiriyoruz.' }
  ],
  sosyal: { facebook: '', instagram: '', youtube: '', tiktok: '' },
  tapu_alici_orani: 2,
  tapu_satici_orani: 2,
  duyuru: '',
  google_yorum_linki: '' // Google İşletme Profili > "Yorum isteyin" bağlantısı; boşsa Google Haritalar araması açılır
};
