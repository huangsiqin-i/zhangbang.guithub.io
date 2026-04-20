const express = require('express');
const router = express.Router();
const patternsController = require('../controllers/patternsController');

router.get('/', patternsController.getAllPatterns);
router.get('/:id', patternsController.getPatternById);

module.exports = router;
