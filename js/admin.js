/* ==========================================================
   BİZİM EMLAK - YÖNETİM PANELİ
   ========================================================== */
(function () {
  'use strict';
  const { $, $$, esc, ikon } = BE;
  const H = window.BE_HESAP;
  const db = BE.db;
  const BUCKET = window.BE_CONFIG.FOTO_BUCKET;

  let ilanlar = [], mesajlar = [], ayarlar = null, ayarKayitli = null;
  const kopya = (o) => JSON.parse(JSON.stringify(o));
  let duzenlenen = null;           // düzenlenen ilan (yeni ise null)
  let fotolar = [];                // formdaki fotoğraf adresleri
  let silinecekFotolar = [];       // kaydedince depodan silinecek
  let etiketler = [];
  let kirli = false;               // kaydedilmemiş değişiklik var mı
  let harita = null, isaret = null;

  /* ---------- Onay penceresi ---------- */
  function onayla(baslik, metin, evetYazi = 'Evet') {
    return new Promise((coz) => {
      $('#modal-baslik').textContent = baslik; $('#modal-metin').textContent = metin; $('#modal-evet').textContent = evetYazi;
      $('#modal').classList.remove('gizli'); $('#modal-hayir').focus();
      const bitir = (s) => { $('#modal').classList.add('gizli'); $('#modal-evet').onclick = $('#modal-hayir').onclick = null; document.removeEventListener('keydown', tus); coz(s); };
      const tus = (e) => { if (e.key === 'Escape') bitir(false); };
      document.addEventListener('keydown', tus);
      $('#modal-evet').onclick = () => bitir(true);
      $('#modal-hayir').onclick = () => bitir(false);
    });
  }
  const hataMetni = (e) => {
    const m = (e && (e.message || e.error_description || e.msg)) || String(e);
    if (/Invalid login/i.test(m)) return 'E-posta veya şifre hatalı.';
    if (/row-level security|permission denied/i.test(m)) return 'Yetki hatası: Bu hesap yönetici olarak tanımlı değil ya da SQL kurulum dosyası çalıştırılmamış.';
    if (/Failed to fetch|NetworkError/i.test(m)) return 'İnternet bağlantısı veya Supabase\'e ulaşılamıyor.';
    if (/Bucket not found/i.test(m)) return 'Fotoğraf deposu bulunamadı. SQL kurulum dosyasını çalıştırın.';
    if (/rate limit|security purposes|after \d+ seconds/i.test(m)) return 'Çok sık deneme yapıldı. Birkaç dakika bekleyip tekrar deneyin.';
    if (/should be different/i.test(m)) return 'Yeni şifre eskisiyle aynı olamaz.';
    if (/Password should|weak/i.test(m)) return 'Şifre çok zayıf. Harf ve rakam karışık, en az 8 karakter kullanın.';
    return m;
  };

  /* ---------- Giriş ---------- */
  async function basla() {
    if (!db) {
      $('#yukleniyor').innerHTML = '<div class="giris-kutu"><h2>Bağlantı kurulamadı</h2><p>Supabase kütüphanesi yüklenemedi. İnternet bağlantınızı kontrol edip sayfayı yenileyin. Sorun devam ederse js/config.js içindeki adres ve anahtarı kontrol edin.</p></div>';
      return;
    }
    let kurtarma = !!window.BE_SIFRE_KURTARMA;
    db.auth.onAuthStateChange((olay) => {
      if (olay === 'PASSWORD_RECOVERY') { kurtarma = true; sifreEkrani(); }
      else if (olay === 'SIGNED_OUT') girisGoster();
    });
    const { data } = await db.auth.getSession();
    if (kurtarma && data.session) sifreEkrani();
    else if (kurtarma) { girisGoster(); $('#giris-hata').innerHTML = '<div class="form-mesaj hata">Şifre yenileme linkinin süresi dolmuş veya daha önce kullanılmış. "Şifremi unuttum" ile yeni link isteyin.</div>'; }
    else if (data.session) await girisYapildi(data.session.user);
    else girisGoster();
  }
  let sifreDegisimi = false;
  $('#sifre-degistir').addEventListener('click', () => { sifreDegisimi = true; $('#sifre-vazgec').classList.remove('gizli'); sifreEkrani(true); });
  $('#sifre-vazgec').addEventListener('click', () => { sifreDegisimi = false; $('#sifre-form').reset(); $('#sifre-yenile').classList.add('gizli'); $('#panel').classList.remove('gizli'); });
  function sifreEkrani(paneldenMi) {
    if (!paneldenMi) history.replaceState(null, '', 'admin.html');
    $('#yukleniyor').classList.add('gizli'); $('#panel').classList.add('gizli'); $('#giris').classList.add('gizli');
    $('#sifre-yenile').classList.remove('gizli'); $('#sifre-form [name=sifre1]').focus();
  }
  $('#sifre-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const f = e.target, btn = $('button', f), hata = $('#sifre-hata');
    hata.innerHTML = '';
    if (f.sifre1.value.length < 8) { hata.innerHTML = '<div class="form-mesaj hata">Şifre en az 8 karakter olmalı.</div>'; return; }
    if (f.sifre1.value !== f.sifre2.value) { hata.innerHTML = '<div class="form-mesaj hata">İki şifre aynı değil.</div>'; return; }
    btn.disabled = true; btn.textContent = 'Kaydediliyor…';
    const { data, error } = await db.auth.updateUser({ password: f.sifre1.value });
    btn.disabled = false; btn.textContent = 'Şifreyi Kaydet';
    if (error) { hata.innerHTML = `<div class="form-mesaj hata">${esc(hataMetni(error))}</div>`; return; }
    f.reset(); $('#sifre-yenile').classList.add('gizli');
    BE.bildirim('Yeni şifreniz kaydedildi');
    if (sifreDegisimi) { sifreDegisimi = false; $('#panel').classList.remove('gizli'); return; }
    await girisYapildi(data.user);
  });
  $('#unuttum').addEventListener('click', async () => {
    const f = $('#giris-form'), eposta = f.eposta.value.trim(), kutu = $('#giris-hata');
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(eposta)) { kutu.innerHTML = '<div class="form-mesaj hata">Önce yukarıya e-posta adresinizi yazın, sonra "Şifremi unuttum"a basın.</div>'; f.eposta.focus(); return; }
    const b = $('#unuttum'); b.disabled = true;
    const { error } = await db.auth.resetPasswordForEmail(eposta, { redirectTo: location.origin + '/admin.html' });
    b.disabled = false;
    kutu.innerHTML = error
      ? `<div class="form-mesaj hata">Link gönderilemedi: ${esc(hataMetni(error))}</div>`
      : `<div class="form-mesaj basarili">Şifre yenileme linki ${esc(eposta)} adresine gönderildi. E-postanızı açıp linke tıklayın (gelmezse "Gereksiz" klasörüne bakın).</div>`;
  });
  function girisGoster() {
    $('#sifre-yenile').classList.add('gizli'); $('#yukleniyor').classList.add('gizli'); $('#panel').classList.add('gizli'); $('#giris').classList.remove('gizli');
    $('#giris-form [name=eposta]').focus();
  }
  $('#giris-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const f = e.target, btn = $('button', f);
    $('#giris-hata').innerHTML = '';
    btn.disabled = true; btn.textContent = 'Giriş yapılıyor…';
    const { data, error } = await db.auth.signInWithPassword({ email: f.eposta.value.trim(), password: f.sifre.value });
    btn.disabled = false; btn.textContent = 'Giriş Yap';
    if (error) { $('#giris-hata').innerHTML = `<div class="form-mesaj hata">${esc(hataMetni(error))}</div>`; return; }
    f.sifre.value = '';
    await girisYapildi(data.user);
  });
  async function girisYapildi(kullanici) {
    const { data, error } = await db.from('yoneticiler').select('user_id').eq('user_id', kullanici.id).maybeSingle();
    if (error || !data) {
      await db.auth.signOut();
      girisGoster();
      $('#giris-hata').innerHTML = `<div class="form-mesaj hata">Bu hesap yönetici olarak tanımlı değil. Supabase'de SQL kurulum dosyasını (supabase-kurulum.sql) tekrar çalıştırın.</div>`;
      return;
    }
    $('#kullanici-eposta').textContent = kullanici.email || '';
    $('#giris').classList.add('gizli'); $('#yukleniyor').classList.add('gizli'); $('#panel').classList.remove('gizli');
    ayarKayitli = await BE.ayarlar(); ayarlar = kopya(ayarKayitli);
    $('#ilce-listesi').innerHTML = (ayarlar.ilceler || []).map((i) => `<option>${esc(i)}</option>`).join('');
    await Promise.all([ilanlariYukle(), mesajlariYukle()]);
    yonlendir();
  }
  $('#cikis').addEventListener('click', async () => {
    if (kirli && !(await onayla('Çıkış yapılsın mı?', 'Kaydedilmemiş değişiklikleriniz kaybolacak.'))) return;
    kirli = false; await db.auth.signOut(); history.replaceState(null, '', 'admin.html'); girisGoster();
  });

  /* ---------- Sayfa geçişleri ---------- */
  function goster(sayfa) {
    $$('[data-sayfa]').forEach((s) => s.classList.toggle('gizli', s.dataset.sayfa !== sayfa));
    const menuAd = sayfa === 'form' ? (duzenlenen ? 'ilanlar' : 'yeni') : sayfa;
    $$('.yan-menu button').forEach((b) => b.classList.toggle('aktif', b.dataset.git === menuAd));
    window.scrollTo(0, 0);
  }
  async function git(hedef) {
    if (kirli && !(await onayla('Sayfadan çıkılsın mı?', 'Kaydedilmemiş değişiklikleriniz kaybolacak.', 'Çık'))) return;
    kirli = false;
    if (location.hash === '#' + hedef) yonlendir(); else location.hash = hedef;
  }
  document.addEventListener('click', (e) => { const b = e.target.closest('[data-git]'); if (b) { e.preventDefault(); git(b.dataset.git); } });
  window.addEventListener('hashchange', yonlendir);
  function yonlendir() {
    if ($('#panel').classList.contains('gizli')) return;
    const h = location.hash.slice(1) || 'ozet';
    if (h === 'yeni') { formAc(null); goster('form'); }
    else if (h.startsWith('duzenle-')) {
      const i = ilanlar.find((x) => String(x.id) === h.slice(8));
      if (!i) { location.hash = 'ilanlar'; return; }
      formAc(i); goster('form');
    }
    else if (h === 'ilanlar') { ilanTablosu(); goster('ilanlar'); }
    else if (h === 'mesajlar') { mesajListesi(); goster('mesajlar'); }
    else if (h === 'ayarlar') { ayarFormu(); goster('ayarlar'); }
    else if (h === 'istatistik') { istatistik(); goster('istatistik'); }
    else { ozet(); goster('ozet'); }
  }
  window.addEventListener('beforeunload', (e) => { if (kirli) { e.preventDefault(); e.returnValue = ''; } });

  /* ---------- Veriler ---------- */
  async function ilanlariYukle() {
    const { data, error } = await db.from('ilanlar').select('*').order('created_at', { ascending: false });
    if (error) { BE.bildirim(hataMetni(error), 'hata'); return; }
    ilanlar = data || [];
  }
  async function mesajlariYukle() {
    const { data, error } = await db.from('mesajlar').select('*').order('created_at', { ascending: false }).limit(500);
    if (error) { console.error(error); return; }
    mesajlar = data || [];
    const n = mesajlar.filter((m) => !m.okundu).length;
    $('#okunmamis').textContent = n || '';
  }

  /* ---------- Özet ---------- */
  function ozet() {
    const yayinda = ilanlar.filter((i) => i.yayinda && BE.aktifMi(i));
    const kutu = (s, y, hedef, vurgu) => `<button type="button" class="ozet-kutu ${vurgu ? 'vurgu' : ''}" data-git="${hedef}"><strong>${s}</strong>${y}</button>`;
    $('#ozet-kutular').innerHTML =
      kutu(yayinda.length, 'Yayındaki İlan', 'ilanlar') +
      kutu(yayinda.filter((i) => i.tip === 'Satılık').length, 'Satılık', 'ilanlar') +
      kutu(yayinda.filter((i) => i.tip === 'Kiralık').length, 'Kiralık', 'ilanlar') +
      kutu(ilanlar.filter((i) => !BE.aktifMi(i)).length, 'Satılan / Pasif', 'ilanlar') +
      kutu(ilanlar.filter((i) => !i.yayinda).length, 'Gizli', 'ilanlar') +
      kutu(mesajlar.filter((m) => !m.okundu).length, 'Okunmamış Mesaj', 'mesajlar', mesajlar.some((m) => !m.okundu));
    const pop = [...ilanlar].sort((a, b) => (b.goruntulenme || 0) - (a.goruntulenme || 0)).slice(0, 6);
    $('#ozet-populer').innerHTML = pop.length ? pop.map((i) => `<div class="mini-satir"><a href="#duzenle-${i.id}">#${i.id} ${esc(i.baslik)}</a><span style="white-space:nowrap">${ikon('goz')} ${BE.sayi(i.goruntulenme || 0)}</span></div>`).join('') : '<p>Henüz ilan yok.</p>';
    $('#ozet-mesajlar').innerHTML = mesajlar.length ? mesajlar.slice(0, 5).map((m) => `<div class="mini-satir"><span>${m.okundu ? '' : '<b style="color:var(--kirmizi)">● </b>'}<strong>${esc(m.ad_soyad)}</strong> — ${esc(m.konu || m.tur)}</span><small style="white-space:nowrap">${BE.tarih(m.created_at)}</small></div>`).join('') + '<p style="margin:12px 0 0"><a href="#mesajlar" style="color:var(--kirmizi);font-weight:700">Tüm mesajlar →</a></p>' : '<p>Henüz mesaj yok.</p>';
  }

  /* ---------- İlan durumu (Satıldı / Kiralandı / Pasif) ---------- */
  const SURE_GUN = 30;
  const kalanGun = (i) => {
    if (BE.aktifMi(i) || !i.durum_tarihi) return null;
    return Math.max(0, SURE_GUN - Math.floor((Date.now() - new Date(i.durum_tarihi)) / 86400000));
  };
  const durumEtiketi = (i) => {
    if (BE.aktifMi(i)) return '';
    const g = kalanGun(i);
    return `<span class="durum-btn durum-pasif" title="Sitede bilgi notuyla görünür, listelerde görünmez">${esc(i.durum)} · ${g > 0 ? `${g} gün sonra gizlenecek` : 'süresi doldu, sitede görünmüyor'}</span>`;
  };
  function kaldirSec(i) {
    return new Promise((coz) => {
      const m = $('#kaldir-modal');
      $('#kaldir-baslik').textContent = `"${i.baslik}" ilanını kaldır`;
      $('#kaldir-satildi').textContent = i.tip === 'Kiralık' ? 'Kiralandı' : 'Satıldı';
      $('#kaldir-satildi-aciklama').textContent = i.tip === 'Kiralık'
        ? `İlan sayfası ${SURE_GUN} gün boyunca "Bu ilan kiralanmıştır" notuyla görünür, sonra kendiliğinden gizlenir.`
        : `İlan sayfası ${SURE_GUN} gün boyunca "Bu ilan satılmıştır" notuyla görünür, sonra kendiliğinden gizlenir.`;
      m.classList.remove('gizli'); $('#kaldir-vazgec').focus();
      const bitir = (secim) => { m.classList.add('gizli'); m.onclick = null; document.removeEventListener('keydown', tus); coz(secim); };
      const tus = (e) => { if (e.key === 'Escape') bitir(null); };
      document.addEventListener('keydown', tus);
      m.onclick = (e) => {
        const b = e.target.closest('[data-kaldir]');
        if (b) bitir(b.dataset.kaldir); else if (e.target === m) bitir(null);
      };
    });
  }
  async function durumYap(i, durum) {
    const { data, error } = await db.from('ilanlar').update({ durum }).eq('id', i.id).select().single();
    if (error) { BE.bildirim(hataMetni(error), 'hata'); return false; }
    Object.assign(i, data); return true;
  }

  /* ---------- İlan tablosu ---------- */
  $('#il-ara').addEventListener('input', ilanTablosu);
  $('#il-durum').addEventListener('change', ilanTablosu);
  function ilanTablosu() {
    const q = $('#il-ara').value.trim().toLocaleLowerCase('tr-TR'), d = $('#il-durum').value;
    const l = ilanlar.filter((i) => {
      if (d === 'yayinda' && !i.yayinda) return false;
      if (d === 'kapali' && i.yayinda) return false;
      if ((d === 'Satılık' || d === 'Kiralık') && i.tip !== d) return false;
      if (d === 'one' && !i.one_cikan) return false;
      if (d === 'aktif' && !(i.yayinda && BE.aktifMi(i))) return false;
      if (d === 'pasif' && BE.aktifMi(i)) return false;
      if (q && !`${i.id} ${i.baslik} ${i.ilce} ${i.mahalle} ${i.kategori}`.toLocaleLowerCase('tr-TR').includes(q)) return false;
      return true;
    });
    $('#il-tablo').innerHTML = `<thead><tr><th></th><th>İlan</th><th>Fiyat</th><th>Durum</th><th style="text-align:right">İşlemler</th></tr></thead><tbody>` +
      (l.length ? l.map((i) => `<tr class="${i.yayinda && BE.aktifMi(i) ? '' : 'kapali'}">
        <td>${BE.kapak(i) ? `<img class="kucuk-resim" src="${esc(BE.kapak(i))}" alt="" loading="lazy">` : '<div class="kucuk-resim"></div>'}</td>
        <td><strong>#${i.id} ${esc(i.baslik)}</strong><br><small>${esc(i.tip)} · ${esc(i.kategori)} · ${esc(BE.konum(i))} · ${ikon('goz')} ${i.goruntulenme || 0}${(() => { const d = (ayarKayitli.danismanlar || []).find((x) => x.id === i.danisman_id); return d ? ' · 👤 ' + esc(d.ad) : ''; })()}</small></td>
        <td style="white-space:nowrap"><strong>${BE.fiyat(i)}</strong></td>
        <td><div style="display:flex;flex-direction:column;gap:4px;align-items:flex-start">
          <button type="button" class="durum-btn ${i.yayinda ? 'acik' : ''}" data-degistir="yayinda" data-id="${i.id}">${i.yayinda ? '● Yayında' : '○ Yayında değil'}</button>
          <button type="button" class="durum-btn ${i.one_cikan ? 'one' : ''}" data-degistir="one_cikan" data-id="${i.id}">${i.one_cikan ? '★ Öne çıkan' : '☆ Öne çıkar'}</button>
          ${durumEtiketi(i)}${i.yetki_no ? '' : '<span class="durum-btn" style="color:var(--kirmizi);border-color:var(--kirmizi)" title="Yetki belge no girilmediği için sitede görünmüyor">⚠ Yetki no yok · sitede görünmüyor</span>'}</div></td>
        <td class="islemler-td"><div class="islemler">
          <a class="btn btn-siyah btn-kucuk" href="#duzenle-${i.id}">Düzenle</a>
          <a class="btn btn-cizgi btn-kucuk" href="ilan.html?id=${i.id}" target="_blank" ${i.yayinda ? '' : 'style="display:none"'}>Gör</a>
          ${BE.aktifMi(i) ? `<button type="button" class="btn btn-cizgi btn-kucuk" data-kaldir-ac="${i.id}" style="color:var(--kirmizi);border-color:var(--kirmizi)">Kaldır</button>`
            : `<button type="button" class="btn btn-cizgi btn-kucuk" data-aktif-et="${i.id}">Tekrar Aktif Et</button>
               <button type="button" class="btn btn-cizgi btn-kucuk" data-sil="${i.id}" style="color:var(--kirmizi);border-color:var(--kirmizi)">Sil</button>`}</div></td>
      </tr>`).join('') : `<tr><td colspan="5" style="text-align:center;padding:40px">${ilanlar.length ? 'Aramanıza uygun ilan yok.' : 'Henüz ilan eklemediniz. <a href="#yeni" style="color:var(--kirmizi);font-weight:700">İlk ilanınızı ekleyin →</a>'}</td></tr>`) + '</tbody>';
  }
  $('#il-tablo').addEventListener('click', async (e) => {
    const d = e.target.closest('[data-degistir]');
    if (d) {
      const i = ilanlar.find((x) => String(x.id) === d.dataset.id), alan = d.dataset.degistir;
      d.disabled = true;
      const { error } = await db.from('ilanlar').update({ [alan]: !i[alan] }).eq('id', i.id);
      if (error) { BE.bildirim(hataMetni(error), 'hata'); d.disabled = false; return; }
      i[alan] = !i[alan]; ilanTablosu();
      BE.bildirim(alan === 'yayinda' ? (i.yayinda ? 'İlan yayına alındı' : 'İlan yayından kaldırıldı') : (i.one_cikan ? 'Öne çıkarıldı' : 'Öne çıkarma kaldırıldı'));
      return;
    }
    const k = e.target.closest('[data-kaldir-ac]');
    if (k) {
      const i = ilanlar.find((x) => String(x.id) === k.dataset.kaldirAc);
      const secim = await kaldirSec(i);
      if (!secim) return;
      if (secim === 'sil') { await ilanSil(i); return; }
      const durum = secim === 'satildi' ? (i.tip === 'Kiralık' ? 'Kiralandı' : 'Satıldı') : 'Pasif';
      if (await durumYap(i, durum)) { ilanTablosu(); BE.bildirim(`İlan "${durum}" olarak işaretlendi. ${SURE_GUN} gün sonra sitede kendiliğinden gizlenecek.`); }
      return;
    }
    const a = e.target.closest('[data-aktif-et]');
    if (a) {
      const i = ilanlar.find((x) => String(x.id) === a.dataset.aktifEt);
      if (await durumYap(i, 'Aktif')) { ilanTablosu(); BE.bildirim('İlan tekrar aktif edildi'); }
      return;
    }
    const s = e.target.closest('[data-sil]');
    if (s) await ilanSil(ilanlar.find((x) => String(x.id) === s.dataset.sil));
  });
  async function ilanSil(i) {
    {
      if (!(await onayla('İlan silinsin mi?', `"${i.baslik}" ilanı ve fotoğrafları kalıcı olarak silinecek ve geri alınamaz.`, 'Evet, Sil'))) return;
      const { error } = await db.from('ilanlar').delete().eq('id', i.id);
      if (error) { BE.bildirim(hataMetni(error), 'hata'); return; }
      fotoSil(i.resimler || []);
      ilanlar = ilanlar.filter((x) => x.id !== i.id); ilanTablosu(); BE.bildirim('İlan silindi');
    }
  }

  /* ---------- Fotoğraflar ---------- */
  const depoYolu = (url) => { const k = `/object/public/${BUCKET}/`; const n = url.indexOf(k); return n >= 0 ? decodeURIComponent(url.slice(n + k.length)) : null; };
  function fotoSil(urller) {
    const yollar = urller.map(depoYolu).filter(Boolean);
    if (yollar.length) db.storage.from(BUCKET).remove(yollar).then(({ error }) => error && console.warn('Fotoğraf silinemedi', error));
  }
  let logoSozu = null;
  const logoYukle = () => logoSozu || (logoSozu = new Promise((coz, red) => { const im = new Image(); im.onload = () => coz(im); im.onerror = red; im.src = 'images/logo.png'; }));
  // Logo ekleme tercihini hatırla
  try { const f = localStorage.getItem('be_filigran'); if (f === '0') document.getElementById('filigran').checked = false; } catch { /* yok */ }
  document.getElementById('filigran').addEventListener('change', (e) => { try { localStorage.setItem('be_filigran', e.target.checked ? '1' : '0'); } catch { /* yok */ } });

  async function kucult(dosya) {
    const EN = 1600;
    let kaynak;
    try { kaynak = await createImageBitmap(dosya, { imageOrientation: 'from-image' }); }
    catch {
      kaynak = await new Promise((coz, red) => { const im = new Image(); im.onload = () => coz(im); im.onerror = red; im.src = URL.createObjectURL(dosya); });
    }
    const w = kaynak.width, h = kaynak.height, o = Math.min(1, EN / Math.max(w, h));
    const c = document.createElement('canvas'); c.width = Math.round(w * o); c.height = Math.round(h * o);
    const x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height); x.drawImage(kaynak, 0, 0, c.width, c.height);
    if ($('#filigran').checked) {
      try {
        const logo = await logoYukle();
        const lw = Math.round(c.width * 0.22), lh = Math.round(lw * logo.height / logo.width), pay = Math.round(c.width * 0.025);
        x.globalAlpha = 0.85;
        x.fillStyle = 'rgba(255,255,255,0.75)';
        const r = Math.round(lh * 0.12);
        x.beginPath(); x.roundRect ? x.roundRect(c.width - lw - pay * 1.6, c.height - lh - pay * 1.6, lw + pay * 1.2, lh + pay * 1.2, r) : x.rect(c.width - lw - pay * 1.6, c.height - lh - pay * 1.6, lw + pay * 1.2, lh + pay * 1.2); x.fill();
        x.globalAlpha = 1;
        x.drawImage(logo, c.width - lw - pay, c.height - lh - pay, lw, lh);
      } catch (e) { console.warn('Logo eklenemedi', e); }
    }
    let blob = await new Promise((coz) => c.toBlob(coz, 'image/webp', 0.82));
    if (!blob || blob.type !== 'image/webp') blob = await new Promise((coz) => c.toBlob(coz, 'image/jpeg', 0.85));
    return blob;
  }
  async function fotoYukle(dosyalar) {
    dosyalar = Array.from(dosyalar).filter((d) => d.type.startsWith('image/'));
    if (!dosyalar.length) return;
    $('#foto-ilerleme').classList.remove('gizli');
    let biten = 0, hatali = 0;
    for (const d of dosyalar) {
      $('#foto-durum').textContent = `${biten + 1} / ${dosyalar.length} fotoğraf yükleniyor…`;
      try {
        const blob = await kucult(d);
        const uzanti = blob.type === 'image/webp' ? 'webp' : 'jpg';
        const yol = `ilan-${duzenlenen ? duzenlenen.id : 'yeni'}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${uzanti}`;
        const { error } = await db.storage.from(BUCKET).upload(yol, blob, { contentType: blob.type, cacheControl: '31536000', upsert: false });
        if (error) throw error;
        fotolar.push(db.storage.from(BUCKET).getPublicUrl(yol).data.publicUrl);
        kirli = true; fotoCiz();
      } catch (err) { console.error(err); hatali++; BE.bildirim(`${d.name}: ${hataMetni(err)}`, 'hata'); }
      biten++; $('#foto-bar').style.width = (biten / dosyalar.length * 100) + '%';
    }
    $('#foto-durum').textContent = hatali ? `${biten - hatali} fotoğraf yüklendi, ${hatali} tanesi yüklenemedi.` : `${biten} fotoğraf yüklendi. Kaydetmeyi unutmayın.`;
    setTimeout(() => { $('#foto-ilerleme').classList.add('gizli'); $('#foto-bar').style.width = '0'; }, 3000);
  }
  function fotoCiz() {
    $('#foto-liste').innerHTML = fotolar.map((u, n) => `
      <div class="foto ${n === 0 ? 'kapak' : ''}" draggable="true" data-n="${n}">
        ${n === 0 ? '<span class="kapak-etiket">KAPAK</span>' : ''}
        <img src="${esc(u)}" alt="Fotoğraf ${n + 1}">
        <div class="foto-araclar">
          <button type="button" data-tasi="-1" ${n === 0 ? 'disabled' : ''} aria-label="Sola taşı">←</button>
          ${n !== 0 ? '<button type="button" data-kapak aria-label="Kapak yap" title="Kapak yap">★</button>' : ''}
          <button type="button" class="sil" data-foto-sil aria-label="Fotoğrafı kaldır">✕</button>
          <button type="button" data-tasi="1" ${n === fotolar.length - 1 ? 'disabled' : ''} aria-label="Sağa taşı">→</button>
        </div>
      </div>`).join('');
  }
  $('#foto-sec').addEventListener('change', (e) => { fotoYukle(e.target.files); e.target.value = ''; });
  const birak = $('#foto-birak');
  ['dragenter', 'dragover'].forEach((t) => birak.addEventListener(t, (e) => { if (e.dataTransfer.types.includes('Files')) { e.preventDefault(); birak.classList.add('uzerinde'); } }));
  ['dragleave', 'drop'].forEach((t) => birak.addEventListener(t, () => birak.classList.remove('uzerinde')));
  birak.addEventListener('drop', (e) => { if (e.dataTransfer.files.length) { e.preventDefault(); fotoYukle(e.dataTransfer.files); } });
  const liste = $('#foto-liste');
  liste.addEventListener('click', (e) => {
    const f = e.target.closest('.foto'); if (!f) return;
    const n = Number(f.dataset.n);
    if (e.target.closest('[data-foto-sil]')) { silinecekFotolar.push(fotolar[n]); fotolar.splice(n, 1); }
    else if (e.target.closest('[data-kapak]')) { fotolar.unshift(fotolar.splice(n, 1)[0]); }
    else if (e.target.closest('[data-tasi]')) { const k = n + Number(e.target.closest('[data-tasi]').dataset.tasi); [fotolar[n], fotolar[k]] = [fotolar[k], fotolar[n]]; }
    else return;
    kirli = true; fotoCiz();
  });
  let surNo = null;
  liste.addEventListener('dragstart', (e) => { const f = e.target.closest('.foto'); if (!f) return; surNo = Number(f.dataset.n); f.classList.add('surukleniyor'); e.dataTransfer.effectAllowed = 'move'; });
  liste.addEventListener('dragover', (e) => { if (surNo !== null) e.preventDefault(); });
  liste.addEventListener('drop', (e) => {
    const f = e.target.closest('.foto'); if (surNo === null || !f) return;
    e.preventDefault(); const k = Number(f.dataset.n);
    if (k !== surNo) { fotolar.splice(k, 0, fotolar.splice(surNo, 1)[0]); kirli = true; }
    surNo = null; fotoCiz();
  });
  liste.addEventListener('dragend', () => { surNo = null; fotoCiz(); });

  /* ---------- Özellik etiketleri ---------- */
  const ONERILER = ['Güney Cephe', 'Ankastre Mutfak', 'Çelik Kapı', 'Görüntülü Diyafon', 'Klima', 'Şömine', 'Bahçe', 'Havuz', 'Kapalı Otopark',
    '7/24 Güvenlik', 'Jeneratör', 'Isı Yalıtımı', 'Ebeveyn Banyosu', 'Giyinme Odası', 'Teras', 'Manzaralı', 'Okula Yakın', 'Toplu Taşımaya Yakın',
    'Cadde Üzeri', 'Yola Cepheli', 'Elektrik', 'Su', 'Konut İmarlı', 'Depolu'];
  function etiketCiz() {
    $$('#etiketler .etiket').forEach((x) => x.remove());
    $('#etiket-gir').insertAdjacentHTML('beforebegin', etiketler.map((t, n) => `<span class="etiket">${esc(t)}<button type="button" data-etiket-sil="${n}" aria-label="${esc(t)} kaldır">×</button></span>`).join(''));
    $('#etiket-oneri').innerHTML = ONERILER.filter((o) => !etiketler.includes(o)).map((o) => `<button type="button" class="cip" data-oneri="${esc(o)}">+ ${esc(o)}</button>`).join('');
  }
  const etiketEkle = (t) => { t = t.trim().slice(0, 50); if (t && !etiketler.includes(t)) { etiketler.push(t); kirli = true; } etiketCiz(); };
  $('#etiket-gir').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); etiketEkle(e.target.value); e.target.value = ''; }
    else if (e.key === 'Backspace' && !e.target.value && etiketler.length) { etiketler.pop(); kirli = true; etiketCiz(); }
  });
  $('#etiket-gir').addEventListener('blur', (e) => { if (e.target.value.trim()) { etiketEkle(e.target.value); e.target.value = ''; } });
  $('#etiketler').addEventListener('click', (e) => { const b = e.target.closest('[data-etiket-sil]'); if (b) { etiketler.splice(Number(b.dataset.etiketSil), 1); kirli = true; etiketCiz(); } else $('#etiket-gir').focus(); });
  $('#etiket-oneri').addEventListener('click', (e) => { const b = e.target.closest('[data-oneri]'); if (b) etiketEkle(b.dataset.oneri); });

  /* ---------- Harita ---------- */
  const MERKEZ = [37.0742, 36.2472];
  function haritaHazirla() {
    if (!window.L) { $('#harita').innerHTML = '<p style="padding:20px">Harita yüklenemedi. Enlem ve boylamı elle yazabilirsiniz.</p>'; return; }
    if (!harita) {
      harita = L.map('harita').setView(MERKEZ, 13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '© OpenStreetMap' }).addTo(harita);
      harita.on('click', (e) => konumAyarla(e.latlng.lat, e.latlng.lng));
    }
    setTimeout(() => harita.invalidateSize(), 50);
    const f = $('#ilan-form'), la = parseFloat(f.enlem.value), lo = parseFloat(f.boylam.value);
    if (isaret) { harita.removeLayer(isaret); isaret = null; }
    if (!isNaN(la) && !isNaN(lo)) { konumAyarla(la, lo, false); harita.setView([la, lo], 16); }
    else harita.setView(MERKEZ, 13);
  }
  function konumAyarla(la, lo, degisti = true) {
    const f = $('#ilan-form');
    f.enlem.value = la.toFixed(6); f.boylam.value = lo.toFixed(6);
    if (degisti) kirli = true;
    if (!window.L || !harita) return;
    if (isaret) isaret.setLatLng([la, lo]);
    else {
      isaret = L.marker([la, lo], { draggable: true }).addTo(harita);
      isaret.on('dragend', () => { const p = isaret.getLatLng(); konumAyarla(p.lat, p.lng); });
    }
  }
  $('#konum-sil').addEventListener('click', () => { const f = $('#ilan-form'); f.enlem.value = f.boylam.value = ''; if (isaret) { harita.removeLayer(isaret); isaret = null; } kirli = true; });
  ['enlem', 'boylam'].forEach((n) => $(`#ilan-form [name=${n}]`).addEventListener('change', () => {
    const f = $('#ilan-form'), la = parseFloat(f.enlem.value.replace(',', '.')), lo = parseFloat(f.boylam.value.replace(',', '.'));
    if (!isNaN(la) && !isNaN(lo)) { konumAyarla(la, lo); harita && harita.setView([la, lo], 16); }
  }));
  $('#konum-bul').addEventListener('click', async () => {
    const f = $('#ilan-form'), b = $('#konum-bul');
    const denemeler = [[f.mahalle.value && f.mahalle.value + ' Mahallesi', f.ilce.value, f.il.value], [f.mahalle.value, f.ilce.value, f.il.value], [f.ilce.value, f.il.value]]
      .map((p) => p.filter(Boolean).join(', ')).filter(Boolean);
    if (!denemeler.length) { BE.bildirim('Önce ilçe veya mahalle yazın', 'hata'); return; }
    b.disabled = true; b.textContent = 'Aranıyor…';
    try {
      for (const q of denemeler) {
        const r = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=tr&accept-language=tr&q=${encodeURIComponent(q)}`);
        const j = await r.json();
        if (j && j[0]) { const la = Number(j[0].lat), lo = Number(j[0].lon); konumAyarla(la, lo); harita && harita.setView([la, lo], 16); BE.bildirim('Bulundu. İşareti tam yerine sürükleyebilirsiniz.'); return; }
      }
      BE.bildirim('Bulunamadı. Haritada yere tıklayarak işaretleyin.', 'hata');
    } catch { BE.bildirim('Arama yapılamadı. Haritaya tıklayarak işaretleyin.', 'hata'); }
    finally { b.disabled = false; b.textContent = 'Mahalleyi haritada bul'; }
  });

  /* ---------- İlan formu ---------- */
  const form = $('#ilan-form');
  const METIN = ['durum', 'baslik', 'kategori', 'il', 'ilce', 'mahalle', 'oda_sayisi', 'bulundugu_kat', 'isitma', 'tapu_durumu', 'imar_durumu', 'aciklama'];
  const TAMSAYI = ['brut_m2', 'net_m2', 'banyo_sayisi', 'bina_yasi', 'kat_sayisi'];
  const PARA = ['fiyat', 'aidat'];
  const BAYRAK = ['esyali', 'balkon', 'asansor', 'otopark', 'site_icinde', 'krediye_uygun', 'takas', 'yayinda', 'one_cikan'];
  PARA.forEach((n) => H.bicimle(form[n]));
  let tip = 'Satılık';
  const tipAyarla = (t) => { tip = t; $$('.secim-grup[data-ad=tip] button').forEach((b) => b.classList.toggle('aktif', b.dataset.v === t)); };
  $$('.secim-grup[data-ad=tip] button').forEach((b) => b.addEventListener('click', () => { tipAyarla(b.dataset.v); kirli = true; }));
  form.addEventListener('input', () => { kirli = true; $('#form-durum').textContent = ''; });

  function formAc(i) {
    duzenlenen = i;
    form.reset();
    $('#form-durum').textContent = '';
    $('#form-baslik').textContent = i ? `İlanı Düzenle #${i.id}` : 'Yeni İlan';
    const on = $('#form-onizle'); on.classList.toggle('gizli', !(i && i.yayinda)); if (i) on.href = `ilan.html?id=${i.id}`;
    tipAyarla(i ? i.tip : 'Satılık');
    METIN.forEach((n) => { form[n].value = i ? (i[n] ?? '') : (n === 'il' ? 'Osmaniye' : n === 'kategori' ? 'Daire' : n === 'durum' ? 'Aktif' : ''); });
    TAMSAYI.forEach((n) => { form[n].value = i && i[n] != null ? i[n] : ''; });
    PARA.forEach((n) => { form[n].value = i && i[n] != null ? BE.sayi(i[n]) : ''; });
    BAYRAK.forEach((n) => { form[n].checked = i ? !!i[n] : n === 'yayinda'; });
    form.video_url.value = (i && i.video_url) || '';
    const dl = (ayarKayitli.danismanlar || []);
    let sonDanisman = ''; try { sonDanisman = localStorage.getItem('be_danisman') || ''; } catch (e) {}
    form.danisman_id.innerHTML = '<option value="">— Danışman seçilmedi (firma bilgileri görünür) —</option>' + dl.map((d) => `<option value="${esc(d.id)}">${esc(d.ad)}${d.unvan ? ' · ' + esc(d.unvan) : ''}</option>`).join('');
    const secili = i ? (i.danisman_id || '') : sonDanisman;
    form.danisman_id.value = dl.some((d) => d.id === secili) ? secili : '';
    let sonYetki = ''; try { sonYetki = localStorage.getItem('be_yetki_no') || ''; } catch (e) {}
    form.yetki_no.value = i ? (i.yetki_no || '') : sonYetki;
    form.sanal_tur_url.value = (i && i.sanal_tur_url) || '';
    form.enlem.value = i && i.enlem != null ? i.enlem : '';
    form.boylam.value = i && i.boylam != null ? i.boylam : '';
    fotolar = i ? [...(i.resimler || [])] : [];
    silinecekFotolar = [];
    etiketler = i ? [...(i.ozellikler || [])] : [];
    fotoCiz(); etiketCiz();
    kirli = false;
    setTimeout(haritaHazirla, 0);
    setTimeout(() => form.baslik.focus(), 60);
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const v = {};
    METIN.forEach((n) => { const x = form[n].value.trim(); v[n] = x || null; });
    TAMSAYI.forEach((n) => { const x = parseInt(form[n].value, 10); v[n] = isNaN(x) ? null : x; });
    PARA.forEach((n) => { const x = H.oku(form[n].value); v[n] = form[n].value.trim() ? x : null; });
    BAYRAK.forEach((n) => { v[n] = form[n].checked; });
    const la = parseFloat(String(form.enlem.value).replace(',', '.')), lo = parseFloat(String(form.boylam.value).replace(',', '.'));
    v.enlem = isNaN(la) ? null : la; v.boylam = isNaN(lo) ? null : lo;
    v.tip = tip; v.il = v.il || 'Osmaniye'; v.kategori = v.kategori || 'Daire'; v.durum = v.durum || 'Aktif';
    v.resimler = fotolar; v.ozellikler = etiketler;
    v.danisman_id = form.danisman_id.value || null;
    ['video_url', 'sanal_tur_url', 'yetki_no'].forEach((n) => { const x = form[n].value.trim(); v[n] = x || null; });

    const hatalar = [];
    if (!v.baslik || v.baslik.length < 3) hatalar.push('başlık');
    if (v.fiyat === null) hatalar.push('fiyat');
    if (!v.yetki_no) hatalar.push('yetki belge no');
    if ((v.video_url && !/^https:\/\//i.test(v.video_url)) || (v.sanal_tur_url && !/^https:\/\//i.test(v.sanal_tur_url))) hatalar.push('video/sanal tur linki "https://" ile başlamalı');
    if (hatalar.length) {
      $('#form-durum').innerHTML = `<span style="color:var(--kirmizi);font-weight:700">Lütfen doldurun: ${hatalar.join(', ')}</span>`;
      (!v.baslik ? form.baslik : v.fiyat === null ? form.fiyat : form.yetki_no).focus(); return;
    }
    const btn = $('#kaydet-btn'); btn.disabled = true; btn.textContent = 'Kaydediliyor…';
    try {
      let kayit;
      if (duzenlenen) {
        const { data, error } = await db.from('ilanlar').update(v).eq('id', duzenlenen.id).select().single();
        if (error) throw error; kayit = data;
        ilanlar = ilanlar.map((x) => x.id === kayit.id ? kayit : x);
      } else {
        const { data, error } = await db.from('ilanlar').insert(v).select().single();
        if (error) throw error; kayit = data;
        ilanlar.unshift(kayit);
      }
      try { localStorage.setItem('be_yetki_no', v.yetki_no); localStorage.setItem('be_danisman', v.danisman_id || ''); } catch (e) {}
      fotoSil(silinecekFotolar); silinecekFotolar = [];
      kirli = false;
      BE.bildirim(duzenlenen ? 'İlan güncellendi' : 'İlan eklendi');
      location.hash = 'ilanlar';
    } catch (err) {
      console.error(err);
      $('#form-durum').innerHTML = `<span style="color:var(--kirmizi);font-weight:700">Kaydedilemedi: ${/danisman_id/.test(String(err && (err.message || err))) ? 'Veritabanında danışman alanı henüz yok. Supabase SQL Editor\'de kurulum satırını çalıştırın.' : /yetki_no/.test(String(err && (err.message || err))) ? 'Veritabanında yetki numarası alanı henüz yok. Supabase SQL Editor\'de kurulum satırını çalıştırın.' : esc(hataMetni(err))}</span>`;
    }
    btn.disabled = false; btn.textContent = 'İlanı Kaydet';
  });

  /* ---------- Mesajlar ---------- */
  $('#ms-filtre').addEventListener('change', mesajListesi);
  function mesajListesi() {
    const f = $('#ms-filtre').value;
    const l = mesajlar.filter((m) => !f || (f === 'okunmamis' ? !m.okundu : m.tur === f));
    $('#ms-liste').innerHTML = l.length ? l.map((m) => `
      <div class="mesaj-kart ${m.okundu ? '' : 'yeni'}">
        <div class="ust">
          <div><strong style="font-family:var(--font-baslik);font-size:1.05rem">${esc(m.ad_soyad)}</strong>
            <span class="rozet ${m.tur === 'Mülk Teklifi' ? 'rozet-satilik' : 'rozet-gri'}" style="margin-left:6px">${esc(m.tur)}</span>
            ${m.okundu ? '' : '<span class="rozet rozet-kiralik" style="margin-left:4px">Yeni</span>'}</div>
          <small>${new Date(m.created_at).toLocaleString('tr-TR')}</small>
        </div>
        ${m.konu ? `<div><strong>Konu:</strong> ${esc(m.konu)}</div>` : ''}
        <div>${m.telefon ? `${ikon('telefon')} ${esc(m.telefon)}` : ''} ${m.eposta ? ` · ${ikon('eposta')} ${esc(m.eposta)}` : ''}</div>
        ${m.mesaj ? `<div class="govde">${esc(m.mesaj)}</div>` : ''}
        <div class="butonlar">
          ${m.telefon ? `<a class="btn btn-kirmizi btn-kucuk" href="${BE.telLink(m.telefon)}">${ikon('telefon')} Ara</a>
          <a class="btn btn-wp btn-kucuk" target="_blank" rel="noopener" href="${BE.wpLink(m.telefon, `Merhaba ${m.ad_soyad}, ${ayarlar.firma_adi}'tan yazıyoruz.`)}">WhatsApp</a>` : ''}
          ${m.eposta ? `<a class="btn btn-cizgi btn-kucuk" href="mailto:${esc(m.eposta)}">E-posta</a>` : ''}
          ${m.ilan_id ? `<a class="btn btn-cizgi btn-kucuk" href="#duzenle-${m.ilan_id}">İlan #${m.ilan_id}</a>` : ''}
          <button type="button" class="btn btn-cizgi btn-kucuk" data-okundu="${m.id}">${m.okundu ? 'Okunmadı yap' : 'Okundu işaretle'}</button>
          <button type="button" class="btn btn-cizgi btn-kucuk" data-ms-sil="${m.id}" style="color:var(--kirmizi);border-color:var(--kirmizi)">Sil</button>
        </div>
      </div>`).join('') : '<div class="bos-durum">Mesaj yok.</div>';
  }
  $('#ms-liste').addEventListener('click', async (e) => {
    const o = e.target.closest('[data-okundu]');
    if (o) {
      const m = mesajlar.find((x) => String(x.id) === o.dataset.okundu);
      const { error } = await db.from('mesajlar').update({ okundu: !m.okundu }).eq('id', m.id);
      if (error) { BE.bildirim(hataMetni(error), 'hata'); return; }
      m.okundu = !m.okundu; $('#okunmamis').textContent = mesajlar.filter((x) => !x.okundu).length || ''; mesajListesi(); return;
    }
    const s = e.target.closest('[data-ms-sil]');
    if (s) {
      if (!(await onayla('Mesaj silinsin mi?', 'Bu mesaj kalıcı olarak silinecek.', 'Evet, Sil'))) return;
      const { error } = await db.from('mesajlar').delete().eq('id', Number(s.dataset.msSil));
      if (error) { BE.bildirim(hataMetni(error), 'hata'); return; }
      mesajlar = mesajlar.filter((x) => String(x.id) !== s.dataset.msSil);
      $('#okunmamis').textContent = mesajlar.filter((x) => !x.okundu).length || ''; mesajListesi(); BE.bildirim('Mesaj silindi');
    }
  });

  /* ---------- İstatistikler ---------- */
  $('#ist-sure').addEventListener('change', istatistik);
  async function istatistik() {
    const gun = Number($('#ist-sure').value);
    $('#ist-kutular').innerHTML = '<p>Yükleniyor…</p>';
    db.rpc('eski_ziyaretleri_temizle').then(() => {}, () => {});
    const bas = new Date(); bas.setHours(0, 0, 0, 0); bas.setDate(bas.getDate() - (gun - 1));
    let tum = [], from = 0;
    while (true) {
      const { data, error } = await db.from('ziyaretler').select('created_at,sayfa,ilan_id,kaynak,cihaz').gte('created_at', bas.toISOString()).order('created_at').range(from, from + 999);
      if (error) { $('#ist-kutular').innerHTML = `<p style="color:var(--kirmizi)">${esc(hataMetni(error))}</p>`; return; }
      tum = tum.concat(data || []);
      if (!data || data.length < 1000 || tum.length >= 50000) break;
      from += 1000;
    }
    const bugun = new Date(); bugun.setHours(0, 0, 0, 0);
    const gunAnahtar = (d) => { const t = new Date(d); return `${t.getFullYear()}-${t.getMonth() + 1}-${t.getDate()}`; };
    const bugunSay = tum.filter((z) => new Date(z.created_at) >= bugun).length;
    const mobil = tum.filter((z) => z.cihaz === 'mobil').length;
    const ilanBakis = tum.filter((z) => z.ilan_id).length;
    const kutu = (s, y) => `<div class="ozet-kutu" style="cursor:default"><strong>${BE.sayi(s)}</strong>${y}</div>`;
    $('#ist-kutular').innerHTML = kutu(bugunSay, 'Bugün') + kutu(tum.length, `Son ${gun} gün`) + kutu(ilanBakis, 'İlan görüntüleme')
      + kutu(tum.length ? Math.round(mobil / tum.length * 100) : 0, '% Mobil');
    // günlük grafik
    const sayac = {}; tum.forEach((z) => { const k = gunAnahtar(z.created_at); sayac[k] = (sayac[k] || 0) + 1; });
    const gunler = []; for (let n = 0; n < gun; n++) { const d = new Date(bas); d.setDate(bas.getDate() + n); gunler.push(d); }
    const enCok = Math.max(1, ...gunler.map((d) => sayac[gunAnahtar(d)] || 0));
    $('#ist-grafik').innerHTML = gunler.map((d) => { const v = sayac[gunAnahtar(d)] || 0; return `<div class="cubuk" style="height:${v / enCok * 100}%"><span>${d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}: ${v}</span></div>`; }).join('')
      + '';
    $('#ist-grafik').insertAdjacentHTML('afterend', '');
    const eksen = $('#ist-grafik').nextElementSibling;
    if (!eksen || !eksen.classList.contains('ist-eksen')) $('#ist-grafik').insertAdjacentHTML('afterend', '<div class="ist-eksen"></div>');
    $('#ist-grafik').nextElementSibling.innerHTML = `<span>${gunler[0].toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}</span><span>Bugün</span>`;
    // listeler
    const say = (dizi) => { const m = new Map(); dizi.forEach((k) => m.set(k, (m.get(k) || 0) + 1)); return [...m.entries()].sort((a, b) => b[1] - a[1]); };
    const liste = (veri, etiket) => {
      if (!veri.length) return '<p style="color:var(--metin-soluk)">Henüz veri yok.</p>';
      const ust = veri[0][1];
      return veri.slice(0, 10).map(([k, v]) => `<div class="ist-satir"><div>${etiket(k)}<div class="ist-bar"><div style="width:${v / ust * 100}%"></div></div></div><strong>${BE.sayi(v)}</strong></div>`).join('');
    };
    $('#ist-ilanlar').innerHTML = liste(say(tum.filter((z) => z.ilan_id).map((z) => z.ilan_id)), (id) => {
      const i = ilanlar.find((x) => x.id === id); return i ? `<a href="#duzenle-${id}">#${id} ${esc(i.baslik)}</a>` : `#${id} (silinmiş ilan)`;
    });
    const KAYNAK_AD = (k) => {
      if (!k) return 'Doğrudan (link/yer imi/WhatsApp)';
      if (/google\./.test(k)) return 'Google';
      if (/instagram/.test(k)) return 'Instagram';
      if (/facebook|fb\./.test(k)) return 'Facebook';
      if (/sahibinden/.test(k)) return 'Sahibinden';
      if (/bing|yandex|yahoo/.test(k)) return 'Diğer arama motorları';
      return k;
    };
    $('#ist-kaynak').innerHTML = liste(say(tum.map((z) => KAYNAK_AD(z.kaynak))), (k) => esc(k));
    const SAYFA_AD = (p) => {
      if (p === '/' || /index\.html$/.test(p)) return 'Ana sayfa';
      const ad = p.replace(/^\//, '').replace(/\.html$/, '');
      return ({ ilanlar: 'İlanlar', iletisim: 'İletişim', hakkimizda: 'Hakkımızda', rehber: 'Emlak Rehberi', favoriler: 'Favoriler', ilan: 'İlan detayı', kvkk: 'KVKK' })[ad]
        || (/^ilan-\d+/.test(ad) ? 'İlan detayı' : ad.replace(/-/g, ' '));
    };
    $('#ist-sayfalar').innerHTML = liste(say(tum.map((z) => SAYFA_AD(z.sayfa))), (k) => esc(k));
  }

  /* ---------- Site ayarları ---------- */
  const af = $('#ayar-form');
  function saatCiz() {
    $('#saat-duzen').innerHTML = ayarlar.calisma_saatleri.map((g, n) => `
      <div class="saat-satir" data-n="${n}">
        <strong>${esc(g.gun)}</strong>
        <label class="anahtar"><input type="checkbox" data-saat="acik" ${g.acik ? 'checked' : ''}><span></span> ${g.acik ? 'Açık' : 'Kapalı'}</label>
        <input type="time" data-saat="baslangic" value="${esc(g.baslangic)}" ${g.acik ? '' : 'disabled'} aria-label="${esc(g.gun)} açılış">
        <input type="time" data-saat="bitis" value="${esc(g.bitis)}" ${g.acik ? '' : 'disabled'} aria-label="${esc(g.gun)} kapanış">
      </div>`).join('');
  }
  $('#saat-duzen').addEventListener('change', (e) => {
    const s = e.target.closest('.saat-satir'); if (!s) return;
    const g = ayarlar.calisma_saatleri[Number(s.dataset.n)], k = e.target.dataset.saat;
    g[k] = k === 'acik' ? e.target.checked : e.target.value;
    if (k === 'acik' && g.acik && !g.baslangic) { g.baslangic = '08:30'; g.bitis = '18:30'; }
    kirli = true; saatCiz();
  });
  $('#saat-kopyala').addEventListener('click', () => {
    const p = ayarlar.calisma_saatleri[0];
    ayarlar.calisma_saatleri.forEach((g) => { if (g.acik) { g.baslangic = p.baslangic; g.bitis = p.bitis; } });
    kirli = true; saatCiz(); BE.bildirim('Uygulandı. Kaydetmeyi unutmayın.');
  });
  function listeCiz(ad) {
    $('#liste-' + ad).innerHTML = (ayarlar[ad] || []).map((x, n) => `
      <div class="liste-satir" data-liste="${ad}" data-n="${n}">
        <input type="text" data-l="baslik" value="${esc(x.baslik)}" placeholder="Başlık" aria-label="Başlık">
        <input type="text" data-l="aciklama" value="${esc(x.aciklama)}" placeholder="Kısa açıklama" aria-label="Açıklama">
        <button type="button" class="btn btn-cizgi btn-kucuk" data-l-sil aria-label="Kaldır" style="color:var(--kirmizi);border-color:var(--kirmizi)">✕</button>
      </div>`).join('');
  }
  af.addEventListener('input', (e) => {
    kirli = true;
    const s = e.target.closest('.liste-satir');
    if (s && e.target.dataset.l) ayarlar[s.dataset.liste][Number(s.dataset.n)][e.target.dataset.l] = e.target.value;
  });
  af.addEventListener('click', (e) => {
    const sil = e.target.closest('[data-l-sil]');
    if (sil) { const s = sil.closest('.liste-satir'); ayarlar[s.dataset.liste].splice(Number(s.dataset.n), 1); kirli = true; listeCiz(s.dataset.liste); }
    const ekle = e.target.closest('[data-liste-ekle]');
    if (ekle) { const ad = ekle.dataset.listeEkle; (ayarlar[ad] = ayarlar[ad] || []).push({ baslik: '', aciklama: '' }); kirli = true; listeCiz(ad); $(`#liste-${ad} .liste-satir:last-child input`).focus(); }
  });
  /* ---------- Danışmanlar ---------- */
  const yeniId = () => 'd' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
  const basHarf = (ad) => String(ad || '?').trim().split(/\s+/).map((k) => k[0] || '').slice(0, 2).join('').toLocaleUpperCase('tr-TR');
  function danismanCiz() {
    const l = ayarlar.danismanlar || [];
    $('#danisman-liste').innerHTML = l.length ? l.map((d, n) => `
      <div class="danisman-satir" data-n="${n}">
        <button type="button" class="danisman-foto" data-d-foto title="Fotoğraf seç">${d.foto ? `<img src="${esc(d.foto)}" alt="">` : `<span>${esc(basHarf(d.ad))}</span>`}<small>${d.foto ? 'Değiştir' : 'Fotoğraf'}</small></button>
        <div class="form-izgara" style="flex:1">
          <label class="alan"><span>Ad Soyad *</span><input type="text" data-d="ad" value="${esc(d.ad)}" maxlength="80"></label>
          <label class="alan"><span>Ünvan</span><input type="text" data-d="unvan" value="${esc(d.unvan)}" maxlength="60" placeholder="Örn. Gayrimenkul Danışmanı"></label>
          <label class="alan"><span>Telefon</span><input type="tel" data-d="telefon" value="${esc(d.telefon)}" maxlength="30" placeholder="Örn. 0532 123 45 67"></label>
          <label class="anahtar" style="align-self:end"><input type="checkbox" data-d="whatsapp" ${d.whatsapp ? 'checked' : ''}><span></span> Bu numarada WhatsApp var</label>
        </div>
        <div style="display:flex;flex-direction:column;gap:6px">
          ${d.foto ? '<button type="button" class="btn btn-cizgi btn-kucuk" data-d-foto-sil>Fotoğrafı kaldır</button>' : ''}
          <button type="button" class="btn btn-cizgi btn-kucuk" data-d-sil style="color:var(--kirmizi);border-color:var(--kirmizi)">Danışmanı sil</button>
        </div>
      </div>`).join('') : '<p style="color:var(--metin-soluk)">Henüz danışman eklemediniz.</p>';
  }
  let fotoBekleyen = null;
  $('#danisman-ekle').addEventListener('click', () => {
    (ayarlar.danismanlar = ayarlar.danismanlar || []).push({ id: yeniId(), ad: '', unvan: 'Gayrimenkul Danışmanı', telefon: '', whatsapp: true, foto: '' });
    kirli = true; danismanCiz(); $('#danisman-liste .danisman-satir:last-child [data-d=ad]').focus();
  });
  $('#danisman-liste').addEventListener('input', (e) => {
    const s = e.target.closest('.danisman-satir'); if (!s || !e.target.dataset.d) return;
    const d = ayarlar.danismanlar[Number(s.dataset.n)];
    d[e.target.dataset.d] = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    kirli = true;
  });
  $('#danisman-liste').addEventListener('click', async (e) => {
    const s = e.target.closest('.danisman-satir'); if (!s) return;
    const n = Number(s.dataset.n), d = ayarlar.danismanlar[n];
    if (e.target.closest('[data-d-foto]')) { fotoBekleyen = n; $('#danisman-foto-dosya').value = ''; $('#danisman-foto-dosya').click(); }
    else if (e.target.closest('[data-d-foto-sil]')) { d.foto = ''; kirli = true; danismanCiz(); }
    else if (e.target.closest('[data-d-sil]')) {
      const kullanan = ilanlar.filter((i) => i.danisman_id === d.id).length;
      if (!(await onayla('Danışman silinsin mi?', `${d.ad || 'Bu danışman'} listeden kaldırılacak.${kullanan ? ` ${kullanan} ilanda bu danışman seçili; o ilanlarda firma bilgileri görünecek.` : ''} Kaydetmeyi unutmayın.`, 'Evet, Sil'))) return;
      ayarlar.danismanlar.splice(n, 1); kirli = true; danismanCiz();
    }
  });
  $('#danisman-foto-dosya').addEventListener('change', async (e) => {
    const dosya = e.target.files[0]; if (!dosya || fotoBekleyen === null) return;
    const d = ayarlar.danismanlar[fotoBekleyen];
    try {
      const blob = await kareFoto(dosya, 400);
      const yol = `danisman/${d.id}-${Date.now()}.webp`;
      const { error } = await db.storage.from(BUCKET).upload(yol, blob, { contentType: blob.type, cacheControl: '31536000', upsert: false });
      if (error) throw error;
      d.foto = db.storage.from(BUCKET).getPublicUrl(yol).data.publicUrl; kirli = true; danismanCiz();
      BE.bildirim('Fotoğraf yüklendi. "Ayarları Kaydet"e basmayı unutmayın.');
    } catch (err) { console.error(err); BE.bildirim('Fotoğraf yüklenemedi: ' + hataMetni(err), 'hata'); }
  });
  async function kareFoto(dosya, n) {
    let k;
    try { k = await createImageBitmap(dosya, { imageOrientation: 'from-image' }); }
    catch { k = await new Promise((coz, red) => { const im = new Image(); im.onload = () => coz(im); im.onerror = red; im.src = URL.createObjectURL(dosya); }); }
    const kenar = Math.min(k.width, k.height), sx = (k.width - kenar) / 2, sy = Math.max(0, (k.height - kenar) / 3);
    const c = document.createElement('canvas'); c.width = c.height = n;
    const x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, n, n); x.drawImage(k, sx, sy, kenar, kenar, 0, 0, n, n);
    return new Promise((coz) => c.toBlob((b) => coz(b), 'image/webp', 0.85));
  }

  function ayarFormu() {
    ayarlar = kopya(ayarKayitli);
    $$('[data-a]', af).forEach((x) => { x.value = ayarlar[x.dataset.a] ?? ''; });
    $$('[data-s]', af).forEach((x) => { x.value = (ayarlar.sosyal || {})[x.dataset.s] || ''; });
    $('#ayar-ilceler').value = (ayarlar.ilceler || []).join(', ');
    saatCiz(); listeCiz('neden_biz'); listeCiz('hizmetler'); danismanCiz();
    $('#ayar-durum').textContent = '';
    kirli = false;
  }
  af.addEventListener('submit', async (e) => {
    e.preventDefault();
    $$('[data-a]', af).forEach((x) => { ayarlar[x.dataset.a] = x.hasAttribute('data-sayi') || x.type === 'number' ? (x.value === '' ? '' : Number(x.value)) : x.value.trim(); });
    ayarlar.sosyal = {}; $$('[data-s]', af).forEach((x) => { ayarlar.sosyal[x.dataset.s] = x.value.trim(); });
    ayarlar.ilceler = $('#ayar-ilceler').value.split(',').map((x) => x.trim()).filter(Boolean);
    ayarlar.neden_biz = (ayarlar.neden_biz || []).filter((x) => x.baslik.trim());
    ayarlar.hizmetler = (ayarlar.hizmetler || []).filter((x) => x.baslik.trim());
    if ((ayarlar.danismanlar || []).some((d) => !String(d.ad || '').trim())) { $('#ayar-durum').innerHTML = '<span style="color:var(--kirmizi);font-weight:700">Danışmanlardan birinin adı boş. Adını yazın veya o danışmanı silin.</span>'; return; }
    const btn = $('button[type=submit]', af); btn.disabled = true; btn.textContent = 'Kaydediliyor…';
    const { data, error } = await db.from('site_ayarlari').update({ veri: ayarlar, updated_at: new Date().toISOString() }).eq('id', 1).select('id');
    btn.disabled = false; btn.textContent = 'Ayarları Kaydet';
    if (error || !data || !data.length) { $('#ayar-durum').innerHTML = `<span style="color:var(--kirmizi);font-weight:700">Kaydedilemedi: ${esc(error ? hataMetni(error) : 'Ayar satırı bulunamadı, SQL kurulum dosyasını çalıştırın.')}</span>`; return; }
    kirli = false; ayarKayitli = kopya(ayarlar);
    $('#ilce-listesi').innerHTML = ayarlar.ilceler.map((i) => `<option>${esc(i)}</option>`).join('');
    $('#ayar-durum').textContent = 'Kaydedildi ✓ Sitede hemen görünür (sayfayı yenileyin).';
    BE.bildirim('Ayarlar kaydedildi'); listeCiz('neden_biz'); listeCiz('hizmetler'); danismanCiz();
  });

  basla();
})();
