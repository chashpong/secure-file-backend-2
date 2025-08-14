// files.js
const express = require('express');
const router = express.Router();
const FileMetadata = require('../models/FileMetadata');

// GET /api/files
router.get('/', async (_req, res) => {
  try {
    const files = await FileMetadata.find().sort({ uploadedAt: -1 });
    res.json(
      files.map(f => ({
        id: f.filename,               // ใช้เป็น params เวลาโหลด ciphertext
        filename: f.originalName,     // ชื่อจริง (ไว้ตั้งชื่อหลังถอดรหัส)
        folder: '-',                  // ยังไม่ทำระบบโฟลเดอร์
        uploadedAt: f.uploadedAt,
        iv: f.iv,                     // 👉 จำเป็นสำหรับ AES-GCM
        mime: f.mime || 'application/octet-stream'
      }))
    );
  } catch (err) {
    console.error('❌ Failed to fetch files:', err);
    res.status(500).json({ error: 'Failed to get files' });
  }
});

module.exports = router;
