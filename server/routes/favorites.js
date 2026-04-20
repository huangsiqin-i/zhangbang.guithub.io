const express = require('express');
const router = express.Router();
const favoriteController = require('../controllers/favoriteController');

router.post('/', favoriteController.addFavorite);
router.delete('/bondian/:bondianId', favoriteController.removeFavorite);
router.get('/user', favoriteController.getUserFavorites);
router.get('/check/:bondianId', favoriteController.checkFavorite);

module.exports = router;
