const db = require('../config/db');

exports.create = async (req, res) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const { invoice_id, amount, method, reference } = req.body;
    if (!invoice_id || !amount) return res.status(400).json({ error: 'invoice_id and amount required' });

    await conn.query(
      'INSERT INTO payments (invoice_id, amount, method, reference) VALUES (?,?,?,?)',
      [invoice_id, amount, method || 'cash', reference || null]
    );

    // Update invoice status
    const [inv] = await conn.query('SELECT total FROM invoices WHERE id=?', [invoice_id]);
    const [paid] = await conn.query('SELECT COALESCE(SUM(amount),0) as total FROM payments WHERE invoice_id=?', [invoice_id]);
    const paidTotal = parseFloat(paid[0].total);
    const invoiceTotal = parseFloat(inv[0].total);

    let status = 'unpaid';
    if (paidTotal >= invoiceTotal) status = 'paid';
    else if (paidTotal > 0) status = 'partial';

    await conn.query('UPDATE invoices SET status=? WHERE id=?', [status, invoice_id]);
    await conn.commit();
    res.status(201).json({ message: 'Payment recorded', status });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  } finally {
    conn.release();
  }
};

exports.getByInvoice = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM payments WHERE invoice_id = ? ORDER BY paid_at DESC', [req.params.invoiceId]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};
