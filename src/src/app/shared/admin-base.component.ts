import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { SessionTimeoutService } from './session-timeout.service';

@Component({
  template: ''
})
export abstract class AdminBaseComponent {
  isAdmin = true; // Admin pages จะเป็น true เสมอ

  constructor(
    protected router: Router,
    protected sessionTimeoutService: SessionTimeoutService
  ) {}

  onLineConnect() {
    // เปิดหน้า LINE Login ในแท็บใหม่
    window.open('https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id=2007589399&redirect_uri=https://b80225d623b9.ngrok-free.app/api/line/callback&state=admin&scope=profile', '_blank');
  }

  onLogout() {
    // ลบ session และ navigate ไป login
    localStorage.removeItem('token');
    localStorage.removeItem('rememberMe');
    localStorage.removeItem('savedUsername');
    this.router.navigate(['/auth']);
  }
}
