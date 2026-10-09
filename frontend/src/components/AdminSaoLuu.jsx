import React, { useState, useEffect, useRef } from 'react';
import { Download, Upload, Undo2, ShieldCheck } from 'lucide-react';
import { api } from '../utils/api';

// Sao lưu toàn bộ dữ liệu ra một file .zip, và khôi phục lại từ file đó khi cần.
const luc = (iso) => (iso ? new Date(iso).toLocaleString('vi-VN') : null);

export default function AdminSaoLuu({ onBao }) {
  const [tt, setTt] = useState(null);
  const [dang, setDang] = useState('');
  const oFile = useRef(null);

  const tai = () => api.saoLuuThongTin().then(setTt).catch(() => {});
  useEffect(() => { tai(); }, []);

  const saoLuu = async () => {
    setDang('luu');
    try {
      const url = URL.createObjectURL(await api.saoLuuToanBo());
      const a = document.createElement('a');
      a.href = url;
      a.download = `sao-luu-smarthometd-${new Date().toISOString().slice(0, 10)}.zip`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 60000);
      onBao('Đã tải bản sao lưu');
      tai();
    } catch (err) { onBao(err.message, 'error'); }
    setDang('');
  };

  const khoiPhuc = async (e) => {
    const file = e.target.files[0];
    e.target.value = '';
    if (!file) return;
    if (!window.confirm(`Khôi phục từ "${file.name}"?\\n\\nDữ liệu hiện tại sẽ được thay bằng dữ liệu trong file. Hệ thống tự giữ bản hiện tại để bạn bấm "Hoàn tác" nếu cần.`)) return;
    setDang('khoiPhuc');
    try {
      const kq = await api.khoiPhucSaoLuu(file);
      onBao(`Đã khôi phục ${kq.khoiPhuc.length} mục, ${kq.soTep} tệp. Đang tải lại…`);
      setTimeout(() => window.location.reload(), 1500);
    } catch (err) { onBao(err.message, 'error'); setDang(''); }
  };

  const hoanTac = async () => {
    if (!window.confirm(`Quay về dữ liệu lúc ${luc(tt.banTruoc)} (trước lần khôi phục gần nhất)?`)) return;
    setDang('hoanTac');
    try {
      await api.hoanTacKhoiPhuc();
      onBao('Đã hoàn tác. Đang tải lại…');
      setTimeout(() => window.location.reload(), 1500);
    } catch (err) { onBao(err.message, 'error'); setDang(''); }
  };

  return (
    <section className="qt-khung">
      <div className="qt-khoi-dau">
        <span className="qt-khoi-so"><ShieldCheck size={16} /></span>
        <div className="qt-khoi-chu">
          <h2>Sao lưu và khôi phục</h2>
          <p>Giữ một bản dữ liệu ở nơi an toàn, phòng khi có sự cố</p>
        </div>
      </div>

      <p className="qt-sl-dong">
        Lần sao lưu gần nhất: <b>{tt ? luc(tt.lanCuoi) || 'chưa có' : '…'}</b>
      </p>
      <div className="qt-sl-nut">
        <button className="btn-primary" onClick={saoLuu} disabled={Boolean(dang)}>
          <Download size={16} /> {dang === 'luu' ? 'Đang tạo…' : 'Tải bản sao lưu'}
        </button>
        <input ref={oFile} type="file" accept=".zip,application/zip" hidden onChange={khoiPhuc} />
        <button className="btn-secondary" onClick={() => oFile.current?.click()} disabled={Boolean(dang)}>
          <Upload size={16} /> {dang === 'khoiPhuc' ? 'Đang khôi phục…' : 'Khôi phục từ file'}
        </button>
        {tt?.banTruoc && (
          <button className="btn-secondary" onClick={hoanTac} disabled={Boolean(dang)} title={`Quay về dữ liệu lúc ${luc(tt.banTruoc)}`}>
            <Undo2 size={16} /> Hoàn tác khôi phục
          </button>
        )}
      </div>
      <ul className="qt-sl-ghi">
        <li>File gồm: sản phẩm, danh mục, công trình, cài đặt, hậu trường, ghi chú, chấm công và các tệp đính kèm.</li>
        <li>Không gồm tài khoản đăng nhập. Ảnh, video lưu ở kho ảnh bên ngoài chỉ giữ đường dẫn.</li>
        <li>Cất file ở nơi khác (Google Drive, USB), đừng chỉ để trên máy này.</li>
      </ul>
    </section>
  );
}
