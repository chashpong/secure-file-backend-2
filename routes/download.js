// download.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const FileMetadata = require('../models/FileMetadata');
const { writeLog } = require('../blockchain/auditContract');

const router = express.Router();

router.get('/:filename', async (req, res) => {
  const encryptedFilename = req.params.filename;
  try {
    const meta = await FileMetadata.findOne({ filename: encryptedFilename });
    if (!meta) return res.status(404).json({ error: 'File metadata not found' });

    const encryptedPath = path.join(__dirname, '../uploads', encryptedFilename);
    if (!fs.existsSync(encryptedPath)) {
      return res.status(404).json({ error: 'Encrypted file not found' });
    }

    // ส่ง ciphertext กลับ (ให้ client ถอดเอง)
    res.setHeader('Content-Type', 'application/octet-stream');
    // ชื่อไฟล์ฝั่ง client จะถอดรหัสแล้วใช้ชื่อจริง แต่ถ้าอยากเก็บไว้ก็โหลดเป็น .enc ได้
    res.setHeader('Content-Disposition', `attachment; filename="${meta.originalName}.enc"`);

    fs.createReadStream(encryptedPath).pipe(res);

    res.on('finish', async () => {
      try { await writeLog(encryptedFilename, 'DOWNLOAD'); } catch (_) {}
    });
  } catch (err) {
    console.error('❌ Download Error:', err);
    res.status(500).json({ error: 'Failed to fetch encrypted file' });
  }
});

module.exports = router;
