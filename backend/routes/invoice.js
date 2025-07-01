// routes/invoice.js
const express = require('express');
const router  = express.Router();
const verify  = require('../middlewares/verifyToken');
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
router.post('/',            verify, ctr.createInvoice);
router.patch('/:id',        verify, ctr.updateInvoice);
router.patch('/:id/paid',   verify, ctr.toggleInvoicePaid);
router.post('/:id/proof',   verify, upload.single('file'), ctr.uploadPaymentProof);
router.delete('/:id',       verify, ctr.deleteInvoice);

module.exports = router;
