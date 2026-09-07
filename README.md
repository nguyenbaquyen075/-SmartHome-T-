# CameraTD Pro - Hệ Thống Bán Thiết Bị Máy Ảnh & Ống Kính Điện Tử

Trang web thương mại điện tử chuyên nghiệp dành cho thiết bị máy ảnh cao cấp (Mirrorless, Cinema, Medium Format, Lens, Gimbal, Phụ kiện) được xây dựng với kiến trúc Full-stack:
- **Frontend**: React (Vite) + Lucide Icons + Design System Dark Pro Titanium & Amber Studio.
- **Backend**: Node.js + Express RESTful API + JSON Database bền vững lưu trữ cục bộ.

---

## 📸 Các Tính Năng Nổi Bật

### 1. Phía Khách Hàng (Customer Experience)
- **Hero Banner Đỉnh Cao**: Trình chiếu dòng máy ảnh Flagship, thông số cảm biến, quay phim 8K/4K và các cam kết chính hãng (Giao 2H, BH 24 tháng, 1 đổi 1 trong 15 ngày).
- **Bộ Lọc Thông Số Máy Ảnh (Camera Specs Filter)**:
  - Lọc theo thương hiệu: Sony, Canon, Fujifilm, Nikon, DJI, Blackmagic.
  - Lọc theo danh mục: Mirrorless, Cinema, Medium Format, Action/Vlog, Ống Kính, Phụ Kiện.
  - Lọc theo loại cảm biến: Full-Frame, APS-C, Medium Format, Super 35, 1-inch.
  - Lọc theo khoảng giá & sắp xếp linh hoạt.
- **Xem Chi Tiết Máy Ảnh (Product Details Modal)**:
  - Thư viện ảnh sản phẩm nhiều góc chụp.
  - Bảng thông số kỹ thuật chi tiết (Cảm biến, Bộ xử lý, ISO, Video, IBIS, AF, Ngàm, Khối lượng).
  - Đánh giá sao & gửi nhận xét đánh giá thực tế.
- **So Sánh Máy Ảnh Chuyên Sâu (Side-by-side Spec Comparison)**:
  - Cho phép chọn tối đa 3 máy ảnh để đặt cạnh nhau so sánh trực tiếp từng thông số kỹ thuật.
- **Giỏ Hàng & Mã Giảm Giá (Cart Drawer)**:
  - Tăng/giảm số lượng, xóa sản phẩm, lưu giỏ hàng vào `localStorage`.
  - Hỗ trợ mã voucher: nhập `CAMERATD` (giảm 500.000₫) hoặc `PROVIP` (giảm 1.000.000₫).
- **Quy Trình Đặt Hàng & VietQR (Checkout Modal)**:
  - Điền thông tin giao hàng & nhận mã đơn hàng tự động (VD: `CAM-829103`).
  - Thanh toán COD (nhận hàng kiểm tra thanh toán).
  - **Tích hợp mã QR VietQR NAPAS 24/7**: Tự động sinh mã QR với số tiền chính xác và nội dung chuyển khoản là mã đơn hàng.
- **Tra Cứu Tiến Độ Đơn Hàng (Order Tracker)**:
  - Tra cứu theo Mã đơn hoặc Số điện thoại đặt hàng.
  - Hiển thị thanh tiến trình 3 bước (Tiếp nhận -> Vận chuyển -> Giao thành công).

### 2. Phía Quản Trị Viên (Admin Portal)
- Bật/Tắt chế độ Quản trị trực tiếp bằng nút **"Vào Quản Trị"** ở thanh điều hướng trên cùng.
- **Thống kê tổng quan**: Tổng số thiết bị, số lượng tồn kho, cảnh báo hàng sắp hết (≤ 5 máy), số đơn hàng, tổng doanh thu.
- **Quản lý sản phẩm**: Thêm mới máy ảnh với đầy đủ thông số kỹ thuật, sửa giá bán và tồn kho trực tiếp, xóa sản phẩm.
- **Quản lý đơn hàng**: Xem chi tiết đơn khách đặt, cập nhật trạng thái đơn hàng (Đang xử lý, Đang giao, Đã hoàn thành) và trạng thái thanh toán.

---

## 🚀 Hướng Dẫn Khởi Động Dự Án

### Cách 1: Khởi động nhanh cả Backend & Frontend bằng 1 lệnh duy nhất
Tại thư mục gốc của dự án:
```bash
npm start
```
*(Lệnh này sẽ tự động chạy cả server Node.js tại cổng 5001 và client React Vite tại cổng 5173).*

### Cách 2: Chạy riêng từng phần
- **Khởi động Backend (Node.js)**:
  ```bash
  cd server
  npm start
  ```
  *(API chạy tại: `http://localhost:5001/api`)*

- **Khởi động Frontend (React)**:
  ```bash
  cd client
  npm run dev
  ```
  *(Giao diện web mở tại: `http://localhost:5174`)*

---

## 🛠 Cấu Trúc Thư Mục

```
cameraTD/
├── package.json               # Cấu hình script gốc
├── start.js                   # Script khởi chạy đồng thời Client & Server
├── server/
│   ├── package.json
│   ├── index.js               # REST API Express (Sản phẩm, Đơn hàng, Thống kê)
│   └── data/
│       ├── products.json      # Dữ liệu máy ảnh, lens, phụ kiện mẫu
│       └── orders.json        # Dữ liệu đơn hàng & thanh toán
└── client/
    ├── package.json
    ├── vite.config.js         # Cấu hình proxy /api -> http://localhost:5001
    ├── index.html             # Google Fonts Plus Jakarta Sans, Icons
    └── src/
        ├── App.jsx            # State điều phối chính của ứng dụng
        ├── index.css          # Design System Pro Dark Cyber & Glassmorphism
        ├── components/
        │   ├── Navbar.jsx           # Header, tìm kiếm, giỏ hàng, nút quản trị
        │   ├── HeroBanner.jsx       # Banner công nghệ máy ảnh cao cấp
        │   ├── CategoryFilter.jsx   # Thanh lọc danh mục, hãng, cảm biến & giá
        │   ├── ProductCard.jsx      # Thẻ sản phẩm với spec chips
        │   ├── ProductModal.jsx     # Chi tiết & bảng thông số kỹ thuật đầy đủ
        │   ├── ComparisonModal.jsx  # So sánh 2-3 máy ảnh song song
        │   ├── CartDrawer.jsx       # Giỏ hàng & áp dụng mã voucher
        │   ├── CheckoutModal.jsx    # Đặt hàng, COD & quét mã VietQR tự động
        │   ├── OrderTrackerModal.jsx# Tra cứu đơn hàng theo mã/SĐT
        │   ├── AdminDashboard.jsx   # Quản lý kho, giá, đơn hàng & doanh thu
        │   └── Footer.jsx           # Hệ thống showroom, chính sách bảo hành
        └── utils/
            └── api.js               # Tiện ích gọi API backend & định dạng tiền tệ VNĐ
```
