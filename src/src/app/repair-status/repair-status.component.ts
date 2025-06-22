import { Component, OnInit } from '@angular/core';
import { CommonModule }      from '@angular/common';
import { RepairService }     from '../repair-request/repair.service';
import { HttpClientModule }  from '@angular/common/http';

@Component({
  selector: 'app-repair-status',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './repair-status.component.html'
})
export class RepairStatusComponent implements OnInit {
  repairs: any[] = [];

  constructor(private repairService: RepairService) {}

  ngOnInit() {
    this.repairService.getRepairs().subscribe({
      next: res => this.repairs = res,
      error: err => console.error('โหลดสถานะการแจ้งซ่อมล้มเหลว:', err)
    });
  }
}
