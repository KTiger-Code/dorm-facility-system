const db = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const [user] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
    if (user.length === 0) return res.status(404).json({ message: 'User not found' });

    const match = await bcrypt.compare(password, user[0].password);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
  {
    id: user[0].id,
    role: user[0].role,
    room_number: user[0].room_number  // ✅ เพิ่มตรงนี้
  },
  process.env.JWT_SECRET,
  { expiresIn: '1d' }
);

    res.json({ token, role: user[0].role });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
