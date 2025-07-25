const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// ✅ เข้าระบบ (Login)
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // 🔍 หาผู้ใช้จาก email
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({ error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' });
  }

  // 🔐 ตรวจรหัสผ่าน
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).json({ error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' });
  }

  // ✅ สร้าง token
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

  res.json({ message: 'เข้าสู่ระบบสำเร็จ', token });
});

// ✅ ลงทะเบียน (Register)
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // 🔁 ตรวจ email ซ้ำ
    const exist = await User.findOne({ email });
    if (exist) return res.status(400).json({ error: 'อีเมลนี้ถูกใช้ไปแล้ว' });

    // 🔐 เข้ารหัส password
    const hashed = await bcrypt.hash(password, 10);

    // 💾 บันทึก
    const newUser = new User({ username, email, password: hashed });
    await newUser.save();

    res.json({ message: 'สมัครสมาชิกสำเร็จ' });
  } catch (err) {
    console.error('❌ Register error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์' });
  }
});

module.exports = router;
