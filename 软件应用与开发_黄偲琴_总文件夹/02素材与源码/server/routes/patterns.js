const express = require('express');
const router = express.Router();
const patternsController = require('../controllers/patternsController');

router.get('/', patternsController.getPatterns);
router.get('/:id', patternsController.getPatternById);
router.post('/', patternsController.createPattern);
router.put('/:id', patternsController.updatePattern);
router.delete('/:id', patternsController.deletePattern);
router.put('/:id/status', patternsController.updatePatternStatus);

module.exports = router;