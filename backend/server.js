const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config();

const app = express();

// ✅ เปิด CORS สำหรับทุก origin
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ เชื่อมต่อกับ routes (เรียงต่อกันได้เลย)
app.use('/api/auth', require('./routes/auth'));
app.use('/api/invoice', require('./routes/invoice')); // แก้ไขจาก invoices เป็น invoice
app.use('/api/repair', require('./routes/repair')); // แก้ไขจาก repair-request เป็น repair
app.use('/api/parcels', require('./routes/parcel'));
app.use('/api/facility', require('./routes/facility')); // แก้ไขจาก facility-booking เป็น facility
app.use('/api/announcements', require('./routes/announcement'));
app.use('/api/line', require('./routes/line'));
app.use('/api/line', require('./routes/lineNotify'));
app.use('/api/users', require('./routes/user'));
app.use('/api/admin-logs', require('./routes/adminLogs'));

// ✅ Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
  console.log('Access from other devices using your computer IP address');
});
