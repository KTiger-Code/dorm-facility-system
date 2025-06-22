const axios = require('axios');

const LINE_CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN;

exports.sendParcelNotification = async (req, res) => {
  const { line_user_id, room_number, parcel_detail } = req.body;

  try {
    const message = {
      to: line_user_id,
      messages: [
        {
          type: 'flex',
          altText: '📦 แจ้งเตือนพัสดุเข้า',
          contents: {
            type: 'bubble',
            hero: {
              type: 'image',
              url: 'https://cdn-icons-png.flaticon.com/512/1040/1040230.png',
              size: 'full',
              aspectRatio: '20:13',
              aspectMode: 'cover'
            },
            body: {
              type: 'box',
              layout: 'vertical',
              contents: [
                {
                  type: 'text',
                  text: `📦 พัสดุเข้าห้อง ${room_number}`,
                  weight: 'bold',
                  size: 'lg',
                  color: '#1DB446'
                },
                {
                  type: 'text',
                  text: parcel_detail,
                  wrap: true,
                  margin: 'md'
                }
              ]
            }
          }
        }
      ]
    };

    await axios.post('https://api.line.me/v2/bot/message/push', message, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`
      }
    });

    res.json({ message: '📬 ส่งแจ้งเตือนพัสดุแล้ว' });
  } catch (err) {
    console.error('❌ ส่งแจ้งเตือนล้มเหลว:', err.response?.data || err.message);
    res.status(500).json({ error: 'ส่งแจ้งเตือนล้มเหลว' });
  }
};
