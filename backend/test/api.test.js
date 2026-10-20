// Kiểm tra toàn bộ API ở chế độ lưu file: npm --prefix backend test
// Chép backend sang thư mục tạm rồi chạy server ở đó, nên dữ liệu thật trong backend/data không bị đụng tới.
// Mỗi nhóm route có ít nhất: đọc, tạo, sửa, xoá, lỗi dữ liệu sai, lỗi chưa đăng nhập.
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const GOC = path.join(__dirname, '..');
const TAM = fs.mkdtempSync(path.join(os.tmpdir(), 'cameratd-api-'));
const BE = path.join(TAM, 'backend');
const PORT = 5600 + Math.floor(Math.random() * 300);
const API = `http://127.0.0.1:${PORT}/api`;
let may;
let token;

// Bỏ mọi biến môi trường trỏ ra dịch vụ thật: bài thử luôn chạy chế độ file trên máy
const MOI_TRUONG = Object.fromEntries(Object.entries(process.env).filter(([k]) =>
  !/^(DATABASE_URL|NEON_S3|CLOUDINARY_URL|ADMIN_|RENDER_EXTERNAL_URL)/.test(k)));

before(async () => {
  fs.cpSync(GOC, BE, {
    recursive: true,
    filter: (src) => !src.includes(`${path.sep}node_modules`) && !src.includes(`${path.sep}test${path.sep}`)
  });
  fs.symlinkSync(path.join(GOC, 'node_modules'), path.join(BE, 'node_modules'), 'dir');
  // Dữ liệu riêng (ghi chú, khách hàng...) trên máy anh không được lọt vào bài thử
  for (const f of ['ghi-chu.json', 'ghi-chu-thu-muc.json', 'cham-cong.json', 'khach-hang.json', 'quan-tri.json', 'giai-tri.json', 'danh-muc.json']) {
    fs.rmSync(path.join(BE, 'data', f), { force: true });
  }
  for (const d of ['ghi-chu-file', 'giai-tri-file']) fs.rmSync(path.join(BE, 'data', d), { recursive: true, force: true });

  may = spawn(process.execPath, ['index.js'], { cwd: BE, env: { ...MOI_TRUONG, PORT: String(PORT) }, stdio: ['ignore', 'pipe', 'pipe'] });
  let log = '';
  may.stdout.on('data', (d) => { log += d; });
  may.stderr.on('data', (d) => { log += d; });
  for (let i = 0; i < 100; i++) {
    try { if ((await fetch(`${API}/health`)).ok) return; } catch { /* chưa lên */ }
    await new Promise((r) => setTimeout(r, 100));
  }
  throw new Error(`Server không chạy được:\n${log}`);
});

after(() => {
  may?.kill();
  fs.rmSync(TAM, { recursive: true, force: true });
});

const goi = async (duong, { method = 'GET', body, raw, headers = {}, auth = true } = {}) => {
  const h = { ...headers };
  if (auth && token) h.Authorization = `Bearer ${token}`;
  if (body !== undefined) h['Content-Type'] = 'application/json';
  const res = await fetch(API + duong, { method, headers: h, body: raw ?? (body !== undefined ? JSON.stringify(body) : undefined) });
  const kieu = res.headers.get('content-type') || '';
  const data = kieu.includes('json') ? await res.json() : Buffer.from(await res.arrayBuffer());
  return { status: res.status, data, headers: res.headers };
};

