import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class FacilityBookingService {
  private api = '/api/facility'; // แก้ไขจาก facility-booking เป็น facility

  constructor(private http: HttpClient) {}

  private auth() {
    const token = localStorage.getItem('token')!;
    return { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) };
  }

  // Resident
  getBookings(): Observable<any[]> {
    return this.http.get<any[]>(this.api, this.auth());
  }
  createBooking(data: any): Observable<any> {
    return this.http.post<any>(this.api, data, this.auth());
  }

  // Admin
  getAllBookings(): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}/all`, this.auth());
  }
  updateBooking(id: number, data: any): Observable<any> {
    return this.http.patch<any>(`${this.api}/${id}`, data, this.auth());
  }
  updateBookingStatus(id: number, status: string): Observable<any> {
    return this.http.patch<any>(`${this.api}/${id}/status`, { status }, this.auth());
  }
  deleteBooking(id: number): Observable<any> {
    return this.http.delete<any>(`${this.api}/${id}`, this.auth());
  }
}
