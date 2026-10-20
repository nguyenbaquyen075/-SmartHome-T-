// Kiem tra kho du lieu o che do luu file: npm --prefix backend test
// (Che do co so du lieu can DATABASE_URL that, thu bang cach chay server voi bien do.)
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const kho = require('../src/lib/kho');
const { THU_MUC_DU_LIEU } = require('../src/config');

const TEN = 'thu-kho-tam';
const FILE = path.join(THU_MUC_DU_LIEU, `${TEN}.json`);

(async () => {
  assert.ok(!process.env.DATABASE_URL, 'Bo DATABASE_URL roi hay chay lai: day la bai thu che do file');
  fs.rmSync(FILE, { force: true });

  await kho.moKho({ [TEN]: [] });
  assert.deepStrictEqual(kho.doc(TEN), [], 'chua co gi thi tra ve mac dinh');

  assert.strictEqual(await kho.ghi(TEN, [{ id: 1 }]), true, 'ghi phai bao true');
  assert.deepStrictEqual(kho.doc(TEN), [{ id: 1 }], 'doc lai dung thu vua ghi');

  const ds = kho.doc(TEN);
  ds.push({ id: 2 });
  assert.strictEqual(kho.doc(TEN).length, 1, 'sua ban doc ra khong duoc lam lech kho');

  assert.strictEqual(await kho.ghi(TEN, ds), true, 'ghi lan hai');
  assert.strictEqual(kho.doc(TEN).length, 2, 'ghi xong doc thay du');

  fs.rmSync(FILE, { force: true });
  console.log('kho.js: OK');
  process.exit(0);
})();
