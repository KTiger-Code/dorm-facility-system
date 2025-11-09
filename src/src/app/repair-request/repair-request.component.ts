import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule }   from '@angular/forms';
import { Router } from '@angular/router';
import { RepairService } from './repair.service';
import { HeaderComponent } from '../shared/header/header.component';
import { NotificationsComponent } from '../shared/components/notifications/notifications.component';
import { NotificationService } from '../shared/services/notification.service';

@Component({
  selector: 'app-repair-request',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent, NotificationsComponent],
  templateUrl: './repair-request.component.html',
  styleUrls: ['./repair-request.component.css']
})
export class RepairRequestComponent implements OnInit {
  title = '';
  description = '';
  repairs: any[] = [];
  filteredRepairs: any[] = [];
  searchQuery: string = '';
  isAdmin: boolean = false;

  constructor(
    private repairService: RepairService, 
    private router: Router,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.checkAdminStatus();
    this.loadRepairs();
  }

  checkAdminStatus() {
    const userRole = localStorage.getItem('userRole');
    this.isAdmin = userRole === 'admin';
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
      this.notificationService.error('กรุณากรอกหัวข้อและรายละเอียดให้ครบ');
      return;
    }
    this.repairService.createRepair({
      title: this.title,
      description: this.description
    }).subscribe({
      next: (newReq) => {
        this.repairs.unshift(newReq);
        this.filteredRepairs.unshift(newReq);
        this.title = '';
        this.description = '';
        this.notificationService.success('แจ้งซ่อมเรียบร้อยแล้ว');
      },
      error: (err) => {
        console.error('แจ้งซ่อมไม่สำเร็จ:', err);
        this.notificationService.error('เกิดข้อผิดพลาดในการแจ้งซ่อม');
      }
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
      this.notificationService.success('ยกเลิกการแจ้งซ่อมเรียบร้อยแล้ว');
      
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

  onLineConnect() {
    // เชื่อมต่อ LINE Account
    window.open('https://line.me/R/ti/p/@your-line-bot', '_blank');
  }

  onLogout() {
    // ออกจากระบบ
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    this.router.navigate(['/login']);
  }
}
