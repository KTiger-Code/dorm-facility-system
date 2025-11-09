const db = require('../db');
const axios = require('axios');

// เพิ่มพัสดุและแจ้งเตือน LINE
exports.addParcel = async (req, res) => {
  const { room_number, description } = req.body;
  
  console.log('📦 Validating parcel data:', {
    room_number,
    description,
    body: req.body
  });

  // ตรวจสอบข้อมูลที่จำเป็น
  if (!room_number || !description) {
    return res.status(400).json({
      success: false,
      message: 'กรุณากรอกเลขห้องและรายละเอียดพัสดุให้ครบถ้วน'
    });
  }

  try {
    // ตรวจสอบว่ามีห้องนี้ในระบบหรือไม่
    const [roomCheck] = await db.query(
      'SELECT room_number FROM users WHERE room_number = ?',
      [room_number]
    );

    if (roomCheck.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบเลขห้องนี้ในระบบ กรุณาตรวจสอบเลขห้องอีกครั้ง'
      });
    }

    // เพิ่มพัสดุลงฐานข้อมูล
    const [result] = await db.query(
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
          Authorization: `Bearer ${process.env.LINE_BOT_ACCESS_TOKEN}`
        }
      });

      console.log(`✅ แจ้งเตือนพัสดุไปยัง LINE: ${lineUserId}`);
    }

    // ส่งการแจ้งเตือนกลับไปยัง frontend
    const response = {
      success: true,
      message: 'เพิ่มพัสดุสำเร็จ',
      data: {
        room_number,
        description,
        id: result.insertId,
        received_at: new Date(),
        line_notification_sent: false
      }
    };

    // ถ้าผู้ใช้มี LINE ID จะส่งการแจ้งเตือน
    try {
      const [lineUser] = await db.query(
        'SELECT line_user_id FROM users WHERE room_number = ? AND line_user_id IS NOT NULL',
        [room_number]
      );

      if (lineUser.length > 0) {
        await axios.post('https://api.line.me/v2/bot/message/push', {
          to: lineUser[0].line_user_id,
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
            Authorization: `Bearer ${process.env.LINE_BOT_ACCESS_TOKEN}`
          }
        });
        
        console.log(`✅ ส่งการแจ้งเตือน LINE สำเร็จ: ${lineUser[0].line_user_id}`);
        response.data.line_notification_sent = true;
      }
    } catch (lineErr) {
      console.error('❌ ไม่สามารถส่งการแจ้งเตือน LINE:', lineErr);
      response.line_error = 'ไม่สามารถส่งการแจ้งเตือน LINE ได้';
    }

    res.status(201).json(response);

  } catch (err) {
    console.error('❌ เกิดข้อผิดพลาดในการเพิ่มพัสดุ:', err);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการเพิ่มพัสดุ',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error'
    });
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
