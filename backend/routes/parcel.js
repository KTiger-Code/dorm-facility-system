const express = require('express');
const router = express.Router();
const {
  addParcel,
  getParcelsByRoom,
  getAllParcels,
  deleteParcel,
  togglePicked,updateParcelStatus
} = require('../controllers/parcelController');
const verifyToken = require('../middlewares/verifyToken');

router.post('/', verifyToken, addParcel);
router.get('/', verifyToken, getParcelsByRoom);
router.get('/all', verifyToken, getAllParcels);
router.delete('/:id', verifyToken, deleteParcel);
router.patch('/:id/toggle', verifyToken, togglePicked);
router.put('/:id', verifyToken, updateParcelStatus);
router.patch('/:id', verifyToken, updateParcelStatus);

module.exports = router;
