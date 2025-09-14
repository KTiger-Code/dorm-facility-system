import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:3000/api/auth/login';

  constructor(private http: HttpClient) {}

  login(username: string, password: string): Observable<any> {
    return this.http.post(this.apiUrl, { username, password });
  }

  /** อ่าน token จาก localStorage */
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  /** แปลง payload แล้วคืนค่า role */
  getUserRole(): string | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.role;
    } catch {
      return null;
    }
  }

  /** ตรวจสอบว่าบุคคลนั้นเป็น admin หรือไม่ */
  isAdmin(): boolean {
    return this.getUserRole() === 'admin';
  }

  /** ล้าง token และข้อมูล session */
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('sessionTimeout');
  }

  /** ตรวจสอบว่าผู้ใช้ล็อกอินอยู่หรือไม่ */
  isLoggedIn(): boolean {
    return this.getToken() !== null;
  }
}
