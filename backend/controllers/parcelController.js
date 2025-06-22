const db = require('../db');
const axios = require('axios');

// เพิ่มพัสดุและแจ้งเตือน LINE
exports.addParcel = async (req, res) => {
  const { room_number, description } = req.body;

  try {
    await db.query(
      'INSERT INTO parcels (room_number, description) VALUES (?, ?)',
      [room_number, description]
    );

    const [rows] = await db.query(
      'SELECT line_user_id FROM users WHERE room_number = ? AND line_user_id IS NOT NULL',
      [room_number]
    );

    if (rows.length > 0) {
      const lineUserId = rows[0].line_user_id;

      await axios.post('https://api.line.me/v2/bot/message/push', {
        to: lineUserId,
        messages: [
          {
            type: 'flex',
            altText: '📦 แจ้งเตือนพัสดุ',
            contents: {
              type: 'bubble',
              size: 'mega',
              body: {
                type: 'box',
                layout: 'vertical',
                contents: [
                  { type: 'text', text: '📦 พัสดุของคุณมาถึงแล้ว!', weight: 'bold', size: 'lg', color: '#1DB446' },
                  { type: 'separator', margin: 'md' },
                  { type: 'text', text: `ห้อง: ${room_number}` },
                  { type: 'text', text: `รายละเอียด: ${description}`, wrap: true },
                  { type: 'text', text: 'กรุณาติดต่อเจ้าหน้าที่เพื่อรับพัสดุ', margin: 'lg', size: 'sm', color: '#888888' }
                ]
              }
            }
          }
        ]
      }, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`
        }
      });

      console.log(`✅ แจ้งเตือนพัสดุไปยัง LINE: ${lineUserId}`);
    }

    res.status(201).json({ message: 'บันทึกพัสดุแล้ว' });
  } catch (err) {
    console.error('❌ Parcel Error:', err);
    res.status(500).json({ error: err.message });
  }
};

// ผู้พักดูของตัวเอง
exports.getParcelsByRoom = async (req, res) => {
  const userRoom = req.user.room_number;

  try {
    const [parcels] = await db.query(
      'SELECT * FROM parcels WHERE room_number = ? ORDER BY received_at DESC',
      [userRoom]
    );
    res.json(parcels);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// เจ้าหน้าที่ดูทั้งหมด
exports.getAllParcels = async (req, res) => {
  try {
    const [parcels] = await db.query(`
      SELECT 
        p.id,
        p.room_number,
        p.description,
        p.received_at,
        p.picked_up,
        u.fullname AS recipient_name
      FROM parcels p
      LEFT JOIN users u ON p.room_number = u.room_number
      ORDER BY p.received_at DESC
    `);
    res.json(parcels);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ลบพัสดุ
exports.deleteParcel = async (req, res) => {
  const parcelId = req.params.id;
  try {
    await db.query('DELETE FROM parcels WHERE id = ?', [parcelId]);
    res.json({ message: 'ลบพัสดุแล้ว' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Toggle รับพัสดุ
exports.togglePicked = async (req, res) => {
  const parcelId = req.params.id;
  try {
    await db.query(`
      UPDATE parcels 
      SET picked_up = NOT picked_up,
          picked_up_at = CASE WHEN picked_up = 0 THEN NOW() ELSE NULL END
      WHERE id = ?
    `, [parcelId]);

    res.json({ message: 'อัปเดตสถานะเรียบร้อย' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ PATCH: อัปเดตสถานะการรับพัสดุ
exports.updateParcelStatus = async (req, res) => {
  const parcelId = req.params.id;
  const { picked_up } = req.body;

  try {
    await db.query(
      'UPDATE parcels SET picked_up = ?, picked_up_at = ? WHERE id = ?',
      [picked_up, picked_up ? new Date() : null, parcelId]
    );

    res.json({ message: 'อัปเดตสถานะพัสดุแล้ว' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
