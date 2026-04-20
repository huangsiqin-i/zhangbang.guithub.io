const { pool } = require('../db/connection');

const getAllComments = async (req, res) => {
  try {
    const [comments] = await pool.execute(
      'SELECT c.*, u.username, u.nickname, u.avatar_url FROM comments c LEFT JOIN users u ON c.user_id = u.id WHERE c.status = "approved" ORDER BY c.created_at DESC'
    );
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: '获取评论列表失败', error: error.message });
  }
};

const getCommentsByBondian = async (req, res) => {
  try {
    const [comments] = await pool.execute(
      'SELECT c.*, u.username, u.nickname, u.avatar_url FROM comments c LEFT JOIN users u ON c.user_id = u.id WHERE c.bondian_id = ? AND c.status = "approved" ORDER BY c.created_at DESC',
      [req.params.bondianId]
    );
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: '获取评论失败', error: error.message });
  }
};

const createComment = async (req, res) => {
  try {
    const { bondian_id, content, parent_id } = req.body;
    
    const [result] = await pool.execute(
      'INSERT INTO comments (bondian_id, user_id, content, parent_id, status) VALUES (?, ?, ?, ?, "approved")',
      [bondian_id, req.user.userId, content, parent_id || null]
    );
    
    res.status(201).json({ message: '评论成功', commentId: result.insertId });
  } catch (error) {
    res.status(500).json({ message: '评论失败', error: error.message });
  }
};

const deleteComment = async (req, res) => {
  try {
    await pool.execute('DELETE FROM comments WHERE id = ?', [req.params.id]);
    res.json({ message: '删除成功' });
  } catch (error) {
    res.status(500).json({ message: '删除失败', error: error.message });
  }
};

module.exports = { getAllComments, getCommentsByBondian, createComment, deleteComment };
