import { useEffect, useRef } from 'react';

// Nút Back của điện thoại/trình duyệt đóng màn đang mở (form, ảnh phóng to, ghi chú...)
// thay vì văng ra khỏi trang. Mở màn = thêm 1 mục lịch sử; Back = đóng màn đó.
// Đóng bằng nút trên màn hình thì tự lùi mục lịch sử đã thêm, không để thừa.
let boQua = false;   // đang tự lùi lịch sử (do đóng bằng nút): các màn khác đừng coi là bấm Back
let soMo = 0;        // số màn đang mở
window.addEventListener('popstate', () => setTimeout(() => {
  boQua = false;
  // Màn đã đóng bằng cách chuyển trang (bấm mục menu...) để lại 1 mục lịch sử thừa: lùi qua nó
  if (window.history.state?.qtLop && soMo === 0) window.history.back();
}, 0));

// Chuyển trang quản trị (hash "#/...") an toàn khi đang mở menu/form/ảnh.
// Không được để link tự chuyển trang: khi màn đóng, nó gọi history.back() để dọn mục lịch sử của mình,
// mà lệnh lùi đó chạy SAU khi trình duyệt đã sang trang mới -> kéo ngược về trang cũ, bấm như không bấm.
// Ở đây ghi đè thẳng mục lịch sử của màn đang mở bằng trang mới: không còn gì để lùi, không tranh chấp.
export function chuyenTrang(duong) {
  const hash = '#' + duong.replace(/^#/, '');
  if (window.history.state?.qtLop) {
    window.history.replaceState(null, '', hash);
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  } else {
    window.location.hash = hash;
  }
}

// Bắt mọi lần bấm link "#/..." trong trang quản trị và chuyển qua chuyenTrang.
// Gắn 1 lần ở AdminApp nên link nào (menu, logo, nút về danh sách...) cũng an toàn, kể cả link thêm sau này.
export function useLinkQuanTri() {
  useEffect(() => {
    const khiBam = (e) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = e.target.closest?.('a[href^="#/"]');
      if (!a || a.target) return;
      e.preventDefault();
      chuyenTrang(a.getAttribute('href'));
    };
    document.addEventListener('click', khiBam, true);   // bắt trước React để chuyển trang trước khi màn kịp đóng
    return () => document.removeEventListener('click', khiBam, true);
  }, []);
}

export function useLuiVe(dangMo, dong) {
  const dongRef = useRef(dong);
  dongRef.current = dong;

  useEffect(() => {
    if (!dangMo) return undefined;
    let daDay = false;
    let hen;
    const day = () => {
      if (boQua) { hen = setTimeout(day, 10); return; }   // chờ lần tự lùi trước xong
      window.history.pushState({ ...window.history.state, qtLop: true }, '');
      daDay = true;
      soMo++;
    };
    day();
    const khiBack = () => { if (!boQua && daDay) { daDay = false; soMo--; dongRef.current(); } };
    window.addEventListener('popstate', khiBack);
    return () => {
      clearTimeout(hen);
      window.removeEventListener('popstate', khiBack);
      if (!daDay) return;
      soMo--;
      if (window.history.state?.qtLop) { boQua = true; window.history.back(); }
    };
  }, [dangMo]);
}
