const express = require('express');
const router = express.Router();
const verify = require('../middlewares/verifyToken');
const ctr = require('../controllers/facilityController');

// Resident: ดูและสร้างเฉพาะของตัวเอง
router.get('/', verify, ctr.getUserBookings);
router.post('/', verify, ctr.createBooking);

// Admin: ดู/สร้าง/แก้ไข/ลบ ทุกห้อง
router.get('/all', verify, ctr.getAllBookings);
router.patch('/:id', verify, ctr.updateBooking);
router.delete('/:id', verify, ctr.deleteBooking);

// Admin: อนุมัติ/ปฏิเสธการจอง
router.patch('/:id/status', verify, ctr.updateBookingStatus);

module.exports = router;
