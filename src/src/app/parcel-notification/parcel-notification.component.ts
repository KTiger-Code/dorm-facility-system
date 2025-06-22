import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ParcelService } from './parcel.service';

@Component({
  selector: 'app-parcel-notification',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './parcel-notification.component.html'
})
export class ParcelNotificationComponent {
  parcels: any[] = [];

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

}
