const { pool } = require('../db/connection');

const getAllAnnouncements = async (req, res) => {
  try {
    const [announcements] = await pool.execute('SELECT * FROM announcements ORDER BY created_at DESC');
    res.json(announcements);
  } catch (error) {
    res.status(500).json({ message: '获取公告列表失败', error: error.message });
  }
};

const getAnnouncementById = async (req, res) => {
  try {
    const [announcements] = await pool.execute('SELECT * FROM announcements WHERE id = ?', [req.params.id]);
    
    if (announcements.length === 0) {
      return res.status(404).json({ message: '公告不存在' });
    }
    
    res.json(announcements[0]);
  } catch (error) {
    res.status(500).json({ message: '获取公告详情失败', error: error.message });
  }
};

module.exports = { getAllAnnouncements, getAnnouncementById };
