// models/FileMetadata.js
const mongoose = require('mongoose');

const FileMetadataSchema = new mongoose.Schema({
  filename:     { type: String, required: true },     // ชื่อไฟล์ ciphertext ที่เก็บบน server
  originalName: { type: String, required: true },     // ชื่อไฟล์จริง
  iv:           { type: String, required: true },     // IV (hex) จาก client
  mime:         { type: String, default: 'application/octet-stream' },
  uploadedAt:   { type: Date,   default: Date.now },

  // ถ้าต้องการเก็บค่าอื่น ๆ เพิ่มได้ เช่น ขนาดไฟล์/โฟลเดอร์/ผู้สร้าง เป็นต้น
  // folder: { type: String, default: '-' },
}, { versionKey: false });

module.exports = mongoose.model('FileMetadata', FileMetadataSchema);
