import { Component, OnInit } from '@angular/core';
import { CommonModule }       from '@angular/common';
import { HttpClientModule }   from '@angular/common/http';
import { AnnouncementService } from './announcement.service';

@Component({
  selector: 'app-announcement',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
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

  constructor(private svc: AnnouncementService) {}

  ngOnInit() {
    this.svc.getAnnouncements().subscribe({
      next: data => this.announcements = data,
      error: err  => console.error('โหลดข่าวสารล้มเหลว:', err)
    });
  }
}
