const db = require('../config/db');

exports.getAll = async (req, res) => {
  try {
    const { category, search } = req.query;
    let sql = 'SELECT * FROM products WHERE 1=1';
    const params = [];
    if (category) { sql += ' AND category = ?'; params.push(category); }
    if (search) { sql += ' AND name LIKE ?'; params.push(`%${search}%`); }
    sql += ' ORDER BY name ASC';
    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT DISTINCT category FROM products ORDER BY category');
    res.json(rows.map(r => r.category));
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getOne = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Product not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.create = async (req, res) => {
  try {
    const { name, price, quantity, unit, category } = req.body;
    if (!name || price == null) return res.status(400).json({ error: 'Name and price required' });
    const [result] = await db.query(
      'INSERT INTO products (name, price, quantity, unit, category) VALUES (?,?,?,?,?)',
      [name, price, quantity || 0, unit || 'pcs', category || 'General']
    );
    const [rows] = await db.query('SELECT * FROM products WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.update = async (req, res) => {
  try {
    const { name, price, quantity, unit, category } = req.body;
    await db.query(
      'UPDATE products SET name=?, price=?, quantity=?, unit=?, category=? WHERE id=?',
      [name, price, quantity, unit, category, req.params.id]
    );
    const [rows] = await db.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Product not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.remove = async (req, res) => {
  try {
    await db.query('DELETE FROM products WHERE id = ?', [req.params.id]);
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};
