// Dựng file Excel (.xlsx) bảng chấm công 1 tháng: mỗi nhân viên 1 dòng, mỗi ngày 1 cột; sheet 2 là chú thích.
// { v, s }: v = giá trị ô, s = chỉ số kiểu ô trong lib/xlsxTinh.js (xanh = 1 công, vàng = nửa công, đỏ = vắng...)
const { taoXlsx } = require('../lib/xlsxTinh');
const { homNayVN } = require('../utils/chuanHoa');

const THU = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

const bangCongXlsx = (d, nam, thang) => {
  const soNgay = new Date(nam, thang, 0).getDate();
  const tienTo = `${nam}-${String(thang).padStart(2, '0')}-`;
  const daQua = `${tienTo}${String(soNgay).padStart(2, '0')}` < homNayVN();   // tháng đã hết: ngày không chấm là vắng (đỏ)

  const dau1 = [{ v: 'STT', s: 1 }, { v: 'Họ tên', s: 1 }, { v: 'Chức vụ', s: 1 }];
  const dau2 = [{ v: '', s: 1 }, { v: '', s: 1 }, { v: '', s: 1 }];
  for (let n = 1; n <= soNgay; n++) {
    const thu = new Date(nam, thang - 1, n).getDay();
    dau1.push({ v: n, s: 1 });
    dau2.push({ v: THU[thu], s: thu === 0 || thu === 6 ? 6 : 1 });
  }
  dau1.push({ v: 'Tổng công', s: 1 }, { v: 'Ngày 1 công', s: 1 }, { v: 'Ngày nửa công', s: 1 });
  dau2.push({ v: '', s: 1 }, { v: '', s: 1 }, { v: '', s: 1 });

  const hang = [[{ v: `BẢNG CHẤM CÔNG THÁNG ${thang}/${nam}`, s: 5 }], [], dau1, dau2];
  d.nhanVien.forEach((nv, i) => {
    const cong = d.cong[nv.id] || {};
    const r = [{ v: i + 1, s: 7 }, { v: nv.ten, s: 0 }, { v: nv.chucVu || '', s: 0 }];
    let tong = 0; let du = 0; let nua = 0;
    for (let n = 1; n <= soNgay; n++) {
      const g = cong[`${tienTo}${String(n).padStart(2, '0')}`] || 0;
      tong += g;
      if (g === 1) { du += 1; r.push({ v: 1, s: 2 }); } else if (g === 0.5) { nua += 1; r.push({ v: 0.5, s: 3 }); } else r.push({ v: '', s: daQua ? 4 : 0 });
    }
    r.push({ v: tong, s: 7 }, { v: du, s: 0 }, { v: nua, s: 0 });
    hang.push(r);
  });
  hang.push([], [{ v: 'Chú giải: xanh = 1 công · vàng = nửa công · đỏ = vắng (tháng đã qua)', s: 0 }]);

  const rong = [5, 24, 18, ...Array.from({ length: soNgay }, () => 4.5), 11, 12, 14];
  const ct = [[{ v: 'Ngày', s: 1 }, { v: 'Nhân viên', s: 1 }, { v: 'Chú thích', s: 1 }]];
  for (const nv of d.nhanVien) {
    Object.entries(d.chuThich[nv.id] || {}).filter(([k]) => k.startsWith(tienTo)).sort(([a], [b]) => a.localeCompare(b))
      .forEach(([k, v]) => ct.push([{ v: k.split('-').reverse().join('/'), s: 0 }, { v: nv.ten, s: 0 }, { v: v, s: 0 }]));
  }
  return taoXlsx([
    { ten: `Tháng ${thang}-${nam}`, hang, rong, dongKhoa: 4, cotKhoa: 3 },
    { ten: 'Chú thích', hang: ct, rong: [12, 24, 60] }
  ]);
};

module.exports = { bangCongXlsx };
