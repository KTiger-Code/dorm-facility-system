const { logAdminAction } = require('../controllers/adminLogController');

// Middleware สำหรับบันทึก admin actions อัตโนมัติ
const adminLogger = (action, targetTable) => {
  return async (req, res, next) => {
    // เก็บ original response methods
    const originalSend = res.send;
    const originalJson = res.json;

    // Override response methods เพื่อดักจับการส่งข้อมูล
    res.send = function(data) {
      // บันทึก log เมื่อ response สำเร็จ (status 2xx)
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const targetId = req.body?.id || req.params?.id || null;
        const details = createLogDetails(action, req, data);
        
        // บันทึก log แบบ async โดยไม่ต้องรอ
        logAdminAction(req.user?.id, action, targetTable, targetId, details, req)
          .catch(error => console.error('Logging error:', error));
      }
      return originalSend.call(this, data);
    };

    res.json = function(data) {
      // บันทึก log เมื่อ response สำเร็จ (status 2xx)
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const targetId = req.body?.id || req.params?.id || null;
        const details = createLogDetails(action, req, data);
        
        // บันทึก log แบบ async โดยไม่ต้องรอ
        logAdminAction(req.user?.id, action, targetTable, targetId, details, req)
          .catch(error => console.error('Logging error:', error));
      }
      return originalJson.call(this, data);
    };

    next();
  };
};

// สร้างรายละเอียดของ log
const createLogDetails = (action, req, responseData) => {
  let details = [];

  // เพิ่มข้อมูลตาม action type
  if (action.includes('อนุมัติการชำระเงิน')) {
    if (req.body?.paid) details.push(`ผลการอนุมัติ: อนุมัติแล้ว`);
    if (req.params?.id) details.push(`ใบแจ้งหนี้ ID: ${req.params.id}`);
  }

  if (action.includes('อนุมัติการจองส่วนกลาง')) {
    if (req.body?.status === 'approved') details.push(`ผลการพิจารณา: อนุมัติ`);
    if (req.body?.status === 'rejected') details.push(`ผลการพิจารณา: ปฏิเสธ`);
    if (req.params?.id) details.push(`การจอง ID: ${req.params.id}`);
  }

  if (action.includes('สร้างใบแจ้งหนี้')) {
    if (req.body?.user_id) details.push(`ผู้ใช้ ID: ${req.body.user_id}`);
    if (req.body?.month_year) details.push(`เดือน/ปี: ${req.body.month_year}`);
    const totalAmount = (req.body?.water_fee || 0) + (req.body?.electricity_fee || 0) + 
                       (req.body?.common_fee || 0) + (req.body?.room_rent || 0);
    if (totalAmount > 0) details.push(`จำนวนเงินรวม: ${totalAmount.toLocaleString()} บาท`);
  }

  if (action.includes('สร้างประกาศ')) {
    if (req.body?.title) details.push(`หัวข้อ: ${req.body.title}`);
    if (req.body?.content) {
      const shortContent = req.body.content.length > 50 
        ? req.body.content.substring(0, 50) + '...' 
        : req.body.content;
      details.push(`เนื้อหา: ${shortContent}`);
    }
  }

  if (action.includes('อัพเดตสถานะคำขอซ่อม')) {
    if (req.body?.status) {
      const statusMap = {
        'pending': 'รอดำเนินการ',
        'in_progress': 'กำลังดำเนินการ', 
        'completed': 'เสร็จสิ้น'
      };
      details.push(`สถานะใหม่: ${statusMap[req.body.status] || req.body.status}`);
    }
    if (req.params?.id) details.push(`คำขอซ่อม ID: ${req.params.id}`);
  }

  if (action.includes('สร้างผู้ใช้ใหม่')) {
    if (req.body?.username) details.push(`ชื่อผู้ใช้: ${req.body.username}`);
    if (req.body?.fullname) details.push(`ชื่อจริง: ${req.body.fullname}`);
    if (req.body?.room_number) details.push(`ห้อง: ${req.body.room_number}`);
    if (req.body?.role) {
      const roleMap = {
        'resident': 'ผู้พักอาศัย',
        'admin': 'ผู้ดูแลระบบ'
      };
      details.push(`บทบาท: ${roleMap[req.body.role] || req.body.role}`);
    }
  }

  if (action.includes('แก้ไข')) {
    if (req.params?.id) details.push(`ID ที่แก้ไข: ${req.params.id}`);
    if (req.body?.title) details.push(`หัวข้อใหม่: ${req.body.title}`);
  }

  if (action.includes('ลบ')) {
    if (req.params?.id) details.push(`ID ที่ลบ: ${req.params.id}`);
  }

  // เพิ่มผลลัพธ์จาก response
  try {
    let responseObj = responseData;
    if (typeof responseData === 'string') {
      responseObj = JSON.parse(responseData);
    }
    
    if (responseObj && responseObj.message) {
      const messageMap = {
        'Paid status updated': 'อัพเดตสถานะการชำระเงินแล้ว',
        'Booking status updated': 'อัพเดตสถานะการจองแล้ว',
        'Invoice created successfully': 'สร้างใบแจ้งหนี้เรียบร้อย',
        'Status updated successfully': 'อัพเดตสถานะเรียบร้อย',
        'Announcement posted successfully': 'โพสต์ประกาศเรียบร้อย',
        'User created successfully': 'สร้างผู้ใช้เรียบร้อย'
      };
      const translatedMessage = messageMap[responseObj.message] || responseObj.message;
      details.push(`ผลลัพธ์: ${translatedMessage}`);
    }
  } catch (e) {
    // ignore parsing errors
  }

  // ถ้าไม่มีรายละเอียด ให้ใช้ข้อความเริ่มต้น
  return details.length > 0 ? details.join(', ') : `${action} เรียบร้อยแล้ว`;
};

// Helper สำหรับ log แบบ manual
const logManualAction = async (req, action, targetTable, targetId, details) => {
  try {
    await logAdminAction(req.user?.id, action, targetTable, targetId, details, req);
  } catch (error) {
    console.error('Manual logging error:', error);
  }
};

module.exports = {
  adminLogger,
  logManualAction
};