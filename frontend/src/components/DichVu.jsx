import React from 'react';
import { Zap, Droplet, Cctv, House, Wifi, Wrench, ArrowRight, BriefcaseBusiness } from 'lucide-react';

// Các dịch vụ thi công hiện ở trang chủ, ngay dưới Danh mục sản phẩm
const DICH_VU = [
  { Icon: Zap, ten: ['Thi công', 'hệ thống điện'], moTa: 'Điện dân dụng & công nghiệp, đảm bảo an toàn, ổn định và thẩm mỹ.', anh: 'dien' },
  { Icon: Droplet, ten: ['Thi công', 'cấp thoát nước'], moTa: 'Lắp đặt hệ thống nước sạch, nước thải cho nhà ở, chung cư, công trình dân dụng.', anh: 'nuoc' },
  { Icon: Cctv, ten: ['Lắp đặt', 'camera giám sát'], moTa: 'Giải pháp giám sát an ninh cho gia đình, văn phòng, cửa hàng, nhà xưởng.', anh: 'camera' },
  { Icon: House, ten: ['Nhà thông minh'], moTa: 'Thi công hệ thống Smarthome hiện đại, tiện nghi và dễ dàng điều khiển.', anh: 'smarthome' },
  { Icon: Wifi, ten: ['Thi công', 'mạng & Wi-Fi'], moTa: 'Triển khai hệ thống mạng LAN, Wi-Fi ổn định, phủ sóng toàn bộ công trình.', anh: 'wifi' },
  { Icon: Wrench, ten: ['Bảo trì và sửa chữa'], moTa: 'Bảo trì định kỳ, sửa chữa nhanh chóng, đảm bảo hệ thống luôn hoạt động tốt.', anh: 'baotri' },
];

export default function DichVu() {
  return (
    <section className="home-group dich-vu">
      <div className="home-group-head">
        <div className="home-group-title">
          <BriefcaseBusiness size={18} />
          <h2>DỊCH VỤ THI CÔNG</h2>
        </div>
      </div>

      <div className="dv-luoi">
        {DICH_VU.map(({ Icon, ten, moTa, anh }) => (
          <article key={anh} className="dv-the">
            <div className="dv-chu">
              <span className="dv-icon"><Icon size={22} /></span>
              <h3>{ten.map((dong) => <span key={dong}>{dong}</span>)}</h3>
              <p>{moTa}</p>
              <span className="dv-mui-ten"><ArrowRight size={16} /></span>
            </div>
            <img className="dv-anh" src={`/images/dich-vu/${anh}.jpg`} alt="" loading="lazy" />
          </article>
        ))}
      </div>
    </section>
  );
}
