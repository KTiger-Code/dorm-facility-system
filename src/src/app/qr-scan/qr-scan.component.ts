import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-qr-scan',
  standalone: true,
  imports: [CommonModule, FormsModule, ZXingScannerModule, HttpClientModule],
  templateUrl: './qr-scan.component.html',
})
export class QrScanComponent {
  scannedResult = '';
  successMessage = '';
  errorMessage = '';

  constructor(private http: HttpClient) {}

  onCodeResult(result: string) {
    this.scannedResult = result;

    const headers = new HttpHeaders({
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    });

    // สมมุติว่า backend รองรับ POST /api/checkin
    this.http.post('http://localhost:3000/api/checkin', { qr: result }, { headers }).subscribe({
      next: () => this.successMessage = 'เช็คอินสำเร็จ',
      error: (err) => this.errorMessage = 'เช็คอินล้มเหลว: ' + err.message,
    });
  }
}
