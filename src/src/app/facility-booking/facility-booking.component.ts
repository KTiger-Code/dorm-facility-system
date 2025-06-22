import { Component, OnInit } from '@angular/core';
import { CommonModule }     from '@angular/common';
import { FormsModule }      from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { FacilityBookingService } from './facility-booking.service';

@Component({
  selector: 'app-facility-booking',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './facility-booking.component.html'
})
export class FacilityBookingComponent implements OnInit {
  bookings: any[] = [];
  newBooking = {
    facility_name: '',
    booking_date: '',
    time_slot_start: '',
    time_slot_end: '',
    number_of_people: 1
  };

  constructor(private svc: FacilityBookingService) {}

  ngOnInit() {
    this.getBookings();
  }

  getBookings() {
    this.svc.getBookings().subscribe({
      next: res => this.bookings = res,
      error: err => console.error(err)
    });
  }

  bookFacility() {
    this.svc.createBooking(this.newBooking).subscribe({
      next: () => {
        this.getBookings();
        this.newBooking = {
          facility_name: '',
          booking_date: '',
          time_slot_start: '',
          time_slot_end: '',
          number_of_people: 1
        };
      },
      error: err => console.error(err)
    });
  }

  formatDate(date: string) {
    return new Date(date).toLocaleDateString('th-TH', {
      day: '2-digit', month: 'long', year: 'numeric'
    });
  }
}
