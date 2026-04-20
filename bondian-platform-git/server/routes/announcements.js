const express = require('express');
const router = express.Router();
const announcementsController = require('../controllers/announcementsController');

router.get('/', announcementsController.getAllAnnouncements);
router.get('/:id', announcementsController.getAnnouncementById);

module.exports = router;
