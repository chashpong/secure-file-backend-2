// routes/files.js
const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const auth = require('../middleware/auth'); 
const FileMetadata = require('../models/FileMetadata');

// ✅ GET /api/files - ดึงไฟล์ของ user ที่ล็อกอิน
router.get('/', auth, async (req, res) => {
  try {
    const { folder } = req.query; // folder = folderId

    const q = { user: req.user._id };
    if (folder && mongoose.Types.ObjectId.isValid(folder)) {
      q.folder = folder; // ✅ ใช้ folderId
    }

    // ✅ populate เพื่อดึงชื่อโฟลเดอร์
    const files = await FileMetadata.find(q)
      .sort({ uploadedAt: -1 })
      .populate('folder', 'name') // ดึงเฉพาะ field name
      .lean();

    res.json(
      files.map((f) => ({
        id: f._id,
        filename: f.originalName,
        storedName: f.filename,
        folderId: f.folder?._id || null, // ✅ ส่งทั้ง id และ name
        folderName: f.folder?.name || 'General',
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

// ✅ GET /api/files/:id - คืนไฟล์เดียว (เช็คสิทธิ์เจ้าของไฟล์ด้วย)
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid file id' });
    }

    const file = await FileMetadata.findById(id).populate('folder', 'name');
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    if (String(file.user) !== String(req.user._id)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({
      id: file._id,
      filename: file.originalName,
      storedName: file.filename,
      folderId: file.folder?._id || null,
      folderName: file.folder?.name || 'General',
      uploadedAt: file.uploadedAt,
      iv: file.iv,
      mime: file.mime || 'application/octet-stream',
      user: file.user,
    });
  } catch (e) {
    console.error('❌ File Fetch Error:', e);
    res.status(500).json({ error: 'Failed to fetch file' });
  }
});

module.exports = router;
