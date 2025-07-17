const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ Mongo Error:', err));

// โหลด Routes
const uploadRoute = require('./routes/upload');
const downloadRoute = require('./routes/download');
const logsRoute = require('./routes/logs');
app.use('/api/upload', uploadRoute);
app.use('/api/download', downloadRoute);
app.use('/api/logs', logsRoute);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
