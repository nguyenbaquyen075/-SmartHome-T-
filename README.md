| `ADMIN_TAI_KHOAN` | Email hoặc số điện thoại để đăng nhập (mặc định tạm `0987654321`). Muốn dùng được **cả email lẫn số**, viết cả hai cách nhau dấu phẩy: `email@cuaanh.vn, 0987654321` |# ĐIỆN NƯỚC CAMERA

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

- **Service ngủ sau 15 phút** không có ai truy cập. Lần mở tiếp theo mất ~50 giây khởi động lại.
- Ổ đĩa của Render là tạm — xem mục **Dữ liệu không bị mất** ngay dưới đây để dữ liệu còn mãi.

---

## 💾 Dữ liệu không bị mất

Ổ đĩa của Render (gói Free) **bị xóa sạch mỗi lần deploy hoặc restart**. Vì vậy dữ liệu
được để ở hai nơi bên ngoài, cả hai đều miễn phí:

| Thứ | Để ở đâu | Biến môi trường |
|---|---|---|
| Chữ nghĩa: sản phẩm, công trình, cài đặt, chú thích | Kho dữ liệu Postgres (Neon) | `DATABASE_URL` |
| File: ảnh sản phẩm, ảnh banner, ảnh + **video** hậu trường | Kho file Neon (Object Storage), 5GB miễn phí | `NEON_S3_*` (4 biến) |

### Vì sao tách chữ nghĩa và file

File **không đi qua server mình**, nhờ vậy web không nặng và không chậm:

- **Lúc đăng:** server chỉ ký một "giấy phép" 15 phút, trình duyệt tải thẳng file lên kho.
  Video 50MB cũng không làm nghẽn server Render (chỉ có 512MB RAM).
- **Lúc khách xem:** ảnh/video tải thẳng từ kho về máy khách, server không phải gánh.
- Ảnh còn được **nén sẵn trên máy** trước khi tải lên (4MB → ~250KB).

### Lấy 4 biến `NEON_S3_*`

1. Neon → **Object storage** → **New bucket** → tên `cameratd`, mức truy cập **public_read**
2. Tạo credential có quyền `storage:read` + `storage:write` (console, hoặc `neon credentials create`).
   Khóa bí mật **chỉ hiện một lần**, copy ngay.
3. Render → **Settings → Environment**, thêm 4 dòng:

| Key | Value |
|---|---|
| `NEON_S3_ENDPOINT` | `https://br-....storage.c-2.us-east-2.aws.neon.tech` |
| `NEON_S3_BUCKET` | `cameratd` |
| `NEON_S3_KEY` | `nak_live_...` |
| `NEON_S3_SECRET` | `nsk_live_...` |

Server tự bật CORS cho bucket lúc khởi động, log ghi `[KHO FILE] Da bat kho file Neon`.

Mỗi file tải lên được gắn lệnh **nhớ 1 năm** (`Cache-Control: immutable`) — tên file có dấu thời gian
nên nội dung không bao giờ đổi. Khách xem lần hai không tải lại, đỡ được phần lớn lưu lượng.

> ⚠️ Gói Neon miễn phí cho **5GB lưu lượng/tháng** dùng chung cho cả kho dữ liệu và kho file.
> Ảnh nén ~300KB thì thoải mái, nhưng **video 50MB chỉ khoảng 100 lượt xem là hết**. Nên quay
> clip ngắn 10–20 giây, clip dài thì đưa lên YouTube (chế độ không công khai) rồi nhúng.

**Chưa đặt 4 biến này thì web vẫn chạy**, chỉ là lùi về cách cũ: ảnh cất trong bảng `anh` của
kho dữ liệu (phục vụ qua `/api/anh/<tên>`), còn **video nằm trên đĩa máy chủ và mất khi deploy**.

**Chưa đặt 2 biến này thì web vẫn chạy**, nhưng dữ liệu chỉ nằm trong máy chủ và sẽ mất khi
deploy lại. Trong log sẽ có dòng `[CANH BAO] Chua dat DATABASE_URL`.

### Lấy `DATABASE_URL` (kho dữ liệu Neon — miễn phí)

1. Vào [neon.com](https://neon.com) → **Sign up** bằng tài khoản Google/GitHub
2. Đặt tên dự án (ví dụ `cameratd`) → **Create project**
3. Trang hiện ra có ô **Connection string**, dạng
   `postgresql://...@....neon.tech/neondb?sslmode=require` → bấm **Copy**
4. Vào Render → dịch vụ của anh → **Settings → Environment → Add Environment Variable**
   - Key: `DATABASE_URL` — Value: dán chuỗi vừa copy → **Save**
5. Render tự deploy lại. Lần chạy đầu tiên, dữ liệu đang có trong `backend/data/*.json`
   được **tự chuyển lên kho** (log ghi `[KHO] Da chuyen "products" tu file len co so du lieu`).
   Từ đó về sau anh thêm sửa gì trong trang quản trị cũng còn nguyên.

> 🔒 Chuỗi `DATABASE_URL` có mật khẩu — chỉ dán vào ô Environment của Render, đừng để vào code
> hay gửi cho ai.

### Lấy `CLOUDINARY_URL` (kho ảnh — miễn phí)

Xem mục [Hậu trường thi công](#-hậu-trường-thi-công-ảnhvideo-giải-trí) bên dưới. Cùng một biến
đó lo luôn ảnh sản phẩm và ảnh banner.

### Muốn xem dữ liệu đang nằm ở đâu

Vào Neon → **Tables** → bảng `du_lieu`. Mỗi dòng là một mục: `products`, `projects`,
`settings`, `giai-tri`. Neon giữ lịch sử 24 giờ, lỡ tay xóa nhầm vẫn quay lại được
(**Restore** trong Neon).

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
| GET | `/api/giai-tri` | Ảnh/video Hậu trường thi công (lấy từ Cloudinary, cache 60 giây) |
| POST | `/api/giai-tri/chu-ky` | Cấp chữ ký để trình duyệt tải thẳng file lên Cloudinary (cần đăng nhập) |
| PUT | `/api/giai-tri` | Sửa chú thích, ngày, ghim (cần đăng nhập) |
| DELETE | `/api/giai-tri` | Xóa 1 ảnh/video (cần đăng nhập) |
| POST | `/api/giai-tri/tai-len` | Nhận file khi chạy chế độ lưu trên máy (cần đăng nhập) |

Đường dẫn `/api/...` không khớp route nào sẽ trả về lỗi 404 dạng JSON.

---

## 🔐 Trang quản trị

Trang quản trị nằm riêng ở **`/admin`** (ví dụ `http://localhost:5174/admin`). Bấm **Tài khoản**
trên web cũng dẫn tới đó. Chưa đăng nhập thì hiện trang đăng nhập, xong vào trang quản trị nền sáng
— bấm nút **☰ góc trái** để mở menu các mục của trang chủ (xếp đúng thứ tự từ trên xuống,
mục nào thêm được có nút **+**). Mỗi trang con có địa chỉ riêng sau dấu `#` (vd `/admin#/san-pham/moi`) nên bấm Back
hay tải lại trang vẫn đúng chỗ.

Code nằm trong `frontend/src/components/Admin*.jsx` + `frontend/src/admin.css`, chỉ tải khi vào `/admin`.

### Đặt tài khoản & mật khẩu

Đăng nhập cần **email hoặc số điện thoại** + **mật khẩu**. Cả hai đọc từ biến môi trường,
**không nằm trong code** nên không ai xem được qua GitHub.

| Biến | Nội dung |
|---|---|
| `ADMIN_TAI_KHOAN` | Email hoặc số điện thoại để đăng nhập (mặc định tạm `0987654321`). Muốn vào được bằng **cả email lẫn số**, viết cả hai cách nhau dấu phẩy: `email@cuaanh.vn, 0987654321` |
| `ADMIN_PASSWORD` | Mật khẩu (mặc định tạm `diennuoc@2026`) |

Đổi mật khẩu xong thì mọi phiên đăng nhập cũ hết hiệu lực ngay. Phiên đăng nhập sống 7 ngày
và **không mất khi server ngủ dậy hay deploy lại**. Sai mật khẩu 8 lần từ cùng một nơi thì
phải đợi 15 phút mới thử tiếp được.

| Nơi chạy | Cách đặt |
|---|---|
| Máy của anh | `ADMIN_TAI_KHOAN=email@cuaanh.vn ADMIN_PASSWORD=matkhaucuaanh npm run dev` |
| Render | **Settings → Environment → Add Environment Variable**: thêm cả 2 key |

Khi nhập, dấu cách và dấu chấm trong số điện thoại được bỏ qua, chữ hoa thường không tính,
nên gõ `0987 654 321` hay `0987.654.321` đều vào được.

> ⚠️ Chưa đặt thì hệ thống dùng mật khẩu tạm `diennuoc@2026` và in cảnh báo ra log.
> **Nhớ đặt biến này trên Render trước khi đưa web cho khách.**

### Làm được gì

| Menu | Nội dung |
|---|---|
| **Tổng quan** | Số sản phẩm theo danh mục, nút thêm nhanh, danh sách sản phẩm còn thiếu thông tin |
| **Sản phẩm** | Tìm, lọc theo danh mục; trang thêm/sửa 8 phần giống hệt trang chi tiết (ảnh, 4 ô nổi bật, giới thiệu, đặc điểm, thông số, hướng dẫn, bảo hành). Chọn danh mục là tự hiện khung thông số của loại đó |
| **Nhật ký thi công** | Thêm / sửa / xóa công trình, tải ảnh lên trực tiếp |
| **Giải trí** | Đăng nhiều ảnh/video một lượt, sửa, ghim, xóa (xem mục *Hậu trường thi công*) |
| **Banner & thanh chạy** | Sửa các dòng chữ chạy, thay ảnh banner trang chủ |

Ảnh tải lên lưu vào `frontend/public/images/tai-len/`. Nén ảnh dưới 400KB trước
khi tải để trang không bị chậm (tối đa 6MB).

Phiên đăng nhập lưu trong tab trình duyệt — đóng tab là phải đăng nhập lại.
Server khởi động lại cũng vậy.

---

## 🎬 Hậu trường thi công (ảnh/video giải trí)

Đi công trình thấy vui thì quay/chụp lại, vào **quản trị → tab Giải trí** để đăng.
Đăng lên là khách thấy ngay ở mục **Hậu trường thi công** trên trang chủ (chậm tối đa 1 phút).
Chưa có bài nào thì mục này tự ẩn.

Tab Giải trí làm được: kéo thả nhiều ảnh/video một lượt, ghi chú thích + ngày cho từng file,
xem trước rồi mới đăng; sửa chú thích/ngày, **ghim** bài lên đầu, lọc ảnh/video, xóa bài.

Có 2 chế độ lưu, server tự chọn theo biến môi trường (góc phải tab Giải trí có ghi đang dùng chế độ nào):

| Chế độ | Khi nào | File nằm ở đâu |
|---|---|---|
| **Cloudinary** | Có đặt `CLOUDINARY_URL` — **bắt buộc trên Render** | Tải thẳng từ điện thoại lên Cloudinary, deploy lại không mất |
| **Lưu trên máy** | Chưa đặt `CLOUDINARY_URL` | `backend/data/giai-tri.json` + `backend/data/giai-tri-file/` — chỉ để chạy thử, không đưa lên Git |

> ⚠️ Không đặt `CLOUDINARY_URL` trên Render thì web vẫn đăng được, nhưng **mỗi lần deploy là mất sạch bài**.

### Cài đặt 1 lần

1. Đăng ký miễn phí ở [cloudinary.com](https://cloudinary.com)
2. Vào **Dashboard** (hoặc *Settings → API Keys*), copy dòng **API environment variable**, dạng
   `cloudinary://123456789:abcXYZ@ten-cloud`
3. Đặt biến môi trường `CLOUDINARY_URL` bằng dòng đó:

| Nơi chạy | Cách đặt |
|---|---|
| Máy của anh | `CLOUDINARY_URL=cloudinary://... npm run dev` |
| Render | **Settings → Environment → Add Environment Variable**: key `CLOUDINARY_URL` |

> ⚠️ Dòng này chứa mã bí mật, **không dán vào code hay gửi qua chat**.

Giới hạn gói miễn phí: ảnh tối đa 10MB, video tối đa 100MB mỗi file.
Mỗi loại (ảnh, video) hiện tối đa 100 bài mới nhất.

> Đặt xong biến này thì **ảnh sản phẩm và ảnh banner** anh tải lên trong trang quản trị
> cũng tự lưu trên Cloudinary, deploy lại không mất.

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