test('công khai: health, danh mục, sản phẩm, cài đặt, công trình', async () => {
  const h = await goi('/health');
  assert.equal(h.status, 200);
  assert.equal(h.data.status, 'ok');

  const dm = await goi('/danh-muc');
  assert.equal(dm.status, 200);
  assert.deepEqual(dm.data.map((d) => d.ten), ['Thiết bị mạng', 'Thiết bị điện', 'Thiết bị nước']);
  assert.deepEqual((await goi('/categories')).data, ['Tất cả', 'Thiết bị mạng', 'Thiết bị điện', 'Thiết bị nước']);

  const sp = await goi('/products');
  assert.equal(sp.status, 200);
  assert.ok(Array.isArray(sp.data) && sp.data.length > 0);
  const motSp = sp.data[0];
  assert.equal((await goi(`/products/${motSp.id}`)).data.id, motSp.id);
  assert.equal((await goi('/products/khong-co')).status, 404);
  const loc = await goi(`/products?category=${encodeURIComponent(motSp.category)}`);
  assert.ok(loc.data.every((p) => p.category === motSp.category));
  const tim = await goi(`/products?search=${encodeURIComponent(motSp.name.slice(0, 5))}`);
  assert.ok(tim.data.some((p) => p.id === motSp.id));
  assert.equal((await goi('/brands')).data[0], 'Tất cả');
  assert.equal(typeof (await goi('/stats')).data.totalProducts, 'number');

  const cd = await goi('/settings');
  assert.equal(cd.status, 200);
  assert.ok(Array.isArray(cd.data.ticker));
  assert.equal(typeof cd.data.lienHe.zalo, 'string');

  assert.ok(Array.isArray((await goi('/projects')).data));
  assert.ok(Array.isArray((await goi('/giai-tri')).data));
});

test('API không tồn tại trả 404 JSON, không rơi vào trang web', async () => {
  const r = await goi('/khong-co-duong-nay');
  assert.equal(r.status, 404);
  assert.match(r.data.error, /Không tìm thấy API/);
});

test('dữ liệu gửi lên hỏng thì báo lỗi JSON, không phải trang lỗi HTML', async () => {
  const r = await goi('/admin/login', { method: 'POST', raw: '{hong', headers: { 'Content-Type': 'application/json' }, auth: false });
  assert.equal(r.status, 400);
  assert.match(r.data.error, /định dạng/);
});

test('chưa đăng nhập thì mọi route quản trị bị chặn', async () => {
  for (const [method, duong] of [['GET', '/ghi-chu'], ['GET', '/khach-hang'], ['GET', '/cham-cong'], ['POST', '/products'],
    ['PUT', '/settings'], ['GET', '/sao-luu/thong-tin'], ['GET', '/admin/check'], ['GET', '/he-thong/dung-luong']]) {
    const r = await goi(duong, { method, auth: false, body: method === 'GET' ? undefined : {} });
    assert.equal(r.status, 401, `${method} ${duong}`);
  }
});

test('đăng nhập: sai thì 401, đúng thì có token', async () => {
  assert.equal((await goi('/admin/login', { method: 'POST', body: { taiKhoan: '0987654321', password: 'sai' }, auth: false })).status, 401);
  const r = await goi('/admin/login', { method: 'POST', body: { taiKhoan: '0987.654.321', password: 'diennuoc@2026' }, auth: false });
  assert.equal(r.status, 200);
  token = r.data.token;
  assert.match(token, /^\d+\.[a-f0-9]{64}$/);
  assert.equal((await goi('/admin/check')).status, 200);
  assert.equal((await goi('/admin/check', { headers: { Authorization: 'Bearer 1.abc' }, auth: false })).status, 401);
  const tk = await goi('/admin/tai-khoan');
  assert.equal(tk.data.taiKhoan, '0987654321');
  assert.equal(tk.data.kho.duLieu, 'file');
});

test('sản phẩm: thêm, sửa (giá dự tính), xoá, báo lỗi dữ liệu thiếu', async () => {
  assert.equal((await goi('/products', { method: 'POST', body: { name: 'thiếu' } })).status, 400);
  const sai = await goi('/products', { method: 'POST', body: { name: 'A', brand: 'B', category: 'Không có', images: ['/x.jpg'] } });
  assert.equal(sai.status, 400);
  assert.match(sai.data.error, /Danh mục/);

  const moi = await goi('/products', { method: 'POST', body: {
    name: '  Camera thử  ', brand: 'TD', category: 'Thiết bị mạng', images: ['/a.jpg', '/b.jpg'],
    giaDuTinh: { tu: '1.200.000', den: 850000, ghiChu: 'gồm lắp đặt' }, laLa: 'bị bỏ'
  } });
  assert.equal(moi.status, 201);
  assert.equal(moi.data.name, 'Camera thử');
  assert.equal(moi.data.image, '/a.jpg');
  assert.deepEqual(moi.data.giaDuTinh, { tu: 850000, den: 1200000, ghiChu: 'gồm lắp đặt' });
  assert.equal(moi.data.laLa, undefined);

  const sua = await goi(`/products/${moi.data.id}`, { method: 'PUT', body: { ...moi.data, name: 'Camera sửa' } });
  assert.equal(sua.status, 200);
  assert.equal(sua.data.name, 'Camera sửa');
  assert.equal((await goi('/products/khong-co', { method: 'PUT', body: moi.data })).status, 404);

  assert.equal((await goi(`/products/${moi.data.id}`, { method: 'DELETE' })).status, 200);
  assert.equal((await goi(`/products/${moi.data.id}`, { method: 'DELETE' })).status, 404);
});

