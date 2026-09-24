import React, { useState, useEffect } from 'react';
import { Package, HardHat, Clapperboard, Plus, Upload } from 'lucide-react';
import { api } from '../utils/api';
import { useDanhMuc } from '../utils/danhMuc';
import { AnhChay, gomAnhTheoDanhMuc } from '../utils/anhChay';

export default function AdminTongQuan({ onBao, diToi }) {
  const dsDanhMuc = useDanhMuc();
  const [duLieu, setDuLieu] = useState(null);

  useEffect(() => {
    Promise.all([api.getProducts(), api.getProjects(), api.getGiaiTriQuanTri()])
      .then(([sanPham, congTrinh, giaiTri]) => setDuLieu({ sanPham, congTrinh, giaiTri }))
      .catch((err) => onBao(err.message, 'error'));
  }, [onBao]);

  if (!duLieu) return <p className="adm-trong">Đang tải…</p>;

  const { sanPham, congTrinh, giaiTri } = duLieu;
  // Ảnh đại diện mỗi danh mục (chỉ ảnh chính, không lấy ảnh phụ), tự đảo vài giây 1 lần
  const anhTheoDanhMuc = gomAnhTheoDanhMuc(sanPham);
  const theoDanhMuc = dsDanhMuc.map((d) => d.ten).map((dm) => ({
    dm,
    so: sanPham.filter((p) => p.category === dm).length,
    ds: anhTheoDanhMuc[dm] || []
  }));

  return (
    <>
      <div className="qt-tieude">
        <div>
          <h1>Tổng quan</h1>
          <p>Chào anh 👋 Hôm nay có gì mới để cập nhật?</p>
        </div>
      </div>

      <div className="qt-so">
        {[
          [Package, 'Sản phẩm', sanPham.length, 'san-pham'],
          [HardHat, 'Công trình', congTrinh.length, 'cong-trinh'],
          [Clapperboard, 'Bài giải trí', giaiTri.length, 'giai-tri']
        ].map(([Icon, nhan, so, d]) => (
          <a key={d} href={`#/${d}`} className="qt-so-o">
            <span className="qt-so-icon"><Icon size={22} /></span>
            <div>
              <strong>{so}</strong>
              <span>{nhan}</span>
            </div>
          </a>
        ))}
      </div>

      <section className="qt-khung">
          <h2>Thêm nhanh</h2>
          <div className="qt-nhanh">
            <button onClick={() => diToi('san-pham', 'moi')}>
              <span className="qt-nhanh-icon"><Plus size={22} /></span>
              <span>Thêm sản phẩm</span>
            </button>
            <button onClick={() => diToi('cong-trinh', 'moi')}>
              <span className="qt-nhanh-icon"><HardHat size={21} /></span>
              <span>Thêm công trình</span>
            </button>
            <button onClick={() => diToi('giai-tri')}>
              <span className="qt-nhanh-icon"><Upload size={21} /></span>
              <span>Đăng ảnh, video</span>
            </button>
          </div>
      </section>

      <section className="qt-khung">
        <h2>Sản phẩm theo danh mục</h2>
        <ul className="qt-dmo">
          {theoDanhMuc.map(({ dm, so, ds }) => (
            <li key={dm}>
              <a
                href={`#/san-pham/loc/${encodeURIComponent(dm)}`}
                className={`qt-dmo-o${so ? '' : ' trong'}`}
                title={`Xem ${so} sản phẩm ${dm}`}
              >
                <span className="qt-dmo-anh">
                  {ds.length ? <AnhChay ds={ds} alt="" /> : <Package size={30} />}
                </span>
                <span className="qt-dmo-so">{so}</span>
                <span className="qt-dmo-ten">{dm}</span>
              </a>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
