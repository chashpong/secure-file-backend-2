// models/Folder.js
const mongoose = require("mongoose");

const folderSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId, // อ้างอิงไปที่ user
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// ✅ ให้แต่ละ user สามารถสร้างโฟลเดอร์ชื่อเดียวกันได้
folderSchema.index({ name: 1, user: 1 }, { unique: true });

module.exports = mongoose.model("Folder", folderSchema);
