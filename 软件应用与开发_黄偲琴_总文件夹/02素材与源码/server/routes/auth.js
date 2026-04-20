const express = require("express");
const { register, login, getProfile, updateProfile } = require("../controllers/authController");
const { requireAuth } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", requireAuth, getProfile);
router.put("/profile", requireAuth, updateProfile);

module.exports = router;