test('tìm/lọc sản phẩm không hỏng khi có sản phẩm thiếu thương hiệu, tên hay danh mục', async () => {
  // Dữ liệu cũ nhập tay có thể thiếu trường: chèn thẳng vào file kho rồi khởi động lại không được,
  // nên dùng bản khôi phục: lấy dữ liệu hiện tại, thêm 1 sản phẩm thiếu trường, khôi phục vào
  const zip = await goi('/sao-luu/toan-bo');
  const { docZip, taoZip } = require(path.join(GOC, 'src', 'lib', 'zipTinh'));
  const muc = docZip(zip.data);
  const sp = muc.find((m) => m.ten === 'du-lieu/products.json');
  sp.duLieu = Buffer.from(JSON.stringify([...JSON.parse(sp.duLieu), { id: 'sp-thieu', image: '/x.jpg', price: 1 }]));
  assert.equal((await goi('/sao-luu/khoi-phuc', { method: 'POST', raw: taoZip(muc) })).status, 200);

  for (const q of ['search=cam', 'brand=TD', 'category=Thiết bị mạng', 'sensor=cmos', 'sort=name-asc']) {
    const r = await goi(`/products?${q.replace(/ /g, '%20')}`);
    assert.equal(r.status, 200, q);
  }
  const hang = (await goi('/brands')).data;
  assert.ok(!hang.includes(null) && !hang.includes(undefined) && !hang.includes(''), 'danh sách hãng không có ô trống');

  assert.equal((await goi('/sao-luu/hoan-tac', { method: 'POST' })).status, 200);
  assert.equal((await goi('/products/sp-thieu')).status, 404);
});

test('danh mục: thêm, đổi tên kéo theo sản phẩm, không xoá được khi còn hàng', async () => {
  assert.equal((await goi('/danh-muc', { method: 'POST', body: { ten: 'Tất cả' } })).status, 400);
  assert.equal((await goi('/danh-muc', { method: 'POST', body: { ten: 'thiết bị mạng' } })).status, 400);
  const dm = await goi('/danh-muc', { method: 'POST', body: { ten: 'Đèn thử', icon: 'sun', loai: ['A', 'a', 'B'] } });
  assert.equal(dm.status, 201);
  assert.deepEqual(dm.data.loai, ['A', 'B']);

  const sp = await goi('/products', { method: 'POST', body: { name: 'Đèn', brand: 'TD', category: 'Đèn thử', images: ['/d.jpg'] } });
  const doi = await goi(`/danh-muc/${dm.data.id}`, { method: 'PUT', body: { ten: 'Đèn mới', icon: 'sun' } });
  assert.equal(doi.status, 200);
  assert.equal((await goi(`/products/${sp.data.id}`)).data.category, 'Đèn mới');
  assert.equal((await goi(`/danh-muc/${dm.data.id}`, { method: 'DELETE' })).status, 409);
  await goi(`/products/${sp.data.id}`, { method: 'DELETE' });
  assert.equal((await goi(`/danh-muc/${dm.data.id}`, { method: 'DELETE' })).status, 200);
});

test('cài đặt: lưu số liên hệ chỉ giữ chữ số, lưu thanh chạy không mất số', async () => {
  const r = await goi('/settings', { method: 'PUT', body: { lienHe: { dienThoai: '0912 345.678', zalo: 'zalo 0368' } } });
  assert.deepEqual(r.data.lienHe, { dienThoai: '0912345678', zalo: '0368' });
  const r2 = await goi('/settings', { method: 'PUT', body: { ticker: ['a', ' ', 'b'] } });
  assert.deepEqual(r2.data.ticker, ['a', 'b']);
  assert.deepEqual(r2.data.lienHe, { dienThoai: '0912345678', zalo: '0368' });
});

