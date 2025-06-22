import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-admin-announcement',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-announcement.component.html',
  styleUrls: ['./admin-announcement.component.css']
})
export class AdminAnnouncementComponent {
  title = '';
  content = '';

  constructor(private http: HttpClient) {}

  getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      headers: new HttpHeaders({ Authorization: `Bearer ${token}` })
    };
  }

  postAnnouncement() {
    if (!this.title.trim() || !this.content.trim()) {
      alert('กรุณากรอกทั้งหัวข้อและเนื้อหาก่อนประกาศ');
      return;
    }

    this.http.post('/api/announcements', {
      title: this.title,
      content: this.content
    }, this.getAuthHeaders()).subscribe({
      next: () => {
        alert('ประกาศข่าวสารสำเร็จ');
        this.title = '';
        this.content = '';
      },
      error: (err) => {
        console.error('โพสต์ประกาศล้มเหลว:', err);
        alert('เกิดข้อผิดพลาดในการโพสต์ประกาศ');
      }
    });
  }
}
