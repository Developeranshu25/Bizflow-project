const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/authController');
const auth = require('../middleware/authMiddleware');
router.post('/login', ctrl.login);
router.put('/password', auth, ctrl.changePassword);
module.exports = router;
