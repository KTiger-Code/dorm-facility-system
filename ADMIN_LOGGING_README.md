# Admin Logging System Documentation

## ภาพรวม
ระบบเก็บ log การทำงานของ admin ในระบบจัดการหอพัก เพื่อตติดตามและตรวจสอบการกระทำต่างๆ ของผู้ดูแลระบบ

## ขั้นตอนการติดตั้ง

### 1. ติดตั้ง Database
รัน SQL script ในไฟล์ `database/admin_logs_setup.sql` ใน PHPMyAdmin:

```sql
-- สร้างตาราง admin_logs
CREATE TABLE IF NOT EXISTS `admin_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `admin_id` int NOT NULL,
  `action` varchar(255) NOT NULL,
  `target_table` varchar(100) NOT NULL,
  `target_id` int DEFAULT NULL,
  `details` text,
  `ip_address` varchar(45) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_admin_id` (`admin_id`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_target` (`target_table`, `target_id`),
  CONSTRAINT `admin_logs_ibfk_1` FOREIGN KEY (`admin_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
```

### 2. API Endpoints

#### Admin Logs API
- `GET /api/admin-logs` - ดึงรายการ admin logs ทั้งหมด (เฉพาะ admin)
- `GET /api/admin-logs/my` - ดึง admin logs ของตัวเอง
- `GET /api/admin-logs/stats` - ดึงสถิติ admin logs
- `DELETE /api/admin-logs/cleanup` - ลบ logs เก่า

#### ตัวอย่าง Query Parameters
```
GET /api/admin-logs?page=1&limit=20&admin_id=1&action=อนุมัติ&date_from=2025-09-01
```

### 3. Features ที่มีอยู่

#### 3.1 การบันทึก Log อัตโนมัติ
- อนุมัติการชำระเงิน
- อนุมัติการจองส่วนกลาง  
- สร้าง/แก้ไข/ลบใบแจ้งหนี้
- อัพเดตสถานะคำขอซ่อม
- สร้างประกาศข่าวสาร
- จัดการผู้ใช้

#### 3.2 ข้อมูลที่บันทึกใน Log
- `admin_id` - ID ของ admin ที่ทำการกระทำ
- `action` - การกระทำที่ทำ (เป็นภาษาไทย)
- `target_table` - ตารางที่ได้รับผลกระทบ
- `target_id` - ID ของข้อมูลที่ได้รับผลกระทบ
- `details` - รายละเอียดเพิ่มเติม
- `ip_address` - IP address ของ admin
- `created_at` - วันที่และเวลาที่ทำการกระทำ

### 4. การแสดงผลใน Admin Home

#### 4.1 Dashboard Stats
- จำนวน logs วันนี้
- จำนวน admin ที่ทำงาน (7 วันล่าสุด)

#### 4.2 กิจกรรมยอดนิยม
แสดงการกระทำที่ทำบ่อยที่สุดใน 7 วันล่าสุด พร้อมสีที่แตกต่างกัน:
- 🟢 สีเขียว: การอนุมัติ
- 🔴 สีแดง: การปฏิเสธ/ลบ
- 🔵 สีน้ำเงิน: การสร้างใหม่
- 🟡 สีเหลือง: การแก้ไข
- ⚫ สีเทา: อื่นๆ

#### 4.3 รายการกิจกรรมล่าสุด
แสดงรายการ logs ล่าสุด พร้อมรายละเอียด:
- ชื่อ admin ที่ทำการกระทำ
- เวลาที่ทำการกระทำ
- ประเภทการกระทำ (พร้อมสี)
- รายละเอียด
- ข้อมูลเมตา (ตาราง, ID, IP)

### 5. Logging Middleware

#### 5.1 การใช้งาน
```javascript
const { adminLogger } = require('../middlewares/adminLogger');

// เพิ่มใน route
router.patch('/:id/paid', verify, adminLogger('อนุมัติการชำระเงิน', 'invoices'), controller.method);
```

#### 5.2 การ Log แบบ Manual
```javascript
const { logManualAction } = require('../middlewares/adminLogger');

// ใช้ใน controller
await logManualAction(req, 'การกระทำพิเศษ', 'table_name', targetId, 'รายละเอียด');
```

### 6. ตัวอย่างการใช้งาน

#### 6.1 ตัวอย่าง Logs
- "admin1 อนุมัติการชำระเงิน ใบแจ้งหนี้ ID 10 เมื่อ 14/09/2568 10:30"
- "admin1 อนุมัติการจองส่วนกลาง ห้องฟิตเนส เมื่อ 13/09/2568 15:45"
- "admin1 สร้างใบแจ้งหนี้ สำหรับเดือน 09/2025 เมื่อ 14/09/2568 08:45"

#### 6.2 การค้นหา Logs
- ค้นหาตาม admin
- ค้นหาตามประเภทการกระทำ
- ค้นหาตามช่วงวันที่
- ค้นหาตามตารางที่ได้รับผลกระทบ

### 7. การจัดการและ Maintenance

#### 7.1 การลบ Logs เก่า
```javascript
// DELETE /api/admin-logs/cleanup
{
  "days": 90  // ลบ logs ที่เก่ากว่า 90 วัน
}
```

#### 7.2 Performance
- Index ถูกสร้างบน `admin_id`, `created_at`, และ `target_table` + `target_id`
- การ log ทำงานแบบ async ไม่กระทบต่อ performance หลัก

### 8. Security
- ต้องมี JWT token และเป็น admin role เท่านั้น
- บันทึก IP address สำหรับตรวจสอบ
- Foreign key constraint กับตาราง users

### 9. การปรับแต่งเพิ่มเติม

#### 9.1 เพิ่ม Action ใหม่
แก้ไขใน route files:
```javascript
router.post('/new-action', verify, adminLogger('การกระทำใหม่', 'target_table'), controller);
```

#### 9.2 ปรับแต่ง Log Details
แก้ไขฟังก์ชัน `createLogDetails` ใน `middlewares/adminLogger.js`

### 10. การแก้ไขปัญหา

#### 10.1 ปัญหาที่อาจพบ
- ตาราง admin_logs ยังไม่ถูกสร้าง → รัน SQL script
- Permission error → ตรวจสอบ role ของผู้ใช้
- IP address ไม่ถูกต้อง → ตั้งค่า trust proxy ใน express

#### 10.2 การตรวจสอบ
```javascript
// ตรวจสอบใน console
console.log('Admin action logged:', { adminId, action, targetTable, targetId });
```

## สรุป
ระบบ Admin Logging นี้จะช่วยให้ผู้ดูแลระบบสามารถติดตามและตรวจสอบการกระทำต่างๆ ของ admin ได้อย่างครอบคลุม พร้อมด้วยการแสดงผลที่เข้าใจง่ายและระบบค้นหาที่ยืดหยุ่น
