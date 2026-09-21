import { useState, useEffect } from 'react';

// Giữ phần đang nhập ngay trong máy. Trình duyệt tự tải lại trang (hay gặp trên điện thoại
// khi chuyển sang app khác rồi quay lại), bấm nhầm nút back, mất mạng... cũng không mất công gõ.
const doc = (khoa) => {
  try { return JSON.parse(localStorage.getItem(khoa) || 'null'); } catch { return null; }
};
const xoa = (khoa) => { try { localStorage.removeItem(khoa); } catch { /* trình duyệt chặn */ } };

export const gioPhut = (luc) =>
  new Date(luc).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' });

// khoa: mỗi form một khóa riêng. taoGoc(): giá trị ban đầu của form.
export function useBanNhap(khoa, taoGoc) {
  const [goc] = useState(() => JSON.stringify(taoGoc()));
  const [cu] = useState(() => doc(khoa));                 // đọc 1 lần lúc mở form
  const [f, setF] = useState(() => cu?.f || JSON.parse(goc));
  const [daKhoiPhuc, setDaKhoiPhuc] = useState(Boolean(cu?.f));

  const coThayDoi = JSON.stringify(f) !== goc;

  // Gõ tới đâu ghi tạm tới đó (chờ 0,4 giây cho khỏi ghi liên tục)
  useEffect(() => {
    const hen = setTimeout(() => {
      if (!coThayDoi) return xoa(khoa);
      try { localStorage.setItem(khoa, JSON.stringify({ luc: Date.now(), f })); } catch { /* hết chỗ */ }
    }, 400);
    return () => clearTimeout(hen);
  }, [f, coThayDoi, khoa]);

  // Đang nhập dở mà đóng tab hay bấm tải lại thì trình duyệt hỏi lại cho chắc
  useEffect(() => {
    if (!coThayDoi) return;
    const canh = (e) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', canh);
    return () => window.removeEventListener('beforeunload', canh);
  }, [coThayDoi]);

  return {
    f,
    setF,
    coThayDoi,
    daKhoiPhuc,
    luc: cu?.luc,
    // Bỏ bản nháp, quay về giá trị ban đầu
    boBanNhap: () => { xoa(khoa); setF(JSON.parse(goc)); setDaKhoiPhuc(false); },
    // Lưu xong thì xóa bản nháp đi
    xongBanNhap: () => xoa(khoa),
    // Bấm Hủy / Quay lại: hỏi lại nếu đang nhập dở
    huyBanNhap: (onHuy) => () => {
      if (coThayDoi && !window.confirm('Bỏ phần đang nhập dở?')) return;
      xoa(khoa);
      onHuy();
    }
  };
}
