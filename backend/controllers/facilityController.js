const db = require('../db');

// POST /api/facility-booking
exports.createBooking = async (req, res) => {
  const {
    facility_name,
    booking_date,
    time_slot_start,
    time_slot_end,
    number_of_people
  } = req.body;
  const userId = req.user.id;

  try {
    const [result] = await db.query(
      `INSERT INTO facility_bookings
         (user_id, facility_name, booking_date, time_slot_start, time_slot_end, number_of_people, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [userId, facility_name, booking_date, time_slot_start, time_slot_end, number_of_people, 'pending']
    );
    // คืนข้อมูลใหม่กลับไป
    const [[newB]] = await db.query(
      `SELECT id, user_id, facility_name, booking_date, time_slot_start, time_slot_end, number_of_people, status
       FROM facility_bookings WHERE id = ?`,
      [result.insertId]
    );
    res.status(201).json(newB);
  } catch (err) {
    console.error('❌ createBooking error:', err);
    res.status(500).json({ error: err.message });
  }
};

// GET /api/facility-booking
exports.getUserBookings = async (req, res) => {
  const userId = req.user.id;
  try {
    const [rows] = await db.query(
      `SELECT id, user_id, facility_name, booking_date, time_slot_start, time_slot_end, number_of_people, 
              COALESCE(status, 'pending') as status
       FROM facility_bookings
       WHERE user_id = ?
       ORDER BY booking_date DESC`,
      [userId]
    );
    res.json(rows);
  } catch (err) {
    console.error('❌ getUserBookings error:', err);
    res.status(500).json({ error: err.message });
  }
};

// GET /api/facility-booking/all
exports.getAllBookings = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT b.id, b.user_id, u.room_number, b.facility_name,
              b.booking_date, b.time_slot_start, b.time_slot_end, b.number_of_people,
              COALESCE(b.status, 'pending') as status
       FROM facility_bookings AS b
       JOIN users AS u ON b.user_id = u.id
       ORDER BY b.booking_date DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error('❌ getAllBookings error:', err);
    res.status(500).json({ error: err.message });
  }
};

// PATCH /api/facility-booking/:id
exports.updateBooking = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const {
    facility_name,
    booking_date,
    time_slot_start,
    time_slot_end,
    number_of_people
  } = req.body;

  try {
    const [result] = await db.query(
      `UPDATE facility_bookings
       SET facility_name     = ?,
           booking_date      = ?,
           time_slot_start   = ?,
           time_slot_end     = ?,
           number_of_people  = ?
       WHERE id = ?`,
      [facility_name, booking_date, time_slot_start, time_slot_end, number_of_people, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    const [[upd]] = await db.query(
      `SELECT id, user_id, facility_name, booking_date, time_slot_start, time_slot_end, number_of_people
       FROM facility_bookings WHERE id = ?`,
      [id]
    );
    res.json(upd);
  } catch (err) {
    console.error('❌ updateBooking error:', err);
    res.status(500).json({ error: err.message });
  }
};

// DELETE /api/facility-booking/:id
exports.deleteBooking = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  try {
    const [del] = await db.query(
      `DELETE FROM facility_bookings WHERE id = ?`,
      [id]
    );
    if (del.affectedRows === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    res.json({ message: 'Booking deleted' });
  } catch (err) {
    console.error('❌ deleteBooking error:', err);
    res.status(500).json({ error: err.message });
  }
};

// PATCH /api/facility-booking/:id/status (สำหรับ Admin)
exports.updateBookingStatus = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { status } = req.body;

  // ตรวจสอบว่า status ถูกต้อง
  if (!['pending', 'approved', 'rejected'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  try {
    const [result] = await db.query(
      `UPDATE facility_bookings 
       SET status = ?
       WHERE id = ?`,
      [status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // ดึงข้อมูลที่อัพเดตแล้ว
    const [[updated]] = await db.query(
      `SELECT b.id, b.user_id, u.room_number, b.facility_name,
              b.booking_date, b.time_slot_start, b.time_slot_end, b.number_of_people,
              b.status
       FROM facility_bookings AS b
       JOIN users AS u ON b.user_id = u.id
       WHERE b.id = ?`,
      [id]
    );

    res.json(updated);
  } catch (err) {
    console.error('❌ updateBookingStatus error:', err);
    res.status(500).json({ error: err.message });
  }
};
