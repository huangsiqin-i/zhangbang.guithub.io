const pool = require("../db/connection");

function validateWorkInput(title, description) {
  if (typeof title !== "string" || typeof description !== "string") {
    return "Title and description must be strings";
  }

  if (title.trim().length < 2 || title.trim().length > 120) {
    return "Title length must be between 2 and 120";
  }

  if (description.trim().length < 10 || description.trim().length > 5000) {
    return "Description length must be between 10 and 5000";
  }

  return null;
}

async function createWork(req, res) {
  const { title, description } = req.body;
  const validationError = validateWorkInput(title, description);

  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  try {
    const cleanTitle = title.trim();
    const cleanDescription = description.trim();

    const [result] = await pool.query(
      "INSERT INTO works (title, description, author_id, status) VALUES (?, ?, ?, 'pending')",
      [cleanTitle, cleanDescription, req.user.id]
    );

    return res.status(201).json({
      message: "Work created successfully",
      work: {
        id: result.insertId,
        title: cleanTitle,
        description: cleanDescription,
        authorId: req.user.id,
        status: "pending"
      }
    });
  } catch (error) {
    return res.status(500).json({
      message: "Create work failed",
      error: error.message
    });
  }
}

async function getMyWorks(req, res) {
  try {
    const [rows] = await pool.query(
      "SELECT id, title, description, status, created_at FROM works WHERE author_id = ? ORDER BY created_at DESC",
      [req.user.id]
    );

    return res.status(200).json({
      message: "My works fetched",
      total: rows.length,
      works: rows
    });
  } catch (error) {
    return res.status(500).json({
      message: "Fetch my works failed",
      error: error.message
    });
  }
}

function normalizePage(value, fallback) {
  const page = Number.parseInt(value, 10);
  if (Number.isNaN(page) || page < 1) {
    return fallback;
  }
  return page;
}

async function listWorks(req, res) {
  const page = normalizePage(req.query.page, 1);
  const pageSize = normalizePage(req.query.pageSize, 10);
  const safePageSize = Math.min(pageSize, 50);
  const offset = (page - 1) * safePageSize;

  const keyword = (req.query.keyword || "").trim();
  const status = (req.query.status || "approved").trim();
  const allowedStatus = ["pending", "approved", "rejected", "all"];
  const safeStatus = allowedStatus.includes(status) ? status : "approved";

  const whereParts = [];
  const params = [];

  if (keyword) {
    whereParts.push("(w.title LIKE ? OR w.description LIKE ?)");
    const keywordLike = `%${keyword}%`;
    params.push(keywordLike, keywordLike);
  }

  if (safeStatus !== "all") {
    whereParts.push("w.status = ?");
    params.push(safeStatus);
  }

  const whereSql = whereParts.length > 0 ? `WHERE ${whereParts.join(" AND ")}` : "";

  try {
    const [countRows] = await pool.query(
      `SELECT COUNT(*) AS total
       FROM works w
       ${whereSql}`,
      params
    );

    const [rows] = await pool.query(
      `SELECT
         w.id,
         w.title,
         w.description,
         w.status,
         w.created_at,
         u.id AS author_id,
         u.username AS author_name
       FROM works w
       JOIN users u ON u.id = w.author_id
       ${whereSql}
       ORDER BY w.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, safePageSize, offset]
    );

    return res.status(200).json({
      message: "Works list fetched",
      pagination: {
        page,
        pageSize: safePageSize,
        total: countRows[0].total
      },
      filters: {
        keyword,
        status: safeStatus
      },
      works: rows
    });
  } catch (error) {
    return res.status(500).json({
      message: "Fetch works list failed",
      error: error.message
    });
  }
}

async function getWorksStats(req, res) {
  try {
    const [[row]] = await pool.query(
      `SELECT
         COUNT(*) AS total,
         SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pending_count,
         SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) AS approved_count,
         SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) AS rejected_count
       FROM works`
    );

    return res.status(200).json({
      message: "Works stats fetched",
      stats: {
        total: Number(row.total || 0),
        pending: Number(row.pending_count || 0),
        approved: Number(row.approved_count || 0),
        rejected: Number(row.rejected_count || 0)
      }
    });
  } catch (error) {
    return res.status(500).json({
      message: "Fetch works stats failed",
      error: error.message
    });
  }
}

async function reviewWork(req, res) {
  const workId = Number.parseInt(req.params.id, 10);
  const { status } = req.body;
  const allowedStatus = ["approved", "rejected"];

  if (Number.isNaN(workId) || workId < 1) {
    return res.status(400).json({
      message: "Invalid work id"
    });
  }

  if (!allowedStatus.includes(status)) {
    return res.status(400).json({
      message: "Status must be approved or rejected"
    });
  }

  try {
    const [result] = await pool.query(
      "UPDATE works SET status = ? WHERE id = ?",
      [status, workId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Work not found"
      });
    }

    const [[updatedWork]] = await pool.query(
      "SELECT id, title, status, created_at FROM works WHERE id = ? LIMIT 1",
      [workId]
    );

    return res.status(200).json({
      message: "Work review updated",
      work: updatedWork
    });
  } catch (error) {
    return res.status(500).json({
      message: "Update review status failed",
      error: error.message
    });
  }
}

module.exports = {
  createWork,
  getMyWorks,
  listWorks,
  getWorksStats,
  reviewWork
};
