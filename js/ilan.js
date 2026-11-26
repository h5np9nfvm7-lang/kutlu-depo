/* İlan detay sayfası */
(async function () {
  const { $, $$, esc, ikon } = BE;
  const alan = $('#ilan-alan');
  const id = BE.param('id') || (window.BE_ILAN_ID ? String(window.BE_ILAN_ID) : null);
  const a = await BE.sayfaBaslat('ilanlar.html');

  const bulunamadi = (m) => {
    alan.innerHTML = `<div class="bos-durum">${ikon('ev')}<h2>${esc(m || 'İlan bulunamadı')}</h2>
      <p>Bu ilan yayından kaldırılmış veya adres hatalı olabilir.</p>
      <a href="ilanlar.html" class="btn btn-kirmizi">Tüm İlanlara Dön</a></div>`;
  };
  if (!id || !/^\d+$/.test(id)) return bulunamadi();

  let i;
  try { i = await BE.ilan(id); }
  catch (e) { console.error(e); return bulunamadi('İlan şu anda yüklenemedi'); }
  if (!i) return bulunamadi();

  BE.sonBakilanEkle(i.id);
  // Arama motorları için asıl adres
  let kan = document.querySelector('link[rel=canonical]');
  if (!kan) { kan = document.createElement('link'); kan.rel = 'canonical'; document.head.appendChild(kan); }
  kan.href = 'https://bizimemlak.biz/' + BE.ilanUrl(i);
  if (BE.db) BE.db.rpc('ilan_goruntulendi', { ilan_no: i.id }).then(() => {}, () => {});

  // Başlık & paylaşım bilgileri
  const konum = BE.konum(i);
  document.title = `${i.baslik} | Bizim Emlak`;
  const ozet = `${i.tip} ${i.kategori} - ${konum} - ${BE.tl(i.fiyat)}`;
  const meta = (s, v) => { const m = document.querySelector(s); if (m) m.setAttribute('content', v); };
  meta('meta[name="description"]', ozet);
  meta('meta[property="og:title"]', i.baslik);
  if (BE.kapak(i)) meta('meta[property="og:image"]', BE.kapak(i));

  const resimler = (i.resimler || []).filter(Boolean);
  const evetHayir = (v) => v ? `<span class="evet">${ikon('tik')} Var</span>` : '<span class="hayir">Yok</span>';
  const satirlar = [
    ['İlan No', '#' + i.id], ['Yetki Belge No', i.yetki_no], ['İlan Tarihi', BE.tarih(i.created_at)], ['İlan Tipi', i.tip], ['Kategori', i.kategori],
    ['Brüt m²', i.brut_m2 && BE.sayi(i.brut_m2) + ' m²'], ['Net m²', i.net_m2 && BE.sayi(i.net_m2) + ' m²'],
    ['Oda Sayısı', i.oda_sayisi], ['Banyo Sayısı', i.banyo_sayisi], ['Bina Yaşı', i.bina_yasi != null ? (i.bina_yasi === 0 ? 'Sıfır' : i.bina_yasi) : ''],
    ['Bulunduğu Kat', i.bulundugu_kat], ['Kat Sayısı', i.kat_sayisi], ['Isıtma', i.isitma],
    ['Tapu Durumu', i.tapu_durumu], ['İmar Durumu', i.imar_durumu], ['Aidat', i.aidat ? BE.tl(i.aidat) : ''],
    ['Eşyalı', i.esyali ? 'Evet' : 'Hayır'], ['Krediye Uygun', i.krediye_uygun ? 'Evet' : 'Hayır'], ['Takas', i.takas ? 'Evet' : 'Hayır']
  ].filter(([, v]) => v !== null && v !== undefined && v !== '');
  const donatim = [['Balkon', i.balkon], ['Asansör', i.asansor], ['Otopark', i.otopark], ['Site İçinde', i.site_icinde]];
  const arsaMi = i.kategori === 'Arsa';

 // Video (YouTube ise sayfaya gömülür) ve sanal tur
  const ytId = (u) => { const m = String(u || '').match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/))([A-Za-z0-9_-]{11})/); return m ? m[1] : null; };
  const guvenliLink = (u) => /^https:\/\//i.test(String(u || '')) ? u : null;
  const video = guvenliLink(i.video_url), tur = guvenliLink(i.sanal_tur_url), yt = ytId(video);
  const medyaHtml = (video || tur) ? `<div class="kart-blok"><h2>Video ve Sanal Tur</h2>
    ${yt ? `<div class="video-kutu" data-gec="https://www.youtube-nocookie.com/embed/${yt}?autoplay=1" data-baslik="İlan videosu"><button type="button" class="harita-ac koyu">${ikon('oynat')}<strong>Videoyu oynat</strong><span>Tıklayınca YouTube yüklenir</span></button></div>` : ''}
    <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:${yt ? '14px' : '0'}">
      ${video && !yt ? `<a class="btn btn-siyah" href="${esc(video)}" target="_blank" rel="noopener">▶ Videoyu İzle</a>` : ''}
      ${tur ? `<a class="btn btn-kirmizi" href="${esc(tur)}" target="_blank" rel="noopener">360° Sanal Turu Başlat</a>` : ''}
    </div></div>` : '';

  // İlana atanmış danışman (Site Ayarları > Danışmanlar)
  const dn = (a.danismanlar || []).find((d) => d.id && d.id === i.danisman_id) || null;
  const aramaTel = (dn && dn.telefon) || a.telefon;
  const wpNo = dn && dn.telefon ? (dn.whatsapp ? dn.telefon : '') : a.whatsapp;
  // Sahibinden: buton her zaman firmanın sahibinden mağaza sayfasına (tüm ilanlar) gider
  const sahibindenLink = /^https:\/\/([a-z0-9-]+\.)*sahibinden\.com(\/|$)/i.test(String(a.sahibinden_magaza || '')) ? a.sahibinden_magaza : '';
  const wpMesaj = `Merhaba, ${i.id} numaralı "${i.baslik}" ilanı hakkında bilgi almak istiyorum. ${location.href}`;
  // Ekranın kenarındaki sabit WhatsApp / Ara butonları da bu ilanda danışmana gitsin
  if (dn && dn.telefon) {
    const sabitWp = document.querySelector('.wp-sabit'), sabitTel = document.querySelector('.tel-sabit');
    if (sabitTel) sabitTel.href = BE.telLink(dn.telefon);
    if (sabitWp) { if (wpNo) sabitWp.href = BE.wpLink(wpNo, wpMesaj); else sabitWp.remove(); }
  } else {
    const sabitWp = document.querySelector('.wp-sabit');
    if (sabitWp && a.whatsapp) sabitWp.href = BE.wpLink(a.whatsapp, wpMesaj);
  }
  const fav = BE.favoriMi(i.id);

  alan.innerHTML = `
  <div class="yol" style="color:var(--metin-soluk)"><a href="./">Ana Sayfa</a> / <a href="ilanlar.html">İlanlar</a> / <a href="ilanlar.html?kategori=${encodeURIComponent(i.kategori)}">${esc(i.kategori)}</a> / #${i.id}</div>
  ${BE.aktifMi(i) ? '' : `<div class="durum-bandi" role="status"><div><strong>${esc(BE.DURUM_YAZI[i.durum] || 'Bu ilan aktif değil')}</strong>
    <p>Benzer bir ${esc((i.kategori || 'mülk').toLocaleLowerCase('tr-TR'))} arıyorsanız size yardımcı olalım.</p></div>
    <a class="btn btn-kirmizi" href="ilanlar.html?tip=${encodeURIComponent(i.tip)}&kategori=${encodeURIComponent(i.kategori)}">Benzer İlanları Gör</a></div>`}
  <div class="detay-duzen">
    <div>
      <div class="galeri">
        <div class="galeri-ana" id="galeri-ana" role="button" tabindex="0" aria-label="Fotoğrafı büyüt">
          ${resimler.length ? `<img src="${esc(resimler[0])}" alt="${esc(i.baslik)} - fotoğraf 1" id="galeri-img">` : `<div class="resim-yok" style="background:var(--gri-acik)"><img src="images/logo.png" alt=""><span>Bu ilan için henüz fotoğraf eklenmedi</span></div>`}
          ${resimler.length > 1 ? `<button class="galeri-ok sol" type="button" aria-label="Önceki fotoğraf">${ikon('sol')}</button><button class="galeri-ok sag" type="button" aria-label="Sonraki fotoğraf">${ikon('sag')}</button>` : ''}
          ${resimler.length ? `<span class="galeri-sayac" id="galeri-sayac">1 / ${resimler.length}</span>` : ''}
        </div>
        ${resimler.length > 1 ? `<div class="galeri-kucuk">${resimler.map((r, n) => `<button type="button" data-n="${n}" class="${n === 0 ? 'aktif' : ''}" aria-label="Fotoğraf ${n + 1}"><img src="${esc(r)}" alt="" loading="lazy"></button>`).join('')}</div>` : ''}
      </div>

      <div class="detay-bas">
        <div class="ust">
          <span class="rozet ${i.tip === 'Kiralık' ? 'rozet-kiralik' : 'rozet-satilik'}">${esc(i.tip)}</span>
          <span class="rozet rozet-gri">${esc(i.kategori)}</span>
          ${i.krediye_uygun ? '<span class="rozet rozet-gri">Krediye Uygun</span>' : ''}
        </div>
        <h1 style="font-size:clamp(1.4rem,3vw,2rem)">${esc(i.baslik)}</h1>
        <div class="kart-konum" style="font-size:1rem">${ikon('konum')} ${esc(konum)}</div>
        <div class="detay-fiyat">${BE.fiyat(i)}</div>
        <div class="ilan-no">İlan No: #${i.id} · Yetki Belge No: ${esc(i.yetki_no)} · ${BE.tarih(i.created_at)} · ${ikon('goz')} ${BE.sayi((i.goruntulenme || 0) + 1)} görüntülenme</div>
      </div>

      <div class="kart-blok"><h2>İlan Bilgileri</h2>
        <dl class="bilgi-tablo">${satirlar.map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join('')}
        ${arsaMi ? '' : donatim.map(([k, v]) => `<div><dt>${k}</dt><dd>${evetHayir(v)}</dd></div>`).join('')}</dl>
      </div>

      ${i.aciklama ? `<div class="kart-blok"><h2>Açıklama</h2><div class="aciklama-metin">${esc(i.aciklama)}</div></div>` : ''}

      ${medyaHtml}
      ${(i.ozellikler || []).length ? `<div class="kart-blok"><h2>Özellikler</h2><ul class="ozellik-liste">${i.ozellikler.map((o) => `<li>${ikon('tik')} ${esc(o)}</li>`).join('')}</ul></div>` : ''}

      ${i.enlem && i.boylam ? `<div class="kart-blok"><h2>Konum</h2>
        <div class="harita-kutu" data-gec="https://www.openstreetmap.org/export/embed.html?bbox=${i.boylam - 0.02}%2C${i.enlem - 0.012}%2C${i.boylam + 0.02}%2C${i.enlem + 0.012}&amp;layer=mapnik&amp;marker=${i.enlem}%2C${i.boylam}" data-baslik="İlan konumu haritası"><button type="button" class="harita-ac">${ikon('konum')}<strong>Haritayı göster</strong><span>Tıklayınca OpenStreetMap haritası yüklenir</span></button></div>
        <p style="margin:10px 0 0;font-size:.9rem"><a class="btn btn-cizgi btn-kucuk" target="_blank" rel="noopener" href="https://www.google.com/maps?q=${i.enlem},${i.boylam}">${ikon('harita')} Google Haritalar'da Aç / Yol Tarifi</a></p>
        <p style="font-size:.82rem;color:var(--metin-soluk);margin:8px 0 0">Harita konumu yaklaşık olarak gösterilmektedir.</p></div>` : ''}

    </div>

    <aside>
      <div class="kart-blok iletisim-kutu">
        <div class="danisman">
          <div class="danisman-avatar">${dn && dn.foto ? `<img class="foto" src="${esc(dn.foto)}" alt="${esc(dn.ad)}">` : dn ? `<span class="harf">${esc(String(dn.ad).trim().split(/\s+/).map((k) => k[0] || '').slice(0, 2).join('').toLocaleUpperCase('tr-TR'))}</span>` : '<img src="images/logo-beyaz.png" alt="">'}</div>
          <div><strong style="font-family:var(--font-baslik)">${esc(dn ? dn.ad : (a.danisman_adi || a.firma_adi))}</strong><br><span style="color:var(--metin-soluk);font-size:.9rem">${dn ? esc([dn.unvan, a.firma_adi].filter(Boolean).join(' · ')) : (a.danisman_adi ? esc(a.firma_adi) : 'Gayrimenkul Danışmanı')}</span></div>
        </div>
        <div class="butonlar">
          ${aramaTel ? `<a class="btn btn-kirmizi btn-blok" href="${BE.telLink(aramaTel)}">${ikon('telefon')} ${esc(aramaTel)}</a>` : ''}
          ${wpNo ? `<a class="btn btn-wp btn-blok" target="_blank" rel="noopener" href="${BE.wpLink(wpNo, wpMesaj)}">${BE.WP_SVG.replace('<svg', '<svg class="ikon" style="fill:currentColor"')} WhatsApp'tan Sor</a>` : ''}
          ${sahibindenLink ? `<a class="btn btn-sahibinden btn-blok" target="_blank" rel="noopener" href="${esc(sahibindenLink)}"><img class="sahibinden-logo" src="images/sahibinden.png" alt="" width="22" height="22"> sahibinden.com Tüm İlanlarımız</a>` : ''}
          ${dn && dn.telefon && a.telefon && dn.telefon !== a.telefon ? `<span class="ofis-tel">Ofis: <a href="${BE.telLink(a.telefon)}">${esc(a.telefon)}</a></span>` : ''}
          <div class="satir-btn">
            <button type="button" class="btn btn-cizgi btn-kucuk fav-btn-detay" id="fav-detay">${ikon('kalp')} <span>${fav ? 'Favoride' : 'Favorile'}</span></button>
            <button type="button" class="btn btn-cizgi btn-kucuk" id="paylas">${ikon('paylas')} Paylaş</button>
            <button type="button" class="btn btn-cizgi btn-kucuk" onclick="window.print()" aria-label="Yazdır">${ikon('yazdir')}</button>
          </div>
        </div>
      </div>
    </aside>
  </div>`;

  // Galeri
  if (resimler.length) {
    let n = 0;
    const goster = (k) => {
      n = (k + resimler.length) % resimler.length;
      $('#galeri-img').src = resimler[n]; $('#galeri-img').alt = `${i.baslik} - fotoğraf ${n + 1}`; oranAyarla();
      $('#galeri-sayac').textContent = `${n + 1} / ${resimler.length}`;
      $$('.galeri-kucuk button').forEach((b) => b.classList.toggle('aktif', Number(b.dataset.n) === n));
      const tam = $('.tam-ekran img'); if (tam) tam.src = resimler[n];
    };
    $$('.galeri-kucuk button').forEach((b) => b.addEventListener('click', () => goster(Number(b.dataset.n))));
    // Fotoğraf kırpılmadan ve siyah boşluk kalmadan sığsın: kutunun oranı fotoğrafın oranına uyar
    // (yatay fotoğraflar tam, çok dikey olanlar en fazla kare olur, yanları bulanık arka planla dolar)
    function oranAyarla() {
      const im = $('#galeri-img'), kutu = $('#galeri-ana');
      const uygula = () => {
        if (!im.naturalWidth) return;
        const o = Math.min(2, Math.max(1, im.naturalWidth / im.naturalHeight));
        kutu.style.aspectRatio = String(o);
        kutu.style.setProperty('--galeri-arka', `url("${im.currentSrc || im.src}")`);
      };
      if (im.complete) uygula(); else im.addEventListener('load', uygula, { once: true });
    }
    oranAyarla();
    const sol = $('.galeri-ok.sol'), sag = $('.galeri-ok.sag');
    sol && sol.addEventListener('click', (e) => { e.stopPropagation(); goster(n - 1); });
    sag && sag.addEventListener('click', (e) => { e.stopPropagation(); goster(n + 1); });
    const tamEkran = () => {
      const d = document.createElement('div'); d.className = 'tam-ekran'; d.setAttribute('role', 'dialog'); d.setAttribute('aria-label', 'Fotoğraf');
      d.innerHTML = `<img src="${esc(resimler[n])}" alt="">
        <button class="btn btn-beyaz kapat" type="button" aria-label="Kapat">${ikon('kapat')}</button>
        ${resimler.length > 1 ? `<button class="galeri-ok sol" type="button" aria-label="Önceki">${ikon('sol')}</button><button class="galeri-ok sag" type="button" aria-label="Sonraki">${ikon('sag')}</button>` : ''}`;
      document.body.appendChild(d); document.body.style.overflow = 'hidden';
      const kapat = () => { d.remove(); document.body.style.overflow = ''; };
      d.addEventListener('click', (e) => {
        if (e.target.closest('.sol')) goster(n - 1);
        else if (e.target.closest('.sag')) goster(n + 1);
        else if (e.target.closest('.kapat') || e.target === d) kapat();
      });
      $('.kapat', d).focus();
    };
    $('#galeri-ana').addEventListener('click', tamEkran);
    $('#galeri-ana').addEventListener('keydown', (e) => { if (e.key === 'Enter') tamEkran(); });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') goster(n - 1);
      if (e.key === 'ArrowRight') goster(n + 1);
      if (e.key === 'Escape') { const t = $('.tam-ekran'); if (t) { t.remove(); document.body.style.overflow = ''; } }
    });
    // Mobilde kaydırarak geçiş
    let x0 = null;
    $('#galeri-ana').addEventListener('touchstart', (e) => { x0 = e.touches[0].clientX; }, { passive: true });
    $('#galeri-ana').addEventListener('touchend', (e) => { if (x0 === null) return; const d = e.changedTouches[0].clientX - x0; if (Math.abs(d) > 40) goster(d < 0 ? n + 1 : n - 1); x0 = null; });
  }

  // Favori & paylaş
  $('#fav-detay').addEventListener('click', () => { const ak = BE.favoriDegistir(i.id); $('#fav-detay span').textContent = ak ? 'Favoride' : 'Favorile'; });
  $('#paylas').addEventListener('click', async () => {
    if (navigator.share) { try { await navigator.share({ title: i.baslik, text: ozet, url: location.href }); return; } catch { /* iptal */ } }
    try { await navigator.clipboard.writeText(location.href); BE.bildirim('İlan linki kopyalandı'); }
    catch { BE.bildirim('Linki adres çubuğundan kopyalayabilirsiniz'); }
  });

  // Harita ve video yalnızca ziyaretçi tıklayınca yüklenir (dış siteye bağlantı sayfa açılırken kurulmaz)
  $$('[data-gec]').forEach((k) => $('button', k).addEventListener('click', () => {
    const fr = document.createElement('iframe');
    fr.src = k.dataset.gec; fr.title = k.dataset.baslik || ''; fr.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen'; fr.allowFullscreen = true;
    k.innerHTML = ''; k.appendChild(fr);
  }));

  // Benzer ilanlar
  try {
    const tum = await BE.ilanlar();
    const benzer = tum.filter((x) => x.id !== i.id && x.kategori === i.kategori)
      .sort((x, y) => (y.ilce === i.ilce) - (x.ilce === i.ilce) || (y.tip === i.tip) - (x.tip === i.tip))
      .slice(0, 3);
    if (benzer.length) { $('#benzerler').innerHTML = benzer.map(BE.kart).join(''); $('#benzer-bolum').classList.remove('gizli'); BE.belirt(); }
  } catch { /* önemli değil */ }
})();
