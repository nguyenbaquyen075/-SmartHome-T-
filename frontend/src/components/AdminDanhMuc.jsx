import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Check, X } from 'lucide-react';
import { api } from '../utils/api';
import { useDanhMuc, ICON_DANH_MUC, iconDanhMuc, lamMoiDanhMuc } from '../utils/danhMuc';

// Thêm / sửa tên + biểu tượng / xóa danh mục sản phẩm. Đổi tên thì sản phẩm trong danh mục đổi theo.
export default function AdminDanhMuc({ onBao }) {
  const ds = useDanhMuc();
  const [dem, setDem] = useState({});                 // tên danh mục -> số sản phẩm
  const [sua, setSua] = useState(null);               // null | { id?, ten, icon }
  const [dangLuu, setDangLuu] = useState(false);

  const demSanPham = () =>
    api.getProducts().then((sp) => {
      const d = {};
      sp.forEach((p) => { d[p.category] = (d[p.category] || 0) + 1; });
      setDem(d);
    }).catch(() => {});

  useEffect(() => { demSanPham(); }, []);

  const luu = async (e) => {
    e.preventDefault();
    if (!sua.ten.trim()) return onBao('Nhập tên danh mục', 'error');
    setDangLuu(true);
    try {
      if (sua.id) await api.suaDanhMuc(sua.id, sua); else await api.themDanhMuc(sua);
      await lamMoiDanhMuc();
      await demSanPham();
      onBao(sua.id ? 'Đã lưu danh mục' : 'Đã thêm danh mục');
      setSua(null);
    } catch (err) {
      onBao(err.message, 'error');
    } finally {
      setDangLuu(false);
    }
  };

  const xoa = async (d) => {
    if (!window.confirm(`Xóa danh mục "${d.ten}"?`)) return;
    try {
      await api.xoaDanhMuc(d.id);
      await lamMoiDanhMuc();
      onBao('Đã xóa danh mục');
    } catch (err) {
      onBao(err.message, 'error');   // còn sản phẩm thì server báo rõ số lượng
    }
  };

  return (
    <>
      <div className="qt-tieude">
        <div>
          <h1>Danh mục</h1>
          <p>{ds.length} danh mục, hiện ở trang chủ, menu và form thêm sản phẩm</p>
        </div>
        {!sua && (
          <button className="btn-primary" onClick={() => setSua({ ten: '', icon: 'package' })}>
            <Plus size={16} /> Thêm danh mục
          </button>
        )}
      </div>

      {sua && (
        <form className="qt-khung" onSubmit={luu}>
          <label className="qt-nhan-nhe">{sua.id ? 'Sửa danh mục' : 'Danh mục mới'}</label>
          <input
            className="qt-input"
            autoFocus
            value={sua.ten}
            maxLength={60}
            onChange={(e) => setSua({ ...sua, ten: e.target.value })}
            placeholder="Tên danh mục, VD: Thiết bị báo động"
          />
          <p className="qt-nhan-nhe" style={{ margin: '14px 0 6px' }}>Biểu tượng</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {Object.entries(ICON_DANH_MUC).map(([khoa, { ten, Icon }]) => (
              <button
                key={khoa}
                type="button"
                title={ten}
                aria-label={ten}
                aria-pressed={sua.icon === khoa}
                onClick={() => setSua({ ...sua, icon: khoa })}
                style={{
                  width: 42, height: 42, borderRadius: 10, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: sua.icon === khoa ? '2px solid #0066cc' : '1px solid #e2e8f0',
                  background: sua.icon === khoa ? '#eff6ff' : '#fff',
                  color: sua.icon === khoa ? '#0066cc' : '#64748b'
                }}
              >
                <Icon size={20} />
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
            <button className="btn-primary" type="submit" disabled={dangLuu}>
              <Check size={16} /> {dangLuu ? 'Đang lưu…' : 'Lưu'}
            </button>
            <button className="btn-secondary" type="button" onClick={() => setSua(null)}>
              <X size={16} /> Hủy
            </button>
          </div>
        </form>
      )}

      <div className="qt-khung">
        {ds.length === 0 ? (
          <p className="adm-trong">Chưa có danh mục nào</p>
        ) : (
          <ul className="qt-ds">
            {ds.map((d) => {
              const Icon = iconDanhMuc(d.icon);
              return (
                <li key={d.id} className="qt-ds-dong">
                  <span className="qt-menu-icon" style={{ width: 44, height: 44 }}><Icon size={20} /></span>
                  <div className="qt-ds-tt">
                    <strong>{d.ten}</strong>
                    <span>{dem[d.ten] || 0} sản phẩm</span>
                  </div>
                  <div className="qt-ds-nut">
                    <button onClick={() => setSua({ id: d.id, ten: d.ten, icon: d.icon })} title="Sửa"><Pencil size={16} /></button>
                    <button onClick={() => xoa(d)} title="Xóa" className="xoa"><Trash2 size={16} /></button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </>
  );
}
