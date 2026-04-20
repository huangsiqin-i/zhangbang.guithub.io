const express = require('express');
const router = express.Router();
const adminLogsController = require('../controllers/adminLogsController');

router.get('/', adminLogsController.getAllLogs);

module.exports = router;
