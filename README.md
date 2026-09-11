# ĐIỆN NƯỚC CAMERA

Website giới thiệu camera an ninh, thiết bị điện dân dụng, thiết bị nước và đèn chiếu sáng.

> Đây là web **trưng bày sản phẩm cho khách xem**, không bán hàng trực tuyến.
> Không có giỏ hàng, đặt hàng hay thanh toán. Khách xem sản phẩm rồi liên hệ qua
> hotline / Zalo ở đầu trang và chân trang.

---

## 📁 Cấu trúc dự án

Dự án chia làm 2 phần độc lập:

```
cameraTD/
├── frontend/            👉 GIAO DIỆN (React + Vite)
│   ├── public/images/       Ảnh sản phẩm, banner
│   ├── src/
│   │   ├── components/      Các khối giao diện (Navbar, ProductCard, Footer...)
│   │   │                     ProductsPage.jsx = trang danh sách sản phẩm có bộ lọc
│   │   │                     PromoTicker.jsx  = thanh chữ chạy trên banner
│   │   ├── utils/api.js     Nơi duy nhất gọi API xuống backend
│   │   ├── App.jsx          Khung trang chính
│   │   └── index.css        CSS chung + responsive cho điện thoại
│   └── package.json         Thư viện riêng của frontend
│
├── backend/             👉 API & DỮ LIỆU (Node.js + Express)
│   ├── index.js             Toàn bộ API + phục vụ bản build của frontend
│   ├── data/
│   │   ├── products.json    Danh sách sản phẩm
│   │   └── projects.json    Nhật ký thi công (các công trình đã làm)
│   └── package.json         Thư viện riêng của backend
│
├── server/index.js      ⚠️ File cầu nối tạm (xem mục Deploy) — không chứa code
├── start.js             Chạy cả 2 phần cùng lúc (dùng khi code)
├── render.yaml          Cấu hình deploy lên Render
└── package.json         Script chung
```

**Quy tắc phân chia:**

| | Frontend | Backend |
|---|---|---|
| Chịu trách nhiệm | Hiển thị, giao diện, tương tác | Dữ liệu, lưu trữ, xử lý đơn |
| Ngôn ngữ | React (JSX) | Node.js (CommonJS) |
| Cổng khi dev | `5174` | `5001` |
| Sửa giao diện, màu sắc, layout | ✅ sửa ở đây | ❌ |
| Thêm/sửa sản phẩm, công trình | ❌ | ✅ sửa ở đây |

Frontend **không bao giờ** gọi thẳng đến database. Mọi dữ liệu đi qua [frontend/src/utils/api.js](frontend/src/utils/api.js) → gọi `/api/...` → [backend/index.js](backend/index.js).

---

## 🚀 Cách chạy khi code

Cài thư viện lần đầu:

```bash
npm run install:all
```

Chạy cả frontend + backend cùng lúc:

```bash
npm run dev
```

Mở trình duyệt: **http://localhost:5174**

### 📱 Xem thử trên điện thoại khi đang code

Sau khi `npm run dev`, mở:

**http://localhost:5174/mobile.html**

Trang này dựng sẵn 3 khung máy cạnh nhau (iPhone SE 320px, iPhone 12 390px,
iPhone 14 Pro Max 430px) để vừa sửa code vừa thấy ngay kết quả — lưu file là
khung tự cập nhật. Có nút xoay ngang và tải lại.

> Chrome DevTools (`Cmd+Shift+M`) cũng giả lập điện thoại, lại chính xác hơn về
> cảm ứng và user agent. Trang này hơn ở chỗ xem được nhiều kích thước cùng lúc
> và để mở thường trực cạnh editor.

### Chạy riêng từng phần

Khi chỉ muốn sửa giao diện, hoặc chỉ muốn test API:

```bash
npm run dev:frontend    # chỉ giao diện  → cổng 5174
npm run dev:backend     # chỉ API        → cổng 5001
```

---

## 🌐 Deploy lên Render

Đã cấu hình sẵn trong [render.yaml](render.yaml). Chỉ cần:

