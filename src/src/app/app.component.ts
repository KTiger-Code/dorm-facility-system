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
    // ตรวจสอบเมื่อเปิดแอปใหม่ว่ามีการปิด browser ผิดปกติหรือไม่
    this.checkBrowserClose();
  }

  // ฟังก์ชันสำหรับตรวจสอบการปิด browser
  private checkBrowserClose() {
    const wasClosedIncorrectly = sessionStorage.getItem('browserClosed');
    if (wasClosedIncorrectly === 'true') {
      // ถ้าปิด browser ผิดปกติ ให้ล้าง token
      this.authService.logout();
      sessionStorage.removeItem('browserClosed');
    }
    // ตั้งค่าว่าแอปกำลังทำงาน
    sessionStorage.setItem('browserClosed', 'false');
  }

  // Event listener สำหรับการปิด browser/tab
  @HostListener('window:beforeunload', ['$event'])
  onBeforeUnload(event: BeforeUnloadEvent) {
    // ตั้งค่าว่า browser ถูกปิด
    sessionStorage.setItem('browserClosed', 'true');
    
    // หากผู้ใช้ล็อกอินอยู่ ให้ล้าง token
    if (this.authService.isLoggedIn()) {
      this.authService.logout();
    }
  }

  // Event listener สำหรับการปิด tab (เพิ่มเติม)
  @HostListener('window:unload', ['$event'])
  onUnload(event: Event) {
    // ตั้งค่าว่า browser ถูกปิด
    sessionStorage.setItem('browserClosed', 'true');
    
    // ล้าง token
    if (this.authService.isLoggedIn()) {
      this.authService.logout();
    }
  }
}
