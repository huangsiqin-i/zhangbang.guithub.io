const express = require('express');
const router = express.Router();
const bondianController = require('../controllers/bondianController');

router.get('/', bondianController.getAllBondians);
router.get('/:id', bondianController.getBondianById);
router.post('/', bondianController.createBondian);
router.put('/:id', bondianController.updateBondian);
router.delete('/:id', bondianController.deleteBondian);

router.get('/types/all', bondianController.getBondianTypes);
router.get('/regions/all', bondianController.getRegions);

// 图鉴样式管理
router.get('/admin/patterns', bondianController.getAdminPatterns);
router.delete('/admin/patterns/:id', bondianController.deleteAdminPattern);

module.exports = router;
