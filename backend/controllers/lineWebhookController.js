const db = require('../db');
const axios = require('axios');
const querystring = require('querystring');
const jwt = require('jsonwebtoken');

const LINE_CLIENT_ID = process.env.LINE_CLIENT_ID;
const LINE_CLIENT_SECRET = process.env.LINE_CLIENT_SECRET;
const LINE_REDIRECT_URI = process.env.LINE_REDIRECT_URI;
const JWT_SECRET = process.env.JWT_SECRET;

// ✅ รับ webhook จาก LINE Bot
exports.handleWebhook = (req, res) => {
  console.log('📨 ได้รับ Webhook จาก LINE:', req.body);
  res.sendStatus(200);
};

// ✅ เริ่ม Login (แนบ token ของ user ใน state เพื่อรู้ว่าใคร login)
exports.lineLogin = (req, res) => {
  const token = req.query.token; // รับ token จาก frontend
  if (!token) return res.status(400).send('Missing token');

  const redirectUrl = `https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id=${LINE_CLIENT_ID}&redirect_uri=${encodeURIComponent(LINE_REDIRECT_URI)}&state=${token}&scope=profile%20openid`;

  res.redirect(redirectUrl);
};

// ✅ Callback หลังจากผู้ใช้ login แล้ว
exports.lineCallback = async (req, res) => {
  const code = req.query.code;
  const state = req.query.state; // รับ JWT token จาก state

  try {
    // ถอด JWT เพื่อดึง user.id
    const decoded = jwt.verify(state, JWT_SECRET);
    const systemUserId = decoded.id;

    // ขอ access token จาก LINE
    const tokenRes = await axios.post('https://api.line.me/oauth2/v2.1/token',
      querystring.stringify({
        grant_type: 'authorization_code',
        code,
        redirect_uri: LINE_REDIRECT_URI,
        client_id: LINE_CLIENT_ID,
        client_secret: LINE_CLIENT_SECRET
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    const accessToken = tokenRes.data.access_token;

    // ✅ ดึง profile ผู้ใช้
    const profileRes = await axios.get('https://api.line.me/v2/profile', {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    const { userId: lineUserId, displayName } = profileRes.data;

    // ✅ อัปเดต line_user_id ในระบบ
    await db.query('UPDATE users SET line_user_id = ? WHERE id = ?', [lineUserId, systemUserId]);

    console.log('✅ LINE User ID:', lineUserId);
    console.log('👤 Display Name:', displayName);
    console.log('🔗 ผูกกับ user.id:', systemUserId);

    // ✅ Redirect กลับไปหน้า Home หลังผูกบัญชีเสร็จ
    res.redirect('http://localhost:4200/home');
  } catch (err) {
    console.error('❌ LINE Callback Error:', err.response?.data || err.message);
    res.status(500).send('Login Failed');
  }
};
