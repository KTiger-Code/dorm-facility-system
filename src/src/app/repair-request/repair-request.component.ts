import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule }   from '@angular/forms';
import { RepairService } from './repair.service';

@Component({
  selector: 'app-repair-request',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './repair-request.component.html'
})
export class RepairRequestComponent implements OnInit {
  title       = '';
  description = '';
  repairs: any[] = [];

  constructor(private repairService: RepairService) {}

  ngOnInit() {
    this.loadRepairs();
  }

  loadRepairs() {
    this.repairService.getRepairs().subscribe({
      next: res => this.repairs = res,
      error: err => console.error('โหลดรายการแจ้งซ่อมล้มเหลว:', err)
    });
  }

  submitRepair() {
    if (!this.title.trim() || !this.description.trim()) {
      return alert('กรุณากรอกหัวข้อและรายละเอียดให้ครบ');
    }
    this.repairService.createRepair({
      title: this.title,
      description: this.description
    }).subscribe({
      next: newReq => {
        this.repairs.unshift(newReq);
        this.title = '';
        this.description = '';
      },
      error: err => console.error('แจ้งซ่อมไม่สำเร็จ:', err)
    });
  }
}
