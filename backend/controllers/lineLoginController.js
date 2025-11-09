const db = require('../db');
const axios = require('axios');
const querystring = require('querystring');
const jwt = require('jsonwebtoken');

const LINE_CLIENT_ID = process.env.LINE_LOGIN_CLIENT_ID;
const LINE_CLIENT_SECRET = process.env.LINE_LOGIN_CLIENT_SECRET;
const LINE_REDIRECT_URI = process.env.LINE_LOGIN_REDIRECT_URI;
const JWT_SECRET = process.env.JWT_SECRET;

// ✅ เริ่ม Login
exports.lineLogin = (req, res) => {
  const token = req.query.token;
  if (!token) return res.status(400).send('Missing token');
  
  console.log('LINE Login Debug:', {
    CLIENT_ID: LINE_CLIENT_ID,
    REDIRECT_URI: LINE_REDIRECT_URI,
    token: token
  });

  // ใช้ URL ตรงจาก LINE Login settings
  const encodedRedirectUri = encodeURIComponent(LINE_REDIRECT_URI);
  const redirectUrl = `https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id=${LINE_CLIENT_ID}&redirect_uri=${encodedRedirectUri}&state=${token}&scope=profile%20openid&bot_prompt=normal`;
  
  console.log('Debug - Login URL:', {
    redirectUrl,
    originalRedirectUri: LINE_REDIRECT_URI,
    encodedRedirectUri
  });

  res.redirect(redirectUrl);
};

// ✅ Callback หลังจากผู้ใช้ login แล้ว
exports.lineCallback = async (req, res) => {
  const code = req.query.code;
  const state = req.query.state;

  console.log('LINE Callback Debug:', {
    code: code,
    state: state,
    redirect_uri: LINE_REDIRECT_URI
  });

  try {
    const decoded = jwt.verify(state, JWT_SECRET);
    const systemUserId = decoded.id;

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

    const profileRes = await axios.get('https://api.line.me/v2/profile', {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    const { userId: lineUserId, displayName } = profileRes.data;

    await db.query('UPDATE users SET line_user_id = ? WHERE id = ?', [lineUserId, systemUserId]);

    console.log('LINE Login Success:', {
      lineUserId: lineUserId,
      displayName: displayName,
      systemUserId: systemUserId
    });

    res.redirect(process.env.FRONTEND_URL || 'http://localhost:4200/home');
  } catch (err) {
    console.error('LINE Callback Error:', {
      error: err.message,
      response: err.response?.data,
      code: req.query.code,
      state: req.query.state
    });
    res.status(500).json({
      error: err.message,
      details: err.response?.data
    });
  }
};