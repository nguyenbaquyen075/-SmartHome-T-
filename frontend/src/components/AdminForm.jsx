import React from 'react';
import { ArrowUp, ArrowDown, Trash2, Plus } from 'lucide-react';

// Các mảnh form dùng chung cho trang thêm/sửa sản phẩm và công trình

// Một ô nhập: nhãn, dấu * bắt buộc, gợi ý xám hoặc lỗi đỏ ngay bên dưới
export function Truong({ nhan, batBuoc, goiY, loi, rong, children }) {
  return (
    <label className={`qt-truong${loi ? ' loi' : ''}${rong ? ' rong' : ''}`}>
      <span>{nhan}{batBuoc && <b className="qt-sao"> *</b>}</span>
      {children}
      {loi ? <small className="qt-loi-chu">{loi}</small> : goiY && <small>{goiY}</small>}
    </label>
  );
}

// Khung đánh số thứ tự cho từng phần của form
export function Khoi({ so, tieuDe, moTa, nut, children }) {
  return (
    <section className="qt-khung">
      <div className="qt-khoi-dau">
        <span className="qt-khoi-so">{so}</span>
        <div className="qt-khoi-chu">
          <h2>{tieuDe}</h2>
          {moTa && <p>{moTa}</p>}
        </div>
        {nut && <div className="qt-khoi-nut">{nut}</div>}
      </div>
      {children}
    </section>
  );
}

// Thanh Lưu dính ở đáy màn hình: form dài cuộn tới đâu cũng bấm được
export function ThanhLuu({ dangLuu, onHuy, nhan, ghiChu }) {
  return (
    <div className="qt-luu">
      <div className="qt-luu-trong">
        {ghiChu && <span>{ghiChu}</span>}
        <button type="button" className="qt-nut" onClick={onHuy}>Hủy</button>
        <button type="submit" className="btn-primary" disabled={dangLuu}>
          {dangLuu ? 'Đang lưu…' : nhan}
        </button>
      </div>
    </div>
  );
}

// Danh sách dòng chữ (đặc điểm, các bước hướng dẫn): thêm, xóa, đổi thứ tự
export function DanhSachDong({ ds, onDoi, placeholder, nhanThem, soThuTu }) {
  const doiCho = (i, j) => {
    const moi = [...ds];
    [moi[i], moi[j]] = [moi[j], moi[i]];
    onDoi(moi);
  };

  return (
    <>
      {ds.map((dong, i) => (
        <div key={i} className="qt-dong">
          {soThuTu && <span className="qt-dong-so">{i + 1}</span>}
          <input
            className="qt-input"
            value={dong}
            placeholder={placeholder}
            onChange={(e) => onDoi(ds.map((x, j) => (j === i ? e.target.value : x)))}
          />
          <div className="qt-dong-nut">
            <button type="button" onClick={() => doiCho(i, i - 1)} disabled={i === 0} aria-label="Đưa lên">
              <ArrowUp size={15} />
            </button>
            <button type="button" onClick={() => doiCho(i, i + 1)} disabled={i === ds.length - 1} aria-label="Đưa xuống">
              <ArrowDown size={15} />
            </button>
            <button type="button" className="xoa" onClick={() => onDoi(ds.filter((_, j) => j !== i))} aria-label="Xóa dòng">
              <Trash2 size={15} />
            </button>
          </div>
        </div>
      ))}
      <button type="button" className="qt-nut-them" onClick={() => onDoi([...ds, ''])}>
        <Plus size={15} /> {nhanThem}
      </button>
    </>
  );
}
