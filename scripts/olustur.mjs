/* ==========================================================
   BİZİM EMLAK - ARAMA MOTORU SAYFALARI ÜRETİCİ
   ----------------------------------------------------------
   GitHub Actions tarafından otomatik çalıştırılır (.github/workflows/site-olustur.yml).
   Supabase'teki yayındaki ilanları okuyup şunları üretir:
     - ilan-<no>-<baslik>.html  : her ilan için Google'ın okuyabileceği sayfa
     - osmaniye-satilik-daire.html vb. : arama sayfaları
     - sitemap.xml
   Bu dosyaları elle düzenlemeyin; her çalışmada yeniden üretilir.
   ========================================================== */
import { writeFileSync, readdirSync, unlinkSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const KOK = join(dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://bizimemlak.biz';
const SUPABASE_URL = 'https://zcfdiskphrmwdxqnexio.supabase.co';
const SUPABASE_KEY = 'sb_publishable_085SzLY-pef-AHq6-qnBbQ_9MKLb2Mb';
const SURUM = 'v=19';

/* ---------- Arama sayfaları ---------- */
const SAYFALAR = [
  {
    dosya: 'osmaniye-satilik-daire', tip: 'Satılık', kategoriler: ['Daire'],
    baslik: 'Osmaniye Satılık Daire İlanları', kisa: 'Osmaniye satılık daire',
    giris: 'Osmaniye Merkez ve ilçelerinde satılık daire mi arıyorsunuz? Bizim Emlak olarak 26 yıldır Osmaniye\'de daire alım satımında aracılık yapıyoruz. 1+1\'den 4+1\'e kadar, asansörlü, site içinde veya krediye uygun satılık daireleri aşağıda bulabilirsiniz.',
    sss: [
      ['Osmaniye\'de satılık daire fiyatları ne kadar?', 'Fiyatlar mahalleye, bina yaşına, metrekareye ve katına göre değişir. Güncel ilanlarımızdaki fiyatları yukarıda görebilir, aradığınız özelliklere uygun daire için bizi arayabilirsiniz.'],
      ['Krediye uygun satılık daire var mı?', 'İlan listesinde "Krediye uygun" işaretli daireler konut kredisine uygun olarak ilan edilmiştir. Kredi koşulları için bankanıza danışın.'],
      ['Daireyi görmeye nasıl gidebilirim?', 'İlan sayfasındaki telefon veya WhatsApp butonuyla bize ulaşın, size uygun saatte gösterim ayarlayalım.']
    ]
  },
  {
    dosya: 'osmaniye-kiralik-daire', tip: 'Kiralık', kategoriler: ['Daire'],
    baslik: 'Osmaniye Kiralık Daire İlanları', kisa: 'Osmaniye kiralık daire',
    giris: 'Osmaniye\'de kiralık daire arayanlar için eşyalı ve eşyasız, öğrenciye ve aileye uygun güncel kiralık daire ilanlarımız aşağıda. Kira sözleşmesinden teslime kadar tüm süreçte yanınızdayız.',
    sss: [
      ['Osmaniye\'de kiralık daire bulmak ne kadar sürer?', 'Aradığınız özellikleri bize bildirdiğinizde uygun daireleri hemen gösterebiliriz. Yeni ilanlar düzenli olarak eklenir.'],
      ['Eşyalı kiralık daire var mı?', 'Evet. İlanlarda "Eşyalı" bilgisi yer alır; ilanlar sayfasındaki filtreyle sadece eşyalı daireleri görebilirsiniz.'],
      ['Depozito ne kadar olur?', 'Konutlarda depozito yasal olarak en fazla üç aylık kira bedeli kadar olabilir. Tutar ev sahibiyle anlaşmaya göre belirlenir.']
    ]
  },
  {
    dosya: 'osmaniye-satilik-ev', tip: 'Satılık', kategoriler: ['Daire', 'Müstakil Ev', 'Villa'],
    baslik: 'Osmaniye Satılık Ev İlanları', kisa: 'Osmaniye satılık ev',
    giris: 'Osmaniye\'de satılık ev arıyorsanız doğru yerdesiniz. Daire, bahçeli müstakil ev ve villa seçeneklerimizi bir arada aşağıda görebilirsiniz. Bütçenize ve ihtiyacınıza uygun evi birlikte bulalım.',
    sss: [
      ['Osmaniye\'de müstakil ev bulunur mu?', 'Evet, Merkez ve ilçelerde bahçeli müstakil ev ilanlarımız bulunuyor. Yeni gelen ilanlar için bizi arayabilirsiniz.'],
      ['Ev alırken hangi belgeleri kontrol etmeliyim?', 'Tapu durumu, iskan, ipotek/haciz kaydı ve DASK poliçesi kontrol edilmelidir. Emlak Rehberi sayfamızda ayrıntılı kontrol listesi var.'],
      ['Evimi size satılık olarak verebilir miyim?', 'Elbette. İletişim sayfasındaki "Mülkünüzü Bize Verin" formunu doldurun, ücretsiz değerleme için sizi arayalım.']
    ]
  },
  {
    dosya: 'osmaniye-kiralik-ev', tip: 'Kiralık', kategoriler: ['Daire', 'Müstakil Ev', 'Villa'],
    baslik: 'Osmaniye Kiralık Ev İlanları', kisa: 'Osmaniye kiralık ev',
    giris: 'Osmaniye\'de kiralık ev, daire ve müstakil ev ilanlarımız aşağıda. Ailenize, bütçenize ve iş yerinize uygun kiralık evi bulmanız için yardımcı oluyoruz.',
    sss: [
      ['Kiralık ev için hangi belgeler gerekir?', 'Genellikle kimlik ve gelir bilgisi yeterlidir. Ev sahibi kefil isteyebilir; ayrıntıları ilan özelinde konuşuruz.'],
      ['Kira artışı ne kadar olabilir?', 'Konut kiralarında yıllık artış yasal olarak bir önceki kira yılının 12 aylık TÜFE ortalamasını geçemez.'],
      ['Evi görmeden kiralayabilir miyim?', 'Mutlaka yerinde görmenizi öneririz. Gösterim için bizi aramanız yeterli.']
    ]
  },
  {
    dosya: 'osmaniye-satilik-villa', tip: 'Satılık', kategoriler: ['Villa'],
    baslik: 'Osmaniye Satılık Villa İlanları', kisa: 'Osmaniye satılık villa',
    giris: 'Osmaniye\'de bahçeli, havuzlu ve site içinde satılık villa ilanlarımızı aşağıda bulabilirsiniz. Geniş yaşam alanı arayan aileler için seçenekleri birlikte değerlendirelim.',
    sss: [
      ['Site içinde villa var mı?', 'İlanlarda "Site içinde" bilgisi yer alır. Güvenlikli site içindeki villalar için bizi arayabilirsiniz.'],
      ['Villa krediyle alınabilir mi?', 'Kat mülkiyetli ve iskanlı villalar genellikle konut kredisine uygundur. İlanlarda "Krediye uygun" bilgisini görebilirsiniz.'],
      ['Villa gösterimi nasıl yapılır?', 'Telefon veya WhatsApp ile randevu alarak villayı yerinde görebilirsiniz.']
    ]
  },
  {
    dosya: 'osmaniye-satilik-arsa', tip: 'Satılık', kategoriler: ['Arsa'],
    baslik: 'Osmaniye Satılık Arsa İlanları', kisa: 'Osmaniye satılık arsa',
    giris: 'Osmaniye ve ilçelerinde konut imarlı, ticari ve yatırımlık satılık arsa ilanlarımız aşağıda. İmar durumu ve tapu bilgileri konusunda size detaylı bilgi veriyoruz.',
    sss: [
      ['Arsa alırken nelere dikkat edilmeli?', 'İmar durumu, emsal (KAKS), yola cephe, hisseli veya müstakil tapu ve altyapı durumu mutlaka kontrol edilmelidir.'],
      ['Hisseli arsa almak riskli mi?', 'Hisseli tapuda kullanım ve satış için diğer hissedarların durumu önemlidir. Almadan önce bize danışın.'],
      ['Arsamı satmak istiyorum, ne yapmalıyım?', '"Mülkünüzü Bize Verin" formunu doldurun veya bizi arayın; arsanızı değerlendirip alıcılara ulaştıralım.']
    ]
  },
  {
    dosya: 'osmaniye-kiralik-dukkan', tip: 'Kiralık', kategoriler: ['Dükkan', 'Ofis'],
    baslik: 'Osmaniye Kiralık Dükkan ve Ofis İlanları', kisa: 'Osmaniye kiralık dükkan',
    giris: 'Osmaniye\'de işyeri açmak isteyenler için cadde üzeri kiralık dükkan ve kiralık ofis ilanlarımız aşağıda. Konum seçiminden kira sözleşmesine kadar yardımcı oluyoruz.',
    sss: [
      ['Cadde üzerinde kiralık dükkan var mı?', 'İlanlarımızda konum ve özellik bilgileri yer alır. İşinize uygun konum için bizi arayın.'],
      ['İşyeri kirasında stopaj var mı?', 'İşyeri kiralarında stopaj ve vergi yükümlülükleri bulunabilir; ayrıntılar için mali müşavirinize danışmanızı öneririz.'],
      ['Ofis olarak kullanılabilecek yerler var mı?', 'Evet, ofis kategorisindeki ilanlarımız da bu sayfada listelenir.']
    ]
  }
];

/* ---------- Ek arama sayfaları (ilçe, özellik, oda) ----------
   Çekirdek 7 sayfa her zaman yayında. Ek sayfalar yalnızca o aramaya uyan
   aktif ilan varsa Google'a açılır (sitemap + index); ilan yoksa "noindex"
   ile üretilir, böylece boş/ince sayfa cezası riski olmaz. */
const ILCELER = [
  ['Merkez', 'osmaniye-merkez', 'Osmaniye Merkez'], ['Kadirli', 'kadirli', 'Kadirli'], ['Düziçi', 'duzici', 'Düziçi'],
  ['Bahçe', 'bahce', 'Bahçe'], ['Toprakkale', 'toprakkale', 'Toprakkale'], ['Hasanbeyli', 'hasanbeyli', 'Hasanbeyli'], ['Sumbas', 'sumbas', 'Sumbas']
];
const KONUT = ['Daire', 'Müstakil Ev', 'Villa'];
const ilceSss = (ad) => [
  [`${ad}'de ilan bulamazsam ne yapmalıyım?`, `Aradığınız özellikleri "Aradığım Evi Bildir" formuyla bize iletin; ${ad} için uygun ilan geldiğinde sizi arayalım.`],
  ['Gösterim için ücret alıyor musunuz?', 'Hayır, ilan gösterimi ücretsizdir. Telefon veya WhatsApp ile randevu alabilirsiniz.'],
  [`${ad}'deki mülkümü size verebilir miyim?`, 'Elbette. "Mülkünüzü Bize Verin" formunu doldurun veya bizi arayın; ücretsiz değerleme yapalım.']
];
const ILCE_TURLERI = [
  ['satilik-ev', 'Satılık', KONUT, 'Satılık Ev', (ad) => `${ad}'de satılık ev mi arıyorsunuz? ${ad} bölgesindeki satılık daire, müstakil ev ve villa ilanlarımız aşağıda. Bizim Emlak 26 yıldır Osmaniye ve ilçelerinde güvenilir alım satım hizmeti veriyor.`],
  ['kiralik-ev', 'Kiralık', KONUT, 'Kiralık Ev', (ad) => `${ad}'de kiralık ev ve kiralık daire ilanlarımız aşağıda. Eşyalı veya eşyasız, ailenize ve bütçenize uygun kiralık evi ${ad} bölgesinde birlikte bulalım.`],
  ['satilik-arsa', 'Satılık', ['Arsa'], 'Satılık Arsa', (ad) => `${ad}'de konut imarlı, ticari veya yatırımlık satılık arsa arayanlar için güncel ilanlarımız aşağıda. İmar ve tapu durumu hakkında ayrıntılı bilgi veriyoruz.`]
];
for (const [ilce, on, ad] of ILCELER) {
  for (const [son, tip, kat, tur, giris] of ILCE_TURLERI) {
    SAYFALAR.push({
      dosya: `${on}-${son}`, tip, kategoriler: kat, ilce, ek: true,
      filtre: (i) => i.tip === tip && kat.includes(i.kategori) && (i.ilce || 'Merkez') === ilce,
      baslik: `${ad} ${tur} İlanları`, kisa: `${ad} ${tur.toLocaleLowerCase('tr-TR')}`,
      giris: giris(ad), sss: ilceSss(ad)
    });
  }
}
const odaSayisi = (i) => String(i.oda_sayisi || '').replace(/\s/g, '');
for (const oda of ['1+1', '2+1', '3+1', '4+1']) {
  for (const [tip, son] of [['Satılık', 'satilik'], ['Kiralık', 'kiralik']]) {
    SAYFALAR.push({
      dosya: `osmaniye-${son}-${oda.replace('+', '-')}-daire`, tip, kategoriler: ['Daire'], oda, ek: true,
      filtre: (i) => i.tip === tip && i.kategori === 'Daire' && odaSayisi(i) === oda,
      baslik: `Osmaniye ${tip} ${oda} Daire İlanları`, kisa: `Osmaniye ${tip.toLocaleLowerCase('tr-TR')} ${oda} daire`,
      giris: `Osmaniye'de ${tip.toLocaleLowerCase('tr-TR')} ${oda} daire arayanlar için güncel ilanlarımız aşağıda. Mahalle, kat, bina yaşı ve fiyat bilgilerini her ilanda bulabilirsiniz.`,
      sss: [
        [`${oda} daire kaç metrekare olur?`, `Osmaniye'de ${oda} daireler binaya göre değişmekle birlikte genellikle ${{ '1+1': '55-75', '2+1': '85-110', '3+1': '115-150', '4+1': '150-200' }[oda]} m² arasındadır. Her ilanda brüt ve net metrekare yazılıdır.`],
        ['Gösterim için ne yapmalıyım?', 'İlan sayfasındaki telefon veya WhatsApp butonuyla bize ulaşın, size uygun saatte gösterim ayarlayalım.'],
        ['Aradığım daire listede yoksa?', '"Aradığım Evi Bildir" formunu doldurun; uygun daire geldiğinde sizi haber verelim.']
      ]
    });
  }
}
SAYFALAR.push(
  {
    dosya: 'osmaniye-sifir-daire', tip: 'Satılık', kategoriler: ['Daire'], ek: true,
    filtre: (i) => i.tip === 'Satılık' && i.kategori === 'Daire' && Number(i.bina_yasi) === 0 && i.bina_yasi !== null && i.bina_yasi !== '',
    baslik: 'Osmaniye Sıfır Satılık Daire İlanları', kisa: 'Osmaniye sıfır daire',
    giris: 'Osmaniye\'de yeni yapılmış, hiç oturulmamış sıfır satılık daire ilanlarımız aşağıda. Yeni binaların iskan, deprem yönetmeliği ve tapu durumu hakkında size ayrıntılı bilgi veriyoruz.',
    sss: [
      ['Sıfır daire alırken nelere dikkat etmeliyim?', 'İskanın alınmış olması, kat mülkiyetli tapu, müteahhidin güvenilirliği ve yapı denetim raporları kontrol edilmelidir.'],
      ['Sıfır daire krediye uygun mu?', 'İskanı alınmış ve kat mülkiyetine geçmiş sıfır daireler genellikle konut kredisine uygundur.'],
      ['Sıfır dairede KDV var mı?', 'Müteahhitten ilk satışta KDV uygulanır; oran metrekare ve bölgeye göre değişir. Ayrıntılar için mali müşavirinize danışın.']
    ]
  },
  {
    dosya: 'osmaniye-esyali-kiralik-daire', tip: 'Kiralık', kategoriler: ['Daire'], ek: true,
    filtre: (i) => i.tip === 'Kiralık' && KONUT.includes(i.kategori) && i.esyali,
    baslik: 'Osmaniye Eşyalı Kiralık Daire İlanları', kisa: 'Osmaniye eşyalı kiralık daire',
    giris: 'Osmaniye\'de eşyalı kiralık daire ve ev arayan öğrenciler, çalışanlar ve aileler için güncel ilanlarımız aşağıda. Taşınma derdi olmadan hemen oturabileceğiniz evleri birlikte bulalım.',
    sss: [
      ['Eşyalı evde hangi eşyalar olur?', 'Genellikle temel mobilya ve beyaz eşya bulunur; ayrıntılar her ilanda ve gösterimde netleşir.'],
      ['Öğrenciye uygun eşyalı daire var mı?', 'Osmaniye Korkut Ata Üniversitesi\'ne yakın eşyalı daireler için bizi arayabilirsiniz.'],
      ['Eşyalı evde depozito farklı mı?', 'Depozito yasal olarak en fazla üç aylık kira kadar olabilir; eşyalı evlerde teslim tutanağı ayrıca önemlidir.']
    ]
  },
  {
    dosya: 'osmaniye-krediye-uygun-satilik-daire', tip: 'Satılık', kategoriler: ['Daire'], ek: true,
    filtre: (i) => i.tip === 'Satılık' && KONUT.includes(i.kategori) && i.krediye_uygun,
    baslik: 'Osmaniye Krediye Uygun Satılık Daire İlanları', kisa: 'Osmaniye krediye uygun daire',
    giris: 'Osmaniye\'de konut kredisiyle alınabilecek satılık daire ve ev ilanlarımız aşağıda. Kredi tutarı, faiz ve onay tamamen bankanın değerlendirmesine bağlıdır.',
    sss: [
      ['Krediye uygun ne demek?', 'Evin iskanlı ve kat mülkiyetli olması gibi bankaların aradığı şartları taşıdığı anlamına gelir. Kesin onay bankanın ekspertizine bağlıdır.'],
      ['Kredi onayını kim verir?', 'Kredi onayını ve tutarını yalnızca banka verir; ekspertiz değerine ve sizin gelir durumunuza göre belirlenir.'],
      ['Peşinat ne kadar olmalı?', 'Bankalar evin ekspertiz değerinin bir kısmını kredilendirir; kalan kısmı peşinat olarak ödenir. Güncel oranları bankanıza sorun.']
    ]
  },
  {
    dosya: 'osmaniye-site-icinde-satilik-daire', tip: 'Satılık', kategoriler: ['Daire'], ek: true,
    filtre: (i) => i.tip === 'Satılık' && KONUT.includes(i.kategori) && i.site_icinde,
    baslik: 'Osmaniye Site İçinde Satılık Daire İlanları', kisa: 'Osmaniye site içinde daire',
    giris: 'Osmaniye\'de güvenlikli, otoparklı ve sosyal alanlı site içinde satılık daire ilanlarımız aşağıda. Ailenizle huzurlu bir yaşam için site seçeneklerini birlikte değerlendirelim.',
    sss: [
      ['Site aidatları ne kadar?', 'Aidat sitenin imkanlarına göre değişir; her ilanda aidat bilgisi yer alır.'],
      ['Sitede güvenlik var mı?', 'Sitelerin güvenlik, otopark ve sosyal alan bilgilerini gösterim sırasında ayrıntılı anlatıyoruz.'],
      ['Site içinde kiralık daire de var mı?', 'Kiralık ilanlarımız için Osmaniye Kiralık Daire sayfamıza bakabilirsiniz.']
    ]
  },
  {
    dosya: 'osmaniye-satilik-mustakil-ev', tip: 'Satılık', kategoriler: ['Müstakil Ev'], ek: true,
    baslik: 'Osmaniye Satılık Müstakil Ev İlanları', kisa: 'Osmaniye satılık müstakil ev',
    giris: 'Osmaniye ve ilçelerinde bahçeli satılık müstakil ev ilanlarımız aşağıda. Toprağa basan, bahçeli bir ev arayanlar için seçenekleri birlikte değerlendirelim.',
    sss: [
      ['Müstakil ev alırken nelere dikkat edilmeli?', 'Tapu türü (kat mülkiyeti, arsa tapusu), iskan, imar durumu ve yapının durumu kontrol edilmelidir.'],
      ['Müstakil ev krediyle alınabilir mi?', 'İskanlı ve tapusu uygun müstakil evler konut kredisiyle alınabilir.'],
      ['Köy evi ilanınız var mı?', 'İlçe ve köylerdeki müstakil ev talepleriniz için bizi arayabilirsiniz.']
    ]
  },
  {
    dosya: 'osmaniye-satilik-dukkan', tip: 'Satılık', kategoriler: ['Dükkan', 'Ofis'], ek: true,
    baslik: 'Osmaniye Satılık Dükkan ve Ofis İlanları', kisa: 'Osmaniye satılık dükkan',
    giris: 'Osmaniye\'de yatırım veya kendi işiniz için satılık dükkan ve satılık ofis ilanlarımız aşağıda. Kira getirisi ve konum değerlendirmesinde size yardımcı oluyoruz.',
    sss: [
      ['Kiracılı dükkan satışı yapıyor musunuz?', 'Evet, kiracılı dükkanlarda mevcut kira ve sözleşme bilgilerini ilan özelinde paylaşıyoruz.'],
      ['Dükkan yatırımında nelere bakılmalı?', 'Cadde konumu, yaya trafiği, cephe genişliği, tapu türü ve kira getirisi en önemli kriterlerdir.'],
      ['Ofis olarak kullanılabilecek yerler var mı?', 'Evet, ofis kategorisindeki satılık ilanlarımız da bu sayfada listelenir.']
    ]
  },
  {
    dosya: 'osmaniye-kiralik-arsa-tarla', tip: 'Kiralık', kategoriler: ['Arsa', 'Tarla'], ek: true,
    baslik: 'Osmaniye Kiralık Arsa ve Tarla İlanları', kisa: 'Osmaniye kiralık arsa',
    giris: 'Osmaniye\'de kiralık arsa ve tarla ilanlarımız aşağıda. Tarım, depolama veya işyeri amaçlı kiralama için uygun yerleri birlikte bulalım.',
    sss: [
      ['Tarla kiralama nasıl yapılır?', 'Tapu sahibiyle yazılı kira sözleşmesi yapılır; süre, bedel ve kullanım şekli sözleşmede belirtilir.'],
      ['Arsamı kiraya verebilir miyim?', 'Elbette. "Mülkünüzü Bize Verin" formunu doldurun veya bizi arayın.'],
      ['Kira bedeli nasıl belirlenir?', 'Konum, büyüklük, yola yakınlık ve su/elektrik durumuna göre belirlenir.']
    ]
  }
);

/* ---------- Yardımcılar ---------- */
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const slug = (t) => String(t || '').toLocaleLowerCase('tr-TR')
  .replace(/ç/g, 'c').replace(/ğ/g, 'g').replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ş/g, 's').replace(/ü/g, 'u').replace(/â/g, 'a').replace(/î/g, 'i').replace(/û/g, 'u')
  .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 70).replace(/-+$/g, '');
