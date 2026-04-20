const express = require('express');
const router = express.Router();
const adminLogsController = require('../controllers/adminLogsController');

router.get('/', adminLogsController.getLogs);
router.post('/', adminLogsController.createLog);

module.exports = router;