import { Component, OnInit } from '@angular/core';
import { CommonModule }      from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { HeaderComponent }   from '../shared/header/header.component';
import { SessionTimeoutService } from '../shared/session-timeout.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  isAdmin = false;

  constructor(
    private router: Router,
    private sessionTimeout: SessionTimeoutService
  ) {}

  ngOnInit() {
    // ตรวจสอบว่ามี token หรือไม่ ถ้าไม่มีให้ redirect ไป login
    const token = localStorage.getItem('token');
    if (!token) {
      this.router.navigate(['/login']);
      return;
    }

    // ตรวจ role จาก JWT ใน localStorage
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      this.isAdmin = payload.role === 'admin';
    } catch {
      this.isAdmin = false;
      // หาก token ไม่ valid ให้ redirect ไป login
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      this.router.navigate(['/login']);
    }
  }

  connectLine() {
    // สมมติว่าเราเรียก endpoint /api/line/login และแนบ token ไปใน query
    const token = localStorage.getItem('token');
    window.location.href = `/api/line/login?token=${token}`;
  }

  onLogout() {
    // หยุด session timeout
    this.sessionTimeout.stopTimeout();
    
    // ลบข้อมูล authentication
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    
    // ลบข้อมูล Remember Me (optional - หากต้องการให้ logout แล้วลืม)
    // localStorage.removeItem('rememberedUsername');
    // localStorage.removeItem('rememberedPassword');
    
    // Redirect ไปหน้า login
    this.router.navigate(['/login']);
  }
}
