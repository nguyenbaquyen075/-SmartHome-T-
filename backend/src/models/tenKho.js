// Tên các mục trong kho dữ liệu (xem lib/kho.js): có DATABASE_URL thì là 1 dòng trong bảng du_lieu
// (deploy lại không mất), không thì là file data/<tên>.json
module.exports = {
  SAN_PHAM: 'products',
  CONG_TRINH: 'projects',
  CAI_DAT: 'settings',
  GIAI_TRI: 'giai-tri',
  DANH_MUC: 'danh-muc',          // danh mục sản phẩm, thêm/sửa/xoá trong trang quản trị
  GHI_CHU: 'ghi-chu',            // ghi chú riêng của quản trị (kiểu Notes trên iPhone/Mac)
  GHI_CHU_TM: 'ghi-chu-thu-muc', // thư mục chứa ghi chú
  CHAM_CONG: 'cham-cong',        // nhân viên + bảng chấm công theo ngày
  KHACH_HANG: 'khach-hang',      // khách hàng + thiết bị đã lắp đặt + hạn bảo hành
  QUAN_TRI: 'quan-tri',          // tài khoản/mật khẩu đổi trong trang Cài đặt
  SAO_LUU_NK: 'sao-luu-nhat-ky',
  SAO_LUU_TRUOC: 'sao-luu-truoc-khoi-phuc'
};
