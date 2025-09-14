const db = require('../db');

// ฟังก์ชันสำหรับบันทึก admin logs
const logAdminAction = async (adminId, action, targetTable, targetId, details, req) => {
  try {
    const ipAddress = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
    
    const query = `
      INSERT INTO admin_logs (admin_id, action, target_table, target_id, details, ip_address)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    await db.execute(query, [adminId, action, targetTable, targetId, details, ipAddress]);
    console.log('Admin action logged:', { adminId, action, targetTable, targetId });
  } catch (error) {
    console.error('Error logging admin action:', error);
  }
};

// ดึงรายการ admin logs
const getAdminLogs = async (req, res) => {
  try {
    console.log('getAdminLogs called with query:', req.query);
    
    const { page = 1, limit = 20, admin_id, action, target_table, date_from, date_to } = req.query;
    const offset = (page - 1) * limit;

    console.log('Parameters:', { page, limit, offset });

    // ลองใช้ query แบบง่ายก่อน
    const simpleQuery = `
      SELECT 
        al.id,
        al.admin_id,
        COALESCE(u.username, 'unknown') as admin_username,
        COALESCE(u.fullname, 'ไม่ระบุ') as admin_fullname,
        al.action,
        al.target_table,
        al.target_id,
        al.details,
        al.ip_address,
        al.created_at
      FROM admin_logs al
      LEFT JOIN users u ON al.admin_id = u.id
      ORDER BY al.created_at DESC
      LIMIT 10
    `;

    console.log('Executing simple query:', simpleQuery);

    const [logs] = await db.execute(simpleQuery);
    
    // ดึงจำนวนทั้งหมด
    const [totalResult] = await db.execute('SELECT COUNT(*) as total FROM admin_logs');
    const total = totalResult[0].total;

    console.log('Query results:', { logsCount: logs.length, total });

    res.json({
      success: true,
      data: logs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching admin logs:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูล admin logs',
      error: error.message,
      stack: error.stack
    });
  }
};

// ดึง admin logs สำหรับ admin คนนั้นๆ
const getMyAdminLogs = async (req, res) => {
  try {
    const adminId = req.user.id;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const query = `
      SELECT 
        al.id,
        al.action,
        al.target_table,
        al.target_id,
        al.details,
        al.created_at
      FROM admin_logs al
      WHERE al.admin_id = ?
      ORDER BY al.created_at DESC
      LIMIT ? OFFSET ?
    `;

    const countQuery = `
      SELECT COUNT(*) as total
      FROM admin_logs al
      WHERE al.admin_id = ?
    `;

    const [logs] = await db.execute(query, [adminId, parseInt(limit), parseInt(offset)]);
    const [totalResult] = await db.execute(countQuery, [adminId]);
    const total = totalResult[0].total;

    res.json({
      success: true,
      data: logs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching my admin logs:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูล logs ของคุณ'
    });
  }
};

// สถิติ admin logs
const getAdminLogStats = async (req, res) => {
  try {
    const { period = '7' } = req.query; // จำนวนวันที่ต้องการดูสถิติ

    // นับจำนวน logs ตามประเภท action ในระยะเวลาที่กำหนด
    const statsQuery = `
      SELECT 
        al.action,
        COUNT(*) as count
      FROM admin_logs al
      WHERE al.created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
      GROUP BY al.action
      ORDER BY count DESC
    `;

    // นับจำนวน admin ที่มีกิจกรรมในระยะเวลาที่กำหนด
    const activeAdminsQuery = `
      SELECT 
        COUNT(DISTINCT al.admin_id) as active_admins
      FROM admin_logs al
      WHERE al.created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
    `;

    // นับจำนวน logs รวมในวันนี้
    const todayLogsQuery = `
      SELECT COUNT(*) as today_logs
      FROM admin_logs al
      WHERE DATE(al.created_at) = CURDATE()
    `;

    const [actionStats] = await db.execute(statsQuery, [parseInt(period)]);
    const [activeAdmins] = await db.execute(activeAdminsQuery, [parseInt(period)]);
    const [todayLogs] = await db.execute(todayLogsQuery);

    res.json({
      success: true,
      data: {
        period: parseInt(period),
        action_stats: actionStats,
        active_admins: activeAdmins[0].active_admins,
        today_logs: todayLogs[0].today_logs
      }
    });

  } catch (error) {
    console.error('Error fetching admin log stats:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงสถิติ admin logs'
    });
  }
};

// ลบ admin logs เก่า (สำหรับ maintenance)
const cleanupOldLogs = async (req, res) => {
  try {
    const { days = 90 } = req.body; // ลบ logs ที่เก่ากว่า X วัน

    const query = `
      DELETE FROM admin_logs 
      WHERE created_at < DATE_SUB(NOW(), INTERVAL ? DAY)
    `;

    const [result] = await db.execute(query, [parseInt(days)]);

    // บันทึก log สำหรับการลบ logs
    await logAdminAction(
      req.user.id,
      'ลบ admin logs เก่า',
      'admin_logs',
      null,
      `ลบ logs เก่ากว่า ${days} วัน (${result.affectedRows} รายการ)`,
      req
    );

    res.json({
      success: true,
      message: `ลบ admin logs เก่าแล้ว ${result.affectedRows} รายการ`,
      deleted_count: result.affectedRows
    });

  } catch (error) {
    console.error('Error cleaning up old logs:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการลบ logs เก่า'
    });
  }
};

module.exports = {
  logAdminAction,
  getAdminLogs,
  getMyAdminLogs,
  getAdminLogStats,
  cleanupOldLogs
};