const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');

router.get('/bondian/:bondianId', commentController.getCommentsByBondian);
router.post('/', commentController.createComment);
router.delete('/:id', commentController.deleteComment);

router.get('/admin/all', commentController.getAllComments);

module.exports = router;
