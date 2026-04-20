const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ 
    status: 'healthy', 
    message: '邦典文化传承平台 API 运行正常',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
