/* Hesaplama araçları sayfası */
(async function () {
  const { $, $$ } = BE;
  const H = window.BE_HESAP;
  const a = await BE.sayfaBaslat('hesaplamalar.html');
  const ok = (id) => H.oku($(id).value);
  const satir = (k, v, buyuk) => `<div class="sonuc-satir"><span>${k}</span>${buyuk ? `<span class="buyuk">${v}</span>` : `<strong>${v}</strong>`}</div>`;
  const yuzde = (n) => '%' + n.toLocaleString('tr-TR', { maximumFractionDigits: 2 });

  // Sekmeler (adres #tapu gibi verilirse o sekme açılır)
  const sekmeAc = (ad) => {
    if (!$('#s-' + ad)) return;
    $$('.sekmeler button').forEach((b) => { const ak = b.dataset.sekme === ad; b.classList.toggle('aktif', ak); b.setAttribute('aria-selected', ak); });
    $$('.sekme-icerik').forEach((s) => s.classList.toggle('gizli', s.id !== 's-' + ad));
  };
  $$('.sekmeler button').forEach((b) => b.addEventListener('click', () => { sekmeAc(b.dataset.sekme); history.replaceState(null, '', '#' + b.dataset.sekme); }));
  if (location.hash) sekmeAc(location.hash.slice(1));

  $$('input.para').forEach(H.bicimle);
  $('#tp-alici').value = String(a.tapu_alici_orani ?? 2).replace('.', ',');
  $('#tp-satici').value = String(a.tapu_satici_orani ?? 2).replace('.', ',');

  // Tapu
  function tapu() {
    const b = ok('#tp-bedel'), ra = H.oku($('#tp-alici').value), rs = H.oku($('#tp-satici').value);
    if (!b) { $('#tp-sonuc').innerHTML = '<p style="color:var(--metin-soluk)">Satış bedelini yazın.</p>'; return; }
    const al = b * ra / 100, sa = b * rs / 100;
    $('#tp-sonuc').innerHTML = `<div class="sonuc-kutu" style="margin:0">${satir('Toplam Tapu Harcı', BE.tl(al + sa), true)}${satir(`Alıcının Ödeyeceği (${yuzde(ra)})`, BE.tl(al))}${satir(`Satıcının Ödeyeceği (${yuzde(rs)})`, BE.tl(sa))}</div>
      <p style="font-size:.88rem;color:var(--metin-soluk);margin-top:12px">Taraflar anlaşırsa harcın tamamını tek taraf da ödeyebilir.</p>`;
  }
  ['#tp-bedel', '#tp-alici', '#tp-satici'].forEach((s) => $(s).addEventListener('input', tapu));

  // Kira getirisi
  function kira() {
    const f = ok('#ki-fiyat'), k = ok('#ki-kira'), g = ok('#ki-gider');
    if (!f || !k) { $('#ki-sonuc').innerHTML = '<p style="color:var(--metin-soluk)">Ev fiyatını ve aylık kirayı yazın.</p>'; return; }
    const yillik = k * 12, net = yillik - g;
    const yil = net > 0 ? f / net : Infinity;
    $('#ki-sonuc').innerHTML = `<div class="sonuc-kutu" style="margin:0">
      ${satir('Kendini Amorti Etme Süresi', isFinite(yil) ? yil.toLocaleString('tr-TR', { maximumFractionDigits: 1 }) + ' yıl' : '-', true)}
      ${satir('Yıllık Kira Geliri', BE.tl(yillik))}
      ${satir('Yıllık Brüt Getiri', yuzde(yillik / f * 100))}
      ${g ? satir('Yıllık Net Getiri', yuzde(net / f * 100)) : ''}</div>`;
  }
  ['#ki-fiyat', '#ki-kira', '#ki-gider'].forEach((s) => $(s).addEventListener('input', kira));

})();
