import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { HeaderComponent } from '../shared/header/header.component';
import { AdminBaseComponent } from '../shared/admin-base.component';
import { SessionTimeoutService } from '../shared/session-timeout.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';

interface DashboardStats {
  pendingInvoices: number;
  pendingRepairs: number;
  pendingFacilityBookings: number;
  pendingAnnouncements: number;
  totalPendingItems: number;
}

interface AdminLog {
  id: number;
  admin_id: number;
  admin_username: string;
  admin_fullname: string;
  action: string;
  target_table: string;
  target_id: number | null;
  details: string;
  ip_address: string;
  created_at: string;
}

interface AdminLogStats {
  period: number;
  action_stats: { action: string; count: number }[];
  active_admins: number;
  today_logs: number;
}

@Component({
  selector: 'app-admin-home',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent],
  templateUrl: './admin-home.component.html',
  styleUrls: ['./admin-home.component.css']
})
export class AdminHomeComponent extends AdminBaseComponent implements OnInit {
  dashboardStats: DashboardStats = {
    pendingInvoices: 0,
    pendingRepairs: 0,
    pendingFacilityBookings: 0,
    pendingAnnouncements: 0,
    totalPendingItems: 0
  };

  // เพิ่มตัวแปรสำหรับ admin logs
  adminLogs: AdminLog[] = [];
  adminLogStats: AdminLogStats | null = null;
  showAdminLogs = false;
  logsLoading = false;
  currentPage = 1;
  logsPerPage = 10;

  private apiUrl = 'http://localhost:3000/api';

  constructor(
    router: Router, 
    sessionTimeoutService: SessionTimeoutService,
    private http: HttpClient
  ) {
    super(router, sessionTimeoutService);
  }

  ngOnInit() {
    this.loadDashboardStats();
    this.loadAdminLogStats();
    // รีเฟรช stats ทุก 30 วินาที
    setInterval(() => {
      this.loadDashboardStats();
      if (this.showAdminLogs) {
        this.loadAdminLogStats();
      }
    }, 30000);
  }

  // สร้าง HTTP headers พร้อม JWT token
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  loadDashboardStats() {
    console.log('Loading dashboard stats...');
    // โหลดข้อมูลการแจ้งเตือนจากแต่ละ API
    this.loadPendingInvoices();
    this.loadPendingRepairs();
    this.loadPendingFacilityBookings();
  }

  private loadPendingInvoices() {
    // ใช้ admin endpoint พร้อม Authorization headers
    const headers = this.getHeaders();
    this.http.get<any[]>(`${this.apiUrl}/invoice/all`, { headers }).subscribe({
      next: (invoices) => {
        console.log('Invoices from API:', invoices);
        // นับใบแจ้งหนี้ที่มีสถานะ "รอตรวจสอบ" เท่านั้น
        const pending = invoices.filter(
          invoice => invoice.payment_status === 'waiting_review'
        );
        console.log('Pending invoices (waiting_review):', pending);
        this.dashboardStats.pendingInvoices = pending.length;
        this.updateTotalPendingItems();
      },
      error: (err) => {
        console.error('Error loading pending invoices:', err);
        // หาก API error ให้ใช้ 0
        this.dashboardStats.pendingInvoices = 0;
        this.updateTotalPendingItems();
      }
    });
  }

  private loadPendingRepairs() {
    // ใช้ admin endpoint พร้อม Authorization headers
    const headers = this.getHeaders();
    this.http.get<any[]>(`${this.apiUrl}/repair/all`, { headers }).subscribe({
      next: (repairs) => {
        console.log('Repairs from API:', repairs);
        // นับคำขอซ่อมที่รอดำเนินการ
        const pending = repairs.filter(
          repair => repair.status === 'รอดำเนินการ' || 
                   repair.status === 'รออนุมัติ' ||
                   repair.status === 'รับเรื่องแล้ว' ||
                   repair.status === 'pending'
        );
        console.log('Pending repairs:', pending);
        this.dashboardStats.pendingRepairs = pending.length;
        this.updateTotalPendingItems();
      },
      error: (err) => {
        console.error('Error loading pending repairs:', err);
        // หาก API error ให้ใช้ 0
        this.dashboardStats.pendingRepairs = 0;
        this.updateTotalPendingItems();
      }
    });
  }

  private loadPendingFacilityBookings() {
    // ใช้ admin endpoint พร้อม Authorization headers
    const headers = this.getHeaders();
    this.http.get<any[]>(`${this.apiUrl}/facility/all`, { headers }).subscribe({
      next: (bookings) => {
        console.log('Facility bookings from API:', bookings);
        // นับการจองส่วนกลางที่รอการอนุมัติ
        const pending = bookings.filter(
          booking => booking.status === 'pending'
        );
        console.log('Pending facility bookings:', pending);
        this.dashboardStats.pendingFacilityBookings = pending.length;
        this.updateTotalPendingItems();
      },
      error: (err) => {
        console.error('Error loading pending facility bookings:', err);
        // หาก API error ให้ใช้ 0
        this.dashboardStats.pendingFacilityBookings = 0;
        this.updateTotalPendingItems();
      }
    });
  }

  private updateTotalPendingItems() {
    this.dashboardStats.totalPendingItems = 
      this.dashboardStats.pendingInvoices + 
      this.dashboardStats.pendingRepairs + 
      this.dashboardStats.pendingFacilityBookings;
  }

  // ฟังก์ชันสำหรับนำทางไปหน้าที่เกี่ยวข้อง
  navigateToInvoices() {
    this.router.navigate(['/admin/invoice']);
  }

  navigateToRepairs() {
    this.router.navigate(['/admin/repairs']);
  }

  navigateToFacilityBookings() {
    this.router.navigate(['/admin/facility-booking']);
  }

  // ฟังก์ชันสำหรับจัดการ admin logs
  toggleAdminLogs() {
    this.showAdminLogs = !this.showAdminLogs;
    if (this.showAdminLogs && this.adminLogs.length === 0) {
      this.loadAdminLogs();
    }
  }

  loadAdminLogStats() {
    const headers = this.getHeaders();
    this.http.get<any>(`${this.apiUrl}/admin-logs/stats?period=7`, { headers }).subscribe({
      next: (response) => {
        if (response.success) {
          this.adminLogStats = response.data;
        }
      },
      error: (err) => {
        console.error('Error loading admin log stats:', err);
      }
    });
  }

  loadAdminLogs() {
    this.logsLoading = true;
    const headers = this.getHeaders();
    
    this.http.get<any>(`${this.apiUrl}/admin-logs?page=${this.currentPage}&limit=${this.logsPerPage}`, { headers }).subscribe({
      next: (response) => {
        if (response.success) {
          this.adminLogs = response.data;
        }
        this.logsLoading = false;
      },
      error: (err) => {
        console.error('Error loading admin logs:', err);
        this.logsLoading = false;
      }
    });
  }

  formatLogDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH') + ' ' + date.toLocaleTimeString('th-TH');
  }

  getActionColor(action: string): string {
    if (action.includes('อนุมัติ') || action.includes('approve')) return 'success';
    if (action.includes('ปฏิเสธ') || action.includes('reject')) return 'danger';
    if (action.includes('สร้าง') || action.includes('create')) return 'primary';
    if (action.includes('แก้ไข') || action.includes('update')) return 'warning';
    if (action.includes('ลบ') || action.includes('delete')) return 'danger';
    return 'secondary';
  }
}
