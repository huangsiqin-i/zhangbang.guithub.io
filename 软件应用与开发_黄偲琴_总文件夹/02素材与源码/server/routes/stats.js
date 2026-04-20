const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');

router.get('/', statsController.getStats);
router.get('/admin', statsController.getAdminStats);
router.get('/user', statsController.getUserStats);
router.get('/regions', statsController.getRegionStats);
router.get('/users', statsController.getUsersList);
router.put('/users/:id/promote', statsController.promoteUser);
router.put('/users/:id/demote', statsController.demoteUser);
router.put('/users/:id/ban', statsController.banUser);
router.put('/users/:id/unban', statsController.unbanUser);
router.delete('/users/:id', statsController.deleteUser);

module.exports = router;
