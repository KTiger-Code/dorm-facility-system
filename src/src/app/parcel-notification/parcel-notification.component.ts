import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { ParcelService } from './parcel.service';
import { HeaderComponent } from '../shared/header/header.component';

@Component({
  selector: 'app-parcel-notification',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, HeaderComponent],
  templateUrl: './parcel-notification.component.html',
  styleUrls: ['./parcel-notification.component.css']
})
export class ParcelNotificationComponent implements OnInit {
  parcels: any[] = [];
  filteredParcels: any[] = [];
  searchQuery: string = '';
  isAdmin: boolean = false;

  constructor(private parcelService: ParcelService, private router: Router) {}

  ngOnInit() {
    this.checkAdminStatus();
    this.loadParcels();
  }

  checkAdminStatus() {
    const userRole = localStorage.getItem('userRole');
    this.isAdmin = userRole === 'admin';
  }

  loadParcels() {
    this.parcelService.getParcels().subscribe({
      next: (res) => {
        this.parcels = res;
        this.filteredParcels = res;
      },
      error: (err) => console.error('โหลดพัสดุล้มเหลว:', err)
    });
  }

  // Search and filter methods
  filterParcels() {
    if (!this.searchQuery.trim()) {
      this.filteredParcels = this.parcels;
      return;
    }

    this.filteredParcels = this.parcels.filter(parcel =>
      parcel.description.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      (parcel.sender && parcel.sender.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
      (parcel.tracking_number && parcel.tracking_number.toLowerCase().includes(this.searchQuery.toLowerCase()))
    );
  }

  // Statistics methods
  getTotalParcels(): number {
    return this.parcels.length;
  }

  getNewParcels(): number {
    const now = new Date();
    const dayAgo = new Date(now.getTime() - (24 * 60 * 60 * 1000));
    return this.parcels.filter(parcel => 
      new Date(parcel.received_at) >= dayAgo && !parcel.picked_up
    ).length;
  }

  getPickedUpParcels(): number {
    return this.parcels.filter(parcel => parcel.picked_up).length;
  }

  // Date formatting methods
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('th-TH', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  }

  formatTime(dateString: string): string {
    return new Date(dateString).toLocaleTimeString('th-TH', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Status methods
  getParcelStatus(parcel: any): string {
    if (parcel.picked_up) {
      return 'รับแล้ว';
    }
    
    const now = new Date();
    const receivedDate = new Date(parcel.received_at);
    const daysDiff = Math.floor((now.getTime() - receivedDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === 0) {
      return 'ใหม่';
    } else if (daysDiff <= 3) {
      return 'รอรับ';
    } else {
      return 'ค้างรับ';
    }
  }

  getStatusBadgeClass(parcel: any): string {
    const status = this.getParcelStatus(parcel);
    switch (status) {
      case 'รับแล้ว': return 'status-picked-up';
      case 'ใหม่': return 'status-new';
      case 'รอรับ': return 'status-waiting';
      case 'ค้างรับ': return 'status-overdue';
      default: return 'status-waiting';
    }
  }

  getParcelStatusClass(parcel: any): string {
    const status = this.getParcelStatus(parcel);
    switch (status) {
      case 'รับแล้ว': return 'parcel-picked-up';
      case 'ใหม่': return 'parcel-new';
      case 'ค้างรับ': return 'parcel-overdue';
      default: return 'parcel-waiting';
    }
  }

  // Action methods
  markAsPickedUp(parcelId: number): void {
    if (confirm('คุณต้องการทำเครื่องหมายว่ารับพัสดุแล้วหรือไม่?')) {
      // Update local data (since we don't have markAsPickedUp in service)
      const parcel = this.parcels.find(p => p.id === parcelId);
      if (parcel) {
        parcel.picked_up = true;
        parcel.picked_up_at = new Date().toISOString();
        this.filterParcels(); // Refresh filtered list
        alert('ทำเครื่องหมายรับพัสดุเรียบร้อยแล้ว');
      }
      
      // TODO: Implement markAsPickedUp in ParcelService
      // this.parcelService.markAsPickedUp(parcelId).subscribe({
      //   next: () => {
      //     this.loadParcels();
      //     alert('ทำเครื่องหมายรับพัสดุเรียบร้อยแล้ว');
      //   },
      //   error: (err: any) => {
      //     console.error(err);
      //     alert('เกิดข้อผิดพลาดในการอัปเดตสถานะ');
      //   }
      // });
    }
  }

  onLineConnect() {
    // เชื่อมต่อ LINE Account
    window.open('https://line.me/R/ti/p/@your-line-bot', '_blank');
  }

  onLogout() {
    // ออกจากระบบ
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    this.router.navigate(['/login']);
  }

}
