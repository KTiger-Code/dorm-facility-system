import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule }   from '@angular/forms';
import { RepairService } from './repair.service';
import { HeaderComponent } from '../shared/header/header.component';

@Component({
  selector: 'app-repair-request',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent],
  templateUrl: './repair-request.component.html',
  styleUrls: ['./repair-request.component.css']
})
export class RepairRequestComponent implements OnInit {
  title = '';
  description = '';
  repairs: any[] = [];
  filteredRepairs: any[] = [];
  searchQuery: string = '';

  constructor(private repairService: RepairService) {}

  ngOnInit() {
    this.loadRepairs();
  }

  loadRepairs() {
    this.repairService.getRepairs().subscribe({
      next: res => {
        this.repairs = res;
        this.filteredRepairs = res;
      },
      error: err => console.error('โหลดรายการแจ้งซ่อมล้มเหลว:', err)
    });
  }

  submitRepair() {
    if (!this.title.trim() || !this.description.trim()) {
      return alert('กรุณากรอกหัวข้อและรายละเอียดให้ครบ');
    }
    this.repairService.createRepair({
      title: this.title,
      description: this.description
    }).subscribe({
      next: newReq => {
        this.repairs.unshift(newReq);
        this.filteredRepairs.unshift(newReq);
        this.title = '';
        this.description = '';
        alert('แจ้งซ่อมเรียบร้อยแล้ว');
      },
      error: err => console.error('แจ้งซ่อมไม่สำเร็จ:', err)
    });
  }

  // Search and filter methods
  filterRepairs() {
    if (!this.searchQuery.trim()) {
      this.filteredRepairs = this.repairs;
      return;
    }

    this.filteredRepairs = this.repairs.filter(repair =>
      repair.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      repair.description.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      (repair.room_number && repair.room_number.toString().includes(this.searchQuery))
    );
  }

  // Statistics methods
  getTotalRepairs(): number {
    return this.repairs.length;
  }

  getPendingRepairs(): number {
    return this.repairs.filter(repair => repair.status === 'pending').length;
  }

  getInProgressRepairs(): number {
    return this.repairs.filter(repair => repair.status === 'in_progress').length;
  }

  getCompletedRepairs(): number {
    return this.repairs.filter(repair => repair.status === 'completed').length;
  }

  // Date formatting
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('th-TH', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Status methods
  getStatusText(status: string): string {
    switch (status) {
      case 'pending':
        return 'รอดำเนินการ';
      case 'in_progress':
        return 'กำลังดำเนินการ';
      case 'completed':
        return 'เสร็จสิ้น';
      default:
        return status;
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'pending': return 'status-pending';
      case 'in_progress': return 'status-in-progress';
      case 'completed': return 'status-completed';
      default: return 'status-pending';
    }
  }

  getRepairCardClass(repair: any): string {
    switch (repair.status) {
      case 'pending': return 'repair-pending';
      case 'in_progress': return 'repair-in-progress';
      case 'completed': return 'repair-completed';
      default: return 'repair-pending';
    }
  }

  // Action methods
  cancelRepair(repairId: number): void {
    if (confirm('คุณต้องการยกเลิกการแจ้งซ่อมนี้หรือไม่?')) {
      // Update local data (since we don't have cancelRepair in service)
      this.repairs = this.repairs.filter(repair => repair.id !== repairId);
      this.filteredRepairs = this.filteredRepairs.filter(repair => repair.id !== repairId);
      alert('ยกเลิกการแจ้งซ่อมเรียบร้อยแล้ว');
      
      // TODO: Implement cancelRepair in RepairService
      // this.repairService.cancelRepair(repairId).subscribe({
      //   next: () => {
      //     this.loadRepairs();
      //     alert('ยกเลิกการแจ้งซ่อมเรียบร้อยแล้ว');
      //   },
      //   error: (err: any) => {
      //     console.error(err);
      //     alert('เกิดข้อผิดพลาดในการยกเลิก');
      //   }
      // });
    }
  }
}
