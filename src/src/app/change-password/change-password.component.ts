import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { HeaderComponent } from '../shared/header/header.component';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent],
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.css']
})
export class ChangePasswordComponent {
  currentPassword = '';
  newPassword = '';
  confirmPassword = '';
  
  loading = false;
  message = '';
  isSuccess = false;
  
  showCurrentPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;

  private apiUrl = 'http://localhost:3000/api';

  constructor(
    private router: Router,
    private http: HttpClient
  ) {}

  // สร้าง HTTP headers พร้อม JWT token
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // ตรวจสอบความถูกต้องของข้อมูล
  validateForm(): boolean {
    // ตรวจสอบว่ากรอกครบทุกช่อง
    if (!this.currentPassword || !this.newPassword || !this.confirmPassword) {
      this.setMessage('กรุณากรอกข้อมูลให้ครบถ้วน', false);
      return false;
    }

    // ตรวจสอบความยาวรหัสผ่านใหม่
    if (this.newPassword.length < 6) {
      this.setMessage('รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 6 ตัวอักษร', false);
      return false;
    }

    // ตรวจสอบรหัสผ่านใหม่ตรงกันหรือไม่
    if (this.newPassword !== this.confirmPassword) {
      this.setMessage('รหัสผ่านใหม่ไม่ตรงกัน', false);
      return false;
    }

    // ตรวจสอบรหัสผ่านใหม่ต้องไม่เหมือนรหัสเก่า
    if (this.currentPassword === this.newPassword) {
      this.setMessage('รหัสผ่านใหม่ต้องแตกต่างจากรหัสผ่านปัจจุบัน', false);
      return false;
    }

    return true;
  }

  // เปลี่ยนรหัสผ่าน
  onChangePassword() {
    if (!this.validateForm()) {
      return;
    }

    this.loading = true;
    this.message = '';

    const changePasswordData = {
      currentPassword: this.currentPassword,
      newPassword: this.newPassword,
      confirmPassword: this.confirmPassword
    };

    const headers = this.getHeaders();

    this.http.patch(`${this.apiUrl}/users/change-password`, changePasswordData, { headers })
      .subscribe({
        next: (response: any) => {
          this.loading = false;
          if (response.success) {
            this.setMessage('เปลี่ยนรหัสผ่านสำเร็จ! กำลังออกจากระบบ...', true);
            
            // รีเซ็ตฟอร์ม
            this.resetForm();
            
            // ออกจากระบบอัตโนมัติหลังจาก 2 วินาที
            setTimeout(() => {
              this.performLogout();
            }, 2000);
          } else {
            this.setMessage(response.message || 'เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน', false);
          }
        },
        error: (error) => {
          this.loading = false;
          console.error('Error changing password:', error);
          
          if (error.error && error.error.message) {
            this.setMessage(error.error.message, false);
          } else if (error.status === 401) {
            this.setMessage('กรุณาเข้าสู่ระบบใหม่', false);
            // ไปหน้า login
            setTimeout(() => {
              this.router.navigate(['/auth']);
            }, 1500);
          } else {
            this.setMessage('เกิดข้อผิดพลาดในระบบ กรุณาลองใหม่อีกครั้ง', false);
          }
        }
      });
  }

  // ตั้งข้อความแสดงผล
  setMessage(message: string, isSuccess: boolean) {
    this.message = message;
    this.isSuccess = isSuccess;
    
    // ลบข้อความหลังจาก 5 วินาที (ถ้าไม่ใช่ success)
    if (!isSuccess) {
      setTimeout(() => {
        this.message = '';
      }, 5000);
    }
  }

  // รีเซ็ตฟอร์ม
  resetForm() {
    this.currentPassword = '';
    this.newPassword = '';
    this.confirmPassword = '';
    this.showCurrentPassword = false;
    this.showNewPassword = false;
    this.showConfirmPassword = false;
  }

  // แสดง/ซ่อนรหัสผ่าน
  togglePasswordVisibility(field: string) {
    switch (field) {
      case 'current':
        this.showCurrentPassword = !this.showCurrentPassword;
        break;
      case 'new':
        this.showNewPassword = !this.showNewPassword;
        break;
      case 'confirm':
        this.showConfirmPassword = !this.showConfirmPassword;
        break;
    }
  }

  // กลับไปหน้าก่อนหน้า
  goBack() {
    window.history.back();
  }

  // ออกจากระบบ (สำหรับ header)
  onLogout() {
    this.performLogout();
  }

  // ออกจากระบบแบบละเอียด
  performLogout() {
    // ลบข้อมูลจาก localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // แสดงข้อความ
    console.log('🔐 User logged out after password change');
    
    // นำทางไปหน้า login
    this.router.navigate(['/auth']);
  }

  // สำหรับ header component
  onLineConnect() {
    // Implementation for LINE connection if needed
    console.log('LINE connection requested');
  }
}