const ilanUrl = (i) => `ilan-${i.id}-${slug(i.baslik)}.html`;
const sayiFmt = new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 });
const tl = (n) => (n === null || n === undefined || n === '') ? 'Fiyat Sorunuz' : sayiFmt.format(Math.round(Number(n))) + ' TL';
const fiyat = (i) => tl(i.fiyat) + (i.tip === 'Kiralık' && i.fiyat ? ' / ay' : '');
const konum = (i) => [i.mahalle, i.ilce, i.il].filter(Boolean).join(', ');
const kisa = (s, n) => { s = String(s || '').replace(/\s+/g, ' ').trim(); return s.length > n ? s.slice(0, n - 1).replace(/\s+\S*$/, '') + '…' : s; };
const bugun = new Date().toISOString().slice(0, 10);
const aktifMi = (i) => !i.durum || i.durum === 'Aktif';
const DURUM_YAZI = { 'Satıldı': 'Bu ilan satılmıştır', 'Kiralandı': 'Bu ilan kiralanmıştır', 'Pasif': 'Bu ilan şu an aktif değil' };

const BAS = (o) => `<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(o.title)}</title>
<meta name="description" content="${esc(o.description)}">
<link rel="canonical" href="${SITE}/${o.yol}">${o.noindex ? '\n<meta name="robots" content="noindex,follow">' : ''}
<meta property="og:type" content="website">
<meta property="og:url" content="${SITE}/${o.yol}">
<meta property="og:title" content="${esc(o.title)}">
<meta property="og:description" content="${esc(o.description)}">
<meta property="og:image" content="${esc(o.resim || SITE + '/images/paylas.jpg')}">${o.resim ? '' : '\n<meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">'}
<meta property="og:site_name" content="Bizim Emlak"><meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#111111">
<link rel="icon" type="image/png" sizes="96x96" href="/images/favicon.png">
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="apple-touch-icon" href="/images/apple-touch-icon.png">
<link rel="stylesheet" href="css/style.css?${SURUM}">
${(o.ld || []).map((x) => `<script type="application/ld+json">${JSON.stringify(x).replace(/</g, '\\u003c')}</script>`).join('\n')}
</head>
<body>
<!-- Bu sayfa scripts/olustur.mjs ile otomatik üretilmiştir. Elle düzenlemeyin. -->
<header id="site-ust"></header>
`;
const SON = (betikler) => `
<footer id="site-alt"></footer>

<script src="vendor/supabase.js?v=11"></script>
<script src="js/config.js?${SURUM}"></script>
<script src="js/common.js?${SURUM}"></script>
${betikler}
</body>
</html>
`;

