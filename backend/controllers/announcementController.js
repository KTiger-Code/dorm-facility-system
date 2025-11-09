const db = require('../db');
const axios = require('axios');

// POST /api/announcements
exports.postAnnouncement = async (req, res) => {
  const { title, content } = req.body;
  const posted_by = req.user.id;

  try {
    // 1. บันทึกลง DB
    await db.query(
      'INSERT INTO announcements (title, content, posted_by) VALUES (?, ?, ?)',
      [title, content, posted_by]
    );

    // 2. ดึงชื่อผู้โพสต์
    const [[user]] = await db.query(
      'SELECT fullname FROM users WHERE id = ?',
      [posted_by]
    );

    const postedByName = user?.fullname || 'เจ้าหน้าที่';

    // 3. ดึง line_user_id ทั้งหมด
    const [users] = await db.query(
      'SELECT line_user_id FROM users WHERE line_user_id IS NOT NULL'
    );

    // 4. ส่ง LINE Flex Message ไปยังทุกคน
    for (const u of users) {
      if (u.line_user_id) {
        try {
          await axios.post(
            'https://api.line.me/v2/bot/message/push',
            {
              to: u.line_user_id,
              messages: [
                {
                  type: 'flex',
                  altText: `📢 ประกาศใหม่: ${title}`,
                  contents: {
                    type: 'bubble',
                    body: {
                      type: 'box',
                      layout: 'vertical',
                      contents: [
                        { type: 'text', text: '📢 ประกาศจากหอพัก', weight: 'bold', size: 'lg', color: '#FF6F00' },
                        { type: 'text', text: title, weight: 'bold', margin: 'md', wrap: true },
                        { type: 'text', text: content, wrap: true, margin: 'sm' },
                        { type: 'separator', margin: 'md' },
                        { type: 'text', text: `โดย: ${postedByName}`, size: 'sm', color: '#888888', margin: 'md' }
                      ]
                    }
                  }
                }
              ]
            },
            {
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`
              }
            }
          );
        } catch (lineErr) {
          console.error('LINE Push Message Error:', lineErr);
          // Continue with next user even if one fails
        }
      }
    }

    res.status(201).json({ message: 'ประกาศสำเร็จและแจ้งเตือน LINE แล้ว' });
  } catch (err) {
    console.error('Error in postAnnouncement:', err);
    res.status(500).json({ error: err.message });
  }
};

// GET /api/announcements
exports.getAnnouncements = async (req, res) => {
  try {
    const [announcements] = await db.query(
      `SELECT a.*, u.fullname AS posted_by_name 
       FROM announcements a 
       JOIN users u ON a.posted_by = u.id 
       ORDER BY a.posted_at DESC`
    );
    res.json(announcements);
  } catch (err) {
    console.error('Error in getAnnouncements:', err);
    res.status(500).json({ error: err.message });
  }
};

// PUT /api/announcements/:id
exports.updateAnnouncement = async (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;
  const updated_by = req.user.id;

  try {
    // Check if announcement exists and user has permission
    const [[announcement]] = await db.query(
      'SELECT * FROM announcements WHERE id = ?',
      [id]
    );

    if (!announcement) {
      return res.status(404).json({ error: 'ไม่พบประกาศนี้' });
    }

    // Update the announcement
    await db.query(
      'UPDATE announcements SET title = ?, content = ?, updated_by = ?, updated_at = NOW() WHERE id = ?',
      [title, content, updated_by, id]
    );

    res.json({ message: 'อัปเดตประกาศสำเร็จ' });
  } catch (err) {
    console.error('Error in updateAnnouncement:', err);
    res.status(500).json({ error: err.message });
  }
};

// DELETE /api/announcements/:id
exports.deleteAnnouncement = async (req, res) => {
  const { id } = req.params;

  try {
    // Check if announcement exists
    const [[announcement]] = await db.query(
      'SELECT * FROM announcements WHERE id = ?',
      [id]
    );

    if (!announcement) {
      return res.status(404).json({ error: 'ไม่พบประกาศนี้' });
    }

    // Delete the announcement
    await db.query('DELETE FROM announcements WHERE id = ?', [id]);

    res.json({ message: 'ลบประกาศสำเร็จ' });
  } catch (err) {
    console.error('Error in deleteAnnouncement:', err);
    res.status(500).json({ error: err.message });
  }
};
