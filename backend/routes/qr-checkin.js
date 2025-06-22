const express = require('express');
const router = express.Router();
const { saveQrCheckin } = require('../controllers/qrCheckinController');
const verifyToken = require('../middlewares/verifyToken');

router.post('/', verifyToken, saveQrCheckin);

module.exports = router;