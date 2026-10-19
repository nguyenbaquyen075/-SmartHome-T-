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

- **Mục "Dịch vụ thi công": đã commit + merge vào main ngày 2026-10-16, đã push 2026-10-18:**
  - `frontend/src/components/DichVu.jsx` (mới): 6 thẻ gồm điện, nước, camera, nhà thông minh, mạng & Wi-Fi, bảo trì
  - `frontend/src/App.jsx`: chèn `<DichVu />` ngay dưới `CategoryFilter`
  - `frontend/src/index.css`: thêm khối CSS `.dv-*` (3 cột trên máy tính, 2 cột trên điện thoại)
  - `frontend/public/images/dich-vu/*.jpg`: ảnh **tạm**, cắt từ ảnh mẫu anh gửi (độ phân giải thấp)

- **Sửa lỗi menu quản trị (2026-10-18): đã commit af0d4f1 + merge main (e87786b), đã push lên GitHub 2026-10-18:** `utils/luiVe.js`, `AdminApp.jsx`,
  `frontend/scripts/thu-menu-quan-tri.mjs`, `frontend/package.json` (script `thu:menu`), `CLAUDE.md`.
  Nhánh `fix/menu-quan-tri`.

- **Kiểm tra tự động trên GitHub (2026-10-18), CHƯA commit/push:** `.github/workflows/kiem-tra.yml`,
  `frontend/scripts/thu-menu-quan-tri.mjs`, `CLAUDE.md`. Sau khi push: vào GitHub → Settings → Branches → luật của `main`
  → bật "Require status checks" chọn `kiem-tra` để main không nhận code đỏ.

- **Ô danh mục nhỏ lại trên điện thoại (2026-10-18), CHƯA commit:** `frontend/src/components/CategoryFilter.jsx`.

- **Giá dự tính sản phẩm (2026-10-19): đã commit + push (212030b):** `backend/index.js`, `utils/sanPham.jsx`, `AdminSanPhamForm.jsx`,
  `ProductCard.jsx`, `ProductDetailPage.jsx`, `index.css`, `admin.css`.

## Việc tiếp theo

- Thay ảnh dịch vụ bằng ảnh nét hơn (giữ nguyên tên file trong `images/dich-vu/`).
- Nút mũi tên trên thẻ dịch vụ hiện chưa bấm được — cần quyết định bấm vào thì đi đâu (gọi hotline / Zalo / trang chi tiết).
- Mục Dịch vụ thi công đang **chỉ hiện trên localhost** (`import.meta.env.DEV` trong `App.jsx`). Khi anh duyệt xong demo thì bỏ điều kiện đó để lên web thật.
