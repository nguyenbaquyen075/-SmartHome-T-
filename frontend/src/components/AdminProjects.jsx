import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Upload, ArrowLeft, MapPin, CalendarDays } from 'lucide-react';
import { api, ngayVN } from '../utils/api';
import { Truong, Khoi, ThanhLuu } from './AdminForm';

const RONG = {
  title: '', address: '', customerType: '', description: '',
  startDate: new Date().toLocaleDateString('sv-SE'),   // "2026-09-15" theo giờ máy
  durationDays: '', status: 'Hoàn thành', image: ''
};

// #/cong-trinh = danh sách, #/cong-trinh/moi = thêm, #/cong-trinh/<id> = sửa
export default function AdminProjects({ onBao, diToi, con }) {
  const [ds, setDs] = useState(null);

  const taiDs = () => api.getProjects().then(setDs).catch((err) => onBao(err.message, 'error'));

  useEffect(() => { taiDs(); }, []);

  const xoa = async (p) => {
    if (!window.confirm(`Xóa công trình "${p.title}"?`)) return;
    try {
      await api.deleteProject(p.id);
      onBao('Đã xóa công trình');
      taiDs();
    } catch (err) {
      onBao(err.message, 'error');
    }
  };

  const [idSua] = con;
  if (idSua) {
    if (!ds) return <p className="adm-trong">Đang tải…</p>;
    const ct = idSua === 'moi' ? null : ds.find((p) => p.id === idSua);
    if (idSua !== 'moi' && !ct) {
      return <p className="adm-trong">Không tìm thấy công trình. <a href="#/cong-trinh">Về danh sách</a></p>;
    }
    return (
      <FormCongTrinh
        key={idSua}
        ct={ct}
        onBao={onBao}
        onXong={() => { taiDs(); diToi('cong-trinh'); }}
        onHuy={() => diToi('cong-trinh')}
      />
    );
  }

  return (
    <>
      <div className="qt-tieude">
        <div>
          <h1>Nhật ký thi công</h1>
          <p>{ds ? `${ds.length} công trình, mới nhất xếp trước` : 'Đang tải…'}</p>
        </div>
        <button className="btn-primary" onClick={() => diToi('cong-trinh', 'moi')}>
          <Plus size={16} /> Thêm công trình
        </button>
      </div>

      <div className="qt-khung">
        {!ds ? (
          <p className="adm-trong">Đang tải…</p>
        ) : ds.length === 0 ? (
          <p className="adm-trong">Chưa có công trình nào</p>
        ) : (
          <ul className="qt-ds">
            {ds.map((p) => (
              <li key={p.id} className="qt-ds-dong">
                <img src={p.image} alt="" className="phu" />
                <div className="qt-ds-tt">
                  <strong>{p.title}</strong>
                  <span><MapPin size={12} /> {p.address}</span>
                  <span>
                    <CalendarDays size={12} /> {ngayVN(p.startDate)}
                    {p.durationDays ? ` · ${p.durationDays} ngày` : ''}
                    {p.customerType ? ` · ${p.customerType}` : ''}
                  </span>
                  <div className="qt-ds-nhan">
                    <span className={`qt-nhan ${p.status === 'Hoàn thành' ? 'xanh' : 'cam'}`}>{p.status}</span>
                  </div>
                </div>
                <div className="qt-ds-nut">
                  <button onClick={() => diToi('cong-trinh', p.id)} title="Sửa"><Pencil size={16} /></button>
                  <button onClick={() => xoa(p)} title="Xóa" className="xoa"><Trash2 size={16} /></button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}

function FormCongTrinh({ ct, onBao, onXong, onHuy }) {
  const [f, setF] = useState(() => ({ ...RONG, ...(ct || {}), durationDays: ct?.durationDays || '' }));
  const [loi, setLoi] = useState({});
  const [dangLuu, setDangLuu] = useState(false);
  const [dangTaiAnh, setDangTaiAnh] = useState(false);

  const doi = (khoa) => (e) => setF((cu) => ({ ...cu, [khoa]: e.target.value }));

  const chonAnh = (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (file.size > 6 * 1024 * 1024) {
      onBao('Ảnh quá nặng (tối đa 6MB). Nén bớt rồi tải lại.', 'error');
      return;
    }
    setDangTaiAnh(true);
    const doc = new FileReader();
    doc.onload = async () => {
      try {
        const { url } = await api.uploadImage(doc.result, file.name.replace(/\.[^.]+$/, ''));
        setF((cu) => ({ ...cu, image: url }));
      } catch (err) {
        onBao(err.message, 'error');
      } finally {
        setDangTaiAnh(false);
      }
    };
    doc.readAsDataURL(file);
  };

  const luu = async (e) => {
    e.preventDefault();
    const thieu = { title: !f.title.trim(), address: !f.address.trim() };
    setLoi(thieu);
    if (thieu.title || thieu.address) {
      onBao('Cần điền tên công trình và địa chỉ', 'error');
      return;
    }
    setDangLuu(true);
    try {
      const duLieu = { ...f, durationDays: Number(f.durationDays) || 0 };
      if (ct) await api.updateProject(ct.id, duLieu);
      else await api.createProject(duLieu);
      onBao(ct ? 'Đã lưu thay đổi' : 'Đã thêm công trình');
      onXong();
    } catch (err) {
      onBao(err.message, 'error');
    } finally {
      setDangLuu(false);
    }
  };

  return (
    <form onSubmit={luu} noValidate>
      <div className="qt-tieude">
        <div>
          <button type="button" className="qt-quaylai" onClick={onHuy}><ArrowLeft size={15} /> Quay lại danh sách công trình</button>
          <h1>{ct ? 'Sửa công trình' : 'Thêm công trình'}</h1>
          <p>Hiện ở mục Nhật ký thi công trên trang chủ</p>
        </div>
      </div>

      <Khoi so={1} tieuDe="Thông tin công trình" moTa="Hiện trên thẻ công trình">
        <div className="qt-hang">
          <Truong nhan="Lắp đặt gì" batBuoc rong loi={loi.title && !f.title.trim() && 'Cần nhập tên công trình'}>
            <input className="qt-input" value={f.title} onChange={doi('title')} placeholder="VD: Lắp đặt hệ thống 8 camera Hikvision" />
          </Truong>
          <Truong nhan="Địa chỉ" batBuoc rong loi={loi.address && !f.address.trim() && 'Cần nhập địa chỉ'}>
            <input className="qt-input" value={f.address} onChange={doi('address')} placeholder="VD: 120 Thái Hà, Đống Đa, Hà Nội" />
          </Truong>
          <Truong nhan="Loại công trình">
            <input className="qt-input" value={f.customerType} onChange={doi('customerType')} placeholder="VD: Nhà phố 4 tầng" />
          </Truong>
          <Truong nhan="Ngày khởi công">
            <input className="qt-input" type="date" value={f.startDate} onChange={doi('startDate')} />
          </Truong>
          <Truong nhan="Thi công (ngày)">
            <input className="qt-input" type="number" min="0" value={f.durationDays} onChange={doi('durationDays')} placeholder="2" />
          </Truong>
          <Truong nhan="Trạng thái">
            <select className="qt-input" value={f.status} onChange={doi('status')}>
              <option>Hoàn thành</option>
              <option>Đang thi công</option>
            </select>
          </Truong>
        </div>
      </Khoi>

      <Khoi so={2} tieuDe="Ảnh công trình" moTa="Ảnh chụp thực tế, nên nén dưới 400KB">
        <div className="qt-anh-cong-trinh">
          <div className="qt-anh-xem">
            {f.image ? <img src={f.image} alt="Ảnh công trình" /> : <span>Chưa có ảnh</span>}
          </div>
          <div className="qt-anh-cong-trinh-nut">
            <label className="qt-nut">
              <Upload size={15} /> {dangTaiAnh ? 'Đang tải…' : f.image ? 'Đổi ảnh' : 'Chọn ảnh'}
              <input type="file" accept="image/png,image/jpeg,image/webp" onChange={chonAnh} hidden disabled={dangTaiAnh} />
            </label>
            <input className="qt-input" value={f.image} onChange={doi('image')} placeholder="hoặc dán đường dẫn: /images/cong-trinh/anh.jpg" />
          </div>
        </div>
      </Khoi>

      <Khoi so={3} tieuDe="Nội dung thi công" moTa="Hiện khi khách bấm vào công trình">
        <textarea
          className="qt-input"
          rows={5}
          value={f.description}
          onChange={doi('description')}
          placeholder="Mô tả công việc đã làm: khảo sát, đi dây, lắp đặt, bàn giao…"
        />
      </Khoi>

      <ThanhLuu dangLuu={dangLuu} onHuy={onHuy} nhan={ct ? 'Lưu thay đổi' : 'Thêm công trình'} ghiChu={f.title || 'Công trình mới'} />
    </form>
  );
}
