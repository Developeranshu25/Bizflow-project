const db = require('../config/db');

exports.getAll = async (req, res) => {
  try {
    const { search } = req.query;
    let sql = 'SELECT * FROM parties WHERE 1=1';
    const params = [];
    if (search) { sql += ' AND (name LIKE ? OR phone LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
    sql += ' ORDER BY name ASC';
    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getOne = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM parties WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Party not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.create = async (req, res) => {
  try {
    const { name, phone, gstin, address } = req.body;
    if (!name) return res.status(400).json({ error: 'Party name required' });
    const [result] = await db.query(
      'INSERT INTO parties (name, phone, gstin, address) VALUES (?,?,?,?)',
      [name, phone || null, gstin || null, address || null]
    );
    const [rows] = await db.query('SELECT * FROM parties WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.update = async (req, res) => {
  try {
    const { name, phone, gstin, address } = req.body;
    await db.query(
      'UPDATE parties SET name=?, phone=?, gstin=?, address=? WHERE id=?',
      [name, phone, gstin, address, req.params.id]
    );
    const [rows] = await db.query('SELECT * FROM parties WHERE id = ?', [req.params.id]);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.remove = async (req, res) => {
  try {
    await db.query('DELETE FROM parties WHERE id = ?', [req.params.id]);
    res.json({ message: 'Party deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getLedger = async (req, res) => {
  try {
    const [invoices] = await db.query(
      `SELECT i.*, COALESCE(SUM(p.amount),0) as paid_amount
       FROM invoices i
       LEFT JOIN payments p ON p.invoice_id = i.id
       WHERE i.party_id = ?
       GROUP BY i.id ORDER BY i.created_at DESC`,
      [req.params.id]
    );
    res.json(invoices);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};