const kart = (i) => {
  const r = (i.resimler || [])[0];
  const bilgi = [i.oda_sayisi, (i.net_m2 || i.brut_m2) && `${i.net_m2 || i.brut_m2} m²`, i.kategori].filter(Boolean).map(esc).join(' · ');
  return `
      <article class="kart">
        <div class="kart-resim">${r ? `<img src="${esc(r)}" alt="${esc(i.baslik)}" loading="lazy">` : '<div class="resim-yok"><img src="images/logo.png" alt=""><span>Fotoğraf yakında</span></div>'}
          <div class="kart-rozetler"><span class="rozet ${i.tip === 'Kiralık' ? 'rozet-kiralik' : 'rozet-satilik'}">${esc(i.tip)}</span></div></div>
        <div class="kart-govde">
          <div class="kart-fiyat">${esc(fiyat(i))}</div>
          <h3 class="kart-baslik"><a href="${ilanUrl(i)}">${esc(i.baslik)}</a></h3>
          <div class="kart-konum">${esc(konum(i))}</div>
          <div class="kart-bilgi"><span>${bilgi}</span></div>
        </div>
      </article>`;
};

/* ---------- İlan sayfası ---------- */
function ilanSayfasi(i, ayar) {
  const resim = (i.resimler || [])[0];
  const satir = [
    ['İlan No', '#' + i.id], ['Yetki Belge No', i.yetki_no], ['İlan Tipi', i.tip], ['Kategori', i.kategori], ['Fiyat', fiyat(i)],
    ['Konum', konum(i)], ['Brüt m²', i.brut_m2], ['Net m²', i.net_m2], ['Oda Sayısı', i.oda_sayisi],
    ['Banyo Sayısı', i.banyo_sayisi], ['Bina Yaşı', i.bina_yasi], ['Bulunduğu Kat', i.bulundugu_kat],
    ['Kat Sayısı', i.kat_sayisi], ['Isıtma', i.isitma], ['Tapu Durumu', i.tapu_durumu], ['İmar Durumu', i.imar_durumu],
    ['Aidat', i.aidat ? tl(i.aidat) : ''], ['Eşyalı', i.esyali ? 'Evet' : ''], ['Krediye Uygun', i.krediye_uygun ? 'Evet' : ''],
    ['Balkon', i.balkon ? 'Var' : ''], ['Asansör', i.asansor ? 'Var' : ''], ['Otopark', i.otopark ? 'Var' : ''], ['Site İçinde', i.site_icinde ? 'Evet' : '']
  ].filter(([, v]) => v !== null && v !== undefined && v !== '');
  const aciklama = kisa(`${i.tip} ${i.kategori} - ${konum(i)} - ${fiyat(i)}. ${i.aciklama || ''}`, 155);
  const ld = [{
    '@context': 'https://schema.org', '@type': 'RealEstateListing', name: i.baslik, url: `${SITE}/${ilanUrl(i)}`,
    description: kisa(i.aciklama || aciklama, 300), datePosted: (i.created_at || '').slice(0, 10) || undefined,
    image: (i.resimler || []).slice(0, 5),
    offers: i.fiyat ? { '@type': 'Offer', price: Number(i.fiyat), priceCurrency: 'TRY', availability: aktifMi(i) ? 'https://schema.org/InStock' : 'https://schema.org/SoldOut',
      businessFunction: i.tip === 'Kiralık' ? 'http://purl.org/goodrelations/v1#LeaseOut' : 'http://purl.org/goodrelations/v1#Sell' } : undefined,
    address: { '@type': 'PostalAddress', addressLocality: i.ilce || 'Merkez', addressRegion: i.il || 'Osmaniye', addressCountry: 'TR' }
  }, {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Ana Sayfa', item: SITE + '/' },
      { '@type': 'ListItem', position: 2, name: 'İlanlar', item: SITE + '/ilanlar.html' },
      { '@type': 'ListItem', position: 3, name: i.baslik, item: `${SITE}/${ilanUrl(i)}` }]
  }];
  return BAS({ title: `${i.baslik} | ${i.tip} ${i.kategori} ${i.ilce || ''} Osmaniye | Bizim Emlak`.replace(/\s+/g, ' '), description: aciklama, yol: ilanUrl(i), resim: resim, ld }) + `
<main>
  <section class="bolum" style="padding-top:28px">
    <div class="kap" id="ilan-alan">
      <div class="yol" style="color:var(--metin-soluk)"><a href="./">Ana Sayfa</a> / <a href="ilanlar.html">İlanlar</a> / ${esc(i.kategori)} / #${i.id}</div>
      ${aktifMi(i) ? '' : `<div class="durum-bandi"><div><strong>${esc(DURUM_YAZI[i.durum] || 'Bu ilan aktif değil')}</strong><p>Benzer ilanlar için bizi arayın.</p></div></div>`}
      <h1 style="font-size:clamp(1.4rem,3vw,2rem)">${esc(i.baslik)}</h1>
      <p class="kart-konum">${esc(konum(i))}</p>
      <p class="detay-fiyat">${esc(fiyat(i))}</p>
      <p class="ilan-no">İlan No: #${i.id} · Yetki Belge No: ${esc(i.yetki_no)}</p>
      ${resim ? `<img src="${esc(resim)}" alt="${esc(i.baslik)}" style="max-width:100%;border-radius:10px">` : ''}
      <div class="kart-blok"><h2>İlan Bilgileri</h2><dl class="bilgi-tablo">${satir.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl></div>
      ${i.aciklama ? `<div class="kart-blok"><h2>Açıklama</h2><div class="aciklama-metin">${esc(i.aciklama)}</div></div>` : ''}
      ${(i.ozellikler || []).length ? `<div class="kart-blok"><h2>Özellikler</h2><ul class="ozellik-liste">${i.ozellikler.map((o) => `<li>${esc(o)}</li>`).join('')}</ul></div>` : ''}
      ${/^https:\/\//.test(i.video_url || '') ? `<p><a href="${esc(i.video_url)}" target="_blank" rel="noopener">İlan videosunu izleyin</a></p>` : ''}
      ${/^https:\/\//.test(i.sanal_tur_url || '') ? `<p><a href="${esc(i.sanal_tur_url)}" target="_blank" rel="noopener">360° sanal tur</a></p>` : ''}
      ${(() => { const d = (ayar.danismanlar || []).find((x) => x.id && x.id === i.danisman_id); const t = (d && d.telefon) || ayar.telefon || ''; const tl = (n) => 'tel:' + String(n).replace(/[^\d+]/g, '').replace(/^0/, '+90');
        return `<p>${d ? `İlan danışmanı: <strong>${esc(d.ad)}</strong>${d.unvan ? ' (' + esc(d.unvan) + ')' : ''}<br>` : ''}Bilgi ve gösterim için: <a href="${tl(t)}">${esc(t)}</a></p>`; })()}
    </div>
  </section>
  <section class="bolum bolum-gri gizli" id="benzer-bolum">
    <div class="kap">
      <div class="ust-satir"><h2>Benzer İlanlar</h2><a href="ilanlar.html" class="btn btn-cizgi">Tüm İlanlar</a></div>
      <div class="ilan-izgara" id="benzerler"></div>
    </div>
  </section>
</main>` + SON(`<script>window.BE_ILAN_ID = ${Number(i.id)};</script>
<script src="js/hesap.js?${SURUM}"></script>
<script src="js/ilan.js?${SURUM}"></script>`);
}

