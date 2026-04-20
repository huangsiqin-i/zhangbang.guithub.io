const express = require('express');
const router = express.Router();
const favoriteController = require('../controllers/favoriteController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/', authMiddleware, favoriteController.getUserFavorites);
router.post('/', authMiddleware, favoriteController.addFavorite);
router.delete('/:bondianId', authMiddleware, favoriteController.removeFavorite);

module.exports = router;
