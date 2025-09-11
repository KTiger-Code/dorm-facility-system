import { Component, OnInit } from '@angular/core';
import { CommonModule }      from '@angular/common';
import { FormsModule }       from '@angular/forms';
import { HttpClientModule, HttpClient, HttpHeaders } from '@angular/common/http';
import { HeaderComponent }   from '../shared/header/header.component';

@Component({
  selector: 'app-admin-repair',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    HeaderComponent
  ],
  templateUrl: './admin-repair.component.html',
  styleUrls: ['./admin-repair.component.css']
})
export class AdminRepairComponent implements OnInit {
  repairs: {
    id: number;
    room_number: string;
    title: string;
    description: string;
    status: 'pending' | 'in_progress' | 'completed';
    created_at: string;
    updated_at: string | null;
  }[] = [];
  filterStatus: 'all' | 'pending' | 'in_progress' | 'completed' = 'all';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadAll();
  }

  private authHeaders() {
    const token = localStorage.getItem('token')!;
    return {
      headers: new HttpHeaders({ Authorization: `Bearer ${token}` })
    };
  }

  loadAll() {
    this.http
      .get<any[]>('/api/repair-request/all', this.authHeaders())
      .subscribe({
        next: data => {
          // สมมติ backend ส่งมาพร้อม room_number, title, description, status, timestamps
          this.repairs = data;
        },
        error: err => console.error('โหลดคำขอซ่อม (Admin) ไม่สำเร็จ:', err)
      });
  }

  filteredRepairs() {
    return this.repairs.filter(r =>
      this.filterStatus === 'all' || r.status === this.filterStatus
    );
  }

  getPendingCount(): number {
    return this.repairs.filter(r => r.status === 'pending').length;
  }

  getInProgressCount(): number {
    return this.repairs.filter(r => r.status === 'in_progress').length;
  }

  getCompletedCount(): number {
    return this.repairs.filter(r => r.status === 'completed').length;
  }

  deleteRepair(id: number) {
    if (!confirm('ลบคำขอนี้?')) return;
    this.http.delete(`/api/repair-request/${id}`, this.authHeaders())
      .subscribe(() => this.loadAll());
  }

  updateStatus(req: any, newStatus: 'pending' | 'in_progress' | 'completed') {
    this.http
      .patch(
        `/api/repair-request/${req.id}/status`,
        { status: newStatus },
        this.authHeaders()
      )
      .subscribe({
        next: () => {
          // อัปเดตในตารางบนหน้าเลย
          req.status = newStatus;
        },
        error: err => console.error('อัปเดตสถานะไม่สำเร็จ:', err)
      });
  }
}
