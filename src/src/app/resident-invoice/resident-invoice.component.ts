import { Component, OnInit } from '@angular/core';
import { CommonModule }    from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { InvoiceService }  from '../invoice.service';

@Component({
  selector: 'app-resident-invoice',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './resident-invoice.component.html',
  styleUrls: ['./resident-invoice.component.css']
})
export class ResidentInvoiceComponent implements OnInit {
  /** รายการใบแจ้งหนี้ทั้งหมดของผู้ใช้ */
  invoices: any[] = [];
  uploading: { [id: number]: boolean } = {};

  constructor(private svc: InvoiceService) {}

  ngOnInit() {
    this.svc.getMyInvoices().subscribe({
      next: data   => this.invoices = data,
      error: err   => console.error('โหลดใบแจ้งหนี้ไม่สำเร็จ', err)
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
}
