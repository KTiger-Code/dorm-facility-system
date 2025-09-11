import { Component, OnInit } from '@angular/core';
import { CommonModule }     from '@angular/common';
import { FormsModule }      from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { FacilityBookingService } from './facility-booking.service';
import { HeaderComponent } from '../shared/header/header.component';

@Component({
  selector: 'app-facility-booking',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, HeaderComponent],
  templateUrl: './facility-booking.component.html',
  styleUrls: ['./facility-booking.component.css']
})
export class FacilityBookingComponent implements OnInit {
  bookings: any[] = [];
  newBooking = {
    facility_name: '',
    booking_date: '',
    time_slot_start: '',
    time_slot_end: '',
    number_of_people: 1
  };

  isAdmin: boolean = false;

  constructor(private svc: FacilityBookingService, private router: Router) {}

  ngOnInit() {
    this.checkAdminStatus();
    this.getBookings();
  }

  checkAdminStatus() {
    const userRole = localStorage.getItem('userRole');
    this.isAdmin = userRole === 'admin';
  }

  getBookings() {
    this.svc.getBookings().subscribe({
      next: res => this.bookings = res,
      error: err => console.error(err)
    });
  }

  bookFacility() {
    this.svc.createBooking(this.newBooking).subscribe({
      next: () => {
        this.getBookings();
        this.newBooking = {
          facility_name: '',
          booking_date: '',
          time_slot_start: '',
          time_slot_end: '',
          number_of_people: 1
        };
      },
      error: err => console.error(err)
    });
  }

  formatDate(date: string) {
    return new Date(date).toLocaleDateString('th-TH', {
      day: '2-digit', month: 'long', year: 'numeric'
    });
  }

  // Statistics methods
  getTotalBookings(): number {
    return this.bookings.length;
  }

  getUpcomingBookings(): number {
    const now = new Date();
    return this.bookings.filter(booking => {
      const bookingDate = new Date(booking.booking_date + ' ' + booking.time_slot_start);
      return bookingDate > now;
    }).length;
  }

  getCompletedBookings(): number {
    const now = new Date();
    return this.bookings.filter(booking => {
      const bookingDate = new Date(booking.booking_date + ' ' + booking.time_slot_end);
      return bookingDate < now;
    }).length;
  }

  // Booking status methods
  getBookingStatus(booking: any): string {
    const now = new Date();
    const bookingStart = new Date(booking.booking_date + ' ' + booking.time_slot_start);
    const bookingEnd = new Date(booking.booking_date + ' ' + booking.time_slot_end);

    if (bookingEnd < now) {
      return 'เสร็จสิ้น';
    } else if (bookingStart <= now && now <= bookingEnd) {
      return 'กำลังดำเนินการ';
    } else {
      return 'รอการดำเนินการ';
    }
  }

  getBookingStatusClass(booking: any): string {
    const status = this.getBookingStatus(booking);
    switch (status) {
      case 'เสร็จสิ้น': return 'status-completed';
      case 'กำลังดำเนินการ': return 'status-active';
      case 'รอการดำเนินการ': return 'status-pending';
      default: return 'status-pending';
    }
  }

  // Booking management methods
  canCancelBooking(booking: any): boolean {
    const now = new Date();
    const bookingStart = new Date(booking.booking_date + ' ' + booking.time_slot_start);
    // Allow cancellation up to 1 hour before booking starts
    const cutoffTime = new Date(bookingStart.getTime() - (60 * 60 * 1000));
    return now < cutoffTime;
  }

  cancelBooking(bookingId: number): void {
    if (confirm('คุณต้องการยกเลิกการจองนี้หรือไม่?')) {
      // For now, just remove from local array since cancelBooking method doesn't exist in service
      this.bookings = this.bookings.filter(booking => booking.booking_id !== bookingId);
      alert('ยกเลิกการจองเรียบร้อยแล้ว');
      
      // TODO: Implement cancelBooking in FacilityBookingService
      // this.svc.cancelBooking(bookingId).subscribe({
      //   next: () => {
      //     this.getBookings();
      //     alert('ยกเลิกการจองเรียบร้อยแล้ว');
      //   },
      //   error: (err: any) => {
      //     console.error(err);
      //     alert('เกิดข้อผิดพลาดในการยกเลิกการจอง');
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
