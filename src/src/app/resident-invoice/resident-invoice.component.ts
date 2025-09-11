import { Component, OnInit } from '@angular/core';
import { CommonModule }    from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { InvoiceService }  from '../invoice.service';
import { HeaderComponent } from '../shared/header/header.component';

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

  constructor(private svc: InvoiceService) {
    // สร้างรายการปีย้อนหลัง 5 ปี และ ล่วงหน้า 2 ปี
    const currentYear = new Date().getFullYear();
    for (let year = currentYear - 5; year <= currentYear + 2; year++) {
      this.years.push(year);
    }
  }

  ngOnInit() {
    this.svc.getMyInvoices().subscribe({
      next: data => {
        this.invoices = data;
        this.filteredInvoices = [...this.invoices];
      },
      error: err => console.error('โหลดใบแจ้งหนี้ไม่สำเร็จ', err)
    });
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

  /** ปริ้นท์หน้าเป็น PDF */
  downloadPdf(inv: any) {
    // ส่วนนี้คุณอาจจะเปลี่ยนเป็น jsPDF/html2canvas ตามต้องการ
    window.print();
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
    this.svc.uploadProof(inv.id, file)
      .subscribe({
        next: res => {
          inv.payment_status = 'waiting_review';
          inv.payment_proof = res.file;
          this.uploading[inv.id] = false;
        },
        error: err => {
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
    return this.filteredInvoices.reduce((sum, inv) => sum + this.total(inv), 0);
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
}
