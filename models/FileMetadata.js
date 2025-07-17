const mongoose = require('mongoose');

const FileSchema = new mongoose.Schema({
  filename: { type: String, required: true }, // ไฟล์ที่เข้ารหัส
  originalName: { type: String, required: true }, // ชื่อจริงของไฟล์
  key: { type: String, required: true },
  iv: { type: String, required: true },
  hash: { type: String }, // optional: SHA-256 hash
  uploadedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('FileMetadata', FileSchema);
