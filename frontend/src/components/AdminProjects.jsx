import React, { useState } from 'react';
import { Plus, Pencil, Trash2, X, Upload } from 'lucide-react';
import { api } from '../utils/api';

const RONG = {
  title: '', address: '', customerType: '',
  startDate: new Date().toISOString().slice(0, 10),
  durationDays: '', status: 'Hoàn thành', image: ''
};

export default function AdminProjects({ projects, onReload, onBao }) {
  const [dangSua, setDangSua] = useState(null);   // null = đóng form
  const [form, setForm] = useState(RONG);
  const [dangLuu, setDangLuu] = useState(false);

  const moThem = () => { setForm(RONG); setDangSua('moi'); };
  const moSua = (p) => {
    setForm({ ...RONG, ...p, durationDays: p.durationDays || '' });
    setDangSua(p.id);
  };

  const chonAnh = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 6 * 1024 * 1024) {
      onBao('Ảnh quá nặng (tối đa 6MB). Nén bớt rồi tải lại.', 'error');
      return;
    }
    const doc = new FileReader();
    doc.onload = async () => {
      try {
        const { url } = await api.uploadImage(doc.result, file.name.replace(/\.[^.]+$/, ''));
        setForm((f) => ({ ...f, image: url }));
        onBao('Đã tải ảnh lên');
      } catch (err) {
        onBao(err.message, 'error');
      }
    };
    doc.readAsDataURL(file);
  };

  const luu = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.address.trim()) {
      onBao('Cần điền tên công trình và địa chỉ', 'error');
      return;
    }
    setDangLuu(true);
    try {
      const payload = { ...form, durationDays: Number(form.durationDays) || 0 };
      if (dangSua === 'moi') await api.createProject(payload);
      else await api.updateProject(dangSua, payload);
      onBao(dangSua === 'moi' ? 'Đã thêm công trình' : 'Đã lưu thay đổi');
      setDangSua(null);
      onReload();
    } catch (err) {
      onBao(err.message, 'error');
    } finally {
      setDangLuu(false);
    }
  };

  const xoa = async (p) => {
    if (!window.confirm(`Xóa công trình "${p.title}"?`)) return;
    try {
      await api.deleteProject(p.id);
      onBao('Đã xóa công trình');
      onReload();
    } catch (err) {
      onBao(err.message, 'error');
    }
  };

  return (
    <div>
      <button className="adm-btn-them" onClick={moThem}>
        <Plus size={16} /> Thêm công trình
      </button>

      {dangSua && (
        <form className="adm-form" onSubmit={luu}>
          <div className="adm-form-head">
            <strong>{dangSua === 'moi' ? 'Công trình mới' : 'Sửa công trình'}</strong>
            <button type="button" onClick={() => setDangSua(null)} aria-label="Đóng"><X size={18} /></button>
          </div>

          <div className="adm-grid">
            <label>
              <span>Lắp đặt gì *</span>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Lắp đặt hệ thống 8 camera Hikvision" />
            </label>
            <label>
              <span>Địa chỉ *</span>
              <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="120 Thái Hà, Đống Đa, Hà Nội" />
            </label>
            <label>
              <span>Loại công trình</span>
              <input value={form.customerType} onChange={(e) => setForm({ ...form, customerType: e.target.value })}
                placeholder="Nhà phố 4 tầng" />
            </label>
            <label>
              <span>Ngày khởi công</span>
              <input type="date" value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
            </label>
            <label>
              <span>Thi công (ngày)</span>
              <input type="number" min="0" value={form.durationDays}
                onChange={(e) => setForm({ ...form, durationDays: e.target.value })} placeholder="2" />
            </label>
            <label>
              <span>Trạng thái</span>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option>Hoàn thành</option>
                <option>Đang thi công</option>
              </select>
            </label>
          </div>

          <div className="adm-anh">
            <div className="adm-anh-xem">
              {form.image
                ? <img src={form.image} alt="Ảnh công trình" />
                : <span>Chưa có ảnh</span>}
            </div>
            <div>
              <label className="adm-btn-tai">
                <Upload size={15} /> Chọn ảnh
                <input type="file" accept="image/*" onChange={chonAnh} hidden />
              </label>
              <input className="adm-anh-duongdan" value={form.image}
                onChange={(e) => setForm({ ...form, image: e.target.value })}
                placeholder="hoặc dán đường dẫn: /images/cat_tools.jpg" />
            </div>
          </div>

          <div className="adm-form-foot">
            <button type="button" onClick={() => setDangSua(null)}>Hủy</button>
            <button type="submit" className="btn-primary" disabled={dangLuu}>
              {dangLuu ? 'Đang lưu…' : 'Lưu'}
            </button>
          </div>
        </form>
      )}

      <div className="adm-bang">
        {projects.length === 0 ? (
          <p className="adm-trong">Chưa có công trình nào</p>
        ) : projects.map((p) => (
          <div key={p.id} className="adm-dong">
            <img src={p.image} alt="" />
            <div className="adm-dong-tt">
              <strong>{p.title}</strong>
              <span>{p.address}</span>
              <span className="adm-dong-phu">
                {p.startDate?.split('-').reverse().join('/')}
                {p.customerType ? ` · ${p.customerType}` : ''}
              </span>
            </div>
            <div className="adm-dong-nut">
              <button onClick={() => moSua(p)} title="Sửa"><Pencil size={15} /></button>
              <button onClick={() => xoa(p)} title="Xóa" className="xoa"><Trash2 size={15} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
