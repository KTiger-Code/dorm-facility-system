import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { HeaderComponent } from '../shared/header/header.component';

@Component({
  selector: 'app-admin-announcement',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent],
  templateUrl: './admin-announcement.component.html',
  styleUrls: ['./admin-announcement.component.css']
})
export class AdminAnnouncementComponent {
  title = '';
  content = '';
  announcements: any[] = [];
  filteredAnnouncements: any[] = [];
  searchQuery: string = '';
  editingAnnouncement: any = null;

  constructor(private http: HttpClient) {
    this.loadAnnouncements();
  }

  getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      headers: new HttpHeaders({ Authorization: `Bearer ${token}` })
    };
  }

  loadAnnouncements() {
    this.http.get<any[]>('/api/announcements', this.getAuthHeaders()).subscribe({
      next: (data) => {
        this.announcements = data;
        this.filteredAnnouncements = data;
      },
      error: (err) => {
        console.error('โหลดประกาศล้มเหลว:', err);
      }
    });
  }

  postAnnouncement() {
    if (!this.title.trim() || !this.content.trim()) {
      alert('กรุณากรอกทั้งหัวข้อและเนื้อหาก่อนประกาศ');
      return;
    }

    const announcementData = {
      title: this.title,
      content: this.content
    };

    if (this.editingAnnouncement) {
      // Update existing announcement
      this.http.put(`/api/announcements/${this.editingAnnouncement.id}`, announcementData, this.getAuthHeaders()).subscribe({
        next: () => {
          alert('แก้ไขประกาศสำเร็จ');
          this.clearForm();
          this.loadAnnouncements();
        },
        error: (err) => {
          console.error('แก้ไขประกาศล้มเหลว:', err);
          alert('เกิดข้อผิดพลาดในการแก้ไขประกาศ');
        }
      });
    } else {
      // Create new announcement
      this.http.post('/api/announcements', announcementData, this.getAuthHeaders()).subscribe({
        next: () => {
          alert('ประกาศข่าวสารสำเร็จ');
          this.clearForm();
          this.loadAnnouncements();
        },
        error: (err) => {
          console.error('โพสต์ประกาศล้มเหลว:', err);
          alert('เกิดข้อผิดพลาดในการโพสต์ประกาศ');
        }
      });
    }
  }

  clearForm() {
    this.title = '';
    this.content = '';
    this.editingAnnouncement = null;
  }

  // Search and filter methods
  filterAnnouncements() {
    if (!this.searchQuery.trim()) {
      this.filteredAnnouncements = this.announcements;
      return;
    }

    this.filteredAnnouncements = this.announcements.filter(announcement =>
      announcement.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      announcement.content.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  // Statistics methods
  getTotalAnnouncements(): number {
    return this.announcements.length;
  }

  getRecentAnnouncements(): number {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    return this.announcements.filter(announcement => 
      new Date(announcement.created_at) >= sevenDaysAgo
    ).length;
  }

  // Date formatting
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('th-TH', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getCurrentDate(): string {
    return new Date().toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  // CRUD operations
  editAnnouncement(announcement: any) {
    this.editingAnnouncement = announcement;
    this.title = announcement.title;
    this.content = announcement.content;
    
    // Scroll to form
    document.querySelector('.form-wrapper')?.scrollIntoView({ behavior: 'smooth' });
  }

  deleteAnnouncement(announcementId: number) {
    if (confirm('คุณต้องการลบประกาศนี้หรือไม่?')) {
      this.http.delete(`/api/announcements/${announcementId}`, this.getAuthHeaders()).subscribe({
        next: () => {
          alert('ลบประกาศสำเร็จ');
          this.loadAnnouncements();
        },
        error: (err) => {
          console.error('ลบประกาศล้มเหลว:', err);
          alert('เกิดข้อผิดพลาดในการลบประกาศ');
        }
      });
    }
  }
}
