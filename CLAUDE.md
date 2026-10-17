# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Làm việc với anh (chủ dự án)

- Trả lời bằng tiếng Việt. Làm luôn, không hỏi lại những việc nhỏ.
- **Không commit/push khi anh chưa bảo** — anh test trên máy trước. Khi được bảo: tạo nhánh `type/mo-ta`
  (`feat/`, `fix/`, `style/`, `perf/`, `chore/`, `docs/`), commit `type(scope): mô tả`, merge vào `main` (xem `CONTRIBUTING.md`).
- Bối cảnh và việc đang dở nằm trong `claude-sessions/`: đầu phiên đọc `TONG-QUAN.md`, `DANG-LAM.md` và nhật ký
  `YYYY-MM-DD.md` mới nhất. Sau mỗi thay đổi đáng kể, ghi tiếp vào nhật ký hôm nay và cập nhật `DANG-LAM.md`.

## Lệnh

```bash
npm run install:all      # cài backend + frontend
npm run dev              # cả hai: backend :5001, frontend :5174 (Vite proxy /api → 5001)
npm run dev:frontend     # chỉ giao diện
npm run dev:backend      # chỉ API
npm run build            # bản build Render: cài sạch rồi vite build → frontend/dist
npm --prefix frontend run lint     # oxlint
node backend/kho.test.js           # test kho dữ liệu chế độ file (phải KHÔNG đặt DATABASE_URL)
npm --prefix frontend run thu:menu # cần `npm run dev` đang chạy: Chrome headless bấm từng mục menu quản trị + Back
```

Xem thử nhiều cỡ điện thoại cùng lúc: `http://localhost:5174/mobile.html` (3 khung iframe 320/390/430px).
Chụp màn hình kiểm tra bằng Chrome headless lên trang này, vì headless ở cửa sổ hẹp tự nới viewport, chụp sai bố cục điện thoại.

## Kiến trúc

Web **trưng bày** (không giỏ hàng/thanh toán) + trang **quản trị nội bộ** tại `/admin`. Deploy 1 service Render
gói Free: `backend/index.js` vừa trả `/api/*` vừa phục vụ `frontend/dist` (route cuối `/{*path}` trả `index.html`).
`server/index.js` chỉ là cầu nối cho Start Command cũ trên Render, không có logic.

**Backend** (Express 5, CommonJS, gần như mọi route nằm trong `backend/index.js`):
- `kho.js` — lớp lưu dữ liệu. Có `DATABASE_URL` thì dùng Postgres với **một bảng** `du_lieu(ten, noi_dung jsonb)`,
  mỗi "kho" (`products`, `projects`, `settings`, `danh-muc`, `ghi-chu`, `cham-cong`, `khach-hang`, …) là một dòng;
  toàn bộ được đọc vào bộ nhớ lúc khởi động, route đọc từ bộ nhớ (`kho.doc`) và ghi qua `kho.ghi`.
  Không có biến thì lùi về file `backend/data/<ten>.json` (ghi file tạm rồi đổi tên). Ổ đĩa Render mất mỗi lần deploy.
- `khoFile.js` + `kyS3.js` — kho file công khai Neon Object Storage (`NEON_S3_*`). Server chỉ ký URL tải lên
  (`/api/tai-len/chu-ky`), trình duyệt tải thẳng file lên bucket; ảnh được nén trên máy trước khi tải. Chưa cấu hình
  thì ảnh lưu vào bảng ảnh của `kho.js` (phục vụ qua `/api/anh/:id`), video lưu đĩa.
- `khoRiengTu.js` — bucket riêng tư cho ảnh khách hàng (`NEON_S3_RT_*`), chỉ đọc qua route có quyền.
- `zipTinh.js` / `xlsxTinh.js` — tự viết định dạng zip (sao lưu/khôi phục toàn bộ) và xlsx (xuất chấm công), không dùng thư viện.
- Xác thực: token ký HMAC có hạn 7 ngày (`phienHopLe`), middleware `canQuyen` cho mọi route ghi; khóa tạm sau nhiều lần sai.
  Tài khoản từ `ADMIN_TAI_KHOAN` / `ADMIN_PASSWORD` hoặc đổi trong trang Cài đặt (kho `quan-tri`).
- Kho dễ bị ghi đồng thời (chấm công, khách hàng) chạy tuần tự qua hàng đợi promise `tuanTuChamCong` / `tuanTuKhach`.

**Frontend** (React 19 + Vite, không router, không thư viện state):
- `main.jsx`: đường dẫn `/admin` → `AdminApp` (tải lười, kèm `admin.css`); còn lại → `App`.
- `App.jsx` (trang khách) tự điều hướng bằng `history.pushState` với `state.v` = `home | products | detail`
  (+ `n` đếm bước để nút Back biết về trang chủ hay lùi lịch sử, `y` nhớ vị trí cuộn). `ProductDetailPage`,
  `ProductsPage`, `ComparisonModal` tải lười.
- **Nút Back trong quản trị** (`utils/luiVe.js`): mỗi màn mở (menu ☰, form, ảnh phóng to) thêm 1 mục lịch sử `qtLop`,
  đóng màn thì tự `history.back()`. Vì vậy **không được** để link/code tự đặt `location.hash` khi một màn đang mở —
  lệnh lùi sẽ chạy sau và kéo về trang cũ (lỗi "bấm mục menu không vào được"). Chuyển trang luôn qua `chuyenTrang()` /
  `diToi`; link `<a href="#/...">` đã được `useLinkQuanTri()` bắt tự động. Sửa gì ở đây thì chạy `thu:menu`.
- `AdminApp.jsx` điều hướng bằng hash (`#/san-pham/moi`, `#/san-pham/<id>`, …); menu ☰ khai báo trong mảng ở đầu file,
  mỗi mục ứng với một component `Admin*.jsx`.
- **Mọi lời gọi API đi qua `frontend/src/utils/api.js`**; token quản trị giữ trong `sessionStorage`.
- Danh mục sản phẩm do quản trị quyết định (`/api/danh-muc`, hook `useDanhMuc` trong `utils/danhMuc.jsx`);
  mẫu thông số/nổi bật/hướng dẫn theo danh mục ở `utils/sanPham.jsx`.
- CSS: `index.css` (trang khách, breakpoint chính 768px/900px) và `admin.css`; nhiều chỗ dùng style inline.

Thiết kế trang quản trị và các trường dữ liệu sản phẩm: `docs/superpowers/specs/2026-09-15-trang-quan-tri-design.md`.

## Quy ước

- Tên biến/hàm/file mới bằng tiếng Việt không dấu theo kiểu sẵn có (`docKhach`, `luiVe`, `DichVu.jsx`); chú thích tiếng Việt.
- Dữ liệu riêng (`ghi-chu*`, `cham-cong`, `khach-hang`, `quan-tri`, `giai-tri*` trong `backend/data/`) bị git-ignore — không đưa lên Git.
- `backend/data/products.json` là dữ liệu chạy thử; sửa trong trang quản trị ở máy sẽ làm file này đổi — đừng commit nhầm.
