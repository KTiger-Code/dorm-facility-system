// routes/invoice.js
const express = require('express');
const router  = express.Router();
const verify  = require('../middlewares/verifyToken');
const { adminLogger } = require('../middlewares/adminLogger');
const ctr     = require('../controllers/invoiceController');
const multer  = require('multer');
const path    = require('path');

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, path.join(__dirname, '..', 'uploads', 'slip'));
  },
  filename: (_req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e6);
    const ext = path.extname(file.originalname);
    cb(null, unique + ext);
  }
});
const upload = multer({ storage });

// Resident
router.get('/',             verify, ctr.getMyInvoices);

// Admin (front-end จะใช้ AdminGuard ไปก่อน)
router.get('/all',          verify, ctr.getAllInvoices);
router.post('/',            verify, adminLogger('สร้างใบแจ้งหนี้', 'invoices'), ctr.createInvoice);
router.patch('/:id',        verify, adminLogger('แก้ไขใบแจ้งหนี้', 'invoices'), ctr.updateInvoice);
router.patch('/:id/paid',   verify, adminLogger('อนุมัติการชำระเงิน', 'invoices'), ctr.toggleInvoicePaid);
router.post('/:id/proof',   verify, upload.single('file'), ctr.uploadPaymentProof);
router.delete('/:id',       verify, adminLogger('ลบใบแจ้งหนี้', 'invoices'), ctr.deleteInvoice);

module.exports = router;
