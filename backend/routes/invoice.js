// routes/invoice.js
const express = require('express');
const router  = express.Router();
const verify  = require('../middlewares/verifyToken');
const ctr     = require('../controllers/invoiceController');

// Resident
router.get('/',             verify, ctr.getMyInvoices);

// Admin (front-end จะใช้ AdminGuard ไปก่อน)
router.get('/all',          verify, ctr.getAllInvoices);
router.post('/',            verify, ctr.createInvoice);
router.patch('/:id',        verify, ctr.updateInvoice);
router.patch('/:id/paid',   verify, ctr.toggleInvoicePaid);
router.delete('/:id',       verify, ctr.deleteInvoice);

module.exports = router;