/* ---------- Arama sayfası ---------- */
const eslesen = (s, ilanlar) => ilanlar.filter((i) => aktifMi(i) && (s.filtre ? s.filtre(i) : (i.tip === s.tip && s.kategoriler.includes(i.kategori))));
const acikMi = (s, ilanlar) => !s.ek || eslesen(s, ilanlar).length > 0;
function aramaSayfasi(s, ilanlar, tumSayfalar) {
  const l = eslesen(s, ilanlar);
  const filtre = `ilanlar.html?tip=${encodeURIComponent(s.tip)}&kategori=${encodeURIComponent(s.kategoriler.join(','))}${s.ilce ? '&ilce=' + encodeURIComponent(s.ilce) : ''}${s.oda ? '&oda=' + encodeURIComponent(s.oda) : ''}`;
  const kapali = s.ek && !l.length;
  const ilceler = [...new Set(l.map((i) => i.ilce).filter(Boolean))];
  const fiyatlar = l.map((i) => Number(i.fiyat)).filter((x) => x > 0);
  const ozet = l.length
    ? `Şu anda ${l.length} adet ${s.kisa.replace('Osmaniye ', '')} ilanımız bulunuyor${ilceler.length ? ` (${ilceler.join(', ')})` : ''}.${fiyatlar.length > 1 ? ` Fiyatlar ${tl(Math.min(...fiyatlar))} ile ${tl(Math.max(...fiyatlar))} arasında değişiyor.` : ''}`
    : 'Bu kategoride şu an yayında ilanımız yok. Aradığınız özellikleri bize bildirin, uygun ilan geldiğinde sizi haber verelim.';
  const ld = [{
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: s.sss.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } }))
  }, {
    '@context': 'https://schema.org', '@type': 'ItemList', name: s.baslik,
    itemListElement: l.slice(0, 30).map((i, n) => ({ '@type': 'ListItem', position: n + 1, url: `${SITE}/${ilanUrl(i)}`, name: i.baslik }))
  }, {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Ana Sayfa', item: SITE + '/' },
      { '@type': 'ListItem', position: 2, name: s.baslik, item: `${SITE}/${s.dosya}.html` }]
  }];
  return BAS({ title: `${s.baslik} | Bizim Emlak`, description: kisa(`${s.baslik}: ${s.giris}`, 155), yol: `${s.dosya}.html`, ld, noindex: kapali }) + `
<main>
  <section class="sayfa-bas">
    <div class="kap">
      <div class="yol"><a href="./">Ana Sayfa</a> / ${esc(s.baslik)}</div>
      <h1>${esc(s.baslik)}</h1>
      <p>${esc(ozet)}</p>
    </div>
  </section>
  <section class="bolum" style="padding-top:36px">
    <div class="kap">
      <div class="seo-metin"><p>${esc(s.giris)}</p></div>
      <div class="ust-satir" style="margin-top:24px"><h2>Güncel İlanlar (${l.length})</h2><a class="btn btn-kirmizi" href="${filtre}">Filtreleyerek Ara</a></div>
      <div class="ilan-izgara">${l.length ? l.map(kart).join('') : `<div class="bos-durum" style="grid-column:1/-1"><h3>Bu kategoride şu an ilan yok</h3><p>Aradığınız evi sizin için bulalım.</p><a class="btn btn-kirmizi" href="iletisim.html#ev-talebi">Aradığım Evi Bildir</a></div>`}</div>
    </div>
  </section>
  <section class="bolum bolum-gri">
    <div class="kap seo-metin">
      <h2>Sık Sorulan Sorular</h2>
      <dl class="terim">${s.sss.map(([q, a]) => `<dt>${esc(q)}</dt><dd>${esc(a)}</dd>`).join('')}</dl>
      <h2>Diğer Aramalar</h2>
      <div class="etiket-linkler">${tumSayfalar.filter((x) => x.dosya !== s.dosya && acikMi(x, ilanlar)).map((x) => `<a class="cip" href="${x.dosya}.html">${esc(x.baslik.replace(' İlanları', ''))}</a>`).join('')}</div>
    </div>
  </section>
  <section class="bolum">
    <div class="kap"><div class="cagri">
      <div><h2>Aradığınızı bulamadınız mı?</h2><p>Bize ne aradığınızı söyleyin, uygun ilanları size ulaştıralım.</p></div>
      <div class="butonlar"><a class="btn btn-kirmizi" href="iletisim.html#ev-talebi">Aradığım Evi Bildir</a></div>
    </div></div>
  </section>
</main>` + SON('<script>BE.sayfaBaslat("ilanlar.html");</script>');
}

