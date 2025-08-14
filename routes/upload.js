// upload.js
const express = require('express');
const router = express.Router();

const multer = require('multer');
const path = require('path');
const fs = require('fs');
const FileMetadata = require('../models/FileMetadata');
const { writeLog } = require('../blockchain/auditContract');

const UP_DIR  = path.join(__dirname, '../uploads');
fs.mkdirSync(UP_DIR,  { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UP_DIR),
  filename: (req, file, cb) => cb(null, `${Date.now()}_${file.originalname}`)
});
const upload = multer({ storage });

// POST /api/upload
// รับไฟล์ "cipher" ที่เข้ารหัสมาจากฝั่ง client พร้อม iv+metadata (ไม่รับ key)
router.post('/', upload.single('cipher'), async (req, res) => {
  try {
    const file = req.file;
    const { originalName, iv, mime } = req.body;

    if (!file || !originalName || !iv) {
      // mime ไม่มีก็ใส่ค่ามาตรฐานให้ได้
      return res.status(400).json({ error: 'Missing fields (cipher/originalName/iv)' });
    }

    await FileMetadata.create({
      filename: file.filename,     // ใช้เป็น id สำหรับดาวน์โหลด ciphertext
      originalName,                // ชื่อไฟล์จริง
      iv,                          // เก็บเฉพาะ IV ได้
      uploadedAt: new Date(),
      mime: mime || 'application/octet-stream'
      // ❌ ไม่เก็บ key
    });

    try { await writeLog(file.filename, 'UPLOAD'); } catch (_) {}

    res.json({ message: '✅ Cipher uploaded successfully!', filename: file.filename });
  } catch (err) {
    console.error('❌ Upload Error:', err);
    res.status(500).json({ error: 'Failed to upload encrypted file' });
  }
});

module.exports = router;
