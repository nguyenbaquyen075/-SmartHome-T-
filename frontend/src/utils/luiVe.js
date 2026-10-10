import { useEffect, useRef } from 'react';

// Nút Back của điện thoại/trình duyệt đóng màn đang mở (form, ảnh phóng to, ghi chú...)
// thay vì văng ra khỏi trang. Mở màn = thêm 1 mục lịch sử; Back = đóng màn đó.
// Đóng bằng nút trên màn hình thì tự lùi mục lịch sử đã thêm, không để thừa.
let boQua = false;   // đang tự lùi lịch sử (do đóng bằng nút): các màn khác đừng coi là bấm Back
window.addEventListener('popstate', () => setTimeout(() => { boQua = false; }, 0));

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
    };
    day();
    const khiBack = () => { if (!boQua && daDay) { daDay = false; dongRef.current(); } };
    window.addEventListener('popstate', khiBack);
    return () => {
      clearTimeout(hen);
      window.removeEventListener('popstate', khiBack);
      if (daDay && window.history.state?.qtLop) { boQua = true; window.history.back(); }
    };
  }, [dangMo]);
}
