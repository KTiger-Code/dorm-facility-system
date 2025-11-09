import { Component, OnInit } from '@angular/core';
import { CommonModule }     from '@angular/common';
import { FormsModule }      from '@angular/forms';
import { HttpClientModule, HttpClient, HttpHeaders } from '@angular/common/http';
import { FacilityBookingService } from '../facility-booking/facility-booking.service';
import { HeaderComponent } from '../shared/header/header.component';
import { AdminBaseComponent } from '../shared/admin-base.component';
import { Router } from '@angular/router';
import { SessionTimeoutService } from '../shared/session-timeout.service';
import { NotificationsComponent } from '../shared/components/notifications/notifications.component';
import { NotificationService } from '../shared/services/notification.service';

@Component({
  selector: 'app-admin-facility',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, HeaderComponent, NotificationsComponent],
  templateUrl: './admin-facility.component.html',
  styleUrls: ['./admin-facility.component.css']
})
export class AdminFacilityComponent extends AdminBaseComponent implements OnInit {
  bookings: any[] = [];
  users: any[] = [];
  filterRoom = '';
  editData: any = { id: null };

  constructor(
    private svc: FacilityBookingService,
    private http: HttpClient,
    router: Router,
    sessionTimeoutService: SessionTimeoutService,
    private notificationService: NotificationService
  ) {
    super(router, sessionTimeoutService);
  }

  ngOnInit() {
    this.loadBookings();
    this.loadUsers();
  }

  private authHeaders() {
    const t = localStorage.getItem('token')!;
    return { headers: new HttpHeaders({ Authorization: `Bearer ${t}` }) };
  }

  loadUsers() {
    this.http.get<any[]>('/api/users', this.authHeaders())
      .subscribe(u => this.users = u);
  }

  loadBookings() {
    this.svc.getAllBookings().subscribe(b => this.bookings = b);
  }

  get filtered() {
    const f = this.filterRoom.toLowerCase();
    return this.bookings.filter(b =>
      b.room_number.toLowerCase().includes(f)
    );
  }

  // สถานะและสี
  getStatusText(status: string): string {
    switch (status) {
      case 'pending': return 'รอการอนุมัติ';
      case 'approved': return 'อนุมัติแล้ว';
      case 'rejected': return 'ถูกปฏิเสธ';
      default: return 'ไม่ทราบสถานะ';
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'pending': return 'status-pending';
      case 'approved': return 'status-approved';
      case 'rejected': return 'status-rejected';
      default: return 'status-unknown';
    }
  }

  // การจัดการสถานะ
  approveBooking(booking: any) {
    console.log('Approving booking:', booking.id);
    this.svc.updateBookingStatus(booking.id, 'approved').subscribe({
      next: (updatedBooking) => {
        console.log('Booking approved successfully:', updatedBooking);
        // อัปเดตข้อมูลในตาราง
        const index = this.bookings.findIndex(b => b.id === booking.id);
        if (index !== -1) {
          this.bookings[index] = { ...this.bookings[index], status: 'approved' };
        }
        this.notificationService.success('อนุมัติการจองเรียบร้อยแล้ว');
      },
      error: (err) => {
        console.error('Error approving booking:', err);
        this.notificationService.error('เกิดข้อผิดพลาดในการอนุมัติ: ' + (err.error?.message || err.message));
      }
    });
  }

  rejectBooking(booking: any) {
    if (!confirm('คุณต้องการปฏิเสธการจองนี้หรือไม่?')) return;
    
    console.log('Rejecting booking:', booking.id);
    this.svc.updateBookingStatus(booking.id, 'rejected').subscribe({
      next: (updatedBooking) => {
        console.log('Booking rejected successfully:', updatedBooking);
        // อัปเดตข้อมูลในตาราง
        const index = this.bookings.findIndex(b => b.id === booking.id);
        if (index !== -1) {
          this.bookings[index] = { ...this.bookings[index], status: 'rejected' };
        }
        this.notificationService.success('ปฏิเสธการจองเรียบร้อยแล้ว');
      },
      error: (err) => {
        console.error('Error rejecting booking:', err);
        this.notificationService.error('เกิดข้อผิดพลาดในการปฏิเสธ: ' + (err.error?.message || err.message));
      }
    });
  }

  // สถิติ
  getPendingCount(): number {
    return this.bookings.filter(b => b.status === 'pending').length;
  }

  getApprovedCount(): number {
    return this.bookings.filter(b => b.status === 'approved').length;
  }

  getRejectedCount(): number {
    return this.bookings.filter(b => b.status === 'rejected').length;
  }

  edit(b: any) {
    this.editData = { 
      id: b.id,
      user_id: b.user_id,
      facility_name: b.facility_name,
      booking_date: this.formatDateForInput(b.booking_date),
      time_slot_start: b.time_slot_start,
      time_slot_end: b.time_slot_end,
      number_of_people: b.number_of_people,
      status: b.status
    };
  }

  // แปลงวันที่ให้อยู่ในรูปแบบที่ input date รองรับ (YYYY-MM-DD)
  formatDateForInput(dateString: string): string {
    if (!dateString) return '';
    
    // หากเป็นรูปแบบ YYYY-MM-DD อยู่แล้ว
    if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return dateString;
    }
    
    // หากเป็นรูปแบบอื่น ให้แปลง
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    
    return date.toISOString().split('T')[0];
  }

  // แปลงวันที่สำหรับการแสดงผล (เป็นภาษาไทย)
  formatDateForDisplay(dateString: string): string {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    
    return date.toLocaleDateString('th-TH', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric'
    });
  }

  save() {
    const d = this.editData;
    if (d.id) {
      this.svc.updateBooking(d.id, d).subscribe({
        next: () => {
          this.loadBookings();
          this.notificationService.success('บันทึกการแก้ไขเรียบร้อยแล้ว');
          this.editData = { id: null };
        },
        error: (err) => {
          console.error('Error updating booking:', err);
          this.notificationService.error('เกิดข้อผิดพลาดในการบันทึก');
        }
      });
    }
  }

  delete(id: number) {
    if (!confirm('ลบการจองนี้?')) return;
    this.svc.deleteBooking(id).subscribe({
      next: () => {
        this.loadBookings();
        this.notificationService.success('ลบการจองเรียบร้อยแล้ว');
      },
      error: (err) => {
        console.error('Error deleting booking:', err);
        this.notificationService.error('เกิดข้อผิดพลาดในการลบ');
      }
    });
  }
}
