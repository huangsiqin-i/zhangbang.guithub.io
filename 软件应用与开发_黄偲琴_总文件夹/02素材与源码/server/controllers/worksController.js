const pool = require("../db/connection");

function validateWorkInput(title, description) {
  if (typeof title !== "string") {
    return "Title must be a string";
  }

  if (title.trim().length < 2 || title.trim().length > 120) {
    return "Title length must be between 2 and 120";
  }

  if (description && (typeof description !== "string" || description.trim().length > 5000)) {
    return "Description length must be less than 5000";
  }

  return null;
}

async function createWork(req, res) {
  const { title, description, colors, stripeWidth, imagePath } = req.body;
  const validationError = validateWorkInput(title, description);

  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  try {
    const cleanTitle = title.trim();
    const cleanDescription = description.trim();
    const colorsJson = colors ? JSON.stringify(colors) : null;
    const width = stripeWidth || 30;

    const [result] = await pool.query(
      "INSERT INTO works (title, description, author_id, status, colors, stripeWidth, imagePath) VALUES (?, ?, ?, 'approved', ?, ?, ?)",
      [cleanTitle, cleanDescription, req.user.id, colorsJson, width, imagePath]
    );

    return res.status(201).json({
      success: true,
      message: "Work created successfully",
      work: {
        id: result.insertId,
        title: cleanTitle,
        description: cleanDescription,
        authorId: req.user.id,
        status: "approved",
        colors: colors,
        stripeWidth: width,
        imagePath: imagePath
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

  const whereParts = [];
  const params = [];

  if (keyword) {
    whereParts.push("(w.title LIKE ? OR w.description LIKE ?)");
    const keywordLike = `%${keyword}%`;
    params.push(keywordLike, keywordLike);
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
         w.colors,
         w.stripeWidth,
         w.imagePath,
         u.id AS author_id,
         u.username AS author_name
       FROM works w
       LEFT JOIN users u ON u.id = w.author_id
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
      `SELECT COUNT(*) AS total FROM works`
    );

    return res.status(200).json({
      message: "Works stats fetched",
      stats: {
        total: Number(row.total || 0)
      }
    });
  } catch (error) {
    return res.status(500).json({
      message: "Fetch works stats failed",
      error: error.message
    });
  }
}

async function adminListWorks(req, res) {
  const status = req.query.status;
  let whereSql = "";
  const params = [];

  if (status && status !== 'all') {
    whereSql = "WHERE w.status = ?";
    params.push(status);
  }

  try {
    const [rows] = await pool.query(
      `SELECT
         w.id,
         w.title,
         w.description,
         w.status,
         w.created_at,
         w.colors,
         w.stripeWidth,
         w.imagePath,
         u.id AS author_id,
         u.username AS author_name
       FROM works w
       LEFT JOIN users u ON u.id = w.author_id
       ${whereSql}
       ORDER BY w.created_at DESC`,
      params
    );

    return res.status(200).json({
      message: "Works list fetched",
      works: rows
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Fetch works failed",
      error: error.message
    });
  }
}

async function adminGetWork(req, res) {
  const workId = Number.parseInt(req.params.id, 10);

  if (Number.isNaN(workId) || workId < 1) {
    return res.status(400).json({
      success: false,
      message: "Invalid work id"
    });
  }

  try {
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
       WHERE w.id = ?`,
      [workId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Work not found"
      });
    }

    return res.status(200).json({
      success: true,
      data: rows[0]
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Fetch work failed",
      error: error.message
    });
  }
}

async function deleteWork(req, res) {
  const workId = Number.parseInt(req.params.id, 10);

  if (Number.isNaN(workId) || workId < 1) {
    return res.status(400).json({
      success: false,
      message: "Invalid work id"
    });
  }

  try {
    const [result] = await pool.query(
      "DELETE FROM works WHERE id = ?",
      [workId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Work not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Work deleted successfully"
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Delete work failed",
      error: error.message
    });
  }
}

module.exports = {
  createWork,
  getMyWorks,
  listWorks,
  getWorksStats,
  adminListWorks,
  adminGetWork,
  deleteWork
};
