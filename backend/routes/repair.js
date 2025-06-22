const express = require('express');
const router  = express.Router();
const verify  = require('../middlewares/verifyToken');
const ctr     = require('../controllers/repairController');

// ผู้พัก (resident) ดูและสร้างคำขอซ่อมของตัวเอง
router.post('/',            verify, ctr.createRepairRequest);
router.get('/',             verify, ctr.getRepairRequests);

// เจ้าหน้าที่ (admin)
// ดูทุกคำขอ
router.get('/all',          verify, ctr.getAllRepairRequests);
// อัพเดตสถานะอย่างเดียว
router.patch('/:id/status', verify, ctr.updateRepairStatus);
// อัพเดตข้อมูลอื่นๆ (title, description) ถ้าต้องการ
router.patch('/:id',        verify, ctr.updateRepairRequest);
// ถ้าต้องการ ลบคำขอซ่อม
// router.delete('/:id',     verify, ctr.deleteRepairRequest);

module.exports = router;
