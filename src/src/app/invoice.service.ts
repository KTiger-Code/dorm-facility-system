import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class InvoiceService {
  private api = '/api/invoice'; // แก้ไขจาก invoices เป็น invoice

  constructor(private http: HttpClient) {}

  private auth() {
    const token = localStorage.getItem('token')!;
    return { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) };
  }

  getMyInvoices(): Observable<any[]> {
    return this.http.get<any[]>(this.api, this.auth());
  }
  getAllInvoices(): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}/all`, this.auth());
  }
  createInvoice(data: any): Observable<any> {
    return this.http.post(this.api, data, this.auth());
  }
  updateInvoice(id: number, data: any): Observable<any> {
    return this.http.patch(`${this.api}/${id}`, data, this.auth());
  }
  toggleInvoicePaid(id: number, paid: boolean): Observable<any> {
    return this.http.patch(`${this.api}/${id}/paid`, { paid }, this.auth());
  }
  uploadProof(id: number, file: File): Observable<any> {
    const form = new FormData();
    form.append('file', file);
    const opts = { headers: this.auth().headers };
    return this.http.post(`${this.api}/${id}/proof`, form, opts);
  }
  deleteInvoice(id: number): Observable<any> {
    return this.http.delete(`${this.api}/${id}`, this.auth());
  }
}
