import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ParcelService {
  private apiUrl = 'http://localhost:3000/api/parcels';

  constructor(private http: HttpClient) {}

  getParcels(): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.get(this.apiUrl, { headers });
  }

  addParcel(data: any): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post(this.apiUrl, data, { headers });
  }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }
}
