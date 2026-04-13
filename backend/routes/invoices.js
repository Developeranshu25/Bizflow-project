const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/invoiceController');
const pdfService = require('../services/pdfService');
const db = require('../config/db');
const auth = require('../middleware/authMiddleware');
router.use(auth);
router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getOne);
router.post('/', ctrl.create);
router.patch('/:id/status', ctrl.updateStatus);
router.delete('/:id', ctrl.remove);
router.get('/:id/pdf', async (req, res) => {
  try {
    const [invoices] = await db.query(
      `SELECT i.*, p.name as party_name, p.phone as party_phone, p.gstin as party_gstin, p.address as party_address
       FROM invoices i LEFT JOIN parties p ON p.id=i.party_id WHERE i.id=?`, [req.params.id]
    );
    if (!invoices.length) return res.status(404).json({ error: 'Not found' });
    const [items] = await db.query('SELECT * FROM invoice_items WHERE invoice_id=?', [req.params.id]);
    const data = { ...invoices[0], items };
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${data.invoice_no}.pdf`);
    pdfService.generateInvoice(data, res);
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});
module.exports = router;
