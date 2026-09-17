# Trang quản trị riêng (/admin) — thiết kế

Ngày: 2026-09-15 · Trạng thái: đã duyệt trong chat

## Mục tiêu

1. Trang quản trị nền sáng, tách hẳn khỏi web tại `/admin`, có trang đăng nhập riêng.
2. Nút ☰ góc trái mở menu trượt: Tổng quan, rồi các mục trang chủ theo thứ tự từ trên xuống —
   Thanh chữ chạy · Ảnh banner · Sản phẩm (+) · Nhật ký thi công (+) · Hậu trường thi công.
   (Bản đầu dùng menu ngang; anh thấy thiếu chỗ và xấu nên đổi sang ☰ ngày 2026-09-15.)
3. Mỗi mục có trang danh sách; Thêm mới / Sửa mở trang nhập liệu riêng (không popup).
4. Trang thêm/sửa sản phẩm có đủ mọi phần khách thấy ở trang chi tiết, kèm mẫu thông số theo danh mục.
5. Trang chi tiết sản phẩm đọc đúng dữ liệu (bỏ chữ viết cứng).

Không làm: giá bán / tồn kho trong quản trị, tra cứu thông tin sản phẩm trên mạng.

## Điều hướng

- `main.jsx`: đường dẫn `/admin` → `AdminApp` (tải lười, kèm `admin.css`), còn lại → `App`.
- Chưa đăng nhập → `AdminLogin` toàn màn hình. Token vẫn giữ trong sessionStorage như cũ.
- Trang con theo hash: `#/tong-quan`, `#/san-pham`, `#/san-pham/moi`, `#/san-pham/<id>`,
  `#/cong-trinh`, `#/cong-trinh/moi`, `#/cong-trinh/<id>`, `#/giai-tri`, `#/banner`.
  Không cần thư viện router; Back và tải lại trang giữ đúng chỗ.
- Nút "Tài khoản" trên web → `/admin`. Popup quản trị cũ (`AdminDashboard`) bị xóa.

## Dữ liệu sản phẩm

Trường mới (trường cũ như `price`, `inStock` giữ nguyên trong file, không sửa trong quản trị):

| Trường | Kiểu | Hiện ở |
|---|---|---|
| `name`, `brand`, `category`, `subTitle`, `unit`, `featured` | chuỗi / bool | thẻ + đầu trang chi tiết |
| `images` (ảnh đầu = `image`) | mảng URL | thư viện ảnh |
| `noiBat` | tối đa 4 `{ bieuTuong, nhan, giaTri, ghiChu }` | dải 4 ô nổi bật |
| `description` | chuỗi | Giới thiệu |
| `highlights` | mảng chuỗi | Đặc điểm nổi bật |
| `specs` | object, khóa = nhãn tiếng Việt | Thông số kỹ thuật |
| `huongDan` | mảng chuỗi | Hướng dẫn lắp đặt |
| `baoHanh` | `{ thoiGian, doiTra }` | Chính sách bảo hành |

Thông số cũ dùng khóa camelCase (`doPhanGiai`) vẫn hiển thị nhờ bảng nhãn; khi sửa trong
quản trị sẽ lưu lại bằng nhãn tiếng Việt.

Backend `chuanHoaSanPham()` chỉ nhận đúng các trường trên, cắt độ dài; bắt buộc tên,
danh mục, thương hiệu và ≥ 1 ảnh.

## Trang chi tiết khi thiếu dữ liệu

- `noiBat` trống → ẩn dải 4 ô (trước đây luôn hiện "2MP / hồng ngoại 30m / IP67").
- `huongDan` trống → hướng dẫn mẫu theo danh mục.
- `baoHanh` trống → 24 tháng, 1 đổi 1 trong 7 ngày.
- Chỉ hiện ảnh thật; bỏ ảnh độn và ô "+3".

## Mẫu theo danh mục (`utils/sanPham.jsx`)

Chọn danh mục trên form → tự điền khung thông số, khung 4 ô nổi bật, hướng dẫn mẫu
(chỉ khi phần đó chưa nhập gì). Giá trị để trống, gợi ý ví dụ nằm trong placeholder để
không vô tình đăng số liệu sai.

## Sửa kèm

- Thêm/sửa/xóa sản phẩm gửi kèm token (trước đây bị 401).
- Server phục vụ `/images/tai-len` (ảnh tải lên nằm ngoài `frontend/dist`).

## Kiểm tra

Build + lint; gọi API tạo/sửa sản phẩm (thiếu trường → 400, không token → 401);
chụp màn hình qua Chrome DevTools Protocol: đăng nhập, tổng quan, danh sách, form sản phẩm,
trang chi tiết của sản phẩm vừa tạo, bản điện thoại.
