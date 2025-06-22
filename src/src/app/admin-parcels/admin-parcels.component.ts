import { Component, OnInit }  from '@angular/core';
import { CommonModule }       from '@angular/common';
import { FormsModule }        from '@angular/forms';
import { HttpClient }         from '@angular/common/http';

@Component({
  selector: 'app-admin-parcels',
  standalone: true,
  imports: [ CommonModule, FormsModule ],
  templateUrl: './admin-parcels.component.html',
  styleUrls: ['./admin-parcels.component.css']
})
export class AdminParcelsComponent implements OnInit {
  allParcels: any[]      = [];
  filteredParcels: any[] = [];
  searchRoom: string     = '';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.fetchAllParcels();
  }

  private getAuth() {
    const token = localStorage.getItem('token')!;
    return { headers: { Authorization: `Bearer ${token}` } };
  }

  fetchAllParcels() {
    this.http.get<any[]>('/api/parcels/all', this.getAuth())
      .subscribe(data => {
        this.allParcels = data;
        this.applyFilter();
      });
  }

  applyFilter() {
    const kw = this.searchRoom.trim().toLowerCase();
    this.filteredParcels = this.allParcels.filter(p =>
      p.room_number.toLowerCase().includes(kw)
    );
  }

  deleteParcel(id: number) {
    if (!confirm('ลบรายการนี้?')) return;
    this.http.delete(`/api/parcels/${id}`, this.getAuth())
      .subscribe(() => this.fetchAllParcels());
  }

  togglePickedUp(parcel: any) {
    const next = !parcel.picked_up;
    this.http.patch(`/api/parcels/${parcel.id}`, { picked_up: next }, this.getAuth())
      .subscribe(() => this.fetchAllParcels());
  }
}
