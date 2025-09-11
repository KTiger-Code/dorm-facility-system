import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';
import { SessionTimeoutService } from '../shared/session-timeout.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent implements OnInit {
  username = '';
  password = '';
  message = '';
  rememberMe = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private sessionTimeout: SessionTimeoutService
  ) {}

  ngOnInit() {
    // ตรวจสอบว่ามี saved credentials หรือไม่
    this.loadRememberedCredentials();
    
    // ตรวจสอบว่ายัง login อยู่หรือไม่
    this.checkExistingLogin();
  }

  loadRememberedCredentials() {
    const savedUsername = localStorage.getItem('rememberedUsername');
    const savedPassword = localStorage.getItem('rememberedPassword');
    
    if (savedUsername && savedPassword) {
      this.username = savedUsername;
      // สำหรับความปลอดภัย อาจจะไม่ควรแสดง password ที่เก็บไว้
      // this.password = savedPassword;
      this.rememberMe = true;
      this.message = 'ข้อมูล username ถูกโหลดจากการบันทึก';
    }
  }

  checkExistingLogin() {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');
    
    if (token && userRole) {
      // ยังมี session อยู่ redirect ไปหน้า home และเริ่ม session timeout
      this.sessionTimeout.startTimeout();
      this.sessionTimeout.initUserActivityDetection();
      this.router.navigate(['/home']);
    }
  }

  login() {
    this.authService.login(this.username, this.password).subscribe({
      next: (res) => {
        // เก็บ token และ role
        localStorage.setItem('token', res.token);
        localStorage.setItem('userRole', res.role);
        
        // ถ้าเลือก Remember Me ให้เก็บ username และ password
        if (this.rememberMe) {
          localStorage.setItem('rememberedUsername', this.username);
          localStorage.setItem('rememberedPassword', this.password);
        } else {
          // ถ้าไม่เลือก Remember Me ให้ลบข้อมูลที่เก็บไว้
          localStorage.removeItem('rememberedUsername');
          localStorage.removeItem('rememberedPassword');
        }
        
        this.message = '✅ Login success!';
        
        // เริ่ม session timeout และตรวจจับ user activity
        this.sessionTimeout.startTimeout();
        this.sessionTimeout.initUserActivityDetection();
        
        this.router.navigate(['/home']);
      },
      error: (err) => {
        this.message = '❌ Login failed: ' + err.error.message;
      }
    });
  }
}
