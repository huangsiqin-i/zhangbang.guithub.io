const express = require('express');
const router = express.Router();
const mastersController = require('../controllers/mastersController');

router.get('/', mastersController.getMasters);
router.get('/:id', mastersController.getMasterById);
router.post('/', mastersController.createMaster);
router.put('/:id', mastersController.updateMaster);
router.delete('/:id', mastersController.deleteMaster);

module.exports = router;