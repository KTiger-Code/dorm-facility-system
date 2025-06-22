const express = require('express');
const router = express.Router();
const { postAnnouncement, getAnnouncements } = require('../controllers/announcementController');
const verifyToken = require('../middlewares/verifyToken');

router.post('/', verifyToken, postAnnouncement);   // ✅ ต้องเป็น admin ในอนาคต
router.get('/', getAnnouncements);

module.exports = router;
