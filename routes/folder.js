const express = require("express");
const router = express.Router();
const Folder = require("../models/Folder.js");
const auth = require("../middleware/auth"); // ✅ ใช้ middleware ตรวจสอบ token

// ✅ GET: ดึงโฟลเดอร์ของ user ที่ login อยู่
router.get("/", auth, async (req, res) => {
  try {
    const folders = await Folder.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(folders);
  } catch (err) {
    console.error("❌ Error fetching folders:", err);
    res.status(500).json({ error: "Failed to fetch folders" });
  }
});

// ✅ POST: เพิ่มโฟลเดอร์ใหม่ (ผูกกับ user จาก token)
router.post("/", auth, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: "Folder name is required" });
    }

    const newFolder = new Folder({
      name: name.trim(),
      user: req.user._id, // ✅ ผูกกับ user จาก token
    });

    await newFolder.save();
    res.json({ message: "✅ Folder created successfully!", folder: newFolder });
  } catch (err) {
    // ✅ จัดการกรณีซ้ำชื่อใน user เดียวกัน
    if (err.code === 11000) {
      return res.status(400).json({ error: "Folder name already exists for this user" });
    }

    console.error("❌ Error creating folder:", err);
    res.status(500).json({ error: "Failed to create folder" });
  }
});

// ✅ DELETE: ลบโฟลเดอร์ของ user เท่านั้น
router.delete("/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Folder.findOneAndDelete({ _id: id, user: req.user._id });
    if (!deleted) {
      return res.status(404).json({ error: "Folder not found or not owned by this user" });
    }

    res.json({ message: "✅ Folder deleted successfully!" });
  } catch (err) {
    console.error("❌ Error deleting folder:", err);
    res.status(500).json({ error: "Failed to delete folder" });
  }
});

module.exports = router;
