// ============================================================
-- Supabase CDN Baslatma (v2)
-- Tum sayfalar bu dosyayi import ederek ilanlari cekebilir
-- ============================================================

// Supabase client'i CDN üzerinden baslat
// Degerleri Supabase projenizden alin
const supabase = supabase.createClient(
  'https://zcfdiskphrmwdxqnexio.supabase.co',  // Supabase Proje URL'niz
  'sb_publishable_085SzLY-pef-AHq6-qnBbQ_9MKLb2Mb'  // Anon/publishable key'iniz
);

// Sayfa yuklenirken iskelet gorumu icin yardımcı fonksiyon
export function showLoading(element) {
  if (element) {
    element.innerHTML = `
      <div style="color: var(--renk-metin); padding: 2rem; text-align: center;">
        <p>Yukleniyor...</p>
        <div class="skeleton" style="width: 100%; margin: 1rem auto;"></div>
      </div>`;
  }
}

// Hata yönetimi
export function showError(element, message) {
  if (element) {
    element.innerHTML = `
      <div style="color: var(--renk-ana); padding: 1rem; background: #fff0f0; border-radius: 4px; margin: 1rem 0;">
        <strong>Uyarı:</strong> ${message}
      </div>`;
  }
}

// JSON'yi güvenli şekilde parse et
export function safeParseJSON(text) {
  try {
    return JSON.parse(text);
  } catch (e) {
    console.error('JSON parse hatası:', e);
    return [];
  }
}

// LocalStorage'ye kaydetme ( offline destek için )
export function saveToLocalStorage(key, data) {
  try {
    localStorage.setItem(`re_${key}`, JSON.stringify(data));
  } catch (e) {
    console.error('LocalStorage kaydedilemedi:', e);
  }
}

// LocalStorage'den yükleme
export function loadFromLocalStorage(key) {
  try {
    const data = localStorage.getItem(`re_${key}`);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    return null;
  }
}

// Supabase bağlantı durumunu kontrol et
export async function checkConnection() {
  try {
    const { data, error } = await supabase.from('ilanlar').select('count', { count: 'exact', head: true });
    return !error;
  } catch (e) {
    return false;
  }
}
