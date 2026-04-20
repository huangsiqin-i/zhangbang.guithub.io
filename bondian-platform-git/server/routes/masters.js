const express = require('express');
const router = express.Router();
const mastersController = require('../controllers/mastersController');

router.get('/', mastersController.getAllMasters);
router.get('/:id', mastersController.getMasterById);

module.exports = router;
