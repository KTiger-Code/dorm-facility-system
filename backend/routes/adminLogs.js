const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken');
const { getAdminLogs, getMyAdminLogs, getAdminLogStats, cleanupOldLogs } = require('../controllers/adminLogController');

// ตรวจสอบว่าเป็น admin
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'ไม่มีสิทธิ์เข้าถึง'
    });
  }
  next();
};

// GET /api/admin-logs - ดึงรายการ admin logs ทั้งหมด (เฉพาะ admin)
router.get('/', verifyToken, isAdmin, getAdminLogs);

// GET /api/admin-logs/my - ดึง admin logs ของตัวเอง
router.get('/my', verifyToken, isAdmin, getMyAdminLogs);

// GET /api/admin-logs/stats - ดึงสถิติ admin logs
router.get('/stats', verifyToken, isAdmin, getAdminLogStats);

// DELETE /api/admin-logs/cleanup - ลบ logs เก่า (สำหรับ maintenance)
router.delete('/cleanup', verifyToken, isAdmin, cleanupOldLogs);

module.exports = router;