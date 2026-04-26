const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');

router.get('/banners', settingsController.getBanners);
router.post('/banners', settingsController.createBanner);
router.put('/banners/:id', settingsController.updateBanner);
router.delete('/banners/:id', settingsController.deleteBanner);

router.get('/notice', settingsController.getNotice);
router.put('/notice', settingsController.updateNotice);

module.exports = router;