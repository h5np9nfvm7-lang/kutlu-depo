/* İlan detay sayfası */
(async function () {
  const { $, $$, esc, ikon } = BE;
  const H = window.BE_HESAP;
  const alan = $('#ilan-alan');
  const id = BE.param('id');
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
    ['İlan No', '#' + i.id], ['İlan Tarihi', BE.tarih(i.created_at)], ['İlan Tipi', i.tip], ['Kategori', i.kategori],
    ['Brüt m²', i.brut_m2 && BE.sayi(i.brut_m2) + ' m²'], ['Net m²', i.net_m2 && BE.sayi(i.net_m2) + ' m²'],
    ['Oda Sayısı', i.oda_sayisi], ['Banyo Sayısı', i.banyo_sayisi], ['Bina Yaşı', i.bina_yasi != null ? (i.bina_yasi === 0 ? 'Sıfır' : i.bina_yasi) : ''],
    ['Bulunduğu Kat', i.bulundugu_kat], ['Kat Sayısı', i.kat_sayisi], ['Isıtma', i.isitma],
    ['Tapu Durumu', i.tapu_durumu], ['İmar Durumu', i.imar_durumu], ['Aidat', i.aidat ? BE.tl(i.aidat) : ''],
    ['Eşyalı', i.esyali ? 'Evet' : 'Hayır'], ['Krediye Uygun', i.krediye_uygun ? 'Evet' : 'Hayır'], ['Takas', i.takas ? 'Evet' : 'Hayır']
  ].filter(([, v]) => v !== null && v !== undefined && v !== '');
  const donatim = [['Balkon', i.balkon], ['Asansör', i.asansor], ['Otopark', i.otopark], ['Site İçinde', i.site_icinde]];
  const arsaMi = i.kategori === 'Arsa';

  const wpMesaj = `Merhaba, ${i.id} numaralı "${i.baslik}" ilanı hakkında bilgi almak istiyorum. ${location.href}`;
  const fav = BE.favoriMi(i.id);

  alan.innerHTML = `
  <div class="yol" style="color:var(--metin-soluk)"><a href="index.html">Ana Sayfa</a> / <a href="ilanlar.html">İlanlar</a> / <a href="ilanlar.html?kategori=${encodeURIComponent(i.kategori)}">${esc(i.kategori)}</a> / #${i.id}</div>
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
        <div class="ilan-no">İlan No: #${i.id} · ${BE.tarih(i.created_at)} · ${ikon('goz')} ${BE.sayi((i.goruntulenme || 0) + 1)} görüntülenme</div>
      </div>

      <div class="kart-blok"><h2>İlan Bilgileri</h2>
        <dl class="bilgi-tablo">${satirlar.map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join('')}
        ${arsaMi ? '' : donatim.map(([k, v]) => `<div><dt>${k}</dt><dd>${evetHayir(v)}</dd></div>`).join('')}</dl>
      </div>

      ${i.aciklama ? `<div class="kart-blok"><h2>Açıklama</h2><div class="aciklama-metin">${esc(i.aciklama)}</div></div>` : ''}

      ${(i.ozellikler || []).length ? `<div class="kart-blok"><h2>Özellikler</h2><ul class="ozellik-liste">${i.ozellikler.map((o) => `<li>${ikon('tik')} ${esc(o)}</li>`).join('')}</ul></div>` : ''}

      ${i.enlem && i.boylam ? `<div class="kart-blok"><h2>Konum</h2>
        <div class="harita-kutu"><iframe title="İlan konumu haritası" loading="lazy"
          src="https://www.openstreetmap.org/export/embed.html?bbox=${i.boylam - 0.02}%2C${i.enlem - 0.012}%2C${i.boylam + 0.02}%2C${i.enlem + 0.012}&layer=mapnik&marker=${i.enlem}%2C${i.boylam}"></iframe></div>
        <p style="margin:10px 0 0;font-size:.9rem"><a class="btn btn-cizgi btn-kucuk" target="_blank" rel="noopener" href="https://www.google.com/maps?q=${i.enlem},${i.boylam}">${ikon('harita')} Google Haritalar'da Aç / Yol Tarifi</a></p>
        <p style="font-size:.82rem;color:var(--metin-soluk);margin:8px 0 0">Harita konumu yaklaşık olarak gösterilmektedir.</p></div>` : ''}

      ${i.tip === 'Satılık' && i.fiyat ? `<div class="kart-blok" id="kredi-blok"><h2>Kredi Hesapla</h2>
        <div class="form-izgara">
          <label class="alan"><span>Ev Fiyatı (TL)</span><input type="text" inputmode="numeric" id="k-fiyat" value="${BE.sayi(i.fiyat)}"></label>
          <label class="alan"><span>Peşinat (TL)</span><input type="text" inputmode="numeric" id="k-pesinat" value="${BE.sayi(Math.round(i.fiyat * 0.2))}"></label>
          <label class="alan"><span>Vade (ay)</span><select id="k-vade">${[12, 24, 36, 48, 60, 84, 120].map((v) => `<option ${v === 120 ? 'selected' : ''}>${v}</option>`).join('')}</select></label>
          <label class="alan"><span>Aylık Faiz Oranı (%)</span><input type="text" inputmode="decimal" id="k-faiz" placeholder="Bankanızın oranını yazın, örn. 2,5"></label>
        </div>
        <div class="sonuc-kutu" id="k-sonuc"><span style="color:var(--metin-soluk)">Taksiti görmek için faiz oranını yazın.</span></div>
        <p class="uyari-not">Bu hesaplama bilgi amaçlıdır. Kesin oranlar ve masraflar için bankanıza danışın.</p></div>` : ''}
    </div>

    <aside>
      <div class="kart-blok iletisim-kutu">
        <div class="danisman">
          <div class="danisman-avatar"><img src="images/logo-beyaz.png" alt=""></div>
          <div><strong style="font-family:var(--font-baslik)">${esc(a.danisman_adi || a.firma_adi)}</strong><br><span style="color:var(--metin-soluk);font-size:.9rem">${a.danisman_adi ? esc(a.firma_adi) : 'Gayrimenkul Danışmanı'}</span></div>
        </div>
        <div class="butonlar">
          ${a.telefon ? `<a class="btn btn-kirmizi btn-blok" href="${BE.telLink(a.telefon)}">${ikon('telefon')} ${esc(a.telefon)}</a>` : ''}
          ${a.whatsapp ? `<a class="btn btn-wp btn-blok" target="_blank" rel="noopener" href="${BE.wpLink(a.whatsapp, wpMesaj)}">WhatsApp'tan Sor</a>` : ''}
          <div class="satir-btn">
            <button type="button" class="btn btn-cizgi btn-kucuk fav-btn-detay" id="fav-detay">${ikon('kalp')} <span>${fav ? 'Favoride' : 'Favorile'}</span></button>
            <button type="button" class="btn btn-cizgi btn-kucuk" id="paylas">${ikon('paylas')} Paylaş</button>
            <button type="button" class="btn btn-cizgi btn-kucuk" onclick="window.print()" aria-label="Yazdır">${ikon('yazdir')}</button>
          </div>
        </div>
        <form id="ilan-form" style="margin-top:20px;border-top:1px solid var(--kenarlik);padding-top:16px" novalidate>
          <strong style="font-family:var(--font-baslik);display:block;margin-bottom:10px">Sizi Arayalım</strong>
          <div style="display:flex;flex-direction:column;gap:10px">
            <input type="text" name="ad" placeholder="Adınız Soyadınız" aria-label="Adınız Soyadınız" required maxlength="100">
            <input type="tel" name="tel" placeholder="Telefon numaranız" aria-label="Telefon" required maxlength="30">
            <textarea name="mesaj" rows="3" style="min-height:80px" aria-label="Mesaj" maxlength="1000">Bu ilan hakkında bilgi almak istiyorum.</textarea>
            <button type="submit" class="btn btn-siyah btn-blok">Gönder</button>
          </div>
          <div id="ilan-form-sonuc" aria-live="polite"></div>
        </form>
      </div>
    </aside>
  </div>`;

  // Galeri
  if (resimler.length) {
    let n = 0;
    const goster = (k) => {
      n = (k + resimler.length) % resimler.length;
      $('#galeri-img').src = resimler[n]; $('#galeri-img').alt = `${i.baslik} - fotoğraf ${n + 1}`;
      $('#galeri-sayac').textContent = `${n + 1} / ${resimler.length}`;
      $$('.galeri-kucuk button').forEach((b) => b.classList.toggle('aktif', Number(b.dataset.n) === n));
      const tam = $('.tam-ekran img'); if (tam) tam.src = resimler[n];
    };
    $$('.galeri-kucuk button').forEach((b) => b.addEventListener('click', () => goster(Number(b.dataset.n))));
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

  // Kredi hesaplama
  if ($('#kredi-blok')) {
    ['#k-fiyat', '#k-pesinat'].forEach((s) => H.bicimle($(s)));
    const hesapla = () => {
      const fiyat = H.oku($('#k-fiyat').value), pes = H.oku($('#k-pesinat').value);
      const faiz = H.oku($('#k-faiz').value), vade = Number($('#k-vade').value);
      const kredi = fiyat - pes;
      if (!$('#k-faiz').value.trim() || kredi <= 0) { $('#k-sonuc').innerHTML = '<span style="color:var(--metin-soluk)">Taksiti görmek için faiz oranını yazın.</span>'; return; }
      const s = H.kredi(kredi, faiz, vade);
      $('#k-sonuc').innerHTML = `<div class="sonuc-satir"><span>Aylık Taksit</span><span class="buyuk">${BE.tl(s.taksit)}</span></div>
        <div class="sonuc-satir"><span>Kredi Tutarı</span><strong>${BE.tl(kredi)}</strong></div>
        <div class="sonuc-satir"><span>Toplam Geri Ödeme</span><strong>${BE.tl(s.toplam)}</strong></div>
        <div class="sonuc-satir"><span>Toplam Faiz</span><strong>${BE.tl(s.toplamFaiz)}</strong></div>`;
    };
    ['#k-fiyat', '#k-pesinat', '#k-faiz', '#k-vade'].forEach((s) => $(s).addEventListener('input', hesapla));
  }

  // Sizi arayalım formu
  $('#ilan-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const f = e.target, sonuc = $('#ilan-form-sonuc');
    const ad = f.ad.value.trim(), tel = f.tel.value.trim();
    if (ad.length < 2 || tel.replace(/\D/g, '').length < 10) { sonuc.innerHTML = '<div class="form-mesaj hata">Lütfen adınızı ve geçerli bir telefon numarası yazın.</div>'; return; }
    const btn = $('button[type=submit]', f); btn.disabled = true; btn.textContent = 'Gönderiliyor…';
    try {
      const { error } = await BE.db.from('mesajlar').insert({ tur: 'İlan Talebi', ad_soyad: ad, telefon: tel, konu: `#${i.id} ${i.baslik}`.slice(0, 120), mesaj: f.mesaj.value.trim().slice(0, 3000), ilan_id: i.id });
      if (error) throw error;
      f.reset(); sonuc.innerHTML = '<div class="form-mesaj basarili">Teşekkürler! En kısa sürede sizi arayacağız.</div>';
    } catch (err) {
      console.error(err);
      sonuc.innerHTML = `<div class="form-mesaj hata">Gönderilemedi. Lütfen bizi arayın${a.telefon ? ': ' + esc(a.telefon) : ''}.</div>`;
    }
    btn.disabled = false; btn.textContent = 'Gönder';
  });

  // Benzer ilanlar
  try {
    const tum = await BE.ilanlar();
    const benzer = tum.filter((x) => x.id !== i.id && x.kategori === i.kategori)
      .sort((x, y) => (y.ilce === i.ilce) - (x.ilce === i.ilce) || (y.tip === i.tip) - (x.tip === i.tip))
      .slice(0, 3);
    if (benzer.length) { $('#benzerler').innerHTML = benzer.map(BE.kart).join(''); $('#benzer-bolum').classList.remove('gizli'); BE.belirt(); }
  } catch { /* önemli değil */ }
})();
