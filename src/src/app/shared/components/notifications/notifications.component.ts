import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="notifications-container">
      <div *ngFor="let notification of notifications$ | async; let i = index" 
           class="notification" [ngClass]="notification.type">
        {{ notification.message }}
        <button class="notification-close" (click)="notificationService.remove(i)">×</button>
      </div>
    </div>
  `,
  styles: [`
    .notifications-container {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 1000;
      width: 300px;
    }

    .notification {
      padding: 15px;
      margin-bottom: 10px;
      border-radius: 4px;
      color: white;
      display: flex;
      justify-content: space-between;
      align-items: center;
      animation: slideIn 0.3s ease-out;
      box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    }

    .notification.success {
      background-color: #4caf50;
    }

    .notification.error {
      background-color: #f44336;
    }

    .notification.info {
      background-color: #2196F3;
    }

    .notification.warning {
      background-color: #ff9800;
    }

    .notification-close {
      background: none;
      border: none;
      color: white;
      cursor: pointer;
      font-size: 18px;
      padding: 0 5px;
      opacity: 0.8;
      transition: opacity 0.2s;
    }

    .notification-close:hover {
      opacity: 1;
    }

    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
  `]
})
export class NotificationsComponent {
  notifications$;
  
  constructor(public notificationService: NotificationService) {
    this.notifications$ = notificationService.getNotifications();
  }
}