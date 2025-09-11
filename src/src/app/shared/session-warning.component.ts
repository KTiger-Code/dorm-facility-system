import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SessionTimeoutService } from './session-timeout.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-session-warning',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="warning-overlay" *ngIf="showWarning" (click)="onOverlayClick($event)">
      <div class="warning-dialog" (click)="$event.stopPropagation()">
        <div class="warning-header">
          <h3>⚠️ เซสชันใกล้หมดอายุ</h3>
        </div>
        <div class="warning-content">
          <p>เซสชันของคุณจะหมดอายุใน</p>
          <div class="countdown">{{ formatTime(remainingTime) }}</div>
          <p class="activity-hint">💡 ขยับเมาส์หรือกดแป้นพิมพ์เพื่อขยายเวลาอัตโนมัติ</p>
        </div>
        <div class="warning-actions">
          <button class="btn-logout" (click)="logoutNow()">
            ออกจากระบบทันที
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .warning-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      backdrop-filter: blur(4px);
    }

    .warning-dialog {
      background: white;
      border-radius: 12px;
      padding: 2rem;
      max-width: 400px;
      width: 90%;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      text-align: center;
      animation: slideIn 0.3s ease-out;
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(-50px) scale(0.9);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    .warning-header h3 {
      margin: 0 0 1rem 0;
      color: #f44336;
      font-size: 1.4rem;
    }

    .warning-content p {
      margin: 0.5rem 0;
      color: #555;
      font-size: 1rem;
    }

    .activity-hint {
      font-size: 0.9rem !important;
      color: #4CAF50 !important;
      font-weight: 500;
      margin-top: 1rem !important;
    }

    .countdown {
      font-size: 2.5rem;
      font-weight: bold;
      color: #f44336;
      margin: 1rem 0;
      font-family: 'Courier New', monospace;
    }

    .warning-actions {
      display: flex;
      gap: 1rem;
      margin-top: 1.5rem;
      justify-content: center;
    }

    .warning-actions button {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 6px;
      font-size: 1rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-logout {
      background: #f44336;
      color: white;
      width: 100%;
      padding: 0.8rem 1.5rem;
    }

    .btn-logout:hover {
      background: #da190b;
      transform: translateY(-1px);
    }
  `]
})
export class SessionWarningComponent implements OnInit, OnDestroy {
  showWarning = false;
  remainingTime = 0;
  private warningSubscription?: Subscription;
  private timeoutSubscription?: Subscription;
  private countdownInterval?: any;

  constructor(private sessionService: SessionTimeoutService) {}

  ngOnInit() {
    // ฟัง warning signal
    this.warningSubscription = this.sessionService.warningSubject.subscribe(
      (seconds) => {
        if (seconds === -1) {
          // สัญญาณปิด warning (เมื่อมี user activity)
          this.showWarning = false;
          this.stopCountdown();
        } else if (seconds > 0) {
          // แสดง warning ปกติ
          this.remainingTime = seconds;
          this.showWarning = true;
          this.startCountdown();
        }
      }
    );

    // ฟัง timeout signal
    this.timeoutSubscription = this.sessionService.timeoutSubject.subscribe(
      () => {
        this.showWarning = false;
        this.stopCountdown();
      }
    );
  }

  ngOnDestroy() {
    this.warningSubscription?.unsubscribe();
    this.timeoutSubscription?.unsubscribe();
    this.stopCountdown();
  }

  startCountdown() {
    this.stopCountdown();
    this.countdownInterval = setInterval(() => {
      this.remainingTime--;
      if (this.remainingTime <= 0) {
        this.showWarning = false;
        this.stopCountdown();
      }
    }, 1000);
  }

  stopCountdown() {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = null;
    }
  }

  logoutNow() {
    this.sessionService.stopTimeout();
    
    // ลบข้อมูล authentication
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    
    // Redirect ไปหน้า login
    window.location.href = '/login';
  }

  onOverlayClick(event: Event) {
    // ปิด dialog เมื่อคลิกพื้นหลัง - ไม่ต้องทำอะไรแล้ว 
    // เพราะจะปิดอัตโนมัติเมื่อมี mouse activity
  }

  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
}
