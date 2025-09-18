// models/FileMetadata.js
const mongoose = require('mongoose');

const FileMetadataSchema = new mongoose.Schema({
  // ไฟล์ที่เซิร์ฟเวอร์บันทึกไว้ (ชื่อไฟล์ ciphertext)
  filename:     { type: String, required: true, index: true },

  // ชื่อไฟล์เดิมของผู้ใช้ (ก่อนเข้ารหัส)
  originalName: { type: String, required: true },

  // IV ของ AES-GCM (เก็บเป็น 32 hex)
  iv:           { type: String, required: true, match: /^[0-9a-fA-F]{32}$/ },

  // MIME ของไฟล์เดิม
  mime:         { type: String, default: 'application/octet-stream' },

  // วันที่อัปโหลด
  uploadedAt:   { type: Date, default: Date.now },

  // โฟลเดอร์ที่ผู้ใช้เลือก (เก็บเป็นชื่อโฟลเดอร์)
  folder:       { type: String, default: 'General', index: true },

  // ผูกไฟล์กับผู้ใช้ (ต้องมีโมเดล User อยู่แล้ว)
  user:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true }
}, { versionKey: false });

module.exports = mongoose.model('FileMetadata', FileMetadataSchema);
