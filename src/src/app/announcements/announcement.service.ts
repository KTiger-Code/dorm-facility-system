import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AnnouncementService {
  private apiUrl = 'http://localhost:3000/api/announcements';

  constructor(private http: HttpClient) {}

  getAnnouncements(): Observable<any> {
    return this.http.get(this.apiUrl);
  }
}
