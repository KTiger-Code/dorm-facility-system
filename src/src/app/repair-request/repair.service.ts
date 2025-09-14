import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class RepairService {
  private api = '/api/repair'; // แก้ไขจาก repair-request เป็น repair

  constructor(private http: HttpClient) {}

  private authHeaders() {
    const token = localStorage.getItem('token')!;
    return { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) };
  }

  /** ดึงรายการแจ้งซ่อมของตัวเอง */
  getRepairs(): Observable<any[]> {
    return this.http.get<any[]>(this.api, this.authHeaders());
  }

  /** สร้างแจ้งซ่อมใหม่ */
  createRepair(data: { title: string; description: string }): Observable<any> {
    return this.http.post<any>(this.api, data, this.authHeaders());
  }
}