1. Vào [render.com](https://render.com) → đăng nhập bằng GitHub
2. **New +** → **Web Service** → chọn repo này
3. Render tự đọc `render.yaml`. Nếu phải điền tay:
   - Build Command: `npm run build`
   - Start Command: `node backend/index.js` (hoặc `npm start`)
4. **Create Web Service** → đợi ~3-5 phút

> ⚠️ Nếu service đã tạo từ trước bằng nút *New → Web Service*, Render **không đọc** `render.yaml`.
> Muốn đổi lệnh chạy phải vào **Settings → Build & Deploy → Start Command** sửa tay.

### 🔗 Về file `server/index.js`

Service hiện tại trên Render được tạo từ lúc thư mục còn tên `server/`, nên Start Command của
nó vẫn là `node server/index.js`. Sau khi đổi tên thành `backend/`, lệnh đó chết → deploy fail.

[server/index.js](server/index.js) là **file cầu nối 1 dòng** để lệnh cũ vẫn chạy, không chứa
logic gì cả. Muốn dọn cho sạch:

1. Render → **Settings → Build & Deploy → Start Command** → đổi thành `npm start` → Save
2. Xóa thư mục `server/` đi

Chạy chung **1 service duy nhất**: Express vừa trả API, vừa phục vụ bản build của React. Nhờ vậy không cần cấu hình CORS hay biến môi trường nào cả.

### ⚠️ Lưu ý gói Free

- **Sửa sản phẩm trong trang quản trị sẽ mất khi deploy lại.** Dữ liệu lưu vào file JSON, mà ổ đĩa Render là tạm thời — mỗi lần deploy hoặc restart, file quay về trạng thái trong Git. Sửa lâu dài thì sửa thẳng file `backend/data/*.json` rồi push lên.
- **Service ngủ sau 15 phút** không có ai truy cập. Lần mở tiếp theo mất ~50 giây khởi động lại.

---

## 🔌 Danh sách API

| Method | Đường dẫn | Công dụng |
|---|---|---|
| GET | `/api/health` | Kiểm tra server sống |
| GET | `/api/products` | Danh sách sản phẩm (lọc theo `category`, `brand`, `search`...) |
| GET | `/api/products/:id` | Chi tiết 1 sản phẩm |
| POST | `/api/products` | Thêm sản phẩm |
| PUT | `/api/products/:id` | Sửa sản phẩm |
| DELETE | `/api/products/:id` | Xóa sản phẩm |
| GET | `/api/categories` | Danh sách danh mục |
| GET | `/api/brands` | Danh sách thương hiệu |
| GET | `/api/projects` | Nhật ký thi công (tự sắp xếp mới nhất trước) |
| GET | `/api/stats` | Số liệu tổng quan cho trang quản trị |

Đường dẫn `/api/...` không khớp route nào sẽ trả về lỗi 404 dạng JSON.

---

## 🔐 Trang quản trị

Bấm **Tài khoản** (thanh dưới trên điện thoại, góc phải trên máy tính) → nhập mật khẩu.

### Đặt mật khẩu

Mật khẩu đọc từ biến môi trường `ADMIN_PASSWORD`, **không nằm trong code** nên
không ai xem được qua GitHub.

| Nơi chạy | Cách đặt |
|---|---|
| Máy của anh | `ADMIN_PASSWORD=matkhaucuaanh npm run dev` |
| Render | **Settings → Environment → Add Environment Variable**: key `ADMIN_PASSWORD` |

> ⚠️ Chưa đặt thì hệ thống dùng mật khẩu tạm `diennuoc@2026` và in cảnh báo ra log.
> **Nhớ đặt biến này trên Render trước khi đưa web cho khách.**

### Làm được gì

| Tab | Nội dung |
|---|---|
| **Sản phẩm** | Thêm / sửa / xóa sản phẩm, xem tồn kho |
| **Nhật ký thi công** | Thêm / sửa / xóa công trình, tải ảnh lên trực tiếp |
| **Banner & thanh chạy** | Sửa các dòng chữ chạy, thay ảnh banner trang chủ |

Ảnh tải lên lưu vào `frontend/public/images/tai-len/`. Nén ảnh dưới 400KB trước
khi tải để trang không bị chậm (tối đa 6MB).

Phiên đăng nhập lưu trong tab trình duyệt — đóng tab là phải đăng nhập lại.
Server khởi động lại cũng vậy.

---

## 🏗️ Thêm công trình vào Nhật ký thi công

> Cách nhanh nhất là dùng **trang quản trị** (xem mục trên). Phần dưới đây dành cho
> khi anh muốn sửa thẳng file.

Mở [backend/data/projects.json](backend/data/projects.json), thêm một khối như sau vào danh sách:

```json
{
  "id": "ct-2026-09",
  "title": "Lắp đặt hệ thống 6 camera cho kho hàng",
  "address": "Số 10 Lê Lợi, P. Bến Nghé, Quận 1, TP.HCM",
  "customerType": "Kho hàng 300m²",
  "startDate": "2026-09-05",
  "durationDays": 3,
  "status": "Hoàn thành",
  "image": "/images/cong-trinh/kho-le-loi.jpg"
}
```

| Trường | Ý nghĩa | Bắt buộc |
|---|---|---|
| `id` | Mã riêng, không trùng công trình khác | ✅ |
| `title` | Lắp đặt gì — hiện làm tiêu đề thẻ | ✅ |
| `address` | Địa chỉ công trình | ✅ |
| `startDate` | Ngày khởi công, dạng `NĂM-THÁNG-NGÀY` | ✅ |
| `image` | Đường dẫn ảnh trong `frontend/public/images/` | ✅ |
| `status` | Chữ trên nhãn xanh (VD: `Hoàn thành`, `Đang thi công`) | ✅ |
| `customerType` | Loại công trình (nhà phố, nhà xưởng...) | không |
| `durationDays` | Thi công mấy ngày | không |

Lưu file là xong, **không cần build lại** — chỉ cần tải lại trang. Danh sách tự sắp xếp
công trình mới nhất lên đầu theo `startDate`.

> ⚠️ Ảnh 6 công trình hiện tại là **ảnh minh hoạ lấy tạm** từ kho ảnh có sẵn của dự án.
> Anh thay bằng ảnh chụp thực tế: bỏ ảnh vào `frontend/public/images/cong-trinh/`,
> nén trước theo hướng dẫn mục dưới, rồi sửa `image` trong `projects.json`.

---

## 🏷️ Thay logo trên header

Có 2 file logo trong `frontend/public/images/`:

| File | Dùng ở đâu | Nội dung |
|---|---|---|
| `logoTD.png` | Header | **Chỉ phần hình** (nhà + TĐ + phích cắm), 132×63px |
| `logoTD-full.png` | Chưa dùng | Bản đầy đủ có chữ, 400×400px — để dành cho footer |

Header chỉ dùng phần hình vì bên cạnh đã có chữ "ĐIỆN NƯỚC CAMERA" rồi — để thêm
chữ trong logo nữa thì rối, mà thu nhỏ còn 38px thì cũng không đọc được.

Thay logo mới: ghi đè `logoTD.png`, **không cần sửa code**. Nhớ nén trước
(xem mục *Lưu ý về ảnh*). Chưa có file thì header tự hiện biểu tượng dự phòng,
trang không bị vỡ.

---

## 📢 Sửa nội dung thanh chạy trên banner

Sửa trong **trang quản trị** → tab *Banner & thanh chạy* (cách khuyên dùng).

Hoặc sửa thẳng danh sách mặc định trong
[frontend/src/components/PromoTicker.jsx](frontend/src/components/PromoTicker.jsx):

```js
const MESSAGES = [
  '🔧 LẮP ĐẶT TẬN NƠI - MIỄN PHÍ KHẢO SÁT & TƯ VẤN',
  '📞 HOTLINE 24/7: 0987 654 321 - ZALO: 0368.338.988',
  // thêm dòng mới ở đây
];
```

Thêm bớt bao nhiêu dòng cũng được, thanh tự chạy vòng cho khớp. Muốn chạy nhanh/chậm
hơn thì sửa `38s` trong `.ticker-track` ở [index.css](frontend/src/index.css)
(số càng lớn càng chậm). Rê chuột vào thanh là nó dừng để đọc.

---

## 🖼️ Lưu ý về ảnh

Ảnh đặt trong `frontend/public/images/`, gọi trong code bằng đường dẫn `/images/tên-file.jpg`.

Trước khi thêm ảnh mới, **nén lại** để trang không bị chậm (macOS có sẵn `sips`, không cần cài gì):

```bash
sips -Z 900 -s formatOptions 75 anh-moi.jpg
```

- `-Z 900` — thu chiều lớn nhất về 900px (ảnh sản phẩm hiển thị tối đa ~600px, không cần to hơn)
- `-s formatOptions 75` — nén chất lượng 75, mắt thường không thấy khác

Ảnh chụp thì luôn dùng `.jpg`, đừng dùng `.png` — cùng một tấm banner, PNG nặng gấp 4 lần JPG.
