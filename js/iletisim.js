/* İletişim sayfası */
(async function () {
  const { $, $$, esc, ikon } = BE;
  const a = await BE.sayfaBaslat('iletisim.html');

  // Kartlar
  const kart = (ik, baslik, icerik) => `<div class="iletisim-kart belir"><div class="kutu-ikon">${ikon(ik)}</div><h3>${baslik}</h3><p>${icerik}</p></div>`;
  let h = '';
  if (a.telefon) h += kart('telefon', 'Telefon', `<a href="${BE.telLink(a.telefon)}">${esc(a.telefon)}</a>${a.telefon2 ? `<br><a href="${BE.telLink(a.telefon2)}">${esc(a.telefon2)}</a>` : ''}`);
  if (a.whatsapp) h += kart('telefon', 'WhatsApp', `<a href="${BE.wpLink(a.whatsapp, 'Merhaba, bilgi almak istiyorum.')}" target="_blank" rel="noopener">Mesaj gönderin</a>`).replace(BE.ikon('telefon'), BE.WP_SVG.replace('<svg', '<svg class="ikon" style="fill:currentColor"'));
  if (a.eposta) h += kart('eposta', 'E-posta', `<a href="mailto:${esc(a.eposta)}">${esc(a.eposta)}</a>`);
  if (a.adres) h += kart('konum', 'Adres', esc(a.adres));
  $('#iletisim-kartlar').innerHTML = h;
  $('#iletisim-kartlar').style.gridTemplateColumns = `repeat(auto-fit, minmax(220px, 1fr))`;

  // Saatler
  const bugun = BE.bugunAdi();
  $('#saatler').innerHTML = (a.calisma_saatleri || []).map((g) => `<tr class="${g.gun === bugun ? 'bugun' : ''}"><td>${esc(g.gun)}${g.gun === bugun ? ' (Bugün)' : ''}</td><td>${esc(BE.saatMetni(g))}</td></tr>`).join('');
  const acik = BE.acikMi(a);
  $('#acik-durum').innerHTML = `<span class="acik-durum ${acik ? 'acik' : 'kapali'}" style="font-size:.8rem;vertical-align:middle;margin-left:8px">${acik ? 'Şu an açık' : 'Şu an kapalı'}</span>`;
  $('#saat-notu').textContent = a.calisma_notu || '';

  // Harita (ziyaretçi tıklayınca yüklenir; sayfa açılırken Google'a bağlanılmaz)
  if (a.harita_arama || a.adres) {
    const q = encodeURIComponent(a.harita_arama || a.adres);
    const kutu = $('#ofis-harita');
    kutu.innerHTML = `<button type="button" class="harita-ac">${ikon('konum')}<strong>Haritayı göster</strong><span>Tıklayınca Google Haritalar yüklenir</span></button>`;
    $('.harita-ac', kutu).addEventListener('click', () => {
      kutu.innerHTML = `<iframe title="Ofis konumu" style="height:100%;min-height:360px" src="https://maps.google.com/maps?q=${q}&z=16&output=embed"></iframe>`;
    });
  }

  // Formlar: hiçbir bilgi sitede saklanmaz, mesaj WhatsApp'ta hazır açılır.
  const iletisimMesaji = (f) => [`Konu: ${f.konu.value}`, f.mesaj.value.trim()];
  const mulkMesaji = (f) => [
    `${f.islem.value}: ${f.tip.value}`, f.konum.value && `Konum: ${f.konum.value}`,
    f.m2.value && `Metrekare: ${f.m2.value}`, f.oda.value && `Oda: ${f.oda.value}`,
    f.fiyat.value && `Beklediğim fiyat: ${f.fiyat.value} TL`, f.not.value && `Not: ${f.not.value}`
  ];
  const talepMesaji = (f) => [
    `Aradığım: ${f.islem.value} ${f.tip.value}`, f.konum.value && `Konum: ${f.konum.value}`,
    f.oda.value && `Oda: ${f.oda.value}`, f.fiyat.value && `En fazla bütçe: ${f.fiyat.value} TL`, f.not.value && `Not: ${f.not.value}`
  ];
  const yl = $('#yorum-link'); if (yl) yl.href = BE.yorumLink(a);
  $$('.tel-btn').forEach((b) => { if (a.telefon) { b.href = BE.telLink(a.telefon); b.textContent = 'Arayın: ' + a.telefon; } else b.remove(); });

  function bagla(formId, olustur, giris, gerekMesaj) {
    const f = $('#' + formId), sonuc = $('.sonuc', f);
    if (f.fiyat) window.BE_HESAP.bicimle(f.fiyat);
    if (!a.whatsapp) { const b = $('button[type=submit]', f); b.disabled = true; b.textContent = 'WhatsApp numarası ayarlanmamış'; }
    f.addEventListener('submit', (e) => {
      e.preventDefault();
      if (gerekMesaj && f.mesaj.value.trim().length < 3) { sonuc.innerHTML = '<div class="form-mesaj hata">Lütfen mesajınızı yazın.</div>'; return; }
      sonuc.innerHTML = '';
      const metin = [giris, ...olustur(f)].filter(Boolean).join('\n');
      window.open(BE.wpLink(a.whatsapp, metin), '_blank', 'noopener');
    });
  }
  bagla('iletisim-form', iletisimMesaji, 'Merhaba,', true);
  bagla('mulk-form', mulkMesaji, 'Merhaba, mülkümü size vermek istiyorum.', false);
  bagla('talep-form', talepMesaji, 'Merhaba, ev arıyorum. Uygun ilan olursa haber verir misiniz?', false);

  // Form başka sayfadan çağrıldıysa
  const p = BE.param('konu');
  if (p) { const s = $('#iletisim-form [name=konu]'); if (s) s.value = p; }
  BE.belirt();
})();
