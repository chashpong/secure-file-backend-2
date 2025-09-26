const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// === เชื่อม MongoDB ===
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('✅ MongoDB Connected');

    // ลบ index เก่าที่ผิดพลาด (unique เฉพาะ name)
    try {
      const Folder = require('./models/Folder');
      const indexes = await Folder.collection.getIndexes();
      if (indexes.name_1) {
        await Folder.collection.dropIndex('name_1');
        console.log('🗑️ Dropped old index: name_1');
      }
    } catch (err) {
      console.warn('⚠️ Drop index skipped:', err.message);
    }
  })
  .catch(err => console.error('❌ Mongo Error:', err));

// === โหลด Routes ===
const uploadRoute = require('./routes/upload');
const downloadRoute = require('./routes/download');
const filesRoute = require('./routes/files');
const logsRoute = require('./routes/logs');
const authRoute = require('./routes/auth');
const folderRoutes = require('./routes/folder');

app.use('/api/auth', authRoute);      // ✅ Register / Login
app.use('/api/folders', folderRoutes);
app.use('/api/upload', uploadRoute);
app.use('/api/download', downloadRoute);
app.use('/api/logs', logsRoute);
app.use('/api/files', filesRoute);

// === Start Server ===
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