test('công trình: thêm, sửa, xoá', async () => {
  const ct = await goi('/projects', { method: 'POST', body: { title: 'Nhà A', startDate: '2026-01-02' } });
  assert.equal(ct.status, 201);
  assert.equal(ct.data.status, 'Hoàn thành');
  assert.equal((await goi(`/projects/${ct.data.id}`, { method: 'PUT', body: { title: 'Nhà B' } })).data.title, 'Nhà B');
  assert.equal((await goi(`/projects/${ct.data.id}`, { method: 'DELETE' })).status, 200);
  assert.equal((await goi(`/projects/${ct.data.id}`, { method: 'DELETE' })).status, 404);
});

test('tải ảnh: chế độ máy trả cách server, ảnh base64 lưu ra file', async () => {
  assert.deepEqual((await goi('/tai-len/chu-ky', { method: 'POST', body: { kieu: 'image/png' } })).data, { cach: 'server' });
  assert.equal((await goi('/upload', { method: 'POST', body: { data: 'data:text/plain;base64,QQ==' } })).status, 400);
  const png = 'data:image/png;base64,' + Buffer.from('PNGTHU').toString('base64');
  const up = await goi('/upload', { method: 'POST', body: { data: png, name: 'Ảnh Thử' } });
  assert.equal(up.status, 200);
  assert.match(up.data.url, /^\/images\/tai-len\/-nh-th--\d+\.png$|^\/images\/tai-len\/[a-z0-9-]+-\d+\.png$/);
  assert.equal((await goi('/anh/gc-tep-1')).status, 404);
});

test('ghi chú: thư mục, ghi chú, tệp đính kèm, sao lưu', async () => {
  const tm = await goi('/ghi-chu-thu-muc', { method: 'POST', body: { ten: 'Việc' } });
  assert.equal(tm.status, 201);
  assert.equal((await goi('/ghi-chu-thu-muc', { method: 'POST', body: { ten: 'việc' } })).status, 400);
  const gc = await goi('/ghi-chu', { method: 'POST', body: { tieuDe: 'Mua dây', noiDung: 'abc', thuMuc: tm.data.id } });
  assert.equal(gc.status, 201);
  assert.equal(gc.data.thuMuc, tm.data.id);

  assert.equal((await goi(`/ghi-chu/${gc.data.id}/dinh-kem?ten=x.exe`, { method: 'POST', raw: Buffer.from('a') })).status, 400);
  const tep = await goi(`/ghi-chu/${gc.data.id}/dinh-kem?ten=bao-gia.txt`, { method: 'POST', raw: Buffer.from('noi dung tep') });
  assert.equal(tep.status, 201);
  const tai = await goi(`/ghi-chu/dinh-kem/${tep.data.id}?xem=1`);
  assert.equal(tai.status, 200);
  assert.equal(tai.data.toString(), 'noi dung tep');
  assert.match(tai.headers.get('content-type'), /text\/plain/);

  const zip = await goi('/ghi-chu-sao-luu');
  assert.equal(zip.status, 200);
  assert.equal(zip.headers.get('content-type'), 'application/zip');

  assert.equal((await goi(`/ghi-chu/${gc.data.id}`, { method: 'PUT', body: { tieuDe: 'Mua ống' } })).data.tieuDe, 'Mua ống');
  assert.equal((await goi(`/ghi-chu-thu-muc/${tm.data.id}`, { method: 'DELETE' })).status, 200);
  assert.equal((await goi('/ghi-chu')).data.find((g) => g.id === gc.data.id).thuMuc, '');
  assert.equal((await goi(`/ghi-chu/${gc.data.id}/dinh-kem/${tep.data.id}`, { method: 'DELETE' })).status, 200);
  assert.equal((await goi(`/ghi-chu/${gc.data.id}`, { method: 'DELETE' })).status, 200);
  assert.equal((await goi(`/ghi-chu/${gc.data.id}`, { method: 'DELETE' })).status, 404);
});

