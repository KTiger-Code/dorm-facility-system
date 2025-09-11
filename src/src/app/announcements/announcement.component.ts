import { Component, OnInit } from '@angular/core';
import { CommonModule }       from '@angular/common';
import { HttpClientModule }   from '@angular/common/http';
import { Router } from '@angular/router';
import { AnnouncementService } from './announcement.service';
import { HeaderComponent }    from '../shared/header/header.component';
import { SessionTimeoutService } from '../shared/session-timeout.service';

@Component({
  selector: 'app-announcement',
  standalone: true,
  imports: [CommonModule, HttpClientModule, HeaderComponent],
  templateUrl: './announcement.component.html',
  styleUrls: ['./announcement.component.css']
})
export class AnnouncementComponent implements OnInit {
  announcements: Array<{
    id: number;
    title: string;
    content: string;
    posted_at: string;
    posted_by_name: string;
  }> = [];

  isAdmin: boolean = false;

  constructor(
    private svc: AnnouncementService, 
    private router: Router,
    private sessionTimeout: SessionTimeoutService
  ) {}

  ngOnInit() {
    this.checkAdminStatus();
    this.svc.getAnnouncements().subscribe({
      next: data => this.announcements = data,
      error: err  => console.error('โหลดข่าวสารล้มเหลว:', err)
    });
  }

  checkAdminStatus() {
    // ตรวจสอบสถานะ admin จาก localStorage หรือ service
    const userRole = localStorage.getItem('userRole');
    this.isAdmin = userRole === 'admin';
  }

  onLineConnect() {
    // เชื่อมต่อ LINE Account
    window.open('https://line.me/R/ti/p/@your-line-bot', '_blank');
  }

  onLogout() {
    // หยุด session timeout
    this.sessionTimeout.stopTimeout();
    
    // ออกจากระบบ
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    this.router.navigate(['/login']);
  }
}
