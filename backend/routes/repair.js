const express = require('express');
const router  = express.Router();
const verify  = require('../middlewares/verifyToken');
const { adminLogger } = require('../middlewares/adminLogger');
const ctr     = require('../controllers/repairController');

// ผู้พัก (resident) ดูและสร้างคำขอซ่อมของตัวเอง
router.post('/',            verify, ctr.createRepairRequest);
router.get('/',             verify, ctr.getRepairRequests);

// เจ้าหน้าที่ (admin)
// ดูทุกคำขอ
router.get('/all',          verify, ctr.getAllRepairRequests);
// อัพเดตสถานะอย่างเดียว
router.patch('/:id/status', verify, adminLogger('อัพเดตสถานะคำขอซ่อม', 'repair_requests'), ctr.updateRepairStatus);
// อัพเดตข้อมูลอื่นๆ (title, description) ถ้าต้องการ
router.patch('/:id',        verify, adminLogger('แก้ไขคำขอซ่อม', 'repair_requests'), ctr.updateRepairRequest);
// ลบคำขอซ่อม
router.delete('/:id',       verify, adminLogger('ลบคำขอซ่อม', 'repair_requests'), ctr.deleteRepairRequest);

module.exports = router;
