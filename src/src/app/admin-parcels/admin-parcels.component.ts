import { Component, OnInit }  from '@angular/core';
import { CommonModule }       from '@angular/common';
import { FormsModule }        from '@angular/forms';
import { HttpClient }         from '@angular/common/http';
import { HeaderComponent }    from '../shared/header/header.component';
import { AdminBaseComponent } from '../shared/admin-base.component';
import { Router } from '@angular/router';
import { SessionTimeoutService } from '../shared/session-timeout.service';

@Component({
  selector: 'app-admin-parcels',
  standalone: true,
  imports: [ CommonModule, FormsModule, HeaderComponent ],
  templateUrl: './admin-parcels.component.html',
  styleUrls: ['./admin-parcels.component.css']
})
export class AdminParcelsComponent extends AdminBaseComponent implements OnInit {
  allParcels: any[]      = [];
  filteredParcels: any[] = [];
  searchRoom: string     = '';
  statusFilter: string   = 'all';
  newParcel = { room_number: '', description: '' };
  users: any[]          = [];

  constructor(private http: HttpClient, router: Router, sessionTimeoutService: SessionTimeoutService) {
    super(router, sessionTimeoutService);
  }

  ngOnInit() {
    this.loadUsers();
    this.fetchAllParcels();
  }

  private getAuth() {
    const token = localStorage.getItem('token')!;
    return { headers: { Authorization: `Bearer ${token}` } };
  }

  fetchAllParcels() {
    this.http.get<any[]>('/api/parcels/all', this.getAuth())
      .subscribe(data => {
        this.allParcels = data;
        this.applyFilter();
      });
  }

  loadUsers() {
    this.http.get<any[]>('/api/users', this.getAuth())
      .subscribe({
        next: data => this.users = data,
        error: err  => console.error('โหลดผู้ใช้ไม่สำเร็จ:', err)
      });
  }

  applyFilter() {
    const kw = this.searchRoom.trim().toLowerCase();
    this.filteredParcels = this.allParcels.filter(p => {
      const roomMatch = p.room_number.toLowerCase().includes(kw);
      let statusMatch = true;
      if (this.statusFilter === 'received') {
        statusMatch = p.picked_up;
      } else if (this.statusFilter === 'notReceived') {
        statusMatch = !p.picked_up;
      }
      return roomMatch && statusMatch;
    });
  }

  getReceivedCount(): number {
    return this.allParcels.filter(p => p.picked_up).length;
  }

  getNotReceivedCount(): number {
    return this.allParcels.filter(p => !p.picked_up).length;
  }

  deleteParcel(id: number) {
    if (!confirm('ลบรายการนี้?')) return;
    this.http.delete(`/api/parcels/${id}`, this.getAuth())
      .subscribe(() => this.fetchAllParcels());
  }

  togglePickedUp(parcel: any) {
    const next = !parcel.picked_up;
    this.http.patch(`/api/parcels/${parcel.id}`, { picked_up: next }, this.getAuth())
      .subscribe(() => this.fetchAllParcels());
  }

  validateRoom() {
    const room = this.newParcel.room_number;
    if (room && !this.users.find(u => u.room_number === room)) {
      alert('ไม่พบห้องในระบบ');
      this.newParcel.room_number = '';
    }
  }

  addParcel() {
    if (!this.users.find(u => u.room_number === this.newParcel.room_number)) {
      return alert('ไม่พบห้องในระบบ');
    }
    this.http.post('/api/parcels', this.newParcel, this.getAuth())
      .subscribe({
        next: () => {
          this.newParcel = { room_number: '', description: '' };
          this.fetchAllParcels();
        }
      });
  }
}
