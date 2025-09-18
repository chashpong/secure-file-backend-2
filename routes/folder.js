// routes/folder.js
const express = require("express");
const router = express.Router();
const Folder = require("../models/Folder.js");

// ✅ GET: ดึงโฟลเดอร์ของ user เท่านั้น
router.get("/", async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    const folders = await Folder.find({ user: userId }).sort({ createdAt: -1 });
    res.json(folders);
  } catch (err) {
    console.error("❌ Error fetching folders:", err);
    res.status(500).json({ error: "Failed to fetch folders" });
  }
});

// ✅ POST: เพิ่มโฟลเดอร์ใหม่ (ผูกกับ user)
router.post("/", async (req, res) => {
  try {
    const { name, userId } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: "Folder name is required" });
    }
    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    const newFolder = new Folder({
      name: name.trim(),
      user: userId,             // ✅ ผูกกับ user
      createdAt: new Date(),
    });

    await newFolder.save();
    res.json({ message: "✅ Folder created successfully!", folder: newFolder });
  } catch (err) {
    console.error("❌ Error creating folder:", err);
    res.status(500).json({ error: "Failed to create folder" });
  }
});

// ✅ DELETE: ลบโฟลเดอร์ของ user เท่านั้น
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    const deleted = await Folder.findOneAndDelete({ _id: id, user: userId });

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
