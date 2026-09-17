import React, { useState, useEffect } from 'react';
import { Plus, Search, Pencil, Trash2, ExternalLink, Star } from 'lucide-react';
import { api } from '../utils/api';
import { DANH_MUC, thieuThongTin } from '../utils/sanPham';
import AdminSanPhamForm from './AdminSanPhamForm';

// #/san-pham = danh sách, #/san-pham/loc/<danh mục> = danh sách lọc sẵn (từ Tổng quan),
// #/san-pham/moi = thêm, #/san-pham/<id> = sửa
export default function AdminSanPham({ onBao, diToi, con }) {
  const [ds, setDs] = useState(null);
  const [tim, setTim] = useState('');
  const [danhMuc, setDanhMuc] = useState(() => (con[0] === 'loc' ? decodeURIComponent(con[1] || '') : ''));

  const taiDs = () => api.getProducts().then(setDs).catch((err) => onBao(err.message, 'error'));

  useEffect(() => { taiDs(); }, []);

  const xoa = async (p) => {
    if (!window.confirm(`Xóa sản phẩm "${p.name}"? Khách sẽ không xem được nữa.`)) return;
    try {
      await api.deleteProduct(p.id);
      onBao('Đã xóa sản phẩm');
      taiDs();
    } catch (err) {
      onBao(err.message, 'error');
    }
  };

  const [idSua] = con;
  if (idSua && idSua !== 'loc') {
    if (!ds) return <p className="adm-trong">Đang tải…</p>;
    const sp = idSua === 'moi' ? null : ds.find((p) => p.id === idSua);
    if (idSua !== 'moi' && !sp) {
      return <p className="adm-trong">Không tìm thấy sản phẩm. <a href="#/san-pham">Về danh sách</a></p>;
    }
    return (
      <AdminSanPhamForm
        key={idSua}
        sp={sp}
        ds={ds}
        onBao={onBao}
        onXong={() => { taiDs(); diToi('san-pham'); }}
        onHuy={() => diToi('san-pham')}
      />
    );
  }

  const q = tim.trim().toLowerCase();
  const hien = (ds || []).filter((p) =>
    (!danhMuc || p.category === danhMuc) && (!q || `${p.name} ${p.brand}`.toLowerCase().includes(q))
  );

  return (
    <>
      <div className="qt-tieude">
        <div>
          <h1>Sản phẩm</h1>
          <p>{ds ? `${ds.length} sản phẩm đang trưng bày` : 'Đang tải…'}</p>
        </div>
        <button className="btn-primary" onClick={() => diToi('san-pham', 'moi')}>
          <Plus size={16} /> Thêm sản phẩm
        </button>
      </div>

      <div className="qt-khung">
        <div className="qt-loc">
          <label className="qt-tim">
            <Search size={16} />
            <input value={tim} onChange={(e) => setTim(e.target.value)} placeholder="Tìm theo tên, thương hiệu…" />
          </label>
          <select className="qt-input qt-loc-dm" value={danhMuc} onChange={(e) => setDanhMuc(e.target.value)}>
            <option value="">Tất cả danh mục</option>
            {DANH_MUC.map((d) => <option key={d}>{d}</option>)}
          </select>
        </div>

        {!ds ? (
          <p className="adm-trong">Đang tải…</p>
        ) : hien.length === 0 ? (
          <p className="adm-trong">Không có sản phẩm phù hợp</p>
        ) : (
          <ul className="qt-ds">
            {hien.map((p) => {
              const thieu = thieuThongTin(p);
              return (
                <li key={p.id} className="qt-ds-dong">
                  <img src={p.image} alt="" />
                  <div className="qt-ds-tt">
                    <strong>{p.name}</strong>
                    <span>{p.category} · {p.brand}</span>
                    <div className="qt-ds-nhan">
                      {p.featured && <span className="qt-nhan vang"><Star size={11} /> Nổi bật</span>}
                      {thieu.length
                        ? <span className="qt-nhan cam">Thiếu: {thieu.join(', ')}</span>
                        : <span className="qt-nhan xanh">Đủ thông tin</span>}
                    </div>
                  </div>
                  <div className="qt-ds-nut">
                    <a href={`/#product=${p.id}`} target="_blank" rel="noreferrer" title="Xem trên web">
                      <ExternalLink size={16} />
                    </a>
                    <button onClick={() => diToi('san-pham', p.id)} title="Sửa"><Pencil size={16} /></button>
                    <button onClick={() => xoa(p)} title="Xóa" className="xoa"><Trash2 size={16} /></button>
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
