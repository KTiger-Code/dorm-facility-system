const express = require('express');
const router = express.Router();
const { 
  postAnnouncement, 
  getAnnouncements,
  updateAnnouncement,
  deleteAnnouncement
} = require('../controllers/announcementController');
const verifyToken = require('../middlewares/verifyToken');
const { adminLogger } = require('../middlewares/adminLogger');

router.post('/', verifyToken, adminLogger('สร้างประกาศข่าวสาร', 'announcements'), postAnnouncement);
router.get('/', getAnnouncements);
router.put('/:id', verifyToken, adminLogger('แก้ไขประกาศข่าวสาร', 'announcements'), updateAnnouncement);
router.delete('/:id', verifyToken, adminLogger('ลบประกาศข่าวสาร', 'announcements'), deleteAnnouncement);

module.exports = router;
