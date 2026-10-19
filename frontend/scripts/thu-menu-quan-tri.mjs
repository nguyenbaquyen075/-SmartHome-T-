// Thử menu ☰ trang quản trị: mở Chrome headless, bấm từng mục bằng chuột thật, kiểm tra trang có đổi
// và nút Back không kẹt. Chống lỗi "bấm mục menu không vào được" quay lại (xem utils/luiVe.js).
// Cần `npm run dev` đang chạy. Chạy: npm --prefix frontend run thu:menu
// GitHub Actions cũng tự chạy bài này mỗi lần push (.github/workflows/kiem-tra.yml).
// Tài khoản lấy từ ADMIN_TAI_KHOAN / ADMIN_PASSWORD, mặc định là tài khoản chạy thử.
import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const CHROME = process.env.CHROME_PATH
  || (process.platform === 'darwin' ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' : 'google-chrome');
const PORT = 9333;
const ngu = (ms) => new Promise((r) => setTimeout(r, ms));

const res = await fetch('http://localhost:5001/api/admin/login', {
  method: 'POST', headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    taiKhoan: (process.env.ADMIN_TAI_KHOAN || '0987654321').split(',')[0].trim(),
    password: process.env.ADMIN_PASSWORD || 'diennuoc@2026',
  }),
});
const { token } = await res.json();
if (!token) throw new Error('không đăng nhập được');

const HO_SO = mkdtempSync(join(tmpdir(), 'thu-menu-'));
const chrome = spawn(CHROME, [...(process.env.CI ? ['--no-sandbox'] : []), '--headless=new', `--remote-debugging-port=${PORT}`, '--user-data-dir=' + HO_SO, '--window-size=1200,900', 'about:blank']);
let ws;
for (let i = 0; i < 50 && !ws; i++) {
  await ngu(200);
  try {
    const tabs = await (await fetch(`http://127.0.0.1:${PORT}/json`)).json();
    const tab = tabs.find((t) => t.type === 'page');
    if (tab) ws = new WebSocket(tab.webSocketDebuggerUrl);
  } catch { /* chưa lên */ }
}
await new Promise((r) => ws.addEventListener('open', r));
let id = 0; const cho = new Map();
ws.addEventListener('message', (e) => { const m = JSON.parse(e.data); if (m.id && cho.has(m.id)) { cho.get(m.id)(m); cho.delete(m.id); } });
const goi = (method, params = {}) => new Promise((r) => { const i = ++id; cho.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
const tinh = async (expr) => (await goi('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true })).result.result.value;
const bam = async (selector) => {
  const r = await tinh(`(() => { const el = document.querySelector(${JSON.stringify(selector)}); if (!el) return null; const b = el.getBoundingClientRect(); return { x: b.x + b.width / 2, y: b.y + b.height / 2 }; })()`);
  if (!r) return false;
  for (const type of ['mousePressed', 'mouseReleased']) await goi('Input.dispatchMouseEvent', { type, x: r.x, y: r.y, button: 'left', clickCount: 1 });
  return true;
};
// Chờ phần tử hiện ra (máy chậm hay Vite đang dịch lần đầu thì đợi lâu hơn, không đoán giờ)
const choThay = async (selector, ms = 30000) => {
  for (const het = Date.now() + ms; Date.now() < het; await ngu(200)) {
    if (await tinh(`!!document.querySelector(${JSON.stringify(selector)})`)) return;
  }
  throw new Error(`Không thấy ${selector} sau ${ms / 1000} giây`);
};

await goi('Page.enable');
await goi('Page.navigate', { url: 'http://localhost:5174/admin' });
await choThay('.qt-dang-nhap, .qt-ba-soc, form');
await tinh(`sessionStorage.setItem('cameratd_admin_token', ${JSON.stringify(token)})`);
await tinh(`location.hash = '/tong-quan'`);
await goi('Page.reload');
await choThay('.qt-ba-soc');
console.log('Trang đang hiện:', (await tinh(`document.body.innerText.slice(0, 120)`)).replace(/\s+/g, ' '));

const MUC = ['ghi-chu', 'khach-hang', 'cham-cong', 'san-pham', 'danh-muc', 'cai-dat', 'tong-quan'];
let loi = 0;
for (const d of MUC) {
  const truoc = await tinh('location.hash');
  await bam('.qt-ba-soc');
  await ngu(400);
  const ok = await bam(`.qt-menu a[href="#/${d}"]`);
  await ngu(900);
  const sau = await tinh('location.hash');
  const tieuDe = await tinh(`document.querySelector('.qt-dau-trang')?.textContent.trim()`);
  const menuCon = await tinh(`!!document.querySelector('.qt-menu')`);
  const dung = sau === `#/${d}`;
  if (!dung) loi++;
  console.log(`${dung ? 'OK ' : 'LỖI'}  ${truoc} → bấm "${d}"${ok ? '' : ' (không thấy mục)'} → ${sau}  | tiêu đề: ${tieuDe} | menu còn mở: ${menuCon} | độ dài lịch sử: ${await tinh('history.length')}`);
}
// Mở menu rồi bấm nút + (thêm sản phẩm)
await bam('.qt-ba-soc'); await ngu(400);
await bam('.qt-menu a[href="#/san-pham/moi"]'); await ngu(900);
const sauThem = await tinh('location.hash'); if (sauThem !== '#/san-pham/moi') loi++;
console.log(`${sauThem === '#/san-pham/moi' ? 'OK ' : 'LỖI'}  bấm + Sản phẩm → ${sauThem}`);
// Mở menu rồi bấm Back: menu phải đóng, trang giữ nguyên
await bam('.qt-ba-soc'); await ngu(400);
await tinh('history.back()'); await ngu(800);
const menuSauBack = await tinh(`!!document.querySelector('.qt-menu')`);
const hashSauBack = await tinh('location.hash');
const okBackMenu = !menuSauBack && hashSauBack === '#/san-pham/moi'; if (!okBackMenu) loi++;
console.log(`${okBackMenu ? 'OK ' : 'LỖI'}  mở menu rồi Back → menu ${menuSauBack ? 'vẫn mở' : 'đóng'}, trang ${hashSauBack}`);
// Back sau cùng phải về trang trước, không kẹt
const truocBack = await tinh('location.hash');   // đang ở #/san-pham/moi, trang trước là #/tong-quan
await tinh('history.back()');
await ngu(800);
const hashBack = await tinh('location.hash');
console.log(`Back: ${truocBack} → ${hashBack}`); if (hashBack !== '#/tong-quan') loi++;
console.log(loi ? `\n${loi} lần bấm KHÔNG chuyển trang` : '\nTất cả mục menu đều chuyển trang');
ws.close(); chrome.kill();
setTimeout(() => rmSync(HO_SO, { recursive: true, force: true }), 500);
process.exitCode = loi ? 1 : 0;