/* ---------- Ana akış ---------- */
async function getir(yol) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${yol}`, { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } });
  if (!r.ok) throw new Error(`${yol}: ${r.status} ${await r.text()}`);
  return r.json();
}

export async function calistir(veri) {
  // Yetki belge numarası girilmemiş ilanlar yayınlanmaz (yasal zorunluluk)
  const ilanlar = (veri?.ilanlar ?? await getir('ilanlar?select=*&yayinda=eq.true&order=created_at.desc'))
    .filter((i) => String(i.yetki_no || '').trim());
  const ayarSatir = veri?.ayar ?? (await getir('site_ayarlari?select=veri&id=eq.1'))[0];
  const ayar = Object.assign({ telefon: '0328 812 00 00' }, ayarSatir?.veri || {});

  // Eski ilan sayfalarını temizle
  const yeniler = new Set(ilanlar.map(ilanUrl));
  for (const f of readdirSync(KOK)) {
    if (/^ilan-\d+-.*\.html$/.test(f) && !yeniler.has(f)) unlinkSync(join(KOK, f));
  }
  for (const i of ilanlar) writeFileSync(join(KOK, ilanUrl(i)), ilanSayfasi(i, ayar));
  for (const f of readdirSync(KOK)) {
    if (/^(osmaniye|kadirli|duzici|bahce|toprakkale|hasanbeyli|sumbas)-.*\.html$/.test(f) && !SAYFALAR.some((s) => `${s.dosya}.html` === f)) unlinkSync(join(KOK, f));
  }
  for (const s of SAYFALAR) writeFileSync(join(KOK, `${s.dosya}.html`), aramaSayfasi(s, ilanlar, SAYFALAR));

  const sabit = [['', '1.0', 'daily'], ['ilanlar.html', '0.9', 'daily'], ...SAYFALAR.filter((s) => acikMi(s, ilanlar)).map((s) => [`${s.dosya}.html`, s.ek ? '0.8' : '0.9', 'daily']),
    ['iletisim.html', '0.7', 'monthly'], ['hakkimizda.html', '0.6', 'monthly'], ['rehber.html', '0.6', 'monthly'], ['kvkk.html', '0.2', 'yearly']];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sabit.map(([u, p, c]) => `  <url><loc>${SITE}/${u}</loc><lastmod>${bugun}</lastmod><changefreq>${c}</changefreq><priority>${p}</priority></url>`).join('\n')}
${ilanlar.filter(aktifMi).map((i) => `  <url><loc>${SITE}/${ilanUrl(i)}</loc><lastmod>${(i.updated_at || i.created_at || bugun).slice(0, 10)}</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>`).join('\n')}
</urlset>
`;
  writeFileSync(join(KOK, 'sitemap.xml'), xml);
  console.log(`${ilanlar.length} ilan sayfası (${ilanlar.filter(aktifMi).length} aktif), ${SAYFALAR.length} arama sayfası (${SAYFALAR.filter((s) => acikMi(s, ilanlar)).length} Google'a açık) ve sitemap.xml üretildi.`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  calistir().catch((e) => { console.error(e); process.exit(1); });
}
