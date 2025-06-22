// controllers/userController.js
const db = require('../db');
const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10;

// GET /api/users
exports.getAllUsers = async (req, res) => {
  try {
    const [users] = await db.query(
      `SELECT id, username, fullname, room_number, role, line_user_id, created_at
       FROM users
       ORDER BY room_number ASC`
    );
    res.json(users);
  } catch (err) {
    console.error('❌ getAllUsers error:', err);
    res.status(500).json({ error: err.message });
  }
};

// POST /api/users  ▶️ สร้างผู้ใช้ใหม่
exports.createUser = async (req, res) => {
  const { username, password, fullname, room_number, role } = req.body;
  if (!username || !password || !fullname || !room_number || !['resident','admin'].includes(role)) {
    return res.status(400).json({ error: 'ข้อมูลไม่สมบูรณ์หรือ role ไม่ถูกต้อง' });
  }
  try {
    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    const [result] = await db.query(
      `INSERT INTO users (username, password, fullname, room_number, role)
       VALUES (?, ?, ?, ?, ?)`,
      [username, hash, fullname, room_number, role]
    );
    res.status(201).json({ id: result.insertId });
  } catch (err) {
    console.error('❌ createUser error:', err);
    res.status(500).json({ error: err.message });
  }
};

// PUT /api/users/:id  ▶️ แก้ไขข้อมูลผู้ใช้ (ไม่แก้รหัสผ่าน ถ้าไม่ส่ง)
exports.updateUser = async (req, res) => {
  const userId = parseInt(req.params.id,10);
  const { username, password, fullname, room_number, role } = req.body;
  if (!username || !fullname || !room_number || !['resident','admin'].includes(role)) {
    return res.status(400).json({ error: 'ข้อมูลไม่สมบูรณ์หรือ role ไม่ถูกต้อง' });
  }
  try {
    let sql = `UPDATE users SET username=?, fullname=?, room_number=?, role=?`;
    const params = [username, fullname, room_number, role];
    if (password) {
      const hash = await bcrypt.hash(password, SALT_ROUNDS);
      sql += `, password=?`;
      params.push(hash);
    }
    sql += ` WHERE id=?`;
    params.push(userId);
    const [result] = await db.query(sql, params);
    if (result.affectedRows===0) {
      return res.status(404).json({ error:'User not found' });
    }
    res.json({ message:'แก้ไขผู้ใช้สำเร็จ' });
  } catch (err) {
    console.error('❌ updateUser error:', err);
    res.status(500).json({ error: err.message });
  }
};

// PATCH /api/users/:id/role  ▶️ เปลี่ยน role
exports.updateUserRole = async (req, res) => {
  const userId = parseInt(req.params.id,10);
  const { role } = req.body;
  if (!['resident','admin'].includes(role)) {
    return res.status(400).json({ error:'Invalid role' });
  }
  try {
    const [result] = await db.query(
      'UPDATE users SET role=? WHERE id=?',
      [role, userId]
    );
    if (result.affectedRows===0) {
      return res.status(404).json({ error:'User not found' });
    }
    res.json({ message:'อัปเดตสิทธิ์ผู้ใช้แล้ว' });
  } catch (err) {
    console.error('❌ updateUserRole error:', err);
    res.status(500).json({ error: err.message });
  }
};

// DELETE /api/users/:id
exports.deleteUser = async (req, res) => {
  const userId = parseInt(req.params.id,10);
  try {
    const [result] = await db.query(
      'DELETE FROM users WHERE id=?',
      [userId]
    );
    if (result.affectedRows===0) {
      return res.status(404).json({ error:'User not found' });
    }
    res.json({ message:'ลบผู้ใช้แล้ว' });
  } catch (err) {
    console.error('❌ deleteUser error:', err);
    res.status(500).json({ error: err.message });
  }
};
