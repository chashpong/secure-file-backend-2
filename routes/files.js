// routes/files.js
const express = require('express');
const router = express.Router();
const FileMetadata = require('../models/FileMetadata');

// GET /api/files?userId=...&folder=...
router.get('/', async (req, res) => {
  try {
    const { userId, folder } = req.query;

    // ✅ ต้องมี userId เสมอ
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const q = { user: userId };
    if (folder) q.folder = folder;

    const files = await FileMetadata.find(q).sort({ uploadedAt: -1 }).lean();

    res.json(
      files.map((f) => ({
        id: f.filename,
        filename: f.originalName,
        storedName: f.filename,
        folder: f.folder || 'General',
        uploadedAt: f.uploadedAt,
        iv: f.iv,
        mime: f.mime || 'application/octet-stream',
        user: f.user,
      }))
    );
  } catch (e) {
    console.error('❌ Files Error:', e);
    res.status(500).json({ error: 'Failed to fetch files' });
  }
});

module.exports = router;
