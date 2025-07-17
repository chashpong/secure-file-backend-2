const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const FileMetadata = require('../models/FileMetadata');
const { writeLog } = require('../blockchain/auditContract');

const router = express.Router();

router.get('/:filename', async (req, res) => {
  const encryptedFilename = req.params.filename;

  // 🔍 ดึง key/iv จาก MongoDB
  const fileData = await FileMetadata.findOne({ filename: encryptedFilename });
  if (!fileData) return res.status(404).json({ error: 'File metadata not found' });

  const encryptedPath = path.join(__dirname, '../uploads', encryptedFilename);
  const decryptedFileName = fileData.originalName;

  try {
    if (!fs.existsSync(encryptedPath)) {
      return res.status(404).json({ error: 'Encrypted file not found' });
    }

    const decipher = crypto.createDecipheriv(
      'aes-256-cbc',
      Buffer.from(fileData.key, 'hex'),
      Buffer.from(fileData.iv, 'hex')
    );

    res.setHeader('Content-Disposition', `attachment; filename="${decryptedFileName}"`);
    res.setHeader('Content-Type', 'application/octet-stream');

    const input = fs.createReadStream(encryptedPath);
    const output = input.pipe(decipher);
    output.pipe(res);

    // ✅ รอให้ส่งไฟล์จบก่อนค่อยเขียน log
    res.on('finish', async () => {
      try {
        await writeLog(encryptedFilename, "DOWNLOAD");
        console.log(`✅ Logged download: ${encryptedFilename}`);
      } catch (logErr) {
        console.error("❌ Failed to log download:", logErr);
      }
    });

  } catch (err) {
    console.error('❌ Decryption failed:', err);
    res.status(500).json({ error: 'Failed to decrypt and download file' });
  }
});

module.exports = router;
