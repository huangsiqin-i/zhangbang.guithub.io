const express = require('express');
const router = express.Router();
const bondianController = require('../controllers/bondianController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/', bondianController.getAllBondians);
router.get('/:id', bondianController.getBondianById);
router.get('/type/:typeId', bondianController.getBondiansByType);
router.get('/region/:region', bondianController.getBondiansByRegion);
router.post('/', authMiddleware, bondianController.createBondian);
router.put('/:id', authMiddleware, bondianController.updateBondian);
router.delete('/:id', authMiddleware, bondianController.deleteBondian);

module.exports = router;
