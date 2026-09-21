import React from 'react';
import { LayoutGrid, ArrowRight } from 'lucide-react';
import { MUC_DANH_MUC } from '../utils/sanPham';

// 4 ô danh mục ngoài trang chủ: Tất cả + 3 nhóm hàng.
// Danh sách lấy từ utils/sanPham.jsx nên luôn khớp với menu và form thêm sản phẩm.
export default function CategoryFilter({ selectedCategory, setSelectedCategory, onViewAll, dem = {} }) {
  return (
    <section className="dm-khu">
      <div className="khu-dau">
        <h2><LayoutGrid size={17} /> DANH MỤC SẢN PHẨM</h2>
        <button type="button" onClick={() => onViewAll('Tất cả')}>
          Xem tất cả <ArrowRight size={13} />
        </button>
      </div>

      <div className="dm-luoi">
        {MUC_DANH_MUC.map(({ ten, Icon, anh, moTa }) => {
          const so = dem[ten];
          return (
            <button
              type="button"
              key={ten}
              className={`dm-o${selectedCategory === ten ? ' dang-chon' : ''}`}
              onClick={() => setSelectedCategory(ten)}
              aria-pressed={selectedCategory === ten}
            >
              <span className="dm-anh">
                <img src={anh} alt="" loading="lazy" onError={(e) => { e.currentTarget.hidden = true; }} />
              </span>
              <span className="dm-chu">
                <strong><Icon size={15} /> {ten}</strong>
                <small>{moTa}</small>
              </span>
              {/* Chưa có hàng thì nói luôn, khỏi bấm vào rồi thấy trống */}
              <span className={`dm-so${so ? '' : ' trong'}`}>{so ? `${so} sản phẩm` : 'chưa có'}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
