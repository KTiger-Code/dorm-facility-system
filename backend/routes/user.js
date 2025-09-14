// routes/user.js
const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken');
const { adminLogger } = require('../middlewares/adminLogger');
const {
  getAllUsers,
  createUser,
  updateUser,
  updateUserRole,
  deleteUser
} = require('../controllers/userController');

router.get('/',          verifyToken, getAllUsers);
router.post('/',         verifyToken, adminLogger('สร้างผู้ใช้ใหม่', 'users'), createUser);        // สร้างใหม่
router.put('/:id',       verifyToken, adminLogger('แก้ไขข้อมูลผู้ใช้', 'users'), updateUser);        // แก้ไขข้อมูล
router.patch('/:id/role',verifyToken, adminLogger('เปลี่ยนบทบาทผู้ใช้', 'users'), updateUserRole);    // เปลี่ยน role
router.delete('/:id',    verifyToken, adminLogger('ลบผู้ใช้', 'users'), deleteUser);

module.exports = router;
