const express = require('express');
const router = express.Router();
const { handleWebhook, lineLogin, lineCallback } = require('../controllers/lineWebhookController');

// Webhook
router.post('/webhook', handleWebhook);

// ✅ LINE Login
router.get('/login', lineLogin);
router.get('/callback', lineCallback);

module.exports = router;
