// routes/user.js
const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken');
const {
  getAllUsers,
  createUser,
  updateUser,
  updateUserRole,
  deleteUser
} = require('../controllers/userController');

router.get('/',          verifyToken, getAllUsers);
router.post('/',         verifyToken, createUser);        // สร้างใหม่
router.put('/:id',       verifyToken, updateUser);        // แก้ไขข้อมูล
router.patch('/:id/role',verifyToken, updateUserRole);    // เปลี่ยน role
router.delete('/:id',    verifyToken, deleteUser);

module.exports = router;
