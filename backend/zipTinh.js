// Tao file .zip khong nen (store) - du cho ban sao luu, khong can them thu vien.
// Ten file luu UTF-8 (co co 0x0800) nen tieng Viet giu nguyen khi giai nen.
const BANG_CRC = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
const crc32 = (buf) => {
  let c = 0xffffffff;
  for (const b of buf) c = BANG_CRC[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};

// muc = [{ ten: 'thu muc/tep.txt', duLieu: Buffer }]
const taoZip = (muc) => {
  const bay = new Date();
  const gio = (bay.getHours() << 11) | (bay.getMinutes() << 5) | (bay.getSeconds() >> 1);
  const ngay = ((bay.getFullYear() - 1980) << 9) | ((bay.getMonth() + 1) << 5) | bay.getDate();
  const phan = [];
  const thuMuc = [];
  let viTri = 0;

  for (const { ten, duLieu } of muc) {
    const tenBuf = Buffer.from(ten, 'utf8');
    const crc = crc32(duLieu);
    const dau = Buffer.alloc(30);
    dau.writeUInt32LE(0x04034b50, 0); dau.writeUInt16LE(20, 4); dau.writeUInt16LE(0x0800, 6); dau.writeUInt16LE(0, 8);
    dau.writeUInt16LE(gio, 10); dau.writeUInt16LE(ngay, 12); dau.writeUInt32LE(crc, 14);
    dau.writeUInt32LE(duLieu.length, 18); dau.writeUInt32LE(duLieu.length, 22); dau.writeUInt16LE(tenBuf.length, 26);
    phan.push(dau, tenBuf, duLieu);

    const tm = Buffer.alloc(46);
    tm.writeUInt32LE(0x02014b50, 0); tm.writeUInt16LE(20, 4); tm.writeUInt16LE(20, 6); tm.writeUInt16LE(0x0800, 8);
    tm.writeUInt16LE(0, 10); tm.writeUInt16LE(gio, 12); tm.writeUInt16LE(ngay, 14); tm.writeUInt32LE(crc, 16);
    tm.writeUInt32LE(duLieu.length, 20); tm.writeUInt32LE(duLieu.length, 24); tm.writeUInt16LE(tenBuf.length, 28);
    tm.writeUInt32LE(viTri, 42);
    thuMuc.push(tm, tenBuf);
    viTri += 30 + tenBuf.length + duLieu.length;
  }

  const cd = Buffer.concat(thuMuc);
  const cuoi = Buffer.alloc(22);
  cuoi.writeUInt32LE(0x06054b50, 0); cuoi.writeUInt16LE(muc.length, 8); cuoi.writeUInt16LE(muc.length, 10);
  cuoi.writeUInt32LE(cd.length, 12); cuoi.writeUInt32LE(viTri, 16);
  return Buffer.concat([...phan, cd, cuoi]);
};

module.exports = { taoZip };
