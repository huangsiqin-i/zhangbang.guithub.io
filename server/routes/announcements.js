const express = require('express');
const router = express.Router();
const announcementsController = require('../controllers/announcementsController');

router.get('/', announcementsController.getAnnouncements);
router.get('/active', announcementsController.getActiveAnnouncement);
router.post('/', announcementsController.createAnnouncement);
router.put('/:id', announcementsController.updateAnnouncement);
router.delete('/:id', announcementsController.deleteAnnouncement);

module.exports = router;