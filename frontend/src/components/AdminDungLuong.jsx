import React, { useState, useEffect } from 'react';
import { HardDrive } from 'lucide-react';
import { api } from '../utils/api';

// Dung lượng kho đang dùng: thanh đo, và số ảnh khách hàng đã lưu.
const mb = (b) => (b >= 1073741824 ? `${(b / 1073741824).toFixed(2)} GB` : `${(b / 1048576).toFixed(b < 10485760 ? 1 : 0)} MB`);
const TEN = { khach: 'Ảnh khách hàng (trong kho dữ liệu)', ghichu: 'Tệp đính kèm ghi chú', khac: 'Ảnh khác' };

export default function AdminDungLuong() {
  const [d, setD] = useState(null);
  useEffect(() => { api.dungLuong().then(setD).catch(() => {}); }, []);
  if (!d) return null;

  const phanTram = d.gioiHan ? Math.min(100, (d.tong / d.gioiHan) * 100) : 0;
  const muc = phanTram >= 90 ? 'do' : phanTram >= 70 ? 'cam' : 'xanh';
  return (
    <section className="qt-khung">
      <div className="qt-khoi-dau">
        <span className="qt-khoi-so"><HardDrive size={16} /></span>
        <div className="qt-khoi-chu">
          <h2>Dung lượng</h2>
          <p>{d.cheDo === 'db' ? 'Kho dữ liệu trên mạng' : 'Dữ liệu trên máy này'}</p>
        </div>
      </div>

      <p className="qt-dl-so">
        Đã dùng <b>{mb(d.tong)}</b>{d.gioiHan ? <> / {mb(d.gioiHan)} <span className={`qt-dl-pt ${muc}`}>({phanTram.toFixed(phanTram < 10 ? 1 : 0)}%)</span></> : ''}
      </p>
      {d.gioiHan && <div className="qt-dl-thanh"><i className={muc} style={{ width: `${Math.max(2, phanTram)}%` }} /></div>}
      {phanTram >= 70 && <p className="qt-dl-canh">Kho sắp đầy. Hãy bật kho ảnh riêng hoặc xóa bớt ảnh cũ trước khi hết chỗ.</p>}

      <ul className="qt-dl-ds">
        {d.nhom.filter((n) => n.so > 0).map((n) => <li key={n.loai}><span>{TEN[n.loai]}</span><b>{n.so} · {mb(n.byte)}</b></li>)}
        {d.khoRieng.bat && <li><span>Ảnh khách hàng (kho ảnh riêng tư)</span><b>{d.khoRieng.soAnh} · {mb(d.khoRieng.byte)}</b></li>}
        <li><span>Tổng ảnh thiết bị đã ghi</span><b>{d.tongAnhKhach}</b></li>
      </ul>
      <p className="qt-dl-ghi">
        {d.khoRieng.bat
          ? 'Kho ảnh riêng đã bật: ảnh khách hàng mới được lưu ở đó, không chiếm kho dữ liệu.'
          : 'Kho ảnh riêng chưa bật: ảnh khách hàng đang lưu trong kho dữ liệu. Mỗi thiết bị tối đa 4 ảnh, ảnh tự thu nhỏ khi tải lên.'}
      </p>
    </section>
  );
}
