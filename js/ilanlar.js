/* İlan listesi ve filtreler */
(async function () {
  const { $, $$, esc } = BE;
  const SAYFA_BASI = 9;
  const sonucEl = $('#sonuclar');
  sonucEl.innerHTML = BE.kartIskelet(6);

  const a = await BE.sayfaBaslat('ilanlar.html');
  $('#f-ilce').insertAdjacentHTML('beforeend', (a.ilceler || []).map((i) => `<option>${esc(i)}</option>`).join(''));

  const BAYRAKLAR = $$('[data-bayrak]').map((x) => x.dataset.bayrak);
  // Filtre durumu (URL'den okunur)
  const p = new URLSearchParams(location.search);
  const durum = {
    tip: p.get('tip') || '',
    kategori: (p.get('kategori') || '').split(',').filter(Boolean),
    ilce: p.get('ilce') || '',
    fmin: p.get('fmin') || '', fmax: p.get('fmax') || '',
    oda: (p.get('oda') || '').split(',').filter(Boolean),
    mmin: p.get('mmin') || '', mmax: p.get('mmax') || '',
    yas: p.get('yas') || '',
    q: p.get('q') || '',
    sira: p.get('sira') || 'yeni',
    s: Math.max(1, parseInt(p.get('s')) || 1),
    gorunum: BE.depola.al('be_gorunum', 'izgara')
  };
  BAYRAKLAR.forEach((b) => { durum[b] = p.get(b) === '1'; });

  // Durumu forma yansıt
  function formuDoldur() {
    $$('[data-tek]').forEach((g) => $$('.cip', g).forEach((c) => c.classList.toggle('aktif', c.dataset.deger === durum[g.dataset.tek])));
    $$('[data-coklu]').forEach((g) => $$('.cip', g).forEach((c) => c.classList.toggle('aktif', durum[g.dataset.coklu].includes(c.dataset.deger))));
    $('#f-ilce').value = durum.ilce;
    ['fmin', 'fmax', 'mmin', 'mmax', 'q', 'sira'].forEach((k) => { $('#f-' + k).value = durum[k]; });
    $$('[data-bayrak]').forEach((x) => { x.checked = !!durum[x.dataset.bayrak]; });
    $$('.cip').forEach((c) => c.setAttribute('aria-pressed', c.classList.contains('aktif')));
  }

  function urlYaz() {
    const u = new URLSearchParams();
    ['tip', 'ilce', 'fmin', 'fmax', 'mmin', 'mmax', 'yas', 'q'].forEach((k) => durum[k] && u.set(k, durum[k]));
    if (durum.kategori.length) u.set('kategori', durum.kategori.join(','));
    if (durum.oda.length) u.set('oda', durum.oda.join(','));
    BAYRAKLAR.forEach((b) => durum[b] && u.set(b, '1'));
    if (durum.sira !== 'yeni') u.set('sira', durum.sira);
    if (durum.s > 1) u.set('s', durum.s);
    history.replaceState(null, '', 'ilanlar.html' + (u.toString() ? '?' + u : ''));
  }

  // Olaylar
  $$('[data-tek] .cip').forEach((c) => c.addEventListener('click', () => {
    durum[c.parentElement.dataset.tek] = c.dataset.deger; degisti();
  }));
  $$('[data-coklu] .cip').forEach((c) => c.addEventListener('click', () => {
    const k = c.parentElement.dataset.coklu; const v = c.dataset.deger;
    durum[k] = durum[k].includes(v) ? durum[k].filter((x) => x !== v) : [...durum[k], v]; degisti();
  }));
  $('#f-ilce').addEventListener('change', (e) => { durum.ilce = e.target.value; degisti(); });
  let zaman;
  ['fmin', 'fmax', 'mmin', 'mmax', 'q'].forEach((k) => $('#f-' + k).addEventListener('input', (e) => {
    clearTimeout(zaman); zaman = setTimeout(() => { durum[k] = e.target.value.trim(); degisti(); }, 300);
  }));
  $('#f-sira').addEventListener('change', (e) => { durum.sira = e.target.value; degisti(false); });
  $$('[data-bayrak]').forEach((x) => x.addEventListener('change', () => { durum[x.dataset.bayrak] = x.checked; degisti(); }));
  $('#f-temizle').addEventListener('click', () => {
    Object.assign(durum, { tip: '', kategori: [], ilce: '', fmin: '', fmax: '', oda: [], mmin: '', mmax: '', yas: '', q: '' });
    BAYRAKLAR.forEach((b) => { durum[b] = false; }); degisti();
  });
  $$('.gorunum-btn').forEach((b) => b.addEventListener('click', () => { durum.gorunum = b.dataset.gorunum; BE.depola.yaz('be_gorunum', durum.gorunum); ciz(); }));
  const panel = $('#filtre-panel');
  $('#filtre-ac').addEventListener('click', () => { panel.classList.add('acik'); document.body.style.overflow = 'hidden'; });
  $$('[data-filtre-kapat]').forEach((b) => b.addEventListener('click', () => { panel.classList.remove('acik'); document.body.style.overflow = ''; }));

  function degisti(sifirla = true) { if (sifirla) durum.s = 1; formuDoldur(); urlYaz(); ciz(); }

  // Veriler
  let tum = [];
  try { tum = await BE.ilanlar(); }
  catch (e) { console.error(e); sonucEl.innerHTML = BE.hataHtml(); $('#sonuc-sayi').textContent = ''; formuDoldur(); return; }

  const odaNo = (o) => parseInt(String(o || '')) || 0;
  const kucukHarf = (s) => String(s || '').toLocaleLowerCase('tr-TR');

  function filtrele() {
    const q = kucukHarf(durum.q);
    const [ymin, ymax] = durum.yas ? durum.yas.split('-').map(Number) : [null, null];
    return tum.filter((i) => {
      if (durum.tip && i.tip !== durum.tip) return false;
      if (durum.kategori.length && !durum.kategori.includes(i.kategori)) return false;
      if (durum.ilce && i.ilce !== durum.ilce) return false;
      if (durum.fmin && !(Number(i.fiyat) >= Number(durum.fmin))) return false;
      if (durum.fmax && !(Number(i.fiyat) <= Number(durum.fmax))) return false;
      const m2 = i.net_m2 || i.brut_m2;
      if (durum.mmin && !(m2 >= Number(durum.mmin))) return false;
      if (durum.mmax && !(m2 <= Number(durum.mmax))) return false;
      if (durum.oda.length) {
        const ok = durum.oda.some((o) => o === '5+' ? odaNo(i.oda_sayisi) >= 5 : i.oda_sayisi === o);
        if (!ok) return false;
      }
      if (ymin !== null && !(i.bina_yasi != null &&i.bina_yasi >= ymin && i.bina_yasi <= ymax)) return false;
      for (const b of BAYRAKLAR) if (durum[b] && !i[b]) return false;
      if (q) {
        const metin = kucukHarf([i.baslik, i.aciklama, i.kategori, i.ilce, i.mahalle, i.oda_sayisi, i.id, (i.ozellikler || []).join(' ')].join(' '));
        if (!q.split(/\s+/).every((k) => metin.includes(k))) return false;
      }
      return true;
    });
  }

  function sirala(l) {
    const s = [...l];
    const f = (x) => (x.fiyat === null || x.fiyat === undefined ? Infinity : Number(x.fiyat));
    if (durum.sira === 'fiyat-artan') s.sort((x, y) => f(x) - f(y));
    else if (durum.sira === 'fiyat-azalan') s.sort((x, y) => (Number(y.fiyat) || 0) - (Number(x.fiyat) || 0));
    else if (durum.sira === 'm2') s.sort((x, y) => (y.net_m2 || y.brut_m2 || 0) - (x.net_m2 || x.brut_m2 || 0));
    else if (durum.sira === 'populer') s.sort((x, y) => (y.goruntulenme || 0) - (x.goruntulenme || 0));
    else s.sort((x, y) => new Date(y.created_at) - new Date(x.created_at));
    return s;
  }

  function ciz() {
    const liste = sirala(filtrele());
    const toplamSayfa = Math.max(1, Math.ceil(liste.length / SAYFA_BASI));
    if (durum.s > toplamSayfa) durum.s = toplamSayfa;
    const parca = liste.slice((durum.s - 1) * SAYFA_BASI, durum.s * SAYFA_BASI);

    $('#sonuc-sayi').textContent = `${liste.length} ilan bulundu`;
    $('#f-sayi').textContent = liste.length;
    let baslik = 'Tüm İlanlar';
    if (durum.tip || durum.kategori.length === 1) baslik = [durum.ilce, durum.tip, durum.kategori.length === 1 ? durum.kategori[0] : ''].filter(Boolean).join(' ') + ' İlanları';
    $('#liste-baslik').textContent = baslik;
    document.title = baslik + ' | Bizim Emlak Osmaniye';

    sonucEl.classList.toggle('liste', durum.gorunum === 'liste');
    $$('.gorunum-btn').forEach((b) => b.classList.toggle('aktif', b.dataset.gorunum === durum.gorunum));
    sonucEl.innerHTML = parca.length ? parca.map(BE.kart).join('') : `
      <div class="bos-durum" style="grid-column:1/-1">${BE.ikon('ara')}
        <h3>Aramanıza uygun ilan bulunamadı</h3>
        <p>Filtreleri azaltmayı deneyin veya bize ulaşın, sizin için arayalım.</p>
        <button class="btn btn-kirmizi" type="button" onclick="document.getElementById('f-temizle').click()">Filtreleri Temizle</button>
      </div>`;

    // Sayfalama
    const sf = $('#sayfalama');
    if (toplamSayfa <= 1) { sf.innerHTML = ''; }
    else {
      let h = `<button type="button" data-s="${durum.s - 1}" ${durum.s === 1 ? 'disabled' : ''} aria-label="Önceki sayfa">‹</button>`;
      for (let n = 1; n <= toplamSayfa; n++) {
        if (n === 1 || n === toplamSayfa || Math.abs(n - durum.s) <= 1) h += `<button type="button" data-s="${n}" class="${n === durum.s ? 'aktif' : ''}" ${n === durum.s ? 'aria-current="page"' : ''}>${n}</button>`;
        else if (Math.abs(n - durum.s) === 2) h += '<button type="button" disabled>…</button>';
      }
      h += `<button type="button" data-s="${durum.s + 1}" ${durum.s === toplamSayfa ? 'disabled' : ''} aria-label="Sonraki sayfa">›</button>`;
      sf.innerHTML = h;
      $$('button[data-s]', sf).forEach((b) => b.addEventListener('click', () => {
        durum.s = Number(b.dataset.s); urlYaz(); ciz();
        window.scrollTo({ top: $('.liste-duzen').offsetTop - 100, behavior: 'smooth' });
      }));
    }
    BE.belirt();
  }

  formuDoldur();
  ciz();
})();
