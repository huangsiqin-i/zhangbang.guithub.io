const express = require('express');
const router = express.Router();
const worksController = require('../controllers/worksController');

router.get('/', worksController.getAllWorks);
router.get('/:id', worksController.getWorkById);

module.exports = router;