test('chấm công: nhân viên, lưu công, không chấm trước ngày, xuất Excel', async () => {
  const nv = await goi('/cham-cong/nhan-vien', { method: 'POST', body: { ten: 'Anh Thợ', chucVu: 'Thợ điện' } });
  assert.equal(nv.status, 201);
  assert.equal((await goi('/cham-cong/nhan-vien', { method: 'POST', body: {} })).status, 400);
  const tuongLai = await goi('/cham-cong/luu', { method: 'PUT', body: { thayDoi: [{ nhanVienId: nv.data.id, ngay: '2099-01-01', gia: 1 }] } });
  assert.equal(tuongLai.status, 400);
  assert.equal((await goi('/cham-cong/luu', { method: 'PUT', body: { thayDoi: [{ nhanVienId: nv.data.id, ngay: '2026-02-30', gia: 1 }] } })).status, 400);
  const luu = await goi('/cham-cong/luu', { method: 'PUT', body: { thayDoi: [
    { nhanVienId: nv.data.id, ngay: '2026-01-05', gia: 1, chuThich: 'đi sớm' },
    { nhanVienId: nv.data.id, ngay: '2026-01-06', gia: 0.5 }
  ] } });
  assert.equal(luu.status, 200);
  const cc = (await goi('/cham-cong')).data;
  assert.deepEqual(cc.cong[nv.data.id], { '2026-01-05': 1, '2026-01-06': 0.5 });
  assert.equal(cc.chuThich[nv.data.id]['2026-01-05'], 'đi sớm');
  const xlsx = await goi('/cham-cong/xuat?thang=2026-01');
  assert.equal(xlsx.status, 200);
  assert.match(xlsx.headers.get('content-type'), /spreadsheetml/);
  assert.equal((await goi('/cham-cong/xuat?thang=2026-13')).status, 400);
  assert.equal((await goi(`/cham-cong/nhan-vien/${nv.data.id}`, { method: 'PUT', body: { ten: 'Anh Thợ Cả' } })).data.ten, 'Anh Thợ Cả');
  assert.equal((await goi(`/cham-cong/nhan-vien/${nv.data.id}`, { method: 'DELETE' })).status, 200);
});

test('khách hàng: khách, thiết bị, ảnh thiết bị riêng tư', async () => {
  assert.equal((await goi('/khach-hang', { method: 'POST', body: {} })).status, 400);
  const kh = await goi('/khach-hang', { method: 'POST', body: { ten: 'Chị Lan', sdt: '0901' } });
  assert.equal(kh.status, 201);
  assert.equal((await goi(`/khach-hang/${kh.data.id}/thiet-bi`, { method: 'POST', body: { ten: 'Camera' } })).status, 400);
  const tb = await goi(`/khach-hang/${kh.data.id}/thiet-bi`, { method: 'POST', body: { ten: 'Camera', ngayLapDat: '2026-03-01', baoHanhThang: 999 } });
  assert.equal(tb.status, 201);
  assert.equal(tb.data.baoHanhThang, 120);

  const anh = await goi(`/khach-hang/${kh.data.id}/thiet-bi/${tb.data.id}/anh?ten=tem.jpg`, { method: 'POST', raw: Buffer.from('JPEGTHU') });
  assert.equal(anh.status, 201);
  assert.equal(anh.data.kho, 'db');
  const xem = await goi(`/khach-hang/anh/${anh.data.id}`);
  assert.equal(xem.status, 200);
  assert.equal(xem.data.toString(), 'JPEGTHU');
  assert.equal((await goi(`/khach-hang/anh/${anh.data.id}`, { auth: false })).status, 401);
  assert.equal((await goi(`/anh/${anh.data.id}`)).status, 404, 'ảnh khách không lộ qua đường ảnh công khai');

  assert.equal((await goi(`/khach-hang/${kh.data.id}/thiet-bi/${tb.data.id}`, { method: 'PUT', body: { ten: 'Camera 2', ngayLapDat: '2026-03-02' } })).data.ten, 'Camera 2');
  assert.equal((await goi(`/khach-hang/${kh.data.id}/thiet-bi/${tb.data.id}/anh/${anh.data.id}`, { method: 'DELETE' })).status, 200);
  assert.equal((await goi(`/khach-hang/${kh.data.id}/thiet-bi/${tb.data.id}`, { method: 'DELETE' })).status, 200);
  assert.equal((await goi(`/khach-hang/${kh.data.id}`, { method: 'PUT', body: { ten: 'Chị Lan Anh' } })).data.ten, 'Chị Lan Anh');
  assert.equal((await goi(`/khach-hang/${kh.data.id}`, { method: 'DELETE' })).status, 200);
});

