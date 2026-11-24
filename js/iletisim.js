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

  // Harita
  if (a.harita_arama || a.adres) {
    const q = encodeURIComponent(a.harita_arama || a.adres);
    $('#ofis-harita').innerHTML = `<iframe title="Ofis konumu" loading="lazy" style="height:100%;min-height:360px" src="https://maps.google.com/maps?q=${q}&z=16&output=embed"></iframe>`;
  }

  // Formlar
  const telOk = (t) => t.replace(/\D/g, '').length >= 10;
  const iletisimMesaji = (f) => ({
    tur: 'İletişim', ad_soyad: f.ad.value.trim(), telefon: f.tel.value.trim(), eposta: f.eposta.value.trim() || null,
    konu: f.konu.value, mesaj: f.mesaj.value.trim()
  });
  const mulkMesaji = (f) => ({
    tur: 'Mülk Teklifi', ad_soyad: f.ad.value.trim(), telefon: f.tel.value.trim(),
    konu: `${f.islem.value} - ${f.tip.value}`,
    mesaj: [
      `İşlem: ${f.islem.value}`, `Mülk tipi: ${f.tip.value}`, f.konum.value && `Konum: ${f.konum.value}`,
      f.m2.value && `Metrekare: ${f.m2.value}`, f.oda.value && `Oda: ${f.oda.value}`,
      f.fiyat.value && `Beklenen fiyat: ${f.fiyat.value} TL`, f.not.value && `Not: ${f.not.value}`
    ].filter(Boolean).join('\n')
  });
  const talepMesaji = (f) => ({
    tur: 'Ev Talebi', ad_soyad: f.ad.value.trim(), telefon: f.tel.value.trim(),
    konu: `${f.islem.value} ${f.tip.value} arıyor`,
    mesaj: [
      `Aranan: ${f.islem.value} ${f.tip.value}`, f.konum.value && `Konum: ${f.konum.value}`,
      f.oda.value && `Oda: ${f.oda.value}`, f.fiyat.value && `En fazla bütçe: ${f.fiyat.value} TL`, f.not.value && `Not: ${f.not.value}`
    ].filter(Boolean).join('\n')
  });
  const kontrol = (f, gerekMesaj) => {
    if (f.ad.value.trim().length < 2) return 'Lütfen adınızı yazın.';
    if (!telOk(f.tel.value)) return 'Lütfen geçerli bir telefon numarası yazın.';
    if (gerekMesaj && f.mesaj.value.trim().length < 3) return 'Lütfen mesajınızı yazın.';
    if (!BE.kvkkKontrol(f)) return 'Lütfen aydınlatma metnini okuduğunuzu onaylayın.';
    return '';
  };
  $$('.kvkk-yer').forEach((e) => { e.innerHTML = BE.kvkkOnay(); });
  const yl = $('#yorum-link'); if (yl) yl.href = BE.yorumLink(a);

  function bagla(formId, olustur, gerekMesaj) {
    const f = $('#' + formId), sonuc = $('.sonuc', f);
    if (f.fiyat) window.BE_HESAP.bicimle(f.fiyat);
    f.addEventListener('submit', async (e) => {
      e.preventDefault();
      const hata = kontrol(f, gerekMesaj);
      if (hata) { sonuc.innerHTML = `<div class="form-mesaj hata">${hata}</div>`; return; }
      const btn = $('button[type=submit]', f); const eski = btn.textContent; btn.disabled = true; btn.textContent = 'Gönderiliyor…';
      try {
        if (!BE.db) throw new Error('bağlantı yok');
        const { error } = await BE.db.from('mesajlar').insert(olustur(f));
        if (error) throw error;
        f.reset();
        sonuc.innerHTML = '<div class="form-mesaj basarili">Teşekkürler! Mesajınız bize ulaştı, en kısa sürede dönüş yapacağız.</div>';
      } catch (err) {
        console.error(err);
        sonuc.innerHTML = `<div class="form-mesaj hata">Mesaj gönderilemedi. ${a.whatsapp ? 'WhatsApp ile gönderebilir veya ' : ''}bizi arayabilirsiniz${a.telefon ? ': ' + esc(a.telefon) : ''}.</div>`;
      }
      btn.disabled = false; btn.textContent = eski;
    });
    // WhatsApp ile gönder
    const wp = $(`[data-wp-form="${formId}"]`);
    if (a.whatsapp && wp) {
      wp.classList.remove('gizli');
      wp.addEventListener('click', () => {
        const hata = kontrol(f, gerekMesaj);
        if (hata) { sonuc.innerHTML = `<div class="form-mesaj hata">${hata}</div>`; return; }
        const m = olustur(f);
        const metin = `Merhaba, ben ${m.ad_soyad} (${m.telefon}).\nKonu: ${m.konu}\n${m.mesaj}`;
        window.open(BE.wpLink(a.whatsapp, metin), '_blank', 'noopener');
      });
    }
  }
  bagla('iletisim-form', iletisimMesaji, true);
  bagla('mulk-form', mulkMesaji, false);
  bagla('talep-form', talepMesaji, false);

  // Form başka sayfadan çağrıldıysa
  const p = BE.param('konu');
  if (p) { const s = $('#iletisim-form [name=konu]'); if (s) s.value = p; }
  BE.belirt();
})();
