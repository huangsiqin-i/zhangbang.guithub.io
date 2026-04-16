const express = require("express");
const { createWork, getMyWorks, listWorks, getWorksStats, reviewWork } = require("../controllers/worksController");
const { requireAuth, requireAdmin } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/", requireAuth, createWork);
router.patch("/:id/review", requireAuth, requireAdmin, reviewWork);
router.get("/my", requireAuth, getMyWorks);
router.get("/stats", getWorksStats);
router.get("/", listWorks);

module.exports = router;
