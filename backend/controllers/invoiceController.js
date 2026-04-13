const db = require('../config/db');
const gstService = require('../services/gstService');

exports.getAll = async (req, res) => {
  try {
    const { status, party_id, from, to } = req.query;
    let sql = `SELECT i.*, p.name as party_name,
               COALESCE((SELECT SUM(pm.amount) FROM payments pm WHERE pm.invoice_id = i.id),0) as paid_amount
               FROM invoices i LEFT JOIN parties p ON p.id = i.party_id WHERE 1=1`;
    const params = [];
    if (status) { sql += ' AND i.status = ?'; params.push(status); }
    if (party_id) { sql += ' AND i.party_id = ?'; params.push(party_id); }
    if (from) { sql += ' AND DATE(i.created_at) >= ?'; params.push(from); }
    if (to) { sql += ' AND DATE(i.created_at) <= ?'; params.push(to); }
    sql += ' ORDER BY i.created_at DESC';
    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getOne = async (req, res) => {
  try {
    const [invoices] = await db.query(
      `SELECT i.*, p.name as party_name, p.phone as party_phone,
              p.gstin as party_gstin, p.address as party_address
       FROM invoices i LEFT JOIN parties p ON p.id = i.party_id
       WHERE i.id = ?`,
      [req.params.id]
    );
    if (invoices.length === 0) return res.status(404).json({ error: 'Invoice not found' });
    const [items] = await db.query('SELECT * FROM invoice_items WHERE invoice_id = ?', [req.params.id]);
    const [payments] = await db.query('SELECT * FROM payments WHERE invoice_id = ?', [req.params.id]);
    res.json({ ...invoices[0], items, payments });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.create = async (req, res) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const { party_id, items, cgst_rate = 9, sgst_rate = 9, payment_method = 'cash', notes } = req.body;
    if (!items || items.length === 0) return res.status(400).json({ error: 'At least one item required' });

    const calc = gstService.calculate(items, cgst_rate, sgst_rate);
    const [last] = await conn.query('SELECT MAX(id) as lastId FROM invoices');
    const invoice_no = gstService.generateInvoiceNo(last[0].lastId);

    const [result] = await conn.query(
      `INSERT INTO invoices (invoice_no, party_id, user_id, subtotal, cgst_rate, sgst_rate,
       cgst_amount, sgst_amount, total, payment_method, notes)
       VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
      [invoice_no, party_id || null, req.user.id, calc.subtotal, calc.cgstRate, calc.sgstRate,
       calc.cgstAmount, calc.sgstAmount, calc.total, payment_method, notes || null]
    );
    const invoiceId = result.insertId;

    for (const item of items) {
      const lineTotal = parseFloat(item.rate) * parseInt(item.quantity);
      await conn.query(
        `INSERT INTO invoice_items (invoice_id, product_id, product_name, rate, quantity, unit, line_total)
         VALUES (?,?,?,?,?,?,?)`,
        [invoiceId, item.product_id || null, item.product_name, item.rate, item.quantity, item.unit || 'pcs', lineTotal]
      );
      // Deduct stock if product_id provided
      if (item.product_id) {
        await conn.query('UPDATE products SET quantity = quantity - ? WHERE id = ? AND quantity >= ?',
          [item.quantity, item.product_id, item.quantity]);
      }
    }

    // Auto-record payment if cash/upi and mark paid
    if (payment_method === 'cash' || payment_method === 'upi') {
      await conn.query(
        'INSERT INTO payments (invoice_id, amount, method) VALUES (?,?,?)',
        [invoiceId, calc.total, payment_method]
      );
      await conn.query("UPDATE invoices SET status='paid' WHERE id=?", [invoiceId]);
    }

    await conn.commit();
    const [rows] = await db.query('SELECT * FROM invoices WHERE id = ?', [invoiceId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  } finally {
    conn.release();
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    await db.query('UPDATE invoices SET status=? WHERE id=?', [status, req.params.id]);
    res.json({ message: 'Status updated' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.remove = async (req, res) => {
  try {
    await db.query('DELETE FROM invoices WHERE id = ?', [req.params.id]);
    res.json({ message: 'Invoice deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};
