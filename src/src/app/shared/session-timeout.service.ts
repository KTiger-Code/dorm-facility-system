import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class SessionTimeoutService {
  // กำหนดเวลาตาม role - เวลาจริงสำหรับ Production
  private readonly USER_SESSION_TIMEOUT = 5 * 60 * 1000; // 5 นาที สำหรับ user ธรรมดา
  private readonly ADMIN_SESSION_TIMEOUT = 20 * 60 * 1000; // 20 นาที สำหรับ admin
  private readonly WARNING_TIME = 1 * 60 * 1000; // เตือนก่อน 1 นาที
  
  private timeoutId: any;
  private warningId: any;
  private currentSessionTimeout: number = this.USER_SESSION_TIMEOUT;
  
  // Observable สำหรับแจ้งเตือนก่อน timeout
  public warningSubject = new Subject<number>();
  public timeoutSubject = new Subject<void>();

  constructor(private router: Router, private authService: AuthService) {
    // เริ่มต้นการตรวจจับ user activity ทันที
    this.initUserActivityDetection();
    
    // ตรวจสอบ token และ session
    if (this.authService.isLoggedIn()) {
      this.startTimeout();
    }
  }

  // เริ่มนับเวลา session timeout
  startTimeout() {
    // กำหนดเวลาตาม role
    this.setTimeoutByRole();
    this.resetTimeout();
  }

  // กำหนดเวลา timeout ตาม role
  setTimeoutByRole() {
    const userRole = localStorage.getItem('userRole');
    if (userRole === 'admin') {
      this.currentSessionTimeout = this.ADMIN_SESSION_TIMEOUT;
      console.log('Admin session timeout: 40 minutes');
    } else {
      this.currentSessionTimeout = this.USER_SESSION_TIMEOUT;
      console.log('User session timeout: 10 minutes');
    }
  }

  // รีเซ็ต timeout timer
  resetTimeout() {
    // ยกเลิก timer เก่า
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
    if (this.warningId) {
      clearTimeout(this.warningId);
    }

    // ตั้ง timer ใหม่สำหรับการเตือน
    this.warningId = setTimeout(() => {
      this.showWarning();
    }, this.currentSessionTimeout - this.WARNING_TIME);

    // ตั้ง timer ใหม่สำหรับ auto logout
    this.timeoutId = setTimeout(() => {
      this.performLogout();
    }, this.currentSessionTimeout);
  }

  // แสดงคำเตือนก่อน timeout
  private showWarning() {
    const remainingTime = Math.floor(this.WARNING_TIME / 1000); // เหลือ 1 นาที (60 วินาที)
    this.warningSubject.next(remainingTime);
  }

  // ทำการ logout อัตโนมัติ
  private performLogout() {
    console.log('Session timeout - Auto logout');
    
    // ใช้ AuthService สำหรับ logout (ลบข้อมูล authentication)
    this.authService.logout();
    
    // แจ้ง components อื่นๆ ว่า timeout แล้ว
    this.timeoutSubject.next();
    
    // Redirect ไปหน้า login
    this.router.navigate(['/login']);
    
    // แสดงข้อความแจ้งเตือน
    alert('เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่');
  }

  // หยุด timeout (เมื่อ logout manual)
  stopTimeout() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    if (this.warningId) {
      clearTimeout(this.warningId);
      this.warningId = null;
    }
  }

  // ขยายเวลา session (เมื่อผู้ใช้ยืนยัน)
  extendSession() {
    this.resetTimeout();
    console.log('Session extended');
  }

  // ตรวจสอบว่ามี session หรือไม่
  hasValidSession(): boolean {
    const token = localStorage.getItem('token');
    return !!token;
  }

  // เริ่มต้นการตรวจจับ user activity
  initUserActivityDetection() {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    const resetOnActivity = () => {
      if (this.hasValidSession()) {
        this.resetTimeout();
        // แจ้ง components ว่ามี activity (เพื่อปิด warning dialog)
        this.warningSubject.next(-1); // ส่ง -1 เป็นสัญญาณปิด warning
      }
    };

    // ฟัง user activities
    events.forEach(event => {
      document.addEventListener(event, resetOnActivity, true);
    });
  }

  // แปลงเวลาเป็นนาที:วินาที
  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
}
