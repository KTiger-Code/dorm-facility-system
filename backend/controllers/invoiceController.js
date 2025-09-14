// controllers/invoiceController.js
const db = require('../db');

// — ดึงใบแจ้งหนี้ของผู้เช่า (Resident)
exports.getMyInvoices = async (req, res) => {
  const userId     = req.user.id;
  const roomNumber = req.user.room_number;

  try {
    // 1) ดึง invoices หลัก
    const [invoices] = await db.query(
      `SELECT
         id,
         month_year,
         water_prev_meter,
         water_curr_meter,
         water_unit_price,
         water_fee,
         electricity_prev_meter,
         electricity_curr_meter,
         electricity_unit_price,
         electricity_fee,
         common_fee,
         room_rent,
         paid,
         paid_at,
         payment_status,
         payment_proof,
         created_at
       FROM invoices
       WHERE user_id = ?
       ORDER BY created_at DESC`,
      [userId]
    );

    // 2) ดึง extras จาก invoice_extras
    const invoiceIds = invoices.map(i => i.id);
    let extras = [];
    if (invoiceIds.length) {
      [extras] = await db.query(
        `SELECT invoice_id, label, amount
         FROM invoice_extras
         WHERE invoice_id IN (?)`,
        [invoiceIds]
      );
    }

    // 3) จัดกลุ่ม extras ตาม invoice_id
    const extrasMap = {};
    extras.forEach(e => {
      extrasMap[e.invoice_id] = extrasMap[e.invoice_id] || [];
      extrasMap[e.invoice_id].push({
        label: e.label,
        amount: parseFloat(e.amount)
      });
    });

    // 4) ผนึกกลับไปพร้อมเลขห้อง
    const result = invoices.map(inv => ({
      ...inv,
      room_number:   roomNumber,
      extra_charges: extrasMap[inv.id] || []
    }));

    res.json(result);
  } catch (err) {
    console.error('❌ getMyInvoices error:', err);
    res.status(500).json({ error: err.message });
  }
};

// — ดึงใบแจ้งหนี้ทั้งหมด (Admin)
exports.getAllInvoices = async (req, res) => {
  try {
    // 1) ดึง invoices + room_number
    const [invoices] = await db.query(
      `SELECT 
         inv.id,
         inv.user_id,
         u.room_number,
         inv.month_year,
         inv.water_prev_meter,
         inv.water_curr_meter,
         inv.water_unit_price,
         inv.water_fee,
         inv.electricity_prev_meter,
         inv.electricity_curr_meter,
         inv.electricity_unit_price,
         inv.electricity_fee,
         inv.common_fee,
         inv.room_rent,
         inv.paid,
         inv.paid_at,
         inv.payment_status,
         inv.payment_proof,
         inv.created_at
       FROM invoices AS inv
       JOIN users    AS u   ON inv.user_id = u.id
       ORDER BY inv.created_at DESC`
    );

    // 2) ดึง extras
    const invoiceIds = invoices.map(i => i.id);
    let extras = [];
    if (invoiceIds.length) {
      [extras] = await db.query(
        `SELECT invoice_id, label, amount
         FROM invoice_extras
         WHERE invoice_id IN (?)`,
        [invoiceIds]
      );
    }

    // 3) จัดกลุ่ม extras
    const extrasMap = {};
    extras.forEach(e => {
      extrasMap[e.invoice_id] = extrasMap[e.invoice_id] || [];
      extrasMap[e.invoice_id].push({
        label: e.label,
        amount: parseFloat(e.amount)
      });
    });

    // 4) ผนึกกลับ
    const result = invoices.map(inv => ({
      ...inv,
      extra_charges: extrasMap[inv.id] || []
    }));

    res.json(result);
  } catch (err) {
    console.error('❌ getAllInvoices error:', err);
    res.status(500).json({ error: err.message });
  }
};

// — สร้างใบแจ้งหนี้ใหม่ (Admin)
exports.createInvoice = async (req, res) => {
  const {
    user_id,
    month_year,
    water_prev_meter = 0,
    water_curr_meter = 0,
    water_unit_price = 0,
    electricity_prev_meter = 0,
    electricity_curr_meter = 0,
    electricity_unit_price = 0,
    common_fee = 0,
    room_rent = 0,
    extra_charges = []
  } = req.body;

  // ensure numeric values
  const wp = parseFloat(water_prev_meter) || 0;
  const wc = parseFloat(water_curr_meter) || 0;
  const wprice = parseFloat(water_unit_price) || 0;
  const ep = parseFloat(electricity_prev_meter) || 0;
  const ec = parseFloat(electricity_curr_meter) || 0;
  const eprice = parseFloat(electricity_unit_price) || 0;

  // คำนวณค่าน้ำและค่าไฟจากตัวเลขมิเตอร์และราคาต่อหน่วย
  const water_used = wc - wp;
  const electricity_used = ec - ep;
  const water_fee = water_used * wprice;
  const electricity_fee = electricity_used * eprice;

  try {
    // 1) insert invoice
    const [invResult] = await db.query(
      `INSERT INTO invoices
         (user_id, month_year,
          water_prev_meter, water_curr_meter, water_unit_price, water_fee,
          electricity_prev_meter, electricity_curr_meter, electricity_unit_price, electricity_fee,
          common_fee, room_rent)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [user_id, month_year,
       wp, wc, wprice, water_fee,
       ep, ec, eprice, electricity_fee,
       common_fee, room_rent]
    );
    const invoiceId = invResult.insertId;

    // 2) insert extras
    if (extra_charges.length) {
      const rows = extra_charges.map(e => [invoiceId, e.label, e.amount]);
      await db.query(
        `INSERT INTO invoice_extras
           (invoice_id, label, amount)
         VALUES ?`,
        [rows]
      );
    }

    res.status(201).json({ message: 'Invoice created' });
  } catch (err) {
    console.error('❌ createInvoice error:', err);
    res.status(500).json({ error: err.message });
  }
};

// — แก้ไขใบแจ้งหนี้ (Admin)
exports.updateInvoice = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const {
    month_year,
    water_prev_meter = 0,
    water_curr_meter = 0,
    water_unit_price = 0,
    electricity_prev_meter = 0,
    electricity_curr_meter = 0,
    electricity_unit_price = 0,
    common_fee = 0,
    room_rent = 0,
    extra_charges = []
  } = req.body;

  const wp = parseFloat(water_prev_meter) || 0;
  const wc = parseFloat(water_curr_meter) || 0;
  const wprice = parseFloat(water_unit_price) || 0;
  const ep = parseFloat(electricity_prev_meter) || 0;
  const ec = parseFloat(electricity_curr_meter) || 0;
  const eprice = parseFloat(electricity_unit_price) || 0;

  const water_used = wc - wp;
  const electricity_used = ec - ep;
  const water_fee = water_used * wprice;
  const electricity_fee = electricity_used * eprice;

  try {
    // 1) update invoice หลัก
    const [upd] = await db.query(
      `UPDATE invoices
       SET month_year      = ?,
           water_prev_meter       = ?,
           water_curr_meter       = ?,
           water_unit_price       = ?,
           water_fee       = ?,
           electricity_prev_meter = ?,
           electricity_curr_meter = ?,
           electricity_unit_price = ?,
           electricity_fee = ?,
           common_fee      = ?,
           room_rent       = ?
       WHERE id = ?`,
      [month_year,
       wp, wc, wprice, water_fee,
       ep, ec, eprice,
       electricity_fee, common_fee, room_rent, id]
    );
    if (upd.affectedRows === 0) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    // 2) ลบ extras เก่า
    await db.query(`DELETE FROM invoice_extras WHERE invoice_id = ?`, [id]);

    // 3) ใส่ extras ใหม่
    if (extra_charges.length) {
      const rows = extra_charges.map(e => [id, e.label, e.amount]);
      await db.query(
        `INSERT INTO invoice_extras (invoice_id, label, amount) VALUES ?`,
        [rows]
      );
    }

    res.json({ message: 'Invoice updated' });
  } catch (err) {
    console.error('❌ updateInvoice error:', err);
    res.status(500).json({ error: err.message });
  }
};

// — ติ๊กชำระเงิน (Admin)
exports.toggleInvoicePaid = async (req, res) => {
  const id   = parseInt(req.params.id, 10);
  const paid = req.body.paid ? 1 : 0;
  const paidAt = paid ? new Date() : null;
  const status = paid ? 'paid' : 'waiting_payment';

  try {
    const [upd] = await db.query(
      `UPDATE invoices
       SET paid = ?, paid_at = ?, payment_status = ?
       WHERE id = ?`,
      [paid, paidAt, status, id]
    );
    if (upd.affectedRows === 0) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    if (!paid) {
      await db.query(
        `UPDATE invoices SET payment_proof = NULL WHERE id = ?`,
        [id]
      );
    }
    res.json({ message: 'Paid status updated' });
  } catch (err) {
    console.error('❌ toggleInvoicePaid error:', err);
    res.status(500).json({ error: err.message });
  }
};

// — อัปโหลดหลักฐานการชำระเงิน
exports.uploadPaymentProof = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const filePath = `/uploads/slip/${req.file.filename}`;

  try {
    const [upd] = await db.query(
      `UPDATE invoices
       SET payment_proof = ?, payment_status = 'waiting_review'
       WHERE id = ?`,
      [filePath, id]
    );
    if (upd.affectedRows === 0) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    res.json({ message: 'Proof uploaded', file: filePath });
  } catch (err) {
    console.error('❌ uploadPaymentProof error:', err);
    res.status(500).json({ error: err.message });
  }
};

// — ลบใบแจ้งหนี้ (Admin)
exports.deleteInvoice = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  try {
    const [del] = await db.query(`DELETE FROM invoices WHERE id = ?`, [id]);
    if (del.affectedRows === 0) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    // ตาราง invoice_extras ตั้ง FK ให้ลบ cascade เรียบร้อยแล้ว
    res.json({ message: 'Invoice deleted' });
  } catch (err) {
    console.error('❌ deleteInvoice error:', err);
    res.status(500).json({ error: err.message });
  }
};

// Admin: ดึงใบแจ้งหนี้ทั้งหมด
exports.getAllInvoices = async (req, res) => {
  try {
    const [invoices] = await db.query(
      `SELECT i.*, u.username, u.room_number 
       FROM invoices i 
       LEFT JOIN users u ON i.user_id = u.id 
       ORDER BY i.created_at DESC`
    );
    res.json(invoices);
  } catch (err) {
    console.error('Error in getAllInvoices:', err);
    res.status(500).json({ error: err.message });
  }
};
