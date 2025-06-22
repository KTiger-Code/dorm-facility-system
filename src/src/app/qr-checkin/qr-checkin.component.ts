import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { QRCodeComponent } from 'angularx-qrcode';

@Component({
  selector: 'app-qr-checkin',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, QRCodeComponent],
  templateUrl: './qr-checkin.component.html'
})
export class QrCheckinComponent {
  roomNumber: string = '';
  qrData: string = '';
  successMessage: string = '';

  constructor(private http: HttpClient) {}

  generateQR() {
    const now = new Date().toLocaleString('th-TH');
    this.qrData = `ห้อง ${this.roomNumber} เช็คอินเวลา ${now}`;
    this.submitCheckin();
  }

  submitCheckin() {
    const now = new Date();

    // ✅ แปลงเป็น "YYYY-MM-DD HH:mm:ss"
    const formattedDateTime = now.toISOString().slice(0, 19).replace('T', ' ');

    const payload = {
      room_number: this.roomNumber,
      checkin_time: formattedDateTime
    };

    const token = localStorage.getItem('token');
    const headers = {
      Authorization: `Bearer ${token}`
    };

    this.http.post('http://localhost:3000/api/qr-checkin', payload, { headers }).subscribe({
      next: () => {
        this.successMessage = '✅ เช็คอินสำเร็จ';
      },
      error: (err: any) => {
        console.error('เช็คอินล้มเหลว:', err);
        this.successMessage = '❌ เช็คอินล้มเหลว';
      }
    });
  }
}
