import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { ParcelService } from './parcel.service';

@Component({
  selector: 'app-parcel-notification',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule],
  templateUrl: './parcel-notification.component.html'
})
export class ParcelNotificationComponent {
  parcels: any[] = [];

  newParcel = {
    room_number: '',
    description: ''
  };

  constructor(private parcelService: ParcelService) {}

  ngOnInit() {
    this.loadParcels();
  }

  loadParcels() {
    this.parcelService.getParcels().subscribe({
      next: (res) => (this.parcels = res),
      error: (err) => console.error('โหลดพัสดุล้มเหลว:', err)
    });
  }

  addParcel() {
    this.parcelService.addParcel(this.newParcel).subscribe({
      next: () => {
        this.loadParcels();
        this.newParcel = { room_number: '', description: '' };
      },
      error: (err) => console.error('เพิ่มพัสดุไม่สำเร็จ:', err)
    });
  }
}
