// Sao lưu / khôi phục toàn bộ: các mục dữ liệu nằm trong file .zip.
// Không gồm tài khoản đăng nhập (quan-tri) để file sao lưu lộ ra cũng không lộ mật khẩu.
const kho = require('../lib/kho');
const TEN = require('./tenKho');
const caiDat = require('./caiDat');
const danhMuc = require('./danhMuc');
const chamCong = require('./chamCong');

// Mục được sao lưu -> giá trị mặc định (cũng dùng để kiểm kiểu dữ liệu khi khôi phục)
const MUC = {
  [TEN.SAN_PHAM]: [], [TEN.CONG_TRINH]: [], [TEN.CAI_DAT]: caiDat.MAC_DINH, [TEN.DANH_MUC]: danhMuc.MAC_DINH,
  [TEN.GIAI_TRI]: [], [TEN.GHI_CHU]: [], [TEN.GHI_CHU_TM]: [], [TEN.CHAM_CONG]: chamCong.MAC_DINH,
  [TEN.KHACH_HANG]: []
};
const TOI_DA = 250 * 1024 * 1024;
const MA_TEP_HOP_LE = /^[\w.-]{1,200}$/;

const docNhatKy = () => kho.doc(TEN.SAO_LUU_NK, {});
const ghiNhatKy = (lanCuoi) => kho.ghi(TEN.SAO_LUU_NK, { lanCuoi });
const docBanTruoc = () => kho.doc(TEN.SAO_LUU_TRUOC, null);
const ghiBanTruoc = (ban) => kho.ghi(TEN.SAO_LUU_TRUOC, ban);

// Toàn bộ dữ liệu chữ đang có, dạng { tên mục: nội dung }
const chupHienTai = () => Object.fromEntries(Object.entries(MUC).map(([t, d]) => [t, kho.doc(t, d)]));

// Đúng kiểu với mặc định của mục: mảng là mảng, object là object
const dungKieu = (ten, noiDung) => {
  const macDinh = MUC[ten];
  return Array.isArray(macDinh) ? Array.isArray(noiDung) : noiDung && typeof noiDung === 'object' && !Array.isArray(noiDung);
};

// Ghi lại các mục dữ liệu từ { tên: nội dung }, hỏng mục nào thì ném lỗi
const ghiCacMuc = async (du) => {
  for (const [ten, noiDung] of Object.entries(du)) {
    if (!(await kho.ghi(ten, noiDung))) throw new Error(`Không ghi được "${ten}"`);
  }
};

module.exports = { MUC, TOI_DA, MA_TEP_HOP_LE, docNhatKy, ghiNhatKy, docBanTruoc, ghiBanTruoc, chupHienTai, dungKieu, ghiCacMuc };
