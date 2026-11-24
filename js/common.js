/* ==========================================================
   BİZİM EMLAK - ORTAK KODLAR (tüm sayfalarda kullanılır)
   Menü, alt bilgi, ilan kartı, favoriler, ayarlar vb.
   ========================================================== */
(function () {
  'use strict';
  const C = window.BE_CONFIG;
  const BE = (window.BE = {});

  /* ---------- Supabase bağlantısı ---------- */
  BE.db = null;
  try {
    if (window.supabase && C.SUPABASE_URL && C.SUPABASE_KEY) {
      BE.db = window.supabase.createClient(C.SUPABASE_URL, C.SUPABASE_KEY);
    }
  } catch (e) { console.error('Supabase başlatılamadı', e); }

  /* ---------- İkonlar ---------- */
  const IKONLAR = {
    ev: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/><path d="M10 21v-6h4v6"/>',
    bina: '<rect x="4" y="3" width="16" height="18" rx="1"/><path d="M9 7h1M14 7h1M9 11h1M14 11h1M9 15h1M14 15h1M10 21v-3h4v3"/>',
    villa: '<path d="M2 12 12 4l10 8"/><path d="M4 10.5V20h16v-9.5"/><rect x="9" y="13" width="6" height="7"/><path d="M17 6V3h2v4.5"/>',
    arsa: '<path d="M3 20h18"/><path d="M5 20V9l4-3 4 3v11"/><path d="M15 20v-6l3-2 3 2v6"/><path d="M3 4l3 2M21 4l-3 2"/>',
    dukkan: '<path d="M3 9l1.5-5h15L21 9"/><path d="M3 9h18v2a3 3 0 0 1-6 0 3 3 0 0 1-6 0 3 3 0 0 1-6 0z"/><path d="M5 13v8h14v-8"/><path d="M10 21v-5h4v5"/>',
    ofis: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M3 13h18"/>',
    konum: '<path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
    telefon: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"/>',
    eposta: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 6-10 7L2 6"/>',
    saat: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    kalp: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z"/>',
    menu: '<path d="M3 6h18M3 12h18M3 18h18"/>',
    kapat: '<path d="M18 6 6 18M6 6l12 12"/>',
    ara: '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>',
    oda: '<path d="M3 20V8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v12"/><path d="M3 14h18M7 14v-3h4v3"/>',
    alan: '<path d="M3 3h7M3 3v7M21 21h-7M21 21v-7M3 3l7 7M21 21l-7-7"/>',
    kat: '<path d="m12 2 10 5-10 5L2 7z"/><path d="m2 12 10 5 10-5M2 17l10 5 10-5"/>',
    banyo: '<path d="M4 12h16v3a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z"/><path d="M6 12V5a2 2 0 0 1 4 0"/><path d="M7 20l-1 2M17 20l1 2"/>',
    takvim: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
    kamera: '<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>',
    tik: '<path d="M20 6 9 17l-5-5"/>',
    sol: '<path d="m15 18-6-6 6-6"/>',
    sag: '<path d="m9 18 6-6-6-6"/>',
    kalkan: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>',
    hesap: '<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M8 6h8M8 10h.01M12 10h.01M16 10h.01M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h4"/>',
    harita: '<path d="m1 6 7-3 8 3 7-3v15l-7 3-8-3-7 3z"/><path d="M8 3v15M16 6v15"/>',
    yildiz: '<path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z"/>',
    hiz: '<path d="M13 2 3 14h9l-1 8 10-12h-9z"/>',
    anahtar: '<circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-9.6 9.6M15.5 7.5l3 3L22 7l-3-3"/>',
    grafik: '<path d="M3 3v18h18"/><path d="m7 15 4-4 3 3 6-6"/>',
    belge: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h8"/>',
    kullanici: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    izgara: '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>',
    liste: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
    filtre: '<path d="M22 3H2l8 9.5V19l4 2v-8.5z"/>',
    paylas: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4"/>',
    goz: '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z"/><circle cx="12" cy="12" r="3"/>',
    yazdir: '<path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>',
    facebook: '<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>',
    instagram: '<rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17.5 6.5h.01"/>',
    youtube: '<path d="M22.5 6.4a2.8 2.8 0 0 0-2-2C18.9 4 12 4 12 4s-6.9 0-8.5.4a2.8 2.8 0 0 0-2 2A29 29 0 0 0 1 12a29 29 0 0 0 .5 5.6 2.8 2.8 0 0 0 2 2C5.1 20 12 20 12 20s6.9 0 8.5-.4a2.8 2.8 0 0 0 2-2A29 29 0 0 0 23 12a29 29 0 0 0-.5-5.6z"/><path d="m9.8 15.5 5.7-3.5-5.7-3.5z"/>',
    tiktok: '<path d="M9 12a4 4 0 1 0 4 4V2c.5 2.5 2.5 4.5 5 5"/>'
  };
  BE.ikon = (ad, ek = '') => `<svg class="ikon ${ek}" viewBox="0 0 24 24" aria-hidden="true">${IKONLAR[ad] || ''}</svg>`;
  BE.WP_SVG = '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M16 3C9 3 3.3 8.6 3.3 15.6c0 2.3.6 4.5 1.8 6.4L3 29l7.2-2a12.7 12.7 0 0 0 5.8 1.4h.1c7 0 12.7-5.6 12.7-12.6S23 3 16 3zm0 23.1c-1.9 0-3.8-.5-5.4-1.5l-.4-.2-4.3 1.1 1.1-4.2-.3-.4a10.4 10.4 0 0 1-1.6-5.6C5.1 9.9 10 5.1 16 5.1S26.8 9.9 26.8 15.8 21.9 26.1 16 26.1zm5.9-7.8c-.3-.2-1.9-.9-2.2-1s-.5-.2-.7.2-.8 1-1 1.2-.4.2-.7.1a8.5 8.5 0 0 1-4.3-3.7c-.3-.6.3-.5.9-1.7.1-.2 0-.4 0-.5l-1-2.4c-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4s-1.2 1.1-1.2 2.7 1.2 3.2 1.4 3.4 2.4 3.6 5.7 5c2.1.9 3 1 4 .8.7-.1 1.9-.8 2.2-1.5s.3-1.4.2-1.5-.3-.2-.6-.3z"/></svg>';

  /* ---------- Yardımcılar ---------- */
  BE.esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  BE.$ = (s, k = document) => k.querySelector(s);
  BE.$$ = (s, k = document) => Array.from(k.querySelectorAll(s));
  const sayiFmt = new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 });
  BE.sayi = (n) => (n === null || n === undefined || n === '' || isNaN(n)) ? '' : sayiFmt.format(Number(n));
  BE.tl = (n) => (n === null || n === undefined || n === '' || isNaN(n)) ? '-' : sayiFmt.format(Math.round(Number(n))) + ' TL';
  BE.fiyat = (ilan) => {
    if (!ilan.fiyat && ilan.fiyat !== 0) return 'Fiyat Sorunuz';
    return BE.tl(ilan.fiyat) + (ilan.tip === 'Kiralık' ? ' <small>/ ay</small>' : '');
  };
  BE.tarih = (t) => t ? new Date(t).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }) : '';
  BE.param = (ad) => new URLSearchParams(location.search).get(ad);
  BE.telLink = (tel) => 'tel:' + String(tel || '').replace(/[^\d+]/g, '').replace(/^0/, '+90');
  BE.wpLink = (no, mesaj = '') => {
    let n = String(no || '').replace(/\D/g, '');
    if (n.startsWith('0')) n = '90' + n.slice(1);
    if (n.length === 10) n = '90' + n;
    return 'https://wa.me/' + n + (mesaj ? '?text=' + encodeURIComponent(mesaj) : '');
  };
  // Türkçe karakterleri sadeleştirerek adres parçası üretir (scripts/olustur.mjs ile aynı olmalı)
  BE.slug = (t) => String(t || '').toLocaleLowerCase('tr-TR')
    .replace(/ç/g, 'c').replace(/ğ/g, 'g').replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ş/g, 's').replace(/ü/g, 'u').replace(/â/g, 'a').replace(/î/g, 'i').replace(/û/g, 'u')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 70).replace(/-+$/g, '');
  BE.ilanUrl = (i) => `ilan-${i.id}-${BE.slug(i.baslik)}.html`;
  BE.konum = (i) => [i.mahalle, i.ilce, i.il].filter(Boolean).join(', ');
  BE.kapak = (i) => (Array.isArray(i.resimler) && i.resimler.length ? i.resimler[0] : '');
  BE.depola = {
    al(k, v) { try { const x = localStorage.getItem(k); return x ? JSON.parse(x) : v; } catch { return v; } },
    yaz(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* tarayıcı izin vermiyor */ } }
  };

  BE.bildirim = (metin, tur = '') => {
    let kap = BE.$('.bildirim-kap');
    if (!kap) { kap = document.createElement('div'); kap.className = 'bildirim-kap'; kap.setAttribute('role', 'status'); document.body.appendChild(kap); }
    const b = document.createElement('div');
    b.className = 'bildirim ' + tur; b.textContent = metin;
    kap.appendChild(b);
    setTimeout(() => b.remove(), 3200);
  };

  /* ---------- Site ayarları ---------- */
  let ayarSozu = null;
  BE.ayarlar = function () {
    if (ayarSozu) return ayarSozu;
    const v = JSON.parse(JSON.stringify(window.BE_VARSAYILAN_AYARLAR));
    ayarSozu = (async () => {
      if (!BE.db) return v;
      try {
        const { data, error } = await BE.db.from('site_ayarlari').select('veri').eq('id', 1).maybeSingle();
        if (error) throw error;
        if (data && data.veri) return Object.assign(v, data.veri);
      } catch (e) { console.warn('Ayarlar okunamadı, varsayılanlar kullanılıyor.', e); }
      return v;
    })();
    return ayarSozu;
  };

  const GUN_SIRA = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
  BE.bugunAdi = () => GUN_SIRA[new Date().getDay()];
  BE.acikMi = (a) => {
    const bugun = (a.calisma_saatleri || []).find((g) => g.gun === BE.bugunAdi());
    if (!bugun || !bugun.acik || !bugun.baslangic || !bugun.bitis) return false;
    const s = new Date(); const dk = s.getHours() * 60 + s.getMinutes();
    const [bh, bm] = bugun.baslangic.split(':').map(Number);
    const [kh, km] = bugun.bitis.split(':').map(Number);
    return dk >= bh * 60 + bm && dk < kh * 60 + km;
  };
  BE.saatMetni = (g) => (g && g.acik && g.baslangic) ? `${g.baslangic} - ${g.bitis}` : 'Kapalı';

  /* ---------- Favoriler & son bakılanlar ---------- */
  BE.favoriler = () => BE.depola.al('be_favoriler', []);
  BE.favoriMi = (id) => BE.favoriler().includes(String(id));
  BE.favoriDegistir = (id) => {
    id = String(id);
    let f = BE.favoriler();
    const vardi = f.includes(id);
    f = vardi ? f.filter((x) => x !== id) : [id, ...f];
    BE.depola.yaz('be_favoriler', f);
    BE.favSayiGuncelle();
    BE.bildirim(vardi ? 'Favorilerden çıkarıldı' : 'Favorilere eklendi');
    return !vardi;
  };
  BE.favSayiGuncelle = () => BE.$$('.fav-sayi').forEach((e) => { const n = BE.favoriler().length; e.textContent = n || ''; });
  BE.sonBakilanEkle = (id) => {
    id = String(id);
    const l = BE.depola.al('be_son_bakilanlar', []).filter((x) => x !== id);
    BE.depola.yaz('be_son_bakilanlar', [id, ...l].slice(0, 8));
  };

  // Tüm sayfalarda favori butonlarına tıklama
  document.addEventListener('click', (e) => {
    const b = e.target.closest('.fav-btn');
    if (!b) return;
    e.preventDefault(); e.stopPropagation();
    const aktif = BE.favoriDegistir(b.dataset.id);
    BE.$$(`.fav-btn[data-id="${b.dataset.id}"]`).forEach((x) => {
      x.classList.toggle('aktif', aktif);
      x.setAttribute('aria-pressed', aktif);
      x.setAttribute('aria-label', aktif ? 'Favorilerden çıkar' : 'Favorilere ekle');
    });
    document.dispatchEvent(new CustomEvent('favori-degisti'));
  });

  /* ---------- İlan verileri ---------- */
  BE.ilanlar = async function (secenek = {}) {
    if (!BE.db) throw new Error('Veritabanı bağlantısı kurulamadı.');
    let q = BE.db.from('ilanlar').select('*').eq('yayinda', true);
    if (!secenek.tumu) q = q.eq('durum', 'Aktif');
    if (secenek.ids) q = q.in('id', secenek.ids.map(Number).filter(Boolean));
    if (secenek.oneCikan) q = q.eq('one_cikan', true);
    q = q.order('created_at', { ascending: false });
    if (secenek.limit) q = q.limit(secenek.limit);
    const { data, error } = await q;
    if (error) throw error;
    return data || [];
  };
  BE.ilan = async function (id) {
    if (!BE.db) throw new Error('Veritabanı bağlantısı kurulamadı.');
    const { data, error } = await BE.db.from('ilanlar').select('*').eq('id', Number(id)).eq('yayinda', true).maybeSingle();
    if (error) throw error;
    return data;
  };

  /* ---------- İlan kartı ---------- */
  BE.DURUM_YAZI = { 'Satıldı': 'Bu ilan satılmıştır', 'Kiralandı': 'Bu ilan kiralanmıştır', 'Pasif': 'Bu ilan şu an aktif değil' };
  BE.aktifMi = (i) => !i.durum || i.durum === 'Aktif';
  BE.kart = function (i) {
    const fav = BE.favoriMi(i.id);
    const resim = BE.kapak(i);
    const fotoSayi = (i.resimler || []).length;
    const bilgiler = [];
    if (i.oda_sayisi) bilgiler.push(`<span title="Oda sayısı">${BE.ikon('oda')} ${BE.esc(i.oda_sayisi)}</span>`);
    if (i.net_m2 || i.brut_m2) bilgiler.push(`<span title="Metrekare">${BE.ikon('alan')} ${BE.sayi(i.net_m2 || i.brut_m2)} m²</span>`);
    if (i.bulundugu_kat) bilgiler.push(`<span title="Bulunduğu kat">${BE.ikon('kat')} ${BE.esc(i.bulundugu_kat)}${/^\d+$/.test(i.bulundugu_kat) ? '. Kat' : ''}</span>`);
    else if (i.kategori) bilgiler.push(`<span>${BE.ikon('ev')} ${BE.esc(i.kategori)}</span>`);
    return `
    <article class="kart belir ${BE.aktifMi(i) ? '' : 'kart-pasif'}">
      <div class="kart-resim">
        ${resim ? `<img src="${BE.esc(resim)}" alt="${BE.esc(i.baslik)}" loading="lazy">` : `<div class="resim-yok"><img src="images/logo.png" alt=""><span>Fotoğraf yakında</span></div>`}
        <div class="kart-rozetler">
          <span class="rozet ${i.tip === 'Kiralık' ? 'rozet-kiralik' : 'rozet-satilik'}">${BE.esc(i.tip)}</span>
          ${BE.aktifMi(i) ? (i.one_cikan ? '<span class="rozet rozet-one">Öne Çıkan</span>' : '') : `<span class="rozet rozet-durum">${BE.esc(i.durum === 'Pasif' ? 'Aktif Değil' : i.durum)}</span>`}
        </div>
        ${fotoSayi > 1 ? `<span class="kart-foto-sayi">${BE.ikon('kamera')} ${fotoSayi}</span>` : ''}
      </div>
      <button class="fav-btn ${fav ? 'aktif' : ''}" data-id="${i.id}" aria-pressed="${fav}" aria-label="${fav ? 'Favorilerden çıkar' : 'Favorilere ekle'}">${BE.ikon('kalp')}</button>
      <div class="kart-govde">
        <div class="kart-fiyat">${BE.fiyat(i)}</div>
        <h3 class="kart-baslik"><a href="${BE.ilanUrl(i)}">${BE.esc(i.baslik)}</a></h3>
        <div class="kart-konum">${BE.ikon('konum')} ${BE.esc(BE.konum(i))}</div>
        <div class="kart-bilgi">${bilgiler.join('')}</div>
      </div>
    </article>`;
  };
  BE.kartIskelet = (n = 3) => Array.from({ length: n }, () => `
    <div class="kart kart-iskelet" aria-hidden="true"><div class="kart-resim iskelet"></div>
    <div class="kart-govde"><div class="satir iskelet" style="width:50%"></div><div class="satir iskelet"></div><div class="satir iskelet" style="width:70%"></div></div></div>`).join('');
  BE.hataHtml = (m) => `<div class="hata-kutu" role="alert">${BE.esc(m || 'İlanlar şu anda yüklenemedi. Lütfen biraz sonra tekrar deneyin.')}</div>`;

  /* ---------- Kaydırınca belirme ---------- */
  let gozlemci = null;
  BE.belirt = function () {
    const ogeler = BE.$$('.belir:not(.gorundu)');
    if (!('IntersectionObserver' in window)) { ogeler.forEach((o) => o.classList.add('gorundu')); return; }
    gozlemci = gozlemci || new IntersectionObserver((g) => g.forEach((x) => {
      if (x.isIntersecting) { x.target.classList.add('gorundu'); gozlemci.unobserve(x.target); }
    }), { threshold: 0.08 });
    ogeler.forEach((o) => gozlemci.observe(o));
  };

  /* ---------- Menü ve alt bilgi ---------- */
  const MENU = [
    ['index.html', 'Ana Sayfa'], ['ilanlar.html', 'İlanlar'], ['hesaplamalar.html', 'Hesaplamalar'],
    ['rehber.html', 'Emlak Rehberi'], ['hakkimizda.html', 'Hakkımızda'], ['iletisim.html', 'İletişim']
  ];

  const POPULER = [
    ['osmaniye-satilik-daire.html', 'Osmaniye Satılık Daire'], ['osmaniye-kiralik-daire.html', 'Osmaniye Kiralık Daire'],
    ['osmaniye-satilik-ev.html', 'Osmaniye Satılık Ev'], ['osmaniye-kiralik-ev.html', 'Osmaniye Kiralık Ev'],
    ['osmaniye-satilik-villa.html', 'Osmaniye Satılık Villa'], ['osmaniye-satilik-arsa.html', 'Osmaniye Satılık Arsa'],
    ['osmaniye-kiralik-dukkan.html', 'Osmaniye Kiralık Dükkan']
  ];

  function ustHtml(a, aktif) {
    const bugun = (a.calisma_saatleri || []).find((g) => g.gun === BE.bugunAdi());
    return `
    ${a.duyuru ? `<div class="duyuru">${BE.esc(a.duyuru)}</div>` : ''}
    <div class="ust-bar"><div class="kap">
      <div class="sol">
        ${a.telefon ? `<a href="${BE.telLink(a.telefon)}">${BE.ikon('telefon')} ${BE.esc(a.telefon)}</a>` : ''}
        ${a.eposta ? `<a href="mailto:${BE.esc(a.eposta)}">${BE.ikon('eposta')} ${BE.esc(a.eposta)}</a>` : ''}
      </div>
      <div class="sag"><span>${BE.ikon('saat')} Bugün: ${BE.esc(BE.saatMetni(bugun))}</span></div>
    </div></div>
    <div class="kap menu-kap">
      <a href="./" class="logo" aria-label="${BE.esc(a.firma_adi)} ana sayfa"><img src="images/logo.png" alt="${BE.esc(a.firma_adi)}" width="351" height="128"></a>
      <button class="menu-ac" aria-label="Menüyü aç" aria-expanded="false" aria-controls="ana-menu">${BE.ikon('menu')}</button>
      <nav class="ana-menu" id="ana-menu" aria-label="Ana menü">
        <button class="menu-ac menu-kapat" aria-label="Menüyü kapat">${BE.ikon('kapat')}</button>
        ${MENU.map(([u, t]) => `<a href="${u === 'index.html' ? './' : u}" ${u === aktif ? 'class="aktif" aria-current="page"' : ''}>${t}</a>`).join('')}
        <a href="favoriler.html" class="fav-link ${aktif === 'favoriler.html' ? 'aktif' : ''}" aria-label="Favorilerim">${BE.ikon('kalp')} <span class="fav-yazi">Favoriler</span> <span class="fav-sayi"></span></a>
      </nav>
    </div>`;
  }

  function altHtml(a) {
    const s = a.sosyal || {};
    const sosyal = ['facebook', 'instagram', 'youtube', 'tiktok'].filter((k) => s[k])
      .map((k) => `<a href="${BE.esc(s[k])}" target="_blank" rel="noopener" aria-label="${k}">${BE.ikon(k)}</a>`).join('');
    return `
    <div class="kap alt-izgara">
      <div>
        <img src="images/logo-beyaz.png" alt="${BE.esc(a.firma_adi)}" class="alt-logo">
        <p>${BE.esc(a.slogan)}</p>
        ${sosyal ? `<div class="sosyal">${sosyal}</div>` : ''}
      </div>
      <div>
        <h4>Hızlı Linkler</h4>
        <ul>${MENU.map(([u, t]) => `<li><a href="${u === 'index.html' ? './' : u}">${t}</a></li>`).join('')}<li><a href="favoriler.html">Favorilerim</a></li></ul>
      </div>
      <div>
        <h4>İletişim</h4>
        <ul class="alt-iletisim">
          ${a.adres ? `<li>${BE.ikon('konum')}<span>${BE.esc(a.adres)}</span></li>` : ''}
          ${a.telefon ? `<li>${BE.ikon('telefon')}<a href="${BE.telLink(a.telefon)}">${BE.esc(a.telefon)}</a></li>` : ''}
          ${a.telefon2 ? `<li>${BE.ikon('telefon')}<a href="${BE.telLink(a.telefon2)}">${BE.esc(a.telefon2)}</a></li>` : ''}
          ${a.eposta ? `<li>${BE.ikon('eposta')}<a href="mailto:${BE.esc(a.eposta)}">${BE.esc(a.eposta)}</a></li>` : ''}
        </ul>
      </div>
      <div>
        <h4>Çalışma Saatleri</h4>
        <ul class="alt-saatler">${(a.calisma_saatleri || []).map((g) => `<li><span>${BE.esc(g.gun)}</span><span>${BE.esc(BE.saatMetni(g))}</span></li>`).join('')}</ul>
        ${a.calisma_notu ? `<p style="font-size:.8rem;margin-top:10px">${BE.esc(a.calisma_notu)}</p>` : ''}
      </div>
    </div>
    <div class="kap alt-aramalar">
      <strong>Popüler Aramalar:</strong>
      ${POPULER.map(([u, t]) => `<a href="${u}">${t}</a>`).join('')}
    </div>
    <div class="kap alt-telif">
      <span>© ${new Date().getFullYear()} ${BE.esc(a.firma_adi)}. Tüm hakları saklıdır.</span>
      <span>${BE.esc(a.hizmet_bolgesi || '')}</span>
    </div>`;
  }

  BE.sayfaBaslat = async function (aktif) {
    const a = await BE.ayarlar();
    BE.A = a;
    const ust = BE.$('#site-ust');
    if (ust) {
      ust.className = 'site-ust';
      ust.innerHTML = ustHtml(a, aktif);
      const menu = BE.$('#ana-menu', ust);
      const ac = BE.$('.menu-ac', ust);
      let perde = null;
      const kapat = () => { menu.classList.remove('acik'); ac.setAttribute('aria-expanded', 'false'); perde && perde.remove(); perde = null; document.body.style.overflow = ''; };
      ac.addEventListener('click', () => {
        menu.classList.add('acik'); ac.setAttribute('aria-expanded', 'true');
        perde = document.createElement('div'); perde.className = 'menu-perde'; perde.addEventListener('click', kapat);
        document.body.appendChild(perde); document.body.style.overflow = 'hidden';
      });
      BE.$('.menu-kapat', ust).addEventListener('click', kapat);
      document.addEventListener('keydown', (e) => { if (e.key === 'Escape') kapat(); });
      window.addEventListener('scroll', () => ust.classList.toggle('golgeli', window.scrollY > 10), { passive: true });
    }
    const alt = BE.$('#site-alt');
    if (alt) { alt.className = 'site-alt'; alt.innerHTML = altHtml(a); }

    if (a.whatsapp && !BE.$('.wp-sabit')) {
      const wp = document.createElement('a');
      wp.className = 'wp-sabit'; wp.href = BE.wpLink(a.whatsapp, 'Merhaba, bilgi almak istiyorum.');
      wp.target = '_blank'; wp.rel = 'noopener'; wp.setAttribute('aria-label', 'WhatsApp ile yazın');
      wp.innerHTML = BE.WP_SVG; document.body.appendChild(wp);
    }
    if (a.telefon && !BE.$('.tel-sabit')) {
      const t = document.createElement('a');
      t.className = 'tel-sabit'; t.href = BE.telLink(a.telefon); t.setAttribute('aria-label', 'Hemen arayın');
      t.innerHTML = BE.ikon('telefon'); document.body.appendChild(t);
    }
    // Sayfadaki [data-ayar] alanlarını doldur
    BE.$$('[data-ayar]').forEach((e) => { const v = a[e.dataset.ayar]; if (v !== undefined && v !== '') e.textContent = v; });
    BE.favSayiGuncelle();
    BE.belirt();
    return a;
  };
})();
