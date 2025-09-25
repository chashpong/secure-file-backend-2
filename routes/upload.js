// routes/upload.js
const express = require('express');
const router = express.Router();

const multer = require('multer');
const path = require('path');
const fs = require('fs');
const FileMetadata = require('../models/FileMetadata');
const { writeLog } = require('../blockchain/auditContract');

// === ที่เก็บไฟล์เข้ารหัส ===
const UP_DIR = path.join(__dirname, '../uploads');
fs.mkdirSync(UP_DIR, { recursive: true });

// ===== utils =====
const isValidHexIV = (iv) =>
  typeof iv === 'string' && /^[0-9a-fA-F]{32}$/.test(iv);

const safeFolderName = (name = 'General') =>
  String(name).trim().slice(0, 64).replace(/[\\/:*?"<>|]/g, '_'); // กัน path traversal

// ===== Multer config =====
// storage: บังคับให้ชื่อไฟล์ลงท้ายด้วย .enc
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UP_DIR),
  filename: (req, file, cb) => {
    const ts = Date.now();
    const rand = Math.random().toString(36).slice(2, 10);
    cb(null, `${ts}_${rand}.enc`);
  }
});

// filter: ยอมเฉพาะไฟล์ .enc เท่านั้น
const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
  fileFilter: (req, file, cb) => {
    if (!file.originalname.endsWith('.enc')) {
      return cb(new Error('❌ Only encrypted files (.enc) are allowed!'));
    }
    cb(null, true);
  }
});

// ===== Route =====
router.post('/', upload.single('cipher'), async (req, res) => {
  try {
    const file = req.file;
    const { originalName, iv, mime, folder, userId } = req.body;

    // 1) ต้องมี userId ทุกครั้ง
    if (!userId) {
      return res.status(400).json({ error: '❌ userId is required' });
    }

    // 2) ตรวจสอบไฟล์ว่ามีจริงและไม่ว่าง
    if (!file || file.size === 0) {
      return res.status(400).json({ error: '❌ Cipher file is missing or empty' });
    }

    // 3) ตรวจสอบ originalName
    if (!originalName || originalName.length > 255) {
      return res.status(400).json({ error: '❌ Invalid originalName' });
    }

    // 4) ตรวจสอบ IV
    if (!isValidHexIV(iv)) {
      return res.status(400).json({ error: '❌ Invalid IV format. Must be 32 hex chars (16 bytes).' });
    }

    const folderName = safeFolderName(folder || 'General');

    // ✅ บันทึก metadata
    const doc = await FileMetadata.create({
      filename: file.filename,
      originalName: String(originalName).slice(0, 255),
      iv,
      uploadedAt: new Date(),
      mime: mime || 'application/octet-stream',
      folder: folderName,
      user: userId
    });

     // ✅ log ลง Blockchain (best-effort)
    try {
      await writeLog(userId, file.filename, 'UPLOAD'); // 👈 ส่ง userId ด้วย
    } catch (e) {
      console.warn('⚠️ Blockchain log skipped:', e.message);
    }

    res.json({
      message: '✅ Cipher uploaded successfully!',
      filename: doc.filename,
      folder: doc.folder,
      user: doc.user
    });
  } catch (err) {
    console.error('❌ Upload Error:', err);
    res.status(500).json({ error: 'Failed to upload encrypted file' });
  }
});

module.exports = router;
