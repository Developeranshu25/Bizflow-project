const db = require('../config/db');
const pdfService = require('../services/pdfService');

exports.getStock = async (req, res) => {
  try {
    const { category } = req.query;
    let sql = 'SELECT * FROM products WHERE 1=1';
    const params = [];
    if (category) { sql += ' AND category = ?'; params.push(category); }
    sql += ' ORDER BY category, name';
    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getMonthlySales = async (req, res) => {
  try {
    const { month, year } = req.query;
    const m = month || (new Date().getMonth() + 1);
    const y = year || new Date().getFullYear();

    const [invoices] = await db.query(
      `SELECT i.*, p.name as party_name
       FROM invoices i LEFT JOIN parties p ON p.id = i.party_id
       WHERE MONTH(i.created_at) = ? AND YEAR(i.created_at) = ?
       ORDER BY i.created_at DESC`,
      [m, y]
    );

    const [summary] = await db.query(
      `SELECT COUNT(*) as total_invoices,
              COALESCE(SUM(subtotal),0) as total_subtotal,
              COALESCE(SUM(cgst_amount),0) as total_cgst,
              COALESCE(SUM(sgst_amount),0) as total_sgst,
              COALESCE(SUM(total),0) as total_amount,
              COALESCE(SUM(CASE WHEN status='paid' THEN total ELSE 0 END),0) as collected
       FROM invoices
       WHERE MONTH(created_at) = ? AND YEAR(created_at) = ?`,
      [m, y]
    );

    res.json({ summary: summary[0], invoices, month: m, year: y });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getDashboard = async (req, res) => {
  try {
    const [[totalSales]] = await db.query(`SELECT COALESCE(SUM(total),0) as val FROM invoices WHERE MONTH(created_at)=MONTH(NOW()) AND YEAR(created_at)=YEAR(NOW())`);
    const [[totalInvoices]] = await db.query(`SELECT COUNT(*) as val FROM invoices WHERE MONTH(created_at)=MONTH(NOW()) AND YEAR(created_at)=YEAR(NOW())`);
    const [[unpaid]] = await db.query(`SELECT COUNT(*) as val FROM invoices WHERE status='unpaid'`);
    const [[lowStock]] = await db.query(`SELECT COUNT(*) as val FROM products WHERE quantity <= 5`);
    const [recentInvoices] = await db.query(
      `SELECT i.*, p.name as party_name FROM invoices i LEFT JOIN parties p ON p.id=i.party_id ORDER BY i.created_at DESC LIMIT 5`
    );
    res.json({
      monthlySales: parseFloat(totalSales.val),
      monthlyInvoices: totalInvoices.val,
      unpaidCount: unpaid.val,
      lowStockCount: lowStock.val,
      recentInvoices
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.downloadStockPDF = async (req, res) => {
  try {
    const [products] = await db.query('SELECT * FROM products ORDER BY category, name');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=stock-report.pdf');
    pdfService.generateStockReport(products, res);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.downloadSalesPDF = async (req, res) => {
  try {
    const { month, year } = req.query;
    const m = month || (new Date().getMonth() + 1);
    const y = year || new Date().getFullYear();
    const [invoices] = await db.query(
      `SELECT i.*, p.name as party_name FROM invoices i LEFT JOIN parties p ON p.id=i.party_id
       WHERE MONTH(i.created_at)=? AND YEAR(i.created_at)=? ORDER BY i.created_at DESC`,
      [m, y]
    );
    const [[summary]] = await db.query(
      `SELECT COALESCE(SUM(subtotal),0) as subtotal, COALESCE(SUM(cgst_amount),0) as cgst,
              COALESCE(SUM(sgst_amount),0) as sgst, COALESCE(SUM(total),0) as total
       FROM invoices WHERE MONTH(created_at)=? AND YEAR(created_at)=?`,
      [m, y]
    );
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=sales-report-${y}-${m}.pdf`);
    pdfService.generateSalesReport({ invoices, summary, month: m, year: y }, res);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};
