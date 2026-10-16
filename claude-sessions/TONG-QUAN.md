# Tổng quan dự án cameraTD

_Cập nhật: 2026-10-16_

## Là gì

Web **trưng bày** camera, thiết bị điện, nước, đèn (không bán online — không giỏ hàng/thanh toán;
khách liên hệ hotline/Zalo). Tên cửa hàng trên header: "Thiet bi_ Dien - Nuoc - Camera".
Kèm **trang quản trị** tại `/admin` dùng làm công cụ nội bộ của cửa hàng.

## Công nghệ

- **Frontend:** React 19 + Vite 8, icon `lucide-react`, lint `oxlint`. Không dùng router —
  trang khách dùng `history.state`, trang quản trị dùng hash (`#/san-pham/moi`...).
- **Backend:** Node + Express 5 (CommonJS), `pg`, `compression`. Một file chính `backend/index.js` (~1600 dòng).
- **Deploy:** Render gói Free, 1 service (Express phục vụ cả API lẫn bản build React). Cấu hình ở `render.yaml`.
- **Dữ liệu:** Postgres Neon (`DATABASE_URL`); file ảnh/video ở Neon Object Storage (`NEON_S3_*`);
  ảnh khách hàng ở bucket riêng tư (`NEON_S3_RT_*`). Chưa đặt biến → lưu tạm `backend/data/*.json` (mất khi deploy).
- Đăng nhập quản trị: `ADMIN_TAI_KHOAN`, `ADMIN_PASSWORD`.

## Chạy

```bash
npm run install:all   # lần đầu
npm run dev           # frontend 5174 + backend 5001 → http://localhost:5174
                      # xem trên nhiều cỡ điện thoại: http://localhost:5174/mobile.html
```

## Cấu trúc chính

```
backend/
  index.js        toàn bộ API
  kho.js          lưu dữ liệu (Postgres hoặc file JSON)   kho.test.js
  khoFile.js      kho file công khai (Neon S3)            kyS3.js  ký request S3
  khoRiengTu.js   kho ảnh khách hàng riêng tư
  zipTinh.js, xlsxTinh.js   tự tạo file zip (sao lưu) / xlsx (xuất chấm công)
  data/           dữ liệu chạy thử trên máy
frontend/src/
  main.jsx        /admin → AdminApp (tải lười), còn lại → App
  App.jsx         trang khách
  components/     Admin*.jsx = quản trị; còn lại = trang khách
  utils/api.js    nơi DUY NHẤT gọi API
server/index.js   file cầu nối cũ cho Render (có thể xóa khi đổi Start Command)
docs/superpowers/specs/2026-09-15-trang-quan-tri-design.md   thiết kế trang quản trị
```

## Trang quản trị (menu ☰)

- **Công cụ:** Tổng quan · Ghi chú (thư mục, đính kèm file, sao lưu) · Khách hàng (thiết bị đã lắp,
  bảo hành, ảnh) · Chấm công (xuất Excel) · Cài đặt (tài khoản, dung lượng, sao lưu/khôi phục toàn bộ)
- **Trang chủ:** Thanh chữ chạy · Ảnh banner · Danh mục · Sản phẩm (+) · Nhật ký thi công (+) · Hậu trường thi công (ảnh/video)

## API (backend/index.js)

`/api/admin/*` đăng nhập · `/api/products` · `/api/projects` · `/api/settings` · `/api/danh-muc` ·
`/api/ghi-chu*` · `/api/cham-cong*` · `/api/khach-hang*` · `/api/giai-tri*` · `/api/sao-luu/*` ·
`/api/tai-len/chu-ky` + `/api/upload` (tải file) · `/api/anh/:id` · `/api/he-thong/dung-luong` · `/api/stats`.
Route ghi đều có middleware `canQuyen`.

## Quy ước (CONTRIBUTING.md)

- `main` được bảo vệ → làm trên nhánh `feat/…`, `fix/…`, `style/…`, `perf/…`, `chore/…` rồi merge.
- Commit: `type(scope): mô tả` (tiếng Anh hoặc tiếng Việt đều đã dùng).
- Tên biến/hàm trong code chủ yếu tiếng Việt không dấu (`docKhach`, `tuanTuChamCong`, `luiVe`...).
- Dữ liệu riêng (ghi chú, chấm công, khách hàng, tài khoản quản trị) **không đưa lên Git** (.gitignore).
