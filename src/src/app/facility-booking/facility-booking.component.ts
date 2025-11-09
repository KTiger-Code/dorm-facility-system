import { Component, OnInit } from '@angular/core';
import { CommonModule }     from '@angular/common';
import { FormsModule }      from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { FacilityBookingService } from './facility-booking.service';
import { HeaderComponent } from '../shared/header/header.component';
import { NotificationsComponent } from '../shared/components/notifications/notifications.component';
import { NotificationService } from '../shared/services/notification.service';

@Component({
  selector: 'app-facility-booking',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, HeaderComponent, NotificationsComponent],
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

  constructor(
    private svc: FacilityBookingService, 
    private router: Router,
    private notificationService: NotificationService
  ) {}

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
      next: res => {
        this.bookings = res;
        this.sortBookingsByStatus();
      },
      error: err => console.error(err)
    });
  }

  // ฟังก์ชันเรียงลำดับการจองตามสถานะ
  sortBookingsByStatus() {
    this.bookings.sort((a: any, b: any) => {
      const statusA = this.getBookingStatus(a);
      const statusB = this.getBookingStatus(b);
      
      // กำหนดลำดับความสำคัญ (เลขน้อย = อยู่บนสุด)
      const statusPriority: { [key: string]: number } = {
        'รอยืนยันการจอง': 1,    // บนสุด
        'กำลังจะมาถึง': 2,       // กลาง
        'สำเร็จ': 3,             // ล่างสุด
        'ถูกปฏิเสธ': 4          // ล่างสุด (หากมี)
      };
      
      const priorityA = statusPriority[statusA] || 999;
      const priorityB = statusPriority[statusB] || 999;
      
      // หากสถานะเหมือนกัน ให้เรียงตามวันที่และเวลา
      if (priorityA === priorityB) {
        // สร้าง Date object รวมวันที่และเวลาเริ่มต้น
        const dateTimeA = this.createBookingDateTime(a);
        const dateTimeB = this.createBookingDateTime(b);
        
        // เรียงตามเวลา: การจองที่มีเวลาเร็วกว่าอยู่บนสุด
        return dateTimeA.getTime() - dateTimeB.getTime();
      }
      
      return priorityA - priorityB;
    });
  }

  // ฟังก์ชันสำหรับสร้าง DateTime object จากการจอง
  private createBookingDateTime(booking: any): Date {
    const bookingDate = new Date(booking.booking_date);
    const [hours, minutes] = booking.time_slot_start.split(':').map(Number);
    const dateTime = new Date(bookingDate);
    dateTime.setHours(hours, minutes, 0, 0);
    return dateTime;
  }

  bookFacility() {
    if (!this.newBooking.facility_name || !this.newBooking.booking_date || 
        !this.newBooking.time_slot_start || !this.newBooking.time_slot_end) {
      this.notificationService.error('กรุณากรอกข้อมูลการจองให้ครบถ้วน');
      return;
    }

    this.svc.createBooking(this.newBooking).subscribe({
      next: () => {
        this.notificationService.success('จองสิ่งอำนวยความสะดวกสำเร็จ');
        this.getBookings();
        this.newBooking = {
          facility_name: '',
          booking_date: '',
          time_slot_start: '',
          time_slot_end: '',
          number_of_people: 1
        };
      },
      error: err => {
        console.error(err);
        this.notificationService.error('เกิดข้อผิดพลาดในการจอง กรุณาลองใหม่อีกครั้ง');
      }
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
    console.log('Current time:', now.toLocaleString('th-TH'));
    
    const upcomingBookings = this.bookings.filter(booking => {
      // แปลง booking_date เป็น Date object ก่อน
      const bookingDate = new Date(booking.booking_date);
      
      // แยกเวลาจาก time_slot_start (format: "HH:MM:SS") 
      const [hours, minutes] = booking.time_slot_start.split(':').map(Number);
      
      // สร้าง Date object ใหม่โดยใช้วันที่จากฐานข้อมูลและเวลาที่แยกได้
      const bookingDateTime = new Date(bookingDate);
      bookingDateTime.setHours(hours, minutes, 0, 0);
      
      console.log(`Checking booking ${booking.id}:`, {
        facility_name: booking.facility_name,
        booking_date: booking.booking_date,
        time_slot_start: booking.time_slot_start,
        parsed_datetime: bookingDateTime.toLocaleString('th-TH'),
        status: booking.status,
        is_future: bookingDateTime > now,
        is_approved: booking.status === 'approved'
      });
      
      return bookingDateTime > now && booking.status === 'approved';
    });
    
    console.log('Upcoming bookings count:', upcomingBookings.length);
    return upcomingBookings.length;
  }

  getCompletedBookings(): number {
    const now = new Date();
    console.log('=== getCompletedBookings called ===');
    console.log('Current time:', now.toLocaleString('th-TH'));
    
    const completedBookings = this.bookings.filter(booking => {
      // แปลง booking_date เป็น Date object ก่อน
      const bookingDate = new Date(booking.booking_date);
      
      // แยกเวลาจาก time_slot_end (format: "HH:MM:SS")
      const [hours, minutes] = booking.time_slot_end.split(':').map(Number);
      
      // สร้าง Date object โดยใช้เวลาสิ้นสุด
      const bookingEndDateTime = new Date(bookingDate);
      bookingEndDateTime.setHours(hours, minutes, 0, 0);
      
      const isPast = bookingEndDateTime < now;
      const isApproved = booking.status === 'approved';
      
      console.log(`Checking completed booking ${booking.id}:`, {
        facility_name: booking.facility_name,
        booking_date: booking.booking_date,
        time_slot_end: booking.time_slot_end,
        end_datetime: bookingEndDateTime.toLocaleString('th-TH'),
        status: booking.status,
        is_past: isPast,
        is_approved: isApproved
      });
      
      return isPast && isApproved;
    });
    
    console.log('Completed bookings count:', completedBookings.length);
    return completedBookings.length;
  }

  // Booking status methods
  getBookingStatus(booking: any): string {
    // หาก Admin ยังไม่อนุมัติ
    if (booking.status === 'pending') {
      return 'รอยืนยันการจอง';
    } else if (booking.status === 'rejected') {
      return 'ถูกปฏิเสธ';
    }

    // หาก approved แล้ว ให้ดูจากเวลา
    const now = new Date();
    const bookingDate = new Date(booking.booking_date);
    
    // แยกเวลาสิ้นสุด
    const [endHours, endMinutes] = booking.time_slot_end.split(':').map(Number);
    const bookingEndDateTime = new Date(bookingDate);
    bookingEndDateTime.setHours(endHours, endMinutes, 0, 0);
    
    // แยกเวลาเริ่มต้น
    const [startHours, startMinutes] = booking.time_slot_start.split(':').map(Number);
    const bookingStartDateTime = new Date(bookingDate);
    bookingStartDateTime.setHours(startHours, startMinutes, 0, 0);

    if (bookingEndDateTime < now) {
      return 'สำเร็จ';
    } else if (bookingStartDateTime <= now && now <= bookingEndDateTime) {
      return 'กำลังจะมาถึง';
    } else {
      return 'กำลังจะมาถึง';
    }
  }

  getBookingStatusClass(booking: any): string {
    const status = this.getBookingStatus(booking);
    switch (status) {
      case 'สำเร็จ': return 'status-completed';
      case 'กำลังจะมาถึง': return 'status-upcoming'; 
      case 'รอยืนยันการจอง': return 'status-pending';
      case 'ถูกปฏิเสธ': return 'status-rejected';
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
      this.sortBookingsByStatus(); // เรียงลำดับใหม่หลังจากลบ
      this.notificationService.success('ยกเลิกการจองเรียบร้อยแล้ว');
      
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
