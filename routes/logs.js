const express = require('express');
const router = express.Router();
const { getLogs } = require('../blockchain/auditContract');

router.get('/', async (req, res) => {
  try {
    const logs = await getLogs();
    res.json(logs);
  } catch (err) {
    console.error('❌ Failed to fetch logs:', err);
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
});

module.exports = router;
