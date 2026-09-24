import { useState, useEffect } from 'react';
import { Cctv, Zap, Droplets, Wifi, Wrench, Lightbulb, ShieldCheck, Package, Plug, Sun, LayoutGrid } from 'lucide-react';
import { api } from './api';

// Danh mục sản phẩm lấy từ server (trang Quản trị > Danh mục thêm/sửa/xóa được).
// Khóa icon phải khớp ICON_DANH_MUC ở backend/index.js.
export const ICON_DANH_MUC = {
  cctv: { ten: 'Camera', Icon: Cctv },
  wifi: { ten: 'Mạng, wifi', Icon: Wifi },
  zap: { ten: 'Điện', Icon: Zap },
  plug: { ten: 'Ổ cắm, dây điện', Icon: Plug },
  lightbulb: { ten: 'Đèn', Icon: Lightbulb },
  droplets: { ten: 'Nước', Icon: Droplets },
  wrench: { ten: 'Dụng cụ', Icon: Wrench },
  shield: { ten: 'An ninh', Icon: ShieldCheck },
  sun: { ten: 'Năng lượng', Icon: Sun },
  package: { ten: 'Khác', Icon: Package }
};
export const iconDanhMuc = (khoa) => (ICON_DANH_MUC[khoa] || ICON_DANH_MUC.package).Icon;

export const ANH_TAT_CA = '/images/cat_style_new/prod_all.jpg';

// Hiện tạm khi chưa tải xong, trùng với danh mục mặc định của backend nên không bị giật
const DU_PHONG = [
  { id: 'dm-mang', ten: 'Thiết bị mạng', icon: 'cctv', anh: '/images/cat_style_new/prod_3.png' },
  { id: 'dm-dien', ten: 'Thiết bị điện', icon: 'zap', anh: '/images/cat_style_new/prod_1.png' },
  { id: 'dm-nuoc', ten: 'Thiết bị nước', icon: 'droplets', anh: '/images/cat_style_new/prod_2.png' }
];

let bo = null;                    // danh sách đã tải, dùng chung cho mọi component
const nguoiNghe = new Set();

// Tải lại từ server, mọi nơi đang dùng useDanhMuc tự cập nhật
export const lamMoiDanhMuc = () =>
  api.getDanhMuc().then((ds) => { bo = ds; nguoiNghe.forEach((f) => f(ds)); }).catch(() => {});

export function useDanhMuc() {
  const [ds, setDs] = useState(bo || DU_PHONG);
  useEffect(() => {
    nguoiNghe.add(setDs);
    if (bo) setDs(bo); else lamMoiDanhMuc();
    return () => nguoiNghe.delete(setDs);
  }, []);
  return ds;
}

// "Tất cả" + các danh mục, dùng cho menu
export const mucMenu = (ds) => [
  { name: 'Tất cả', icon: LayoutGrid },
  ...ds.map((d) => ({ name: d.ten, icon: iconDanhMuc(d.icon) }))
];
