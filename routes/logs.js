const express = require("express");
const router = express.Router();
const { getAllLogs, getLogsByUser } = require("../blockchain/auditContract");
const auth = require("../middleware/auth");

// ✅ log เฉพาะ user
router.get("/", auth, async (req, res) => {
  try {
    const userId = String(req.user._id); // จาก token
    const logs = await getLogsByUser(userId);
    res.json(logs);
  } catch (err) {
    console.error("❌ Failed to fetch logs:", err);
    res.status(500).json({ error: "Failed to fetch logs" });
  }
});

// ✅ สำหรับ admin
router.get("/all", auth, async (req, res) => {
  try {
    const logs = await getAllLogs();
    res.json(logs);
  } catch (err) {
    console.error("❌ Failed to fetch all logs:", err);
    res.status(500).json({ error: "Failed to fetch all logs" });
  }
});

module.exports = router;
