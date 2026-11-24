/* Ana sayfa */
(async function () {
  const { $, $$, esc, ikon } = BE;
  const oneEl = $('#one-cikanlar'), sonEl = $('#son-eklenenler');
  oneEl.innerHTML = BE.kartIskelet(3);
  sonEl.innerHTML = BE.kartIskelet(3);

  const a = await BE.sayfaBaslat('index.html');

  // İlçeler
  $('#arama-ilce').insertAdjacentHTML('beforeend', (a.ilceler || []).map((i) => `<option>${esc(i)}</option>`).join(''));

  // Arama sekmeleri
  let tip = '';
  $$('.arama-sekme button').forEach((b) => b.addEventListener('click', () => {
    $$('.arama-sekme button').forEach((x) => x.classList.remove('aktif'));
    b.classList.add('aktif'); tip = b.dataset.tip;
  }));
  $('#arama-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const f = new FormData(e.target); const p = new URLSearchParams();
    if (tip) p.set('tip', tip);
    for (const [k, v] of f.entries()) if (v) p.set(k, v);
    location.href = 'ilanlar.html' + (p.toString() ? '?' + p : '');
  });

  // Neden biz & hizmetler
  const nIk = ['kalkan', 'grafik', 'harita', 'hiz'];
  $('#neden-biz').innerHTML = (a.neden_biz || []).map((k, i) => `
    <div class="kutu ${i === 0 ? 'kutu-siyah' : ''} belir"><div class="kutu-ikon">${ikon(nIk[i % nIk.length])}</div>
    <h3>${esc(k.baslik)}</h3><p>${esc(k.aciklama)}</p></div>`).join('');
  const hIk = ['anahtar', 'ev', 'grafik', 'yildiz', 'belge', 'hesap'];
  $('#hizmetler').innerHTML = (a.hizmetler || []).map((k, i) => `
    <div class="kutu belir"><div class="kutu-ikon">${ikon(hIk[i % hIk.length])}</div>
    <h3>${esc(k.baslik)}</h3><p>${esc(k.aciklama)}</p></div>`).join('');

  // Çağrı butonları
  const cb = $('#cagri-butonlar');
  if (a.whatsapp) cb.insertAdjacentHTML('beforeend', `<a class="btn btn-wp" target="_blank" rel="noopener" href="${BE.wpLink(a.whatsapp, 'Merhaba, mülkümü değerlendirmek istiyorum.')}">WhatsApp</a>`);
  if (a.telefon) cb.insertAdjacentHTML('beforeend', `<a class="btn btn-beyaz" href="${BE.telLink(a.telefon)}">${ikon('telefon')} Hemen Ara</a>`);

  // Kategoriler
  const KAT = [['Daire', 'bina'], ['Villa', 'villa'], ['Müstakil Ev', 'ev'], ['Arsa', 'arsa'], ['Dükkan', 'dukkan'], ['Ofis', 'ofis']];
  const katCiz = (sayilar) => {
    $('#kategoriler').innerHTML = KAT.map(([k, ic]) => `
      <a class="kategori belir" href="ilanlar.html?kategori=${encodeURIComponent(k)}">${ikon(ic)}
      <strong>${k}</strong><small>${sayilar ? (sayilar[k] || 0) + ' ilan' : '&nbsp;'}</small></a>`).join('');
  };
  katCiz(null);

  // İlanlar
  let ilanlar = [];
  try { ilanlar = await BE.ilanlar(); }
  catch (e) {
    console.error(e);
    oneEl.innerHTML = BE.hataHtml(); sonEl.innerHTML = '';
  }
  if (ilanlar.length || !oneEl.querySelector('.hata-kutu')) {
    const sayilar = {}; ilanlar.forEach((i) => { sayilar[i.kategori] = (sayilar[i.kategori] || 0) + 1; });
    katCiz(sayilar);
    let one = ilanlar.filter((i) => i.one_cikan).slice(0, 6);
    if (!one.length) one = ilanlar.slice(0, 3);
    oneEl.innerHTML = one.length ? one.map(BE.kart).join('') : '<p class="bos-durum" style="grid-column:1/-1">Henüz ilan eklenmedi.</p>';
    sonEl.innerHTML = ilanlar.slice(0, 6).map(BE.kart).join('');

    // Son bakılanlar
    const son = BE.depola.al('be_son_bakilanlar', []);
    const sonIlan = son.map((id) => ilanlar.find((i) => String(i.id) === id)).filter(Boolean).slice(0, 3);
    if (sonIlan.length) { $('#son-bakilanlar').innerHTML = sonIlan.map(BE.kart).join(''); $('#son-bakilan-bolum').classList.remove('gizli'); }
  }

  // Rakamlar
  const hedef = {
    'r-tecrube': Number(a.tecrube_yili) || 0,
    'r-ilan': ilanlar.length,
    'r-satilik': ilanlar.filter((i) => i.tip === 'Satılık').length,
    'r-kiralik': ilanlar.filter((i) => i.tip === 'Kiralık').length
  };
  const say = (el) => {
    const h = hedef[el.id] || 0; const t0 = performance.now();
    const adim = (t) => { const p = Math.min(1, (t - t0) / 1200); el.textContent = Math.round(h * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(adim); };
    requestAnimationFrame(adim);
  };
  const rakamlar = $$('[data-say]');
  if ('IntersectionObserver' in window) {
    const g = new IntersectionObserver((ee) => { if (ee.some((x) => x.isIntersecting)) { rakamlar.forEach(say); g.disconnect(); } }, { threshold: 0.3 });
    g.observe($('.rakamlar'));
  } else rakamlar.forEach(say);

  BE.belirt();
})();
