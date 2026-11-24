// ilanlar-veri.js - İlanlar sayfası verileri

// Örnek ilan verileri (gerçek proje veritabanına bağlanacak)
const ilanlar = [
  {
    id: 1,
    baslik: "Osmaniye'de Konut Satışı",
    fiyat: "2.500.000 ₺",
    odalar: 3,
    m2: "120 m²",
    konum: "Osmaniye Merkez",
    tur: "satılık",
    resim: "konut1.jpg",
    oneCikan: true,
    kategori: "Daire"
  },
  {
    id: 2,
    baslik: "Osmaniye İş Merkezi Kiralık",
    fiyat: "5.000 ₺/ay",
    odalar: 2,
    m2: "85 m²",
    konum: "Osmaniye Merkez",
    tur: "kiralık",
    resim: "ismerkezi1.jpg",
    oneCikan: false,
    kategori: "Ofis"
  },
  {
    id: 3,
    baslik: "Villasaray'da Villa Satışı",
    fiyat: "4.200.000 ₺",
    odalar: 4,
    m2: "200 m²",
    konum: "Villasaray",
    tur: "satılık",
    resim: "villa1.jpg",
    oneCikan: true,
    kategori: "Villa"
  },
  {
    id: 4,
    baslik: "Favori Mahalleda Daire Kiralık",
    fiyat: "3.200 ₺/ay",
    odalar: 2,
    m2: "95 m²",
    konum: "Osmaniye Merkez",
    tur: "kiralık",
    resim: "daire1.jpg",
    oneCikan: false,
    kategori: "Daire"
  },
  {
    id: 5,
    baslik: "Merkez'deki Müstakil Ev",
    fiyat: "3.500.000 ₺",
    odalar: 5,
    m2: "250 m²",
    konum: "Osmaniye Merkez",
    tur: "satılık",
    resim: "mustakil1.jpg",
    oneCikan: true,
    kategori: "Müstakil Ev"
  },
  {
    id: 6,
    baslik: "Osmaniye Arsa Satışı",
    fiyat: "1.200.000 ₺",
    odalar: 0,
    m2: "500 m²",
    konum: "Osmaniye Merkez",
    tur: "satılık",
    resim: "arsa1.jpg",
    oneCikan: false,
    kategori: "Arsa"
  },
  {
    id: 7,
    baslik: "Dükkan Kiralık",
    fiyat: "1.500 ₺/ay",
    odalar: 1,
    m2: "30 m²",
    konum: "Osmaniye Merkez",
    tur: "kiralık",
    resim: "dukkan1.jpg",
    oneCikan: false,
    kategori: "Dükkan"
  }
];

// Fiyat formatlama - Türk lirası formatı
function formatFiyat(fiyatStr) {
  // "2.500.000 ₺" veya "5.000 ₺/ay" formatından fiyat miktarı çıkar
  const match = fiyatStr.match(/[\d.,]+/);
  if (!match) return fiyatStr;
  
  const fiyat = match[0].replace(/\./, '').replace(',', '.');
  const number = parseFloat(fiyat);
  
  if (isNaN(number)) return fiyatStr;
  
  // Başına ₺ ekle ve ayraçları düzelt
  return number.toLocaleString('tr-TR', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' ₺';
}

// Sayacı artan efekt
function animateCounter(element, endValue) {
  const startValue = 0;
  const duration = 1000;
  const startTime = performance.now();
  
  function updateCounter(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easeOut = 1 - Math.pow(1 - progress, 3);
    const currentValue = startValue + (endValue - startValue) * easeOut;
    
    element.textContent = Math.floor(currentValue).toLocaleString('tr-TR');
    
    if (progress < 1) {
      requestAnimationFrame(updateCounter);
    }
  }
  
  requestAnimationFrame(updateCounter);
}

// Sayfaya ilanları eklemek için fonksiyon (filtre desteği ile)
function ilanlarYazdir(filters = {}) {
  const container = document.querySelector('.ilanlar-container');
  if (!container) return;
  
  // Filtrele
  let filtered = ilanlar;
  
  // oneCikan filtresi
  if (filters.oneCikan !== undefined) {
    filtered = filtered.filter(il => il.oneCikan === filters.oneCikan);
  }
  
  // Kategori filtresi
  if (filters.kategori && filters.kategori !== 'Tümü') {
    filtered = filtered.filter(il => il.kategori === filters.kategori);
  }
  
  // Tur filtresi (satılık/kiralık)
  if (filters.tur) {
    filtered = filtered.filter(il => il.tur === filters.tur);
  }
  
  // İlçe filtresi
  if (filters.ilce) {
    filtered = filtered.filter(il => il.konum.includes(filters.ilce));
  }
  
  container.innerHTML = filtered.map((ilan, index) => `
    <div class="card" style="border-left: 4px solid var(--renk-ana);">
      <div class="card-image">
        <img src="images/${ilan.resim}" alt="${ilan.baslik}" loading="lazy">
        <span class="badge badge-${ilan.tur}">${ilan.tur === 'satılık' ? 'Satılık' : 'Kiralık'}</span>
      </div>
      <div class="card-content">
        <h3 style="font-family: var(--font-baslik); margin: 0.5rem 0;">${ilan.baslik}</h3>
        <p style="font-size: 0.85rem; color: var(--renk-metin); margin: 0.2rem 0;">
          <strong>Fiyat:</strong> ${formatFiyat(ilan.fiyat)}
        </p>
        <p style="font-size: 0.75rem; color: #666; margin: 0.2rem 0;">
          <strong>Oda:</strong> ${ilan.odalar} | <strong>M²:</strong> ${ilan.m2} | <strong>Konum:</strong> ${ilan.konum}
        </p>
        <p style="font-size: 0.7rem; color: #999; margin: 0.1rem 0;">
          Kategori: ${ilan.kategori}
        </p>
        <a href="ilan.html?id=${ilan.id}" class="btn" style="width: 100%; justify-content: center; font-size: 0.8rem; padding: 0.5rem;">Detaylar</a>
      </div>
    </div>
  `).join('');
}

// DOMContentLoaded dinleyici
document.addEventListener('DOMContentLoaded', function() {
  const page = window.location.pathname.split('/').pop() || 'index';
  
  if (page === 'index.html' || page === 'index') {
    // Ana sayfa için sayaçları başlat
    animateCounters();
  }
  
  if (document.querySelector('.ilanlar-container')) {
    ilanlarYazdir();
  }
});

// Dışa açılan fonksiyonlar
export { ilanlarYazdir, formatFiyat, animateCounter };