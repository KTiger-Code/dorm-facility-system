import { Component, OnInit } from '@angular/core';
import { CommonModule }     from '@angular/common';
import { FormsModule }      from '@angular/forms';
import { HttpClientModule, HttpClient, HttpHeaders } from '@angular/common/http';
import { FacilityBookingService } from '../facility-booking/facility-booking.service';
import { HeaderComponent } from '../shared/header/header.component';

@Component({
  selector: 'app-admin-facility',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, HeaderComponent],
  templateUrl: './admin-facility.component.html',
  styleUrls: ['./admin-facility.component.css']
})
export class AdminFacilityComponent implements OnInit {
  bookings: any[] = [];
  users: any[] = [];
  filterRoom = '';
  editData: any = { id: null };

  constructor(
    private svc: FacilityBookingService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.loadBookings();
    this.loadUsers();
  }

  private authHeaders() {
    const t = localStorage.getItem('token')!;
    return { headers: new HttpHeaders({ Authorization: `Bearer ${t}` }) };
  }

  loadUsers() {
    this.http.get<any[]>('/api/users', this.authHeaders())
      .subscribe(u => this.users = u);
  }

  loadBookings() {
    this.svc.getAllBookings().subscribe(b => this.bookings = b);
  }

  get filtered() {
    const f = this.filterRoom.toLowerCase();
    return this.bookings.filter(b =>
      b.room_number.toLowerCase().includes(f)
    );
  }

  edit(b: any) {
    this.editData = { ...b };
  }

  save() {
    const d = this.editData;
    if (d.id) {
      this.svc.updateBooking(d.id, d).subscribe(() => this.loadBookings());
    }
  }

  delete(id: number) {
    if (!confirm('ลบการจองนี้?')) return;
    this.svc.deleteBooking(id).subscribe(() => this.loadBookings());
  }
}
