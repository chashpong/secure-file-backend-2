// routes/download.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const FileMetadata = require('../models/FileMetadata');
const { writeLog } = require('../blockchain/auditContract');

const router = express.Router();

// GET /api/download/:filename?userId=...
router.get('/:filename', async (req, res) => {
  const encryptedFilename = req.params.filename;
  const { userId } = req.query;

  try {
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    // ✅ ตรวจสอบว่าไฟล์นี้เป็นของ user นั้นจริงหรือไม่
    const meta = await FileMetadata.findOne({ filename: encryptedFilename, user: userId });
    if (!meta) {
      return res.status(404).json({ error: 'File not found or access denied' });
    }

    const encryptedPath = path.join(__dirname, '../uploads', encryptedFilename);
    if (!fs.existsSync(encryptedPath)) {
      return res.status(404).json({ error: 'Encrypted file not found' });
    }

    // ส่ง ciphertext กลับ (client ถอดรหัสเอง)
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${meta.originalName}.enc"`);

    fs.createReadStream(encryptedPath).pipe(res);

    res.on('finish', async () => {
      try {
        await writeLog(encryptedFilename, 'DOWNLOAD');
      } catch (_) {}
    });
  } catch (err) {
    console.error('❌ Download Error:', err);
    res.status(500).json({ error: 'Failed to fetch encrypted file' });
  }
});

module.exports = router;
