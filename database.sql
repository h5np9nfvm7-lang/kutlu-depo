-- Real Estate Web Application Database Permissions
-- for anon and authenticated roles with RLS policies

-- ============================================================
-- TABLO VE RLS POLİSİKALARI
-- ============================================================

-- 1. properties (ilanlar) tablosu
CREATE TABLE IF NOT EXISTS properties (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(12,2),
  rent_amount DECIMAL(12,2),
  rooms INTEGER,
  size INTEGER,
  type VARCHAR(50) CHECK (type IN ('satılık', 'kiralık')),
  location VARCHAR(255),
  address TEXT,
  district VARCHAR(100),
  city VARCHAR(100) DEFAULT 'Osmaniye',
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'sold', 'rented')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Properties için RLS enabled
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

-- Anon role: sadece aktif_properties seçebilir
CREATE POLICY "Anon can view active properties" ON properties
  USING (status = 'active');

-- Authenticated role: tüm operasyonları yapabilir
CREATE POLICY "Authenticated can manage properties" ON properties
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- 2. users (kullanıcılar) tablosu
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  full_name VARCHAR(100),
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(50),
  role VARCHAR(50) DEFAULT 'client' CHECK (role IN ('client', 'agent', 'admin')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Users için RLS enabled
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Anon: kendi profilini veya admin görebilir
CREATE POLICY "Anon can view own profile or public users" ON users
  USING (auth.role() = 'anon' AND id = current_setting("app.user_id")::int OR role = 'admin');

-- Authenticated: profil güncelleyebilir
CREATE POLICY "Authenticated can update own profile" ON users
  USING (auth.role() = 'authenticated' AND id = current_setting("app.user_id")::int)
  WITH CHECK (auth.role() = 'authenticated' AND id = current_setting("app.user_id")::int);

-- Admin full control
CREATE POLICY "Admin full access" ON users
  USING (auth.role() = 'authenticated' AND has_role(auth.uid(), 'admin'))
  WITH CHECK (auth.role() = 'authenticated' AND has_role(auth.uid(), 'admin'));

-- 3. favorites (favoriler) tablosu
CREATE TABLE IF NOT EXISTS favorites (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  property_id INTEGER REFERENCES properties(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, property_id)
);

-- Favorites için RLS enabled
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- Anon: favorites'a direct erişim yok (authenticated üzerinden)
CREATE POLICY "Authenticated can manage favorites" ON favorites
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- User'in kendi favorilerini görmesi
CREATE POLICY "User can view own favorites" ON favorites
  USING (auth.role() = 'authenticated' AND user_id = current_setting("app.user_id")::int);

-- 4. inquiries (sorular/iltisim) tablosu
CREATE TABLE IF NOT EXISTS inquiries (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  subject VARCHAR(255),
  message TEXT NOT NULL,
  property_id INTEGER REFERENCES properties(id) ON DELETE SET NULL,
  status VARCHAR(50) DEFAULT 'new' CHECK (status IN ('new', 'read', 'answered')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Inquiries için RLS enabled
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;

-- Anon: yeni soru sorabilir (insert)
CREATE POLICY "Anon can create inquiries" ON inquiries
  FOR INSERT WITH CHECK (auth.role() = 'anon');

-- Anon ve authenticated: sorgulayabilir
CREATE POLICY "Can view inquiries" ON inquiries
  USING (auth.role() = 'anon' OR auth.role() = 'authenticated' AND (property_id IS NULL OR auth.role() = 'admin'));

-- Authenticated: status güncelleyebilir (admin)
CREATE POLICY "Authenticated can update inquiry status" ON inquiries
  USING (auth.role() = 'authenticated' AND has_role(auth.uid(), 'admin'))
  WITH CHECK (auth.role() = 'authenticated' AND has_role(auth.uid(), 'admin'));

-- 5. agents (emlak ajanları) tablosu
CREATE TABLE IF NOT EXISTS agents (
  id SERIAL PRIMARY KEY,
  user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  company VARCHAR(100),
  phone VARCHAR(50),
  image_url TEXT,
  rating DECIMAL(3,2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Agents için RLS enabled
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;

-- Anon: verified agents görebilir
CREATE POLICY "Anon can view verified agents" ON agents
  USING (is_verified = TRUE);

-- Authenticated: agent profilini yönetebilir
CREATE POLICY "Authenticated can manage own agent profile" ON agents
  USING (auth.role() = 'authenticated' AND user_id = current_setting("app.user_id")::int)
  WITH CHECK (auth.role() = 'authenticated' AND user_id = current_setting("app.user_id")::int);

-- ============================================================
-- GRANT COMMANDS
-- ============================================================

-- GRANT untuk anon role (tarayıcı erişim)
GRANT CONNECT ON DATABASE realestate TO anon;
GRANT USAGE ON SCHEMA public TO anon;

-- Tablo-specific grants for anon
GRANT SELECT ON properties TO anon;
GRANT SELECT ON properties TO anon WITH CHECK (status = 'active');

-- Authenticated role tam erişim
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Fine-grained access (tablo bazında)
GRANT INSERT, SELECT ON properties TO authenticated;
GRANT INSERT, SELECT, UPDATE ON users TO authenticated;
GRANT INSERT, SELECT ON favorites TO authenticated;
GRANT INSERT, SELECT ON inquiries TO authenticated;
GRANT INSERT, SELECT ON agents TO authenticated;

-- Sequence grants
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- ============================================================
-- ROL VE PERMİSSİON EKSİNLİKLERİ
-- ============================================================

-- Admin rolü için ekstra permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO admin_role;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO admin_role;

-- ============================================================
-- VIEWS (Görünümler - Güvenli erişim için)
-- ============================================================

-- Sadece aktif_properties gösteren view
CREATE OR REPLACE VIEW active_properties AS
SELECT id, title, description, price, rent_amount, rooms, size,
       type, location, address, district, city, status, created_at
FROM properties
WHERE status = 'active';

GRANT SELECT ON active_properties TO anon;
GRANT SELECT ON active_properties TO authenticated;

-- ============================================================
-- END OF DATABASE PERMISSIONS
