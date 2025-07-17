const express = require('express');
const router = express.Router();

const multer = require('multer');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');

const { encryptFile } = require('../encryption/aesEncrypt');
const FileMetadata = require('../models/FileMetadata');
const { writeLog } = require('../blockchain/auditContract');

// ตั้งค่า Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/tmp');
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '_' + file.originalname;
    cb(null, uniqueName);
  }
});
const upload = multer({ storage });

// ✅ POST /api/upload
router.post('/', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;

    const aesKey = crypto.randomBytes(32);
    const iv = crypto.randomBytes(16);
    const encryptedFileName = file.filename + '.aes';
    const inputPath = file.path;
    const outputPath = path.join('uploads', encryptedFileName);

    encryptFile(inputPath, outputPath, aesKey, iv, async (err) => {
      if (err) {
        console.error('❌ Encryption failed:', err);
        return res.status(500).json({ error: 'Encryption failed' });
      }

      fs.unlinkSync(inputPath);

      const encryptedBuffer = fs.readFileSync(outputPath);
      const fileHash = crypto.createHash('sha256').update(encryptedBuffer).digest('hex');

      await FileMetadata.create({
        filename: encryptedFileName,
        originalName: file.originalname,
        key: aesKey.toString('hex'),
        iv: iv.toString('hex'),
        hash: fileHash
      });

      await writeLog(encryptedFileName, "UPLOAD");

      res.json({
        message: '✅ File encrypted, saved and logged successfully!',
        filename: encryptedFileName
      });
    });

  } catch (err) {
    console.error('❌ Upload Error:', err);
    res.status(500).json({ error: 'Failed to upload and encrypt file' });
  }
});

module.exports = router;
