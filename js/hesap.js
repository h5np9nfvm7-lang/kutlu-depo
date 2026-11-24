/* Hesaplama formülleri (ilan detayı ve hesaplamalar sayfası kullanır) */
window.BE_HESAP = {
  // Aylık eşit taksitli kredi
  kredi(anapara, aylikFaizYuzde, vadeAy) {
    const P = Number(anapara) || 0, n = Math.max(1, Math.round(Number(vadeAy) || 0)), r = (Number(aylikFaizYuzde) || 0) / 100;
    const taksit = r === 0 ? P / n : (P * r) / (1 - Math.pow(1 + r, -n));
    const plan = []; let kalan = P;
    for (let i = 1; i <= n; i++) {
      const faiz = kalan * r; const anaparaPay = taksit - faiz; kalan = Math.max(0, kalan - anaparaPay);
      plan.push({ ay: i, taksit, faiz, anapara: anaparaPay, kalan });
    }
    return { taksit, toplam: taksit * n, toplamFaiz: taksit * n - P, plan };
  },
  // Sayı kutularında "4.250.000" yazımını destekle
  oku(deger) {
    if (typeof deger === 'number') return deger;
    const s = String(deger || '').trim().replace(/\s/g, '');
    if (!s) return 0;
    // 4.250.000,50 → 4250000.50
    return Number(s.replace(/\./g, '').replace(',', '.')) || 0;
  },
  // Kutuya yazarken binlik ayırıcı ekle
  bicimle(input) {
    input.addEventListener('input', () => {
      const ham = input.value.replace(/[^\d]/g, '');
      input.value = ham ? Number(ham).toLocaleString('tr-TR') : '';
    });
  }
};
