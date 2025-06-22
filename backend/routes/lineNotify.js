const express = require('express');
const router = express.Router();
const { sendParcelNotification } = require('../controllers/lineNotifyController');

// POST /api/line/parcel
router.post('/parcel', sendParcelNotification);

module.exports = router;
