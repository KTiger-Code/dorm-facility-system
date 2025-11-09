import { Component, OnInit, HostListener } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SessionWarningComponent } from './shared/session-warning.component';
import { AuthService } from './auth/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SessionWarningComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected title = 'src';

  constructor(private authService: AuthService) {}

  ngOnInit() {
    // เช็คสถานะการ login เมื่อโหลดแอพ
    if (this.authService.isLoggedIn()) {
      const token = this.authService.getToken();
      if (token && !this.authService.isTokenValid(token)) {
        // ถ้า token หมดอายุ ให้ logout
        this.authService.logout();
        window.location.href = '/login';
      }
    }
  }

  // Event listener สำหรับการปิด browser/tab
  @HostListener('window:beforeunload', ['$event'])
  onBeforeUnload(event: BeforeUnloadEvent) {
    // เก็บสถานะการ login ก่อนปิด browser
    if (this.authService.isLoggedIn()) {
      localStorage.setItem('lastLoginState', 'true');
    }
  }

  // Event listener สำหรับการโหลดหน้าใหม่
  @HostListener('window:load', ['$event'])
  onLoad(event: Event) {
    // ตรวจสอบ token ทุกครั้งที่โหลดหน้า
    if (this.authService.isLoggedIn()) {
      const token = this.authService.getToken();
      if (token && !this.authService.isTokenValid(token)) {
        this.authService.logout();
        window.location.href = '/login';
      }
    }
  }
}
