const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/paymentController');
const auth = require('../middleware/authMiddleware');
router.use(auth);
router.get('/invoice/:invoiceId', ctrl.getByInvoice);
router.post('/', ctrl.create);
module.exports = router;
