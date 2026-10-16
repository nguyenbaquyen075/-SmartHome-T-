# Đang làm / tiếp theo

_Cập nhật: 2026-10-16_

## Trạng thái hiện tại

- Nhánh `main`, commit mới nhất `a34706f` (2026-10-12) — merge `fix/back-muc-thua`.
- Mấy việc gần nhất: nút Back trong quản trị, bỏ viền màu thẻ thiết bị, thẻ Open Graph khi chia sẻ link,
  trang Khách hàng + kho ảnh riêng tư, sao lưu/khôi phục toàn bộ, chấm công.

## Chưa commit

- `backend/data/products.json`: sửa thử sản phẩm "Aptomat Panasonic BBD" (subTitle, mục thông tin) —
  có vẻ là dữ liệu nhập thử từ trang quản trị trên máy. **Hỏi anh có giữ không.**
- `anh/`: 6 ảnh banner SmartHome mới (chưa dùng trong code, chưa đưa vào `frontend/public/images/`).

- **Mục "Dịch vụ thi công" (đang test, CHƯA commit/push — anh bảo mới commit):**
  - `frontend/src/components/DichVu.jsx` (mới): 6 thẻ gồm điện, nước, camera, nhà thông minh, mạng & Wi-Fi, bảo trì
  - `frontend/src/App.jsx`: chèn `<DichVu />` ngay dưới `CategoryFilter`
  - `frontend/src/index.css`: thêm khối CSS `.dv-*` (3 cột trên máy tính, 2 cột trên điện thoại)
  - `frontend/public/images/dich-vu/*.jpg`: ảnh **tạm**, cắt từ ảnh mẫu anh gửi (độ phân giải thấp)

## Việc tiếp theo

- Thay ảnh dịch vụ bằng ảnh nét hơn (giữ nguyên tên file trong `images/dich-vu/`).
- Nút mũi tên trên thẻ dịch vụ hiện chưa bấm được — cần quyết định bấm vào thì đi đâu (gọi hotline / Zalo / trang chi tiết).
- Khi anh bảo: tạo nhánh `feat/dich-vu-thi-cong`, commit rồi merge.
