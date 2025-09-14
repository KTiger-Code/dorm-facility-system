const db = require('../db');

// POST /api/repair-request
exports.createRepairRequest = async (req, res) => {
  const { title, description } = req.body;
  const userId     = req.user.id;
  const roomNumber = req.user.room_number;

  try {
    const [result] = await db.query(
      `INSERT INTO repair_requests
         (user_id, title, description, room_number)
       VALUES (?, ?, ?, ?)`,
      [userId, title, description, roomNumber]
    );
    const insertId = result.insertId;

    const [[newReq]] = await db.query(
      `SELECT id, user_id, room_number, title, description, status, created_at, updated_at
       FROM repair_requests
       WHERE id = ?`,
      [insertId]
    );
    res.status(201).json(newReq);
  } catch (err) {
    console.error('❌ createRepairRequest error:', err);
    res.status(500).json({ error: err.message });
  }
};

// GET /api/repair-request
exports.getRepairRequests = async (req, res) => {
  const userId = req.user.id;
  try {
    const [rows] = await db.query(
      `SELECT id, user_id, room_number, title, description, status, created_at, updated_at
       FROM repair_requests
       WHERE user_id = ?
       ORDER BY created_at DESC`,
      [userId]
    );
    res.json(rows);
  } catch (err) {
    console.error('❌ getRepairRequests error:', err);
    res.status(500).json({ error: err.message });
  }
};

// GET /api/repair-request/all
exports.getAllRepairRequests = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT r.id, r.user_id, r.room_number, r.title, r.description, r.status,
              r.created_at, r.updated_at, u.fullname
       FROM repair_requests AS r
       LEFT JOIN users AS u ON r.user_id = u.id
       ORDER BY r.created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error('❌ getAllRepairRequests error:', err);
    res.status(500).json({ error: err.message });
  }
};

// PATCH /api/repair-request/:id/status
exports.updateRepairStatus = async (req, res) => {
  const id     = parseInt(req.params.id, 10);
  const { status } = req.body;
  if (!['pending','in_progress','completed'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status value' });
  }
  try {
    const [upd] = await db.query(
      `UPDATE repair_requests
       SET status = ?, updated_at = NOW()
       WHERE id = ?`,
      [status, id]
    );
    if (upd.affectedRows === 0) {
      return res.status(404).json({ error: 'Repair request not found' });
    }
    const [[updated]] = await db.query(
      `SELECT id, user_id, room_number, title, description, status, created_at, updated_at
       FROM repair_requests
       WHERE id = ?`,
      [id]
    );
    res.json(updated);
  } catch (err) {
    console.error('❌ updateRepairStatus error:', err);
    res.status(500).json({ error: err.message });
  }
};

// PATCH /api/repair-request/:id
// (อัพเดต title/description ด้วย ถ้าต้องการ)
exports.updateRepairRequest = async (req, res) => {
  const id            = parseInt(req.params.id, 10);
  const { title, description } = req.body;

  const sets = [];
  const params = [];

  if (title)       { sets.push('title = ?');       params.push(title); }
  if (description) { sets.push('description = ?'); params.push(description); }

  if (!sets.length) {
    return res.status(400).json({ error: 'No fields to update' });
  }

  sets.push('updated_at = NOW()');
  params.push(id);

  try {
    const [upd] = await db.query(
      `UPDATE repair_requests
       SET ${sets.join(', ')}
       WHERE id = ?`,
      params
    );
    if (upd.affectedRows === 0) {
      return res.status(404).json({ error: 'Repair request not found' });
    }
    const [[updated]] = await db.query(
      `SELECT id, user_id, room_number, title, description, status, created_at, updated_at
       FROM repair_requests
       WHERE id = ?`,
      [id]
    );
    res.json(updated);
  } catch (err) {
    console.error('❌ updateRepairRequest error:', err);
    res.status(500).json({ error: err.message });
  }
};

// DELETE /api/repair-request/:id
exports.deleteRepairRequest = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  try {
    await db.query('DELETE FROM repair_requests WHERE id = ?', [id]);
    res.json({ message: 'ลบคำขอซ่อมแล้ว' });
  } catch (err) {
    console.error('❌ deleteRepairRequest error:', err);
    res.status(500).json({ error: err.message });
  }
};


