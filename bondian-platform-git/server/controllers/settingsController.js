const { pool } = require('../db/connection');

const getSettings = async (req, res) => {
  try {
    const [settings] = await pool.execute('SELECT * FROM settings');
    res.json(settings.length > 0 ? settings[0] : {});
  } catch (error) {
    res.status(500).json({ message: '获取设置失败', error: error.message });
  }
};

module.exports = { getSettings };
