const db = require('../db');

exports.saveQrCheckin = async (req, res) => {
  const { room_number, checkin_time } = req.body;
  const userId = req.user?.id; // ป้องกัน error ถ้าไม่มี token

  console.log('📥 เช็คอินข้อมูลที่ได้รับ:');
  console.log('userId:', userId);
  console.log('room_number:', room_number);
  console.log('checkin_time:', checkin_time);

  if (!userId || !room_number || !checkin_time) {
    console.warn('❌ ข้อมูลไม่ครบ');
    return res.status(400).json({ error: 'ข้อมูลไม่ครบ' });
  }

  try {
    const [result] = await db.query(
      'INSERT INTO qr_checkins (user_id, room_number, checkin_time) VALUES (?, ?, ?)',
      [userId, room_number, checkin_time]
    );
    console.log('✅ เช็คอินสำเร็จ:', result);
    res.status(201).json({ message: 'Check-in data saved' });
  } catch (err) {
    console.error('❌ SQL Error:', err);
    res.status(500).json({ error: err.message });
  }
};
