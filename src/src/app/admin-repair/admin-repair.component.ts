import { Component, OnInit } from '@angular/core';
import { CommonModule }      from '@angular/common';
import { FormsModule }       from '@angular/forms';
import { HttpClientModule, HttpClient, HttpHeaders } from '@angular/common/http';
import { HeaderComponent }   from '../shared/header/header.component';
import { AdminBaseComponent } from '../shared/admin-base.component';
import { Router } from '@angular/router';
import { SessionTimeoutService } from '../shared/session-timeout.service';
import { NotificationsComponent } from '../shared/components/notifications/notifications.component';
import { NotificationService } from '../shared/services/notification.service';

@Component({
  selector: 'app-admin-repair',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    HeaderComponent,
    NotificationsComponent
  ],
  templateUrl: './admin-repair.component.html',
  styleUrls: ['./admin-repair.component.css']
})
export class AdminRepairComponent extends AdminBaseComponent implements OnInit {
  repairs: {
    id: number;
    room_number: string;
    title: string;
    description: string;
    status: 'pending' | 'in_progress' | 'completed';
    created_at: string;
    updated_at: string | null;
  }[] = [];
  filterStatus: 'all' | 'pending' | 'in_progress' | 'completed' = 'all';

  constructor(
    private http: HttpClient, 
    router: Router, 
    sessionTimeoutService: SessionTimeoutService,
    private notificationService: NotificationService
  ) {
    super(router, sessionTimeoutService);
  }

  ngOnInit() {
    this.loadAll();
  }

  private authHeaders() {
    const token = localStorage.getItem('token')!;
    return {
      headers: new HttpHeaders({ Authorization: `Bearer ${token}` })
    };
  }

  loadAll() {
    this.http
      .get<any[]>('/api/repair/all', this.authHeaders()) // แก้ไขจาก repair-request เป็น repair
      .subscribe({
        next: data => {
          // สมมติ backend ส่งมาพร้อม room_number, title, description, status, timestamps
          this.repairs = data;
        },
        error: err => console.error('โหลดคำขอซ่อม (Admin) ไม่สำเร็จ:', err)
      });
  }

  filteredRepairs() {
    return this.repairs.filter(r =>
      this.filterStatus === 'all' || r.status === this.filterStatus
    );
  }

  getPendingCount(): number {
    return this.repairs.filter(r => r.status === 'pending').length;
  }

  getInProgressCount(): number {
    return this.repairs.filter(r => r.status === 'in_progress').length;
  }

  getCompletedCount(): number {
    return this.repairs.filter(r => r.status === 'completed').length;
  }

  deleteRepair(id: number) {
    if (!confirm('ลบคำขอนี้?')) return;
    this.http.delete(`/api/repair/${id}`, this.authHeaders()) // แก้ไขจาก repair-request เป็น repair
      .subscribe({
        next: () => {
          this.notificationService.success('ลบคำขอซ่อมสำเร็จ');
          this.loadAll();
        },
        error: (err) => {
          console.error('ลบคำขอซ่อมไม่สำเร็จ:', err);
          this.notificationService.error('เกิดข้อผิดพลาดในการลบคำขอซ่อม');
        }
      });
  }

  updateStatus(req: any, newStatus: 'pending' | 'in_progress' | 'completed') {
    this.http
      .patch(
        `/api/repair/${req.id}/status`, // แก้ไขจาก repair-request เป็น repair
        { status: newStatus },
        this.authHeaders()
      )
      .subscribe({
        next: () => {
          req.status = newStatus;
          this.notificationService.success('อัปเดตสถานะคำขอซ่อมสำเร็จ');
        },
        error: (err) => {
          console.error('อัปเดตสถานะไม่สำเร็จ:', err);
          this.notificationService.error('เกิดข้อผิดพลาดในการอัปเดตสถานะคำขอซ่อม');
        }
      });
  }
}
