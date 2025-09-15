// routes/upload.js
const express = require('express');
const router = express.Router();

const multer = require('multer');
const path = require('path');
const fs = require('fs');
const FileMetadata = require('../models/FileMetadata');
const { writeLog } = require('../blockchain/auditContract');

const UP_DIR = path.join(__dirname, '../uploads');
fs.mkdirSync(UP_DIR, { recursive: true });

// storage: บังคับให้ไฟล์ทุกไฟล์เก็บเป็น .enc
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UP_DIR),
  filename: (req, file, cb) => {
    const safeName = path.basename(file.originalname).replace(/[^a-zA-Z0-9._-]/g, "_");
    cb(null, `${Date.now()}_${safeName}.enc`); // ✅ บังคับ .enc
  }
});

// filter: ยอมเฉพาะไฟล์ .enc เท่านั้น
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (!file.originalname.endsWith('.enc')) {
      return cb(new Error('❌ Only encrypted files (.enc) are allowed!'));
    }
    cb(null, true);
  }
});

// ฟังก์ชันเช็ค IV format
function isValidHexIV(iv) {
  return typeof iv === 'string' && /^[0-9a-fA-F]{32}$/.test(iv);
}

// POST /api/upload
router.post('/', (req, res, next) => {
  upload.single('cipher')(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({ error: '❌ File too large (max 10MB)' });
      }
      return res.status(400).json({ error: err.message });
    }
    next();
  });
}, async (req, res) => {
  try {
    const file = req.file;
    const { originalName, iv, mime } = req.body;

    // 1) ตรวจสอบไฟล์ว่ามีจริงและไม่ว่าง
    if (!file || file.size === 0) {
      return res.status(400).json({ error: '❌ Cipher file is missing or empty' });
    }

    // 2) ตรวจสอบ originalName
    if (!originalName || originalName.length > 255) {
      return res.status(400).json({ error: '❌ Invalid originalName' });
    }

    // 3) ตรวจสอบ IV
    if (!isValidHexIV(iv)) {
      return res.status(400).json({ error: '❌ Invalid IV format. Must be 32 hex chars (16 bytes).' });
    }

    // 4) บันทึก metadata
    await FileMetadata.create({
      filename: file.filename,  // เก็บชื่อไฟล์ที่ถูกบังคับเป็น .enc แล้ว
      originalName,
      iv,
      uploadedAt: new Date(),
      mime: mime || 'application/octet-stream'
    });

    try { 
      await writeLog(file.filename, 'UPLOAD'); 
    } catch (e) {
      console.warn('⚠️ Blockchain log skipped:', e.message);
    }

    res.json({ 
      message: '✅ Cipher uploaded successfully!', 
      filename: file.filename 
    });

  } catch (err) {
    console.error('❌ Upload Error:', err);
    res.status(500).json({ error: 'Failed to upload encrypted file' });
  }
});

module.exports = router;
