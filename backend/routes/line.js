const express = require('express');
const router = express.Router();
const { handleWebhook } = require('../controllers/lineWebhookController');
const { lineLogin, lineCallback } = require('../controllers/lineLoginController');

// Webhook endpoints
router.post('/webhook', handleWebhook);

// LINE Login endpoints
router.get('/login', lineLogin);
router.get('/callback', lineCallback);

module.exports = router;
