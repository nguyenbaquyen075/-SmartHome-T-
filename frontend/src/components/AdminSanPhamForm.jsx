import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Trash2, Upload, Plus, Link } from 'lucide-react';
import { api } from '../utils/api';
import { nenAnhFile, coFile } from '../utils/anh';
import { DANH_MUC, DON_VI, doiNhan } from '../utils/sanPham';
import { Truong, Khoi, ThanhLuu, DanhSachDong } from './AdminForm';
import { useBanNhap, gioPhut } from '../utils/banNhap';

const TOI_DA_ANH = 6 * 1024 * 1024;    // giới hạn của /api/upload (tính sau khi nén)
const TOI_DA_CHON = 40 * 1024 * 1024;  // ảnh to hơn mức này thì máy nén cũng ì


// Đổi dữ liệu sản phẩm sang dạng để sửa trên form
const thongTinTuDuLieuCu = (sp) => {
  if (sp?.thongTin?.length) {
    return sp.thongTin.map((m) => {
      const ds = Array.isArray(m.noiDung) ? [...m.noiDung] : [];
      return {
        tieuDe: m.tieuDe || '',
        noiDung: ds,
        vanBan: m.vanBan || ds.join('\n')
      };
    });
  }
  const muc = [];
  if (sp?.description?.trim()) muc.push({ tieuDe: 'Giới thiệu', noiDung: [sp.description.trim()], vanBan: sp.description.trim() });
  if (sp?.highlights?.length) muc.push({ tieuDe: 'Đặc điểm nổi bật', noiDung: [...sp.highlights], vanBan: sp.highlights.join('\n') });
  const thongSo = Object.entries(sp?.specs || {}).map(([nhan, giaTri]) => `${doiNhan(nhan)}: ${giaTri}`);
  if (thongSo.length) muc.push({ tieuDe: 'Thông số kỹ thuật', noiDung: thongSo, vanBan: thongSo.join('\n') });
  if (sp?.huongDan?.length) muc.push({ tieuDe: 'Hướng dẫn sử dụng', noiDung: [...sp.huongDan], vanBan: sp.huongDan.join('\n') });
  const baoHanh = [
    sp?.baoHanh?.thoiGian && `Thời gian bảo hành: ${sp.baoHanh.thoiGian}`,
    sp?.baoHanh?.doiTra && `Đổi trả: ${sp.baoHanh.doiTra}`
  ].filter(Boolean);
  if (baoHanh.length) muc.push({ tieuDe: 'Bảo hành & đổi trả', noiDung: baoHanh, vanBan: baoHanh.join('\n') });
  return muc.length ? muc : [{ tieuDe: '', noiDung: [], vanBan: '' }];
};

const tuSanPham = (sp) => ({
  name: sp?.name || '',
  category: sp?.category || '',
  brand: sp?.brand || '',
  subTitle: sp?.subTitle || '',
  unit: sp?.unit || 'chiếc',
  featured: sp ? Boolean(sp.featured) : true,
  images: sp?.images?.length ? [...sp.images] : sp?.image ? [sp.image] : [],
  thongTin: thongTinTuDuLieuCu(sp)
});

export default function AdminSanPhamForm({ sp, ds, onBao, onXong, onHuy }) {
  const { f, setF, daKhoiPhuc, luc, boBanNhap, xongBanNhap, huyBanNhap } =
    useBanNhap(`cameratd_dang_nhap_sp_${sp?.id || 'moi'}`, () => tuSanPham(sp));
  const huy = huyBanNhap(onHuy);
  const [loi, setLoi] = useState({});
  const [dangLuu, setDangLuu] = useState(false);
  const [dangTaiAnh, setDangTaiAnh] = useState('');   // "2/5" khi đang tải nhiều ảnh
  const [duongDanAnh, setDuongDanAnh] = useState('');

  const doi = (ten, giaTri) => setF((cu) => ({ ...cu, [ten]: giaTri }));
  const cacHang = [...new Set(ds.map((p) => p.brand).filter(Boolean))];
  // Bản nháp tạo trước khi có trường này vẫn mở được bình thường.
  const thongTin = f.thongTin || thongTinTuDuLieuCu(sp);

  const doiMuc = (index, khoa, giaTri) => {
    doi('thongTin', thongTin.map((m, j) => (j === index ? { ...m, [khoa]: giaTri } : m)));
  };


  const xoaMuc = (index) => {
    doi('thongTin', thongTin.filter((_, j) => j !== index));
  };

  const themMuc = (tieuDe = '') => {
    doi('thongTin', [...thongTin, { tieuDe, noiDung: [], vanBan: '' }]);
  };



  // ---- Ảnh ----
  const taiAnh = async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    for (const [i, file] of files.entries()) {
      if (file.size > TOI_DA_CHON) {
        onBao(`"${file.name}" quá lớn (${coFile(file.size)}). Chọn ảnh nhỏ hơn 40MB.`, 'error');
        continue;
      }
      setDangTaiAnh(`${i + 1}/${files.length}`);
      try {
        // Nén ngay trên máy: ảnh điện thoại vài MB còn vài trăm KB
        const goi = await nenAnhFile(file);
        if (goi.size > TOI_DA_ANH) {
          onBao(`"${file.name}" nén rồi vẫn quá nặng, thử ảnh khác.`, 'error');
          continue;
        }
        const { url } = await api.taiAnhLen(goi, f.name || file.name.replace(/\.[^.]+$/, ''));
        setF((cu) => ({ ...cu, images: [...cu.images, url] }));
        if (file.size > goi.size * 1.3) onBao(`Đã nén "${file.name}": ${coFile(file.size)} → ${coFile(goi.size)}`);
      } catch (err) {
        onBao(err.message, 'error');
      }
    }
    setDangTaiAnh('');
  };

  const doiChoAnh = (i, j) => {
    const moi = [...f.images];
    [moi[i], moi[j]] = [moi[j], moi[i]];
    doi('images', moi);
  };

  const themAnhTuDuongDan = () => {
    if (!duongDanAnh.trim()) return;
    doi('images', [...f.images, duongDanAnh.trim()]);
    setDuongDanAnh('');
  };

  // ---- Lưu ----
  const luu = async (e) => {
    e.preventDefault();
    const thieu = { name: !f.name.trim(), category: !f.category, brand: !f.brand.trim(), images: !f.images.length };
    setLoi(thieu);
    if (Object.values(thieu).some(Boolean)) {
      onBao('Còn thiếu thông tin bắt buộc (ô viền đỏ)', 'error');
      requestAnimationFrame(() =>
        document.querySelector('.qt-truong.loi, .qt-anh.loi')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      );
      return;
    }

    const sach = (dsDong) => dsDong.map((s) => s.trim()).filter(Boolean);
    const duLieu = {
      name: f.name,
      category: f.category,
      brand: f.brand,
      subTitle: f.subTitle,
      unit: f.unit,
      featured: f.featured,
      images: f.images,
      noiBat: [],
      description: '',
      highlights: [],
      thongTin: thongTin
        .map((m) => {
          const tieuDe = m.tieuDe.trim();
          const raw = typeof m.vanBan === 'string' ? m.vanBan : (Array.isArray(m.noiDung) ? m.noiDung.join('\n') : '');
          const dsDong = raw
            .split(/\r?\n/)
            .map((s) => s.replace(/^[-•*+]\s*/, '').trim())
            .filter(Boolean);
          return { tieuDe, noiDung: dsDong, vanBan: raw.trim() };
        })
        .filter((m) => m.tieuDe && m.noiDung.length)
    };

    setDangLuu(true);
    try {
      if (sp) await api.updateProduct(sp.id, duLieu);
      else await api.createProduct(duLieu);
      onBao(sp ? 'Đã lưu thay đổi' : 'Đã thêm sản phẩm');
      xongBanNhap();
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
          <button type="button" className="qt-quaylai" onClick={huy}><ArrowLeft size={15} /> Quay lại danh sách sản phẩm</button>
          <h1>{sp ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}</h1>
          <p>Các phần xếp đúng thứ tự khách thấy ở trang chi tiết. Ô có dấu <b className="qt-sao">*</b> là bắt buộc.</p>
        </div>
        {sp && (
          <a className="qt-nut" href={`/#product=${sp.id}`} target="_blank" rel="noreferrer">Xem trên web ↗</a>
        )}
      </div>

      {daKhoiPhuc && (
        <div className="qt-ban-nhap" role="status">
          <span>
            <strong>Đã lấy lại phần anh nhập dở</strong>
            {luc ? ' lúc ' + gioPhut(luc) : ''} — kiểm tra lại rồi bấm Lưu.
          </span>
          <button type="button" className="qt-nut" onClick={boBanNhap}>Bỏ, nhập lại từ đầu</button>
        </div>
      )}

      {/* 1. Thông tin cơ bản */}
      <Khoi so={1} tieuDe="Thông tin cơ bản" moTa="Tên, danh mục và dòng mô tả ngắn hiện trên thẻ sản phẩm">
        <div className="qt-hang">
          <Truong nhan="Tên sản phẩm" batBuoc rong loi={loi.name && !f.name.trim() && 'Cần nhập tên sản phẩm'}>
            <input
              className="qt-input"
              value={f.name}
              onChange={(e) => doi('name', e.target.value)}
              placeholder="VD: Camera IP Hikvision DS-2CD1123G0E-I 2MP"
              maxLength={200}
            />
          </Truong>

          <Truong nhan="Danh mục" batBuoc loi={loi.category && !f.category && 'Chọn danh mục'}>
            <select className="qt-input" value={f.category} onChange={(e) => doi('category', e.target.value)}>
              <option value="">— Chọn danh mục —</option>
              {DANH_MUC.map((d) => <option key={d}>{d}</option>)}
            </select>
          </Truong>

          <Truong nhan="Thương hiệu" batBuoc loi={loi.brand && !f.brand.trim() && 'Cần nhập thương hiệu'} goiY="Gõ tên mới hoặc chọn hãng đã có">
            <input
              className="qt-input"
              list="qt-ds-hang"
              value={f.brand}
              onChange={(e) => doi('brand', e.target.value)}
              placeholder="VD: Hikvision"
              maxLength={80}
            />
            <datalist id="qt-ds-hang">{cacHang.map((h) => <option key={h} value={h} />)}</datalist>
          </Truong>

          <Truong nhan="Mô tả ngắn" rong goiY="Một dòng hiện dưới tên trên thẻ sản phẩm">
            <input
              className="qt-input"
              value={f.subTitle}
              onChange={(e) => doi('subTitle', e.target.value)}
              placeholder="VD: Camera IP Dome ngoài trời 2MP, hồng ngoại 30m, chuẩn IP67"
              maxLength={200}
            />
          </Truong>

          <Truong nhan="Đơn vị tính">
            <select className="qt-input" value={f.unit} onChange={(e) => doi('unit', e.target.value)}>
              {[...new Set([...DON_VI, f.unit])].map((d) => <option key={d}>{d}</option>)}
            </select>
          </Truong>

          <label className="qt-cong-tac">
            <input type="checkbox" checked={f.featured} onChange={(e) => doi('featured', e.target.checked)} />
            <span>
              <strong>Sản phẩm nổi bật</strong>
              <small>Đánh dấu để ưu tiên giới thiệu</small>
            </span>
          </label>
        </div>
      </Khoi>

      {/* 2. Hình ảnh */}
      <Khoi so={2} tieuDe="Hình ảnh" moTa="Ảnh đầu tiên là ảnh đại diện. Cứ chọn ảnh chụp từ điện thoại, hệ thống tự nén lại">
        <div className={`qt-anh${loi.images && !f.images.length ? ' loi' : ''}`}>
          <div className="qt-anh-luoi">
            {f.images.map((url, i) => (
              <div key={`${url}-${i}`} className="qt-anh-o">
                <img src={url} alt={`Ảnh ${i + 1}`} />
                {i === 0 && <span className="qt-anh-dai-dien">Ảnh đại diện</span>}
                <div className="qt-anh-nut">
                  <button type="button" onClick={() => doiChoAnh(i, i - 1)} disabled={i === 0} aria-label="Đưa lên trước">
                    <ArrowLeft size={14} />
                  </button>
                  <button type="button" onClick={() => doiChoAnh(i, i + 1)} disabled={i === f.images.length - 1} aria-label="Đưa ra sau">
                    <ArrowRight size={14} />
                  </button>
                  <button type="button" className="xoa" onClick={() => doi('images', f.images.filter((_, j) => j !== i))} aria-label="Xóa ảnh">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}

            <label className="qt-anh-them">
              <Upload size={22} />
              <span>{dangTaiAnh ? `Đang tải ${dangTaiAnh}…` : 'Tải ảnh lên'}</span>
              <small>JPG, PNG, WEBP · chọn nhiều ảnh · tự nén</small>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                multiple
                hidden
                onChange={taiAnh}
                disabled={Boolean(dangTaiAnh)}
              />
            </label>
          </div>

          {loi.images && !f.images.length && <small className="qt-loi-chu">Cần ít nhất 1 ảnh</small>}

          <div className="qt-anh-link">
            <Link size={15} />
            <input
              className="qt-input"
              value={duongDanAnh}
              onChange={(e) => setDuongDanAnh(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); themAnhTuDuongDan(); } }}
              placeholder="Hoặc dán đường dẫn ảnh có sẵn: /images/ten-anh.jpg"
            />
            <button type="button" className="qt-nut" onClick={themAnhTuDuongDan}>Thêm</button>
          </div>
        </div>
      </Khoi>

      {/* 3. Mô tả với các mục tiêu đề lớn */}
      <Khoi so={3} tieuDe="Mô tả">
        {thongTin.map((muc, i) => (
          <div key={i} className="qt-khung-con">
            <div className="qt-khung-con-dau">
              <span className="qt-khung-con-so">Mục {i + 1}</span>
              <input
                className="qt-input"
                value={muc.tieuDe}
                onChange={(e) => doiMuc(i, 'tieuDe', e.target.value)}
                placeholder="Nhập tiêu đề lớn (VD: Thông số kỹ thuật, Đặc điểm nổi bật...)"
                aria-label="Tiêu đề lớn"
              />
              <button
                type="button"
                className="qt-xoa-o"
                onClick={() => xoaMuc(i)}
                aria-label="Xóa mục lớn"
                title="Xóa mục lớn này"
              >
                <Trash2 size={16} />
              </button>
            </div>

            <div className="qt-khung-con-than">
              <textarea
                className="qt-input qt-textarea-noidung"
                rows={5}
                ref={(el) => { if (el) { el.style.height = 'auto'; el.style.height = el.scrollHeight + 'px'; } }}
                value={typeof muc.vanBan === 'string' ? muc.vanBan : (Array.isArray(muc.noiDung) ? muc.noiDung.join('\n') : '')}
                onChange={(e) => {
                  const val = e.target.value;
                  const ds = val.split(/\r?\n/).map((s) => s.replace(/^[-•*+]\s*/, '').trim()).filter(Boolean);
                  doi('thongTin', thongTin.map((m, j) => (j === i ? { ...m, vanBan: val, noiDung: ds } : m)));
                }}
                placeholder="Dán hoặc nhập nội dung tại đây..."
              />
              {(() => {
                const raw = typeof muc.vanBan === 'string' ? muc.vanBan : (Array.isArray(muc.noiDung) ? muc.noiDung.join('\n') : '');
                const soDong = raw.split(/\r?\n/).filter((s) => s.trim()).length;
                return soDong > 0 ? (
                  <div style={{ textAlign: 'right', marginTop: '4px' }}>
                    <small style={{ color: '#64748b', fontSize: '0.78rem' }}>{soDong} dòng</small>
                  </div>
                ) : null;
              })()}
            </div>
          </div>
        ))}

        <button
          type="button"
          className="qt-nut-them"
          style={{ width: '100%', padding: '12px', fontSize: '0.9rem', justifyContent: 'center' }}
          onClick={() => themMuc()}
        >
          <Plus size={16} /> Thêm mục tiêu đề lớn mới
        </button>
      </Khoi>

      <ThanhLuu
        dangLuu={dangLuu}
        onHuy={huy}
        nhan={sp ? 'Lưu thay đổi' : 'Thêm sản phẩm'}
        ghiChu={f.name || 'Sản phẩm mới'}
      />
    </form>
  );
}