test('giải trí (chế độ máy): đăng ảnh, sửa, xoá', async () => {
  assert.equal((await goi('/giai-tri/che-do')).data.cheDo, 'may');
  assert.deepEqual((await goi('/giai-tri/chu-ky', { method: 'POST', body: {} })).data, { uploadUrl: '/api/giai-tri/tai-len' });
  assert.equal((await goi('/giai-tri/tai-len', { method: 'POST', raw: Buffer.from('x'), headers: { 'X-Ten-File': 'a.svg' } })).status, 400);
  const bai = await goi('/giai-tri/tai-len', { method: 'POST', raw: Buffer.from('GIF89a'), headers: {
    'X-Ten-File': 'vui.gif', 'X-Bai': encodeURIComponent(JSON.stringify({ chuThich: 'Hậu trường', ngay: '2026-04-01' }))
  } });
  assert.equal(bai.status, 201);
  assert.equal(bai.data.chuThich, 'Hậu trường');
  const file = await fetch(`http://127.0.0.1:${PORT}${bai.data.url}`);
  assert.equal(file.status, 200);
  assert.equal((await goi('/giai-tri', { method: 'PUT', body: { id: bai.data.id, loai: 'image', chuThich: 'Sửa', ngay: '2026-04-02', ghim: true } })).data.ghim, true);
  assert.equal((await goi('/giai-tri', { method: 'PUT', body: { id: '../x', loai: 'image' } })).status, 400);
  assert.equal((await goi('/giai-tri', { method: 'DELETE', body: { id: bai.data.id, loai: 'image' } })).status, 200);
});

test('hệ thống + sao lưu toàn bộ: tải zip, khôi phục, hoàn tác', async () => {
  const dl = await goi('/he-thong/dung-luong');
  assert.equal(dl.status, 200);
  assert.equal(dl.data.cheDo, 'file');

  const truoc = (await goi('/products')).data.length;
  const zip = await goi('/sao-luu/toan-bo');
  assert.equal(zip.status, 200);
  assert.equal(zip.headers.get('content-type'), 'application/zip');
  assert.ok((await goi('/sao-luu/thong-tin')).data.lanCuoi);

  assert.equal((await goi('/sao-luu/khoi-phuc', { method: 'POST', raw: Buffer.from('khong phai zip') })).status, 400);
  const kp = await goi('/sao-luu/khoi-phuc', { method: 'POST', raw: zip.data });
  assert.equal(kp.status, 200);
  assert.ok(kp.data.khoiPhuc.includes('products'));
  assert.equal((await goi('/products')).data.length, truoc);
  assert.equal((await goi('/sao-luu/hoan-tac', { method: 'POST' })).status, 200);
  assert.equal((await goi('/sao-luu/hoan-tac', { method: 'POST' })).status, 404);
});

test('đăng xuất mọi nơi làm token cũ hết hiệu lực; đăng xuất thường cũng vậy', async () => {
  const cu = token;
  const r = await goi('/admin/dang-xuat-moi-noi', { method: 'POST' });
  assert.equal(r.status, 200);
  assert.equal((await goi('/admin/check', { headers: { Authorization: `Bearer ${cu}` }, auth: false })).status, 401);
  token = r.data.token;
  assert.equal((await goi('/admin/check')).status, 200);
  assert.equal((await goi('/admin/logout', { method: 'POST' })).status, 200);
  assert.equal((await goi('/admin/check')).status, 401);
});

test('sai mật khẩu quá 8 lần thì bị khoá tạm (429)', async () => {
  let cuoi;
  for (let i = 0; i < 9; i++) {
    cuoi = await goi('/admin/login', { method: 'POST', body: { taiKhoan: 'x', password: 'y' }, auth: false });
  }
  assert.equal(cuoi.status, 429);
});
