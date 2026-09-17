// ================= KHO DU LIEU =================
// Co DATABASE_URL (Postgres - Neon/Supabase/Render) thi luu tren mang:
// deploy lai, server ngu day, doi may... du lieu van con.
// Khong co thi luu file JSON trong backend/data nhu truoc, tien chay thu o may minh.
//
// Chi 1 bang, moi muc 1 dong: du_lieu(ten, noi_dung jsonb). Du lieu nho (vai tram san pham)
// nen doc het vao bo nho luc khoi dong, route chi can doc bo nho - khong phai cho DB.
const fs = require('fs');
const path = require('path');

const THU_MUC = path.join(__dirname, 'data');
const duongDan = (ten) => path.join(THU_MUC, `${ten}.json`);

const docFile = (ten, macDinh) => {
  try {
    return JSON.parse(fs.readFileSync(duongDan(ten), 'utf-8'));
  } catch {
    return macDinh;
  }
};

const ghiFile = (ten, duLieu) => {
  fs.mkdirSync(THU_MUC, { recursive: true });
  // Ghi ra file tam roi doi ten: mat dien giua chung cung khong lam hong file cu
  const tam = `${duongDan(ten)}.tam`;
  fs.writeFileSync(tam, JSON.stringify(duLieu, null, 2), 'utf-8');
  fs.renameSync(tam, duongDan(ten));
};

let pool = null;             // null = dang o che do luu file
const boNho = new Map();     // ten -> du lieu da doc tu DB

// macDinhs = { ten: gia tri khi chua co gi }. Lan dau chay se day du lieu
// dang co trong backend/data len DB de web khong trong tron.
const moKho = async (macDinhs) => {
  if (!process.env.DATABASE_URL) {
    console.warn('[CANH BAO] Chua dat DATABASE_URL - dang luu file trong backend/data.'
      + ' Chay that tren Render se mat du lieu moi lan deploy.');
    return 'file';
  }

  const { Pool } = require('pg');
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    // Neon/Supabase/Render deu bat buoc SSL; Postgres chay ngay tren may thi khong co
    ssl: /localhost|127\.0\.0\.1/.test(process.env.DATABASE_URL) ? false : { rejectUnauthorized: false },
    max: 3
  });
  // Kho ngu / mat mang lam dut ket noi dang ranh -> chi ghi log, dung de sap server
  pool.on('error', (err) => console.error('[KHO] Ket noi dut:', err.message));

  await pool.query(`CREATE TABLE IF NOT EXISTS du_lieu (
    ten     text PRIMARY KEY,
    noi_dung jsonb NOT NULL,
    sua_luc timestamptz NOT NULL DEFAULT now()
  )`);

  const { rows } = await pool.query('SELECT ten, noi_dung FROM du_lieu');
  rows.forEach((r) => boNho.set(r.ten, r.noi_dung));

  for (const [ten, macDinh] of Object.entries(macDinhs)) {
    if (boNho.has(ten)) continue;
    const cu = docFile(ten, macDinh);
    await ghi(ten, cu);
    console.log(`[KHO] Da chuyen "${ten}" tu file len co so du lieu`);
  }
  console.log('[KHO] Dang luu tren co so du lieu, deploy lai khong mat');
  return 'db';
};

// Tra ban sao: route co sua/sap xep tren ket qua cung khong lam lech ban trong bo nho
const doc = (ten, macDinh = []) => {
  if (!pool) return docFile(ten, macDinh);
  return boNho.has(ten) ? structuredClone(boNho.get(ten)) : structuredClone(macDinh);
};

const CAU_GHI = `INSERT INTO du_lieu (ten, noi_dung, sua_luc) VALUES ($1, $2, now())
  ON CONFLICT (ten) DO UPDATE SET noi_dung = EXCLUDED.noi_dung, sua_luc = now()`;

// Tra true neu da luu chac chan. Route phai await va bao loi cho admin khi false,
// khong bao "da luu" trong khi that ra chua luu duoc.
const ghi = async (ten, duLieu) => {
  if (!pool) {
    try {
      ghiFile(ten, duLieu);
      return true;
    } catch (err) {
      console.error(`[KHO] Khong ghi duoc file ${ten}:`, err.message);
      return false;
    }
  }
  // Thu lai 1 lan: kho mien phi hay ngu, lan goi dau tien sau khi ngu de hong
  for (let lan = 0; lan < 2; lan++) {
    try {
      await pool.query(CAU_GHI, [ten, JSON.stringify(duLieu)]);
      boNho.set(ten, duLieu);
      return true;
    } catch (err) {
      console.error(`[KHO] Khong ghi duoc "${ten}" (lan ${lan + 1}):`, err.message);
      if (lan === 0) await new Promise((r) => setTimeout(r, 1200));
    }
  }
  return false;
};

const dangDungDB = () => Boolean(pool);

module.exports = { moKho, doc, ghi, dangDungDB };
