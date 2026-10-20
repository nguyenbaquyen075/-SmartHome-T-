// Sao lưu / khôi phục toàn bộ: 1 file .zip gồm dữ liệu + tệp đính kèm + ảnh lưu trong kho.
// Ảnh/video nằm trên kho ngoài (Neon S3, Cloudinary) không nằm trong file, chỉ giữ đường dẫn.
const fs = require('fs');
const path = require('path');
const kho = require('../lib/kho');
const khoRiengTu = require('../lib/khoRiengTu');
const { taoZip, docZip } = require('../lib/zipTinh');
const saoLuu = require('../models/saoLuu');
const khachHang = require('../models/khachHang');
const tep = require('../models/tep');
const { THU_MUC_TEP } = require('../config');
const { LOI_LUU } = require('../utils/loi');

const thongTin = (req, res) => {
  res.json({
    lanCuoi: saoLuu.docNhatKy().lanCuoi || null,
    banTruoc: saoLuu.docBanTruoc()?.luc || null
  });
};

const taiVe = async (req, res) => {
  try {
    const muc = [];
    const dsTep = [];
    for (const [ten, noiDung] of Object.entries(saoLuu.chupHienTai())) {
      muc.push({ ten: `du-lieu/${ten}.json`, duLieu: Buffer.from(JSON.stringify(noiDung, null, 2), 'utf8') });
    }
    let tong = 0;
    let boQua = 0;   // số ảnh khách hàng bị bỏ vì file sao lưu quá lớn
    // Quá giới hạn: ảnh khách hàng thì bỏ qua và đếm lại, tệp khác thì báo hỏng cả bản sao lưu
    const themTep = (id, kieu, buf, anhKhach) => {
      if (tong + buf.length > saoLuu.TOI_DA) { if (anhKhach) boQua += 1; return !anhKhach ? false : true; }
      tong += buf.length;
      dsTep.push({ id, kieu });
      muc.push({ ten: `tep/${id}`, duLieu: buf });
      return true;
    };
    const daCo = new Set();
    if (kho.dangDungDB()) {
      const ds = await kho.lietKeAnh();
      // Tệp ghi chú và ảnh khác trước (nhỏ, bắt buộc có), ảnh khách hàng sau
      for (const a of [...ds.filter((x) => !tep.laAnhKhach(x.id)), ...ds.filter((x) => tep.laAnhKhach(x.id))]) {
        const x = await kho.docAnh(a.id);
        if (!x) continue;
        if (!themTep(a.id, a.kieu, x.du_lieu, tep.laAnhKhach(a.id))) return res.status(413).json({ error: 'Dữ liệu quá lớn để sao lưu một lần (trên 250MB)' });
        daCo.add(a.id);
      }
    } else if (fs.existsSync(THU_MUC_TEP)) {
      for (const id of fs.readdirSync(THU_MUC_TEP)) {
        themTep(id, 'application/octet-stream', fs.readFileSync(path.join(THU_MUC_TEP, id)), tep.laAnhKhach(id));
        daCo.add(id);
      }
    }
    // Ảnh khách hàng nằm ở kho riêng tư (bucket) không có trong bảng ảnh -> lấy thêm theo danh sách khách hàng
    if (khoRiengTu.dangBat()) {
      for (const a of khachHang.tatCaAnh()) {
        if (daCo.has(a.id)) continue;
        const buf = await khoRiengTu.doc(a.id);
        if (buf) themTep(a.id, a.kieu || 'image/jpeg', buf, true);
      }
    }
    const bay = new Date().toISOString();
    muc.unshift({ ten: 'manifest.json', duLieu: Buffer.from(JSON.stringify({ phienBan: 1, taoLuc: bay, nhom: Object.keys(saoLuu.MUC), tep: dsTep, boQuaAnh: boQua }, null, 2), 'utf8') });
    const zip = taoZip(muc);
    await saoLuu.ghiNhatKy(bay);
    res.setHeader('X-Anh-Bo-Qua', String(boQua));
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="sao-luu-smarthometd-${bay.slice(0, 10)}.zip"`);
    res.send(zip);
  } catch (err) {
    console.error('Loi sao luu toan bo:', err.message);
    res.status(500).json({ error: 'Không tạo được bản sao lưu, thử lại sau' });
  }
};

const khoiPhuc = async (req, res) => {
  let muc;
  try { muc = docZip(req.body); } catch (err) { return res.status(400).json({ error: err.message }); }
  let manifest;
  try { manifest = JSON.parse(muc.find((x) => x.ten === 'manifest.json')?.duLieu.toString('utf8')); } catch { manifest = null; }
  if (manifest?.phienBan !== 1) return res.status(400).json({ error: 'Đây không phải file sao lưu của web này' });

  // Đọc và kiểm tra hết trước khi đụng vào dữ liệu đang có
  const du = {};
  for (const x of muc) {
    const khop = /^du-lieu\/([\w-]+)\.json$/.exec(x.ten);
    if (!khop || !(khop[1] in saoLuu.MUC)) continue;
    let noiDung;
    try { noiDung = JSON.parse(x.duLieu.toString('utf8')); } catch { return res.status(400).json({ error: `Mục "${khop[1]}" trong file bị hỏng` }); }
    if (!saoLuu.dungKieu(khop[1], noiDung)) return res.status(400).json({ error: `Mục "${khop[1]}" trong file sai định dạng` });
    du[khop[1]] = noiDung;
  }
  if (!Object.keys(du).length) return res.status(400).json({ error: 'File không có dữ liệu để khôi phục' });

  try {
    // Giữ bản đang có để hoàn tác được (chỉ phần dữ liệu chữ, không gồm tệp)
    if (!(await saoLuu.ghiBanTruoc({ luc: new Date().toISOString(), duLieu: saoLuu.chupHienTai() }))) return res.status(500).json(LOI_LUU);
    await saoLuu.ghiCacMuc(du);

    let soTep = 0;
    for (const x of muc) {
      if (!x.ten.startsWith('tep/')) continue;
      const id = x.ten.slice(4);
      if (!saoLuu.MA_TEP_HOP_LE.test(id)) continue;
      const kieu = manifest.tep?.find((t) => t.id === id)?.kieu || 'application/octet-stream';
      if (tep.laAnhKhach(id) && khoRiengTu.dangBat()) {
        if (await khoRiengTu.ghi(id, kieu, x.duLieu)) soTep += 1;
      } else if (kho.dangDungDB()) {
        if (await kho.ghiAnhDe(id, kieu, x.duLieu)) soTep += 1;
      } else if (id.startsWith(tep.TIEN_TO_TEP) || id.startsWith(tep.TIEN_TO_ANH_KH)) {
        fs.mkdirSync(THU_MUC_TEP, { recursive: true });
        fs.writeFileSync(path.join(THU_MUC_TEP, id), x.duLieu);
        soTep += 1;
      }
    }
    res.json({ khoiPhuc: Object.keys(du), soTep });
  } catch (err) {
    console.error('Loi khoi phuc:', err.message);
    res.status(500).json({ error: `${err.message}. Bấm "Hoàn tác" để quay về dữ liệu trước khi khôi phục.` });
  }
};

const hoanTac = async (req, res) => {
  const truoc = saoLuu.docBanTruoc();
  if (!truoc?.duLieu) return res.status(404).json({ error: 'Không có bản nào để hoàn tác' });
  try {
    await saoLuu.ghiCacMuc(truoc.duLieu);
    await saoLuu.ghiBanTruoc(null);
    res.json({ success: true });
  } catch (err) {
    console.error('Loi hoan tac:', err.message);
    res.status(500).json(LOI_LUU);
  }
};

module.exports = { thongTin, taiVe, khoiPhuc, hoanTac };
