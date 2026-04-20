const { pool } = require('../db/connection');

const getAllBondians = async (req, res) => {
  try {
    const [bondians] = await pool.execute(
      'SELECT b.*, t.name as type_name FROM bondians b LEFT JOIN bondian_types t ON b.type_id = t.id WHERE b.status = "approved" ORDER BY b.created_at DESC'
    );
    res.json(bondians);
  } catch (error) {
    res.status(500).json({ message: '获取邦典列表失败', error: error.message });
  }
};

const getBondianById = async (req, res) => {
  try {
    const [bondians] = await pool.execute(
      'SELECT b.*, t.name as type_name FROM bondians b LEFT JOIN bondian_types t ON b.type_id = t.id WHERE b.id = ? AND b.status = "approved"',
      [req.params.id]
    );
    
    if (bondians.length === 0) {
      return res.status(404).json({ message: '邦典不存在' });
    }
    
    await pool.execute('UPDATE bondians SET popularity = popularity + 1 WHERE id = ?', [req.params.id]);
    
    res.json(bondians[0]);
  } catch (error) {
    res.status(500).json({ message: '获取邦典详情失败', error: error.message });
  }
};

const getBondiansByType = async (req, res) => {
  try {
    const [bondians] = await pool.execute(
      'SELECT b.*, t.name as type_name FROM bondians b LEFT JOIN bondian_types t ON b.type_id = t.id WHERE b.type_id = ? AND b.status = "approved"',
      [req.params.typeId]
    );
    res.json(bondians);
  } catch (error) {
    res.status(500).json({ message: '获取邦典列表失败', error: error.message });
  }
};

const getBondiansByRegion = async (req, res) => {
  try {
    const [bondians] = await pool.execute(
      'SELECT b.*, t.name as type_name FROM bondians b LEFT JOIN bondian_types t ON b.type_id = t.id WHERE b.region = ? AND b.status = "approved"',
      [req.params.region]
    );
    res.json(bondians);
  } catch (error) {
    res.status(500).json({ message: '获取邦典列表失败', error: error.message });
  }
};

const createBondian = async (req, res) => {
  try {
    const { name, type_id, region, material, craftsmanship, color_description, pattern_description, image_url, origin_description, cultural_significance, usage_scenario } = req.body;
    
    const [result] = await pool.execute(
      'INSERT INTO bondians (name, type_id, region, material, craftsmanship, color_description, pattern_description, image_url, origin_description, cultural_significance, usage_scenario, author_id, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, "approved")',
      [name, type_id, region, material, craftsmanship, color_description, pattern_description, image_url, origin_description, cultural_significance, usage_scenario, req.user.userId]
    );
    
    res.status(201).json({ message: '创建成功', bondianId: result.insertId });
  } catch (error) {
    res.status(500).json({ message: '创建失败', error: error.message });
  }
};

const updateBondian = async (req, res) => {
  try {
    const { name, type_id, region, material, craftsmanship, color_description, pattern_description, image_url, origin_description, cultural_significance, usage_scenario } = req.body;
    
    await pool.execute(
      'UPDATE bondians SET name = ?, type_id = ?, region = ?, material = ?, craftsmanship = ?, color_description = ?, pattern_description = ?, image_url = ?, origin_description = ?, cultural_significance = ?, usage_scenario = ? WHERE id = ?',
      [name, type_id, region, material, craftsmanship, color_description, pattern_description, image_url, origin_description, cultural_significance, usage_scenario, req.params.id]
    );
    
    res.json({ message: '更新成功' });
  } catch (error) {
    res.status(500).json({ message: '更新失败', error: error.message });
  }
};

const deleteBondian = async (req, res) => {
  try {
    await pool.execute('DELETE FROM bondians WHERE id = ?', [req.params.id]);
    res.json({ message: '删除成功' });
  } catch (error) {
    res.status(500).json({ message: '删除失败', error: error.message });
  }
};

module.exports = { getAllBondians, getBondianById, getBondiansByType, getBondiansByRegion, createBondian, updateBondian, deleteBondian };
