const express = require("express");
const { createWork, getMyWorks, listWorks, getWorksStats, adminListWorks, adminGetWork, deleteWork } = require("../controllers/worksController");
const { requireAuth, requireAdmin } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/", requireAuth, createWork);
router.get("/my", requireAuth, getMyWorks);
router.get("/stats", getWorksStats);
router.get("/", listWorks);

// 管理员接口
router.get("/admin", requireAuth, requireAdmin, adminListWorks);
router.get("/admin/:id", requireAuth, requireAdmin, adminGetWork);
router.delete("/:id", requireAuth, requireAdmin, deleteWork);

module.exports = router;
