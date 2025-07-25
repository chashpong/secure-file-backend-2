const express = require('express');
const router = express.Router();
const FileMetadata = require('../models/FileMetadata');

// ✅ GET /api/files - ดึงรายชื่อไฟล์ทั้งหมด
router.get('/', async (req, res) => {
  try {
    const files = await FileMetadata.find().sort({ uploadedAt: -1 });

    const formatted = files.map(f => ({
      id: f.filename, // ใช้ filename เป็น ID สำหรับดาวน์โหลด
      filename: f.originalName,
      folder: '-', // หากยังไม่มีระบบโฟลเดอร์ ให้แสดงเป็น "-"
      uploadedAt: f.uploadedAt.toLocaleDateString('th-TH')
    }));

    res.json(formatted);
  } catch (err) {
    console.error('❌ Failed to fetch files:', err);
    res.status(500).json({ error: 'Failed to get files' });
  }
});

module.exports = router;
