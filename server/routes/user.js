const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// 头像上传
router.post('/avatar', userController.uploadAvatar);

// 修改密码
router.put('/password', userController.changePassword);

// 我的作品
router.get('/works', userController.getMyWorks);
router.put('/works/:id', userController.updateWork);
router.delete('/works/:id', userController.deleteWork);

// 收藏邦典
router.get('/favorites/patterns', userController.getFavoritePatterns);
router.post('/favorites/patterns/:id', userController.addFavoritePattern);
router.delete('/favorites/patterns/:id', userController.removeFavoritePattern);

// 收藏宣言
router.get('/favorites/declarations', userController.getFavoriteDeclarations);
router.post('/favorites/declarations', userController.addFavoriteDeclaration);
router.delete('/favorites/declarations/:id', userController.removeFavoriteDeclaration);

// 浏览记录
router.get('/history', userController.getHistory);
router.post('/history', userController.addHistory);
router.delete('/history', userController.clearHistory);

module.exports = router;