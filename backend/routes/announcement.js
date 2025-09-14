const express = require('express');
const router = express.Router();
const { postAnnouncement, getAnnouncements } = require('../controllers/announcementController');
const verifyToken = require('../middlewares/verifyToken');
const { adminLogger } = require('../middlewares/adminLogger');

router.post('/', verifyToken, adminLogger('สร้างประกาศข่าวสาร', 'announcements'), postAnnouncement);   // ✅ ต้องเป็น admin ในอนาคต
router.get('/', getAnnouncements);

module.exports = router;
