-- ============================================================
-- SUPABASE PROJE KURULUMU - REAL ESTATE UYGULAMASI
-- ============================================================
-- Bu dosyayı Supabase SQL Editor'e yapıştırıp çalıştırın.
-- ============================================================

-- 1. ilanlar TABLOSU
CREATE TABLE IF NOT EXISTS ilanlar (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  baslik TEXT NOT NULL,
  tip TEXT NOT NULL CHECK (tip IN ('satılık', 'kiralık')),
  kategori TEXT,
  fiyat TEXT NOT NULL,
  il TEXT NOT NULL,
  ilce TEXT,
  mahalle TEXT,
  metrekare_brut INTEGER,
  metrekare_net INTEGER,
  oda_sayisi INTEGER DEFAULT 1,
  banyo_sayisi INTEGER DEFAULT 1,
  bina_yasi INTEGER,
  bulundugu_kat INTEGER,
  kat_sayisi INTEGER,
  isitma TEXT,
  esyali BOOLEAN DEFAULT false,
  balkon BOOLEAN DEFAULT false,
  asansor BOOLEAN DEFAULT false,
  otopark BOOLEAN DEFAULT false,
  site_icinde BOOLEAN DEFAULT false,
  krediye_uygun BOOLEAN DEFAULT false,
  tapu_durumu TEXT,
  aidat TEXT,
  aciklama TEXT,
  ozellikler JSONB DEFAULT '[]',
  resimler JSONB DEFAULT '[]',
  enlem DECIMAL(10, 8),
  boylam DECIMAL(11, 8),
  one_cikan BOOLEAN DEFAULT false,
  yayinda BOOLEAN DEFAULT true,
  goruntulenme INTEGER DEFAULT 0
);

-- Ilanlar RLS
ALTER TABLE ilanlar ENABLE ROW LEVEL SECURITY;

-- POLICY: Herkes sadece yayinda=true olan ilanları OKUYABILIR
CREATE POLICY 'Herkes yayinda=true ilanlarina gorebilir' ON ilanlar
  FOR SELECT USING (yayinda = true);

-- POLICY: Sadece giris yapmis kullanici ekleme/guncelleme/silme yapabilir
CREATE POLICY 'Sadece authenticated kullanici islem yapabilir' ON ilanlar
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- 2. mesajlar TABLOSU (iletişim formu)
CREATE TABLE IF NOT EXISTS mesajlar (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  isim TEXT NOT NULL,
  telefon TEXT,
  email TEXT,
  konu TEXT,
  mesaj TEXT NOT NULL,
  ilan_id UUID REFERENCES ilanlar(id) ON DELETE SET NULL,
  okundu BOOLEAN DEFAULT false
);

-- Mesajlar RLS
ALTER TABLE mesajlar ENABLE ROW LEVEL SECURITY;

-- POLICY: HERKESS EKLEYEBILIR (iletişim formu)
CREATE POLICY 'Herkes mesaj ekleyebilir' ON mesajlar
  FOR INSERT WITH CHECK (true);

-- POLICY: Sadece giris yapmis okuyup silebilir
CREATE POLICY 'Sadece authenticated okuyup silebilir' ON mesajlar
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- 3. view: sadece yayinda=true ilanlar
CREATE OR REPLACE VIEW aktif_ilanlar AS
SELECT id, baslik, tip, fiyat, il, ilce, mahalle, metrekare_brut,
       oda_sayisi, banyo_sayisi, resimler, yayinda, goruntulenme, created_at
FROM ilanlar
WHERE yayinda = true;

-- View için de RLS
CREATE POLICY 'view aktif_ilanlar' ON aktif_ilanlar FOR SELECT USING (true);

-- ============================================================
-- ÖRNEK ILAN EKLEMELERİ (6 adet)
-- ============================================================
INSERT INTO ilanlar (baslik, tip, fiyat, il, ilce, metrekare_brut, oda_sayisi, banyo_sayisi, aciklama, ozellikler, resimler, yayinda, one_cikan)
VALUES 
('Osmaniye Konut Satışı', 'satılık', '2.500.000 ₺', 'Osmaniye', 'Merkez', 120, 3, 2, 'Modern konut projesi', '{"teras", "klimatiz"}', '{"resim1.jpg", "resim2.jpg"}', true, true),
('Villasaray Villa', 'satılık', '4.200.000 ₺', 'Osmaniye', 'Villasaray', 200, 4, 3, 'Bahçe villa', '{"balkon", "garaj"}', '{"villa1.jpg"}', true, false),
('Osmaniye İş Dairesi', 'kiralık', '5.000 ₺/ay', 'Osmaniye', 'Merkez', 85, 2, 1, 'Dönemi kiralık', '{"kapalı garaj"}', '{"daire1.jpg"}', true, true),
('Yenişehir Daire', 'satılık', '1.800.000 ₺', 'Osmaniye', 'Yenişehir', 95, 2, 1, 'Yenileilmiş daire', '{"teras"}', '{"yenisoir.jpg"}', true, true),
('Favori Mahalle Villa', 'kiralık', '3.200 ₺/ay', 'Osmaniye', 'Favori', 150, 3, 2, 'Gençlik içinde', '{"balkon", "bağ"}', '{"villa2.jpg"}', true, false),
('Osmaniye Merkez Daire', 'satılık', '3.500.000 ₺', 'Osmaniye', 'Merkez', 110, 3, 2, 'Merkez konumu', '{"asansör", "klimatiz"}', '{"daire2.jpg"}', true, true);

-- ============================================================
-- TAMAMLANMA NOTLARI
-- ============================================================
-- 1. Bu dosyayı Supabase projenizin SQL Editor'e yapıştırın.
-- 2. Storage -> Add bucket -> 'ilan-fotograflari' ekleyin.
-- 3. Storage bucket'ine gidin: Public yapın.
-- 4. Access: Public için enabled, Authenticated için write permissions.
-- 5. Supabase Dashboard -> Authentication -> Settings -> Sign up closed (ücretsiz plan için önemi)
-- 6. Yeni admin kullanıcı oluşturmak icin: Authentication -> Users -> Add user
