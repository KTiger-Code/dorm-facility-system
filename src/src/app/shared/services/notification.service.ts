import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface INotification {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notifications = new BehaviorSubject<INotification[]>([]);

  show(message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') {
    const notification = { message, type };
    const current = this.notifications.value;
    this.notifications.next([...current, notification]);

    // Auto remove after 3 seconds
    setTimeout(() => {
      const current = this.notifications.value;
      const index = current.indexOf(notification);
      if (index > -1) {
        current.splice(index, 1);
        this.notifications.next([...current]);
      }
    }, 3000);
  }

  success(message: string) {
    this.show(message, 'success');
  }

  error(message: string) {
    this.show(message, 'error');
  }

  info(message: string) {
    this.show(message, 'info');
  }

  warning(message: string) {
    this.show(message, 'warning');
  }

  getNotifications() {
    return this.notifications.asObservable();
  }

  remove(index: number) {
    const current = this.notifications.value;
    current.splice(index, 1);
    this.notifications.next([...current]);
  }
}