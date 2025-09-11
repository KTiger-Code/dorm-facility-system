import { Component, OnInit } from '@angular/core';
import { CommonModule }    from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { InvoiceService }  from '../invoice.service';
import { HeaderComponent } from '../shared/header/header.component';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-resident-invoice',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule, HeaderComponent],
  templateUrl: './resident-invoice.component.html',
  styleUrls: ['./resident-invoice.component.css']
})
export class ResidentInvoiceComponent implements OnInit {
  /** รายการใบแจ้งหนี้ทั้งหมดของผู้ใช้ */
  invoices: any[] = [];
  filteredInvoices: any[] = [];
  uploading: { [id: number]: boolean } = {};
  selectedImage: string | null = null;
  isAdmin: boolean = false;

  selectedMonth: string = '';
  selectedYear: string = '';
  
  months = [
    { value: '01', label: 'มกราคม' },
    { value: '02', label: 'กุมภาพันธ์' },
    { value: '03', label: 'มีนาคม' },
    { value: '04', label: 'เมษายน' },
    { value: '05', label: 'พฤษภาคม' },
    { value: '06', label: 'มิถุนายน' },
    { value: '07', label: 'กรกฎาคม' },
    { value: '08', label: 'สิงหาคม' },
    { value: '09', label: 'กันยายน' },
    { value: '10', label: 'ตุลาคม' },
    { value: '11', label: 'พฤศจิกายน' },
    { value: '12', label: 'ธันวาคม' }
  ];

  years: number[] = [];

  constructor(private invoiceService: InvoiceService, private router: Router) {
    // สร้างรายการปีย้อนหลัง 5 ปี และ ล่วงหน้า 2 ปี
    const currentYear = new Date().getFullYear();
    for (let year = currentYear - 5; year <= currentYear + 2; year++) {
      this.years.push(year);
    }
  }

  ngOnInit() {
    this.checkAdminStatus();
    this.invoiceService.getMyInvoices().subscribe({
      next: data => {
        this.invoices = data;
        this.filteredInvoices = [...this.invoices];
      },
      error: err => console.error('โหลดใบแจ้งหนี้ไม่สำเร็จ', err)
    });
  }

  checkAdminStatus() {
    const userRole = localStorage.getItem('userRole');
    this.isAdmin = userRole === 'admin';
  }

  onLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    this.router.navigate(['/login']);
  }

  /** คำนวณยอดรวมของเบส+extras */
  total(inv: any): number {
    const base = (+inv.water_fee || 0)
               + (+inv.electricity_fee || 0)
               + (+inv.common_fee || 0)
               + (+inv.room_rent || 0);
    const extraSum = this.extrasSum(inv);
    return base + extraSum;
  }

  /** คำนวณรวมยอดรายการ extra_charges */
  extrasSum(inv: any): number {
    return (inv.extra_charges || [])
      .reduce((sum: number, x: any) => sum + (+x.amount || 0), 0);
  }

  waterUsed(inv: any): number {
    return (+inv.water_curr_meter || 0) - (+inv.water_prev_meter || 0);
  }

  electricityUsed(inv: any): number {
    return (+inv.electricity_curr_meter || 0) - (+inv.electricity_prev_meter || 0);
  }

  /** ดาวน์โหลดใบแจ้งหนี้เฉพาะรายการที่เลือกเป็น PDF */
  async downloadPdf(inv: any) {
    try {
      // สร้าง element ชั่วคราวสำหรับสร้าง PDF
      const element = this.createInvoiceElement(inv);
      document.body.appendChild(element);

      // รอให้ DOM render เสร็จ
      await new Promise(resolve => setTimeout(resolve, 100));

      // แปลง element เป็น canvas
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      // ลบ element ชั่วคราวออกจาก DOM
      document.body.removeChild(element);

      // สร้าง PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // คำนวณขนาดที่เหมาะสม
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth - 20; // margin 10mm ทั้งซ้ายและขวา
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let position = 10; // margin top

      // หากภาพสูงเกินหน้า ให้ปรับขนาด
      if (imgHeight > pageHeight - 20) {
        const ratio = (pageHeight - 20) / imgHeight;
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth * ratio, (pageHeight - 20));
      } else {
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      }

      // บันทึกไฟล์
      const fileName = `ใบแจ้งหนี้_ห้อง${inv.room_number}_${inv.month_year.replace('/', '-')}.pdf`;
      pdf.save(fileName);

    } catch (error) {
      console.error('เกิดข้อผิดพลาดในการสร้าง PDF:', error);
      alert('เกิดข้อผิดพลาดในการดาวน์โหลด PDF กรุณาลองใหม่อีกครั้ง');
    }
  }

  /** สร้าง HTML element สำหรับใบแจ้งหนี้ */
  private createInvoiceElement(inv: any): HTMLElement {
    const element = document.createElement('div');
    element.style.cssText = `
      width: 600px;
      padding: 30px;
      background: white;
      font-family: 'Sarabun', 'Noto Sans Thai', Arial, sans-serif;
      font-size: 14px;
      line-height: 1.4;
      color: #333;
      border: 1px solid #ddd;
      position: fixed;
      left: -9999px;
      top: 0;
    `;

    element.innerHTML = `
      <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #4CAF50; padding-bottom: 20px;">
        <h1 style="margin: 0; color: #4CAF50; font-size: 28px;">ใบแจ้งหนี้ค่าใช้จ่าย</h1>
        <p style="margin: 10px 0 0 0; color: #666; font-size: 16px;">หอพักมหาวิทยาลัย</p>
      </div>

      <div style="display: flex; justify-content: space-between; margin-bottom: 25px;">
        <div>
          <div style="font-size: 18px; font-weight: bold; color: #333;">ห้อง ${inv.room_number}</div>
          <div style="color: #666; margin-top: 5px;">งวดที่: ${inv.month_year}</div>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 14px; color: #666;">วันที่ออกบิล</div>
          <div style="font-weight: bold;">${new Date().toLocaleDateString('th-TH')}</div>
          <div style="margin-top: 10px;">
            <span style="padding: 5px 15px; border-radius: 20px; font-size: 12px; color: white; background: ${this.getStatusColor(inv.payment_status)};">
              ${this.getStatusText(inv.payment_status)}
            </span>
          </div>
        </div>
      </div>

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <thead>
          <tr style="background: #f8f9fa;">
            <th style="padding: 12px; border: 1px solid #ddd; text-align: left; font-weight: bold;">รายการ</th>
            <th style="padding: 12px; border: 1px solid #ddd; text-align: left; font-weight: bold;">รายละเอียด</th>
            <th style="padding: 12px; border: 1px solid #ddd; text-align: right; font-weight: bold;">จำนวนเงิน (บาท)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="padding: 10px 12px; border: 1px solid #ddd;">ค่าไฟ</td>
            <td style="padding: 10px 12px; border: 1px solid #ddd;">${inv.electricity_prev_meter} → ${inv.electricity_curr_meter} (${this.electricityUsed(inv)} หน่วย × ${inv.electricity_unit_price} ฿)</td>
            <td style="padding: 10px 12px; border: 1px solid #ddd; text-align: right;">${(+inv.electricity_fee || 0).toFixed(2)}</td>
          </tr>
          <tr>
            <td style="padding: 10px 12px; border: 1px solid #ddd;">ค่าน้ำ</td>
            <td style="padding: 10px 12px; border: 1px solid #ddd;">${inv.water_prev_meter} → ${inv.water_curr_meter} (${this.waterUsed(inv)} หน่วย × ${inv.water_unit_price} ฿)</td>
            <td style="padding: 10px 12px; border: 1px solid #ddd; text-align: right;">${(+inv.water_fee || 0).toFixed(2)}</td>
          </tr>
          <tr>
            <td style="padding: 10px 12px; border: 1px solid #ddd;">ค่าส่วนกลาง</td>
            <td style="padding: 10px 12px; border: 1px solid #ddd;">รายการคงที่</td>
            <td style="padding: 10px 12px; border: 1px solid #ddd; text-align: right;">${(+inv.common_fee || 0).toFixed(2)}</td>
          </tr>
          <tr>
            <td style="padding: 10px 12px; border: 1px solid #ddd;">ค่าเช่าห้อง</td>
            <td style="padding: 10px 12px; border: 1px solid #ddd;">รายการคงที่</td>
            <td style="padding: 10px 12px; border: 1px solid #ddd; text-align: right;">${(+inv.room_rent || 0).toFixed(2)}</td>
          </tr>
          ${(inv.extra_charges || []).map((ex: any) => `
            <tr>
              <td style="padding: 10px 12px; border: 1px solid #ddd;">${ex.label}</td>
              <td style="padding: 10px 12px; border: 1px solid #ddd;">รายการเพิ่มเติม</td>
              <td style="padding: 10px 12px; border: 1px solid #ddd; text-align: right;">${(+ex.amount || 0).toFixed(2)}</td>
            </tr>
          `).join('')}
        </tbody>
        <tfoot>
          <tr style="background: #f0f8f0;">
            <td colspan="2" style="padding: 15px 12px; border: 1px solid #ddd; font-weight: bold; font-size: 16px;">รวมทั้งสิ้น</td>
            <td style="padding: 15px 12px; border: 1px solid #ddd; text-align: right; font-weight: bold; font-size: 18px; color: #4CAF50;">${this.total(inv).toFixed(2)}</td>
          </tr>
        </tfoot>
      </table>

      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 12px;">
        <p style="margin: 0;">หมายเหตุ: กรุณาชำระเงินตามกำหนดเวลา และเก็บใบแจ้งหนี้นี้ไว้เป็นหลักฐาน</p>
        <p style="margin: 10px 0 0 0; text-align: center;">ขอบคุณที่ใช้บริการหอพักของเรา</p>
      </div>
    `;

    return element;
  }

  /** ได้สีของสถานะ */
  private getStatusColor(status: string): string {
    switch (status) {
      case 'paid':
        return '#4CAF50';
      case 'waiting_review':
        return '#FF9800';
      case 'waiting_payment':
        return '#f44336';
      default:
        return '#9E9E9E';
    }
  }

  /** กรองใบแจ้งหนี้ตามเดือนและปีที่เลือก */
  filterInvoices() {
    if (!this.selectedMonth && !this.selectedYear) {
      this.filteredInvoices = [...this.invoices];
      return;
    }

    this.filteredInvoices = this.invoices.filter(inv => {
      if (!inv.month_year) return false;
      
      const [month, year] = inv.month_year.split('/');
      const matchMonth = !this.selectedMonth || month === this.selectedMonth;
      const matchYear = !this.selectedYear || year === this.selectedYear;
      
      return matchMonth && matchYear;
    });
  }

  uploadProof(inv: any, event: any) {
    const file = event.target.files?.[0];
    if (!file) return;
    this.uploading[inv.id] = true;
    this.invoiceService.uploadProof(inv.id, file)
      .subscribe({
        next: (res: any) => {
          inv.payment_status = 'waiting_review';
          inv.payment_proof = res.file;
          this.uploading[inv.id] = false;
        },
        error: (err: any) => {
          console.error('upload failed', err);
          this.uploading[inv.id] = false;
        }
      });
  }

  handleImgError(event: Event) {
    (event.target as HTMLImageElement).src = 'building.svg';
  }

  openImage(src: string) {
    this.selectedImage = src;
  }

  // Statistics methods
  getTotalAmount(): number {
    // คิดยอดรวมเฉพาะใบแจ้งหนี้ที่สถานะ "รอชำระ" เท่านั้น
    return this.filteredInvoices
      .filter(inv => inv.payment_status === 'waiting_payment')
      .reduce((sum, inv) => sum + this.total(inv), 0);
  }

  getPaidInvoices(): number {
    return this.filteredInvoices.filter(inv => inv.payment_status === 'paid').length;
  }

  getReviewInvoices(): number {
    return this.filteredInvoices.filter(inv => inv.payment_status === 'waiting_review').length;
  }

  getPendingInvoices(): number {
    return this.filteredInvoices.filter(inv => inv.payment_status === 'waiting_payment').length;
  }

  // Status methods
  getStatusText(status: string): string {
    switch (status) {
      case 'paid':
        return 'ชำระแล้ว';
      case 'waiting_review':
        return 'รอตรวจสอบ';
      case 'waiting_payment':
        return 'รอชำระ';
      default:
        return 'ไม่ทราบสถานะ';
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'paid':
        return 'status-paid';
      case 'waiting_review':
        return 'status-review';
      case 'waiting_payment':
        return 'status-pending';
      default:
        return 'status-unknown';
    }
  }

  onLineConnect() {
    // เชื่อมต่อ LINE Account
    window.open('https://line.me/R/ti/p/@your-line-bot', '_blank');
  }
}
