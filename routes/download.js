const express = require('express');
const fs = require('fs');
const path = require('path');
const FileMetadata = require('../models/FileMetadata');
const { writeLog } = require('../blockchain/auditContract');
const auth = require('../middleware/auth'); // ✅ ใช้ middleware

const router = express.Router();

// GET /api/download/:filename
router.get('/:filename', auth, async (req, res) => {
  const encryptedFilename = req.params.filename;

  try {
    // ✅ ตรวจสอบว่าไฟล์นี้เป็นของ user ที่ login อยู่
    const meta = await FileMetadata.findOne({
      filename: encryptedFilename,
      user: req.user._id, // ✅ ใช้ user จาก token
    });

    if (!meta) {
      return res.status(404).json({ error: 'File not found or access denied' });
    }

    const encryptedPath = path.join(__dirname, '../uploads', encryptedFilename);
    if (!fs.existsSync(encryptedPath)) {
      return res.status(404).json({ error: 'Encrypted file not found' });
    }

    // ✅ ส่ง ciphertext กลับ (client ถอดรหัสเอง)
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${meta.originalName}.enc"`
    );

    fs.createReadStream(encryptedPath).pipe(res);

    res.on('finish', async () => {
      try {
        // ✅ ส่ง userId ไป log ด้วย
        await writeLog(String(req.user._id), encryptedFilename, 'DOWNLOAD');
      } catch (e) {
        console.warn('⚠️ Blockchain log skipped:', e.message);
      }
    });
  } catch (err) {
    console.error('❌ Download Error:', err);
    res.status(500).json({ error: 'Failed to fetch encrypted file' });
  }
});

module.exports = router;
