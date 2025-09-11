import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  FormArray,
  Validators,
} from '@angular/forms';
import { MonthYear, MONTHS } from '../shared/month-year.model';
import {
  HttpClientModule,
  HttpClient,
  HttpHeaders,
} from '@angular/common/http';
import { InvoiceService } from '../invoice.service';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../shared/header/header.component';

@Component({
  selector: 'app-admin-invoice',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    HeaderComponent
  ],
  templateUrl: './admin-invoice.component.html',
  styleUrls: ['./admin-invoice.component.css']
})
export class AdminInvoiceComponent implements OnInit {
  form!: FormGroup;
  invoices: any[] = [];
  users: any[] = [];
  searchRoom = '';  // สำหรับกรองตาราง
  filterStatus = 'all'; // กรองสถานะการชำระเงิน
  selectedImage: string | null = null;

  months = MONTHS;
  years: number[] = [];

  // เก็บข้อมูลมิเตอร์ล่าสุดของแต่ละห้อง
  lastMeterReadings: { [room: string]: { water: number; electricity: number } } = {};

  constructor(
    private fb: FormBuilder,
    private svc: InvoiceService,
    private http: HttpClient
  ) {
    // สร้างรายการปีย้อนหลัง 5 ปี และล่วงหน้า 2 ปี
    const currentYear = new Date().getFullYear();
    for (let year = currentYear - 5; year <= currentYear + 2; year++) {
      this.years.push(year);
    }
  }

  ngOnInit() {
    this.form = this.fb.group({
      id:              [null],
      room_number:     ['', Validators.required],
      month:          ['', Validators.required],
      year:           ['', Validators.required],
      water_prev_meter:       [0],
      water_curr_meter:       [0],
      water_unit_price:       [0],
      water_fee:       [0, [Validators.min(0)]],
      electricity_prev_meter: [0],
      electricity_curr_meter: [0],
      electricity_unit_price: [0],
      electricity_fee: [0, [Validators.min(0)]],
      common_fee:      [0, [Validators.min(0)]],
      room_rent:       [0, [Validators.min(0)]],
      extra_charges:   this.fb.array([])
    });

    this.form.valueChanges.subscribe(() => this.calcFees());

    this.loadUsers();
    this.loadAll();
  }

  get extras(): FormArray {
    return this.form.get('extra_charges') as FormArray;
  }

  addExtra() {
    this.extras.push(this.fb.group({ label: [''], amount: [0] }));
  }

  removeExtra(i: number) {
    this.extras.removeAt(i);
  }

  loadUsers() {
    const token = localStorage.getItem('token')!;
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    this.http.get<any[]>('/api/users', { headers })
      .subscribe({
        next: data => this.users = data,
        error: err  => console.error('โหลดผู้ใช้ไม่สำเร็จ:', err)
      });
  }

  loadAll() {
    this.svc.getAllInvoices().subscribe({
      next: data => {
        this.invoices = data.map(inv => ({
          ...inv,
          extra_charges: Array.isArray(inv.extra_charges)
            ? inv.extra_charges
            : []
        }));
        // อัพเดตข้อมูลมิเตอร์ล่าสุดของแต่ละห้อง
        this.updateLastMeterReadings();
      },
      error: err => console.error('โหลด invoices ไม่สำเร็จ:', err)
    });
  }

  // ตรวจสอบว่าห้องที่กรอกมีในระบบ
  validateRoom() {
    const room = this.form.value.room_number;
    if (room && !this.users.find(u => u.room_number === room)) {
      alert('ไม่พบห้องในระบบ');
      this.form.patchValue({ room_number: '' });
    } else {
      // เมื่อเลือกห้องแล้ว ให้เซ็ตค่ามิเตอร์เดือนก่อน
      this.setPreviousMonthReadings(room);
    }
  }

  // อัพเดตข้อมูลมิเตอร์ล่าสุดของแต่ละห้อง
  private updateLastMeterReadings() {
    this.lastMeterReadings = {};
    
    // เรียงข้อมูลตามเดือน/ปี
    const sortedInvoices = [...this.invoices].sort((a, b) => {
      const [monthA, yearA] = (a.month_year || '').split('/');
      const [monthB, yearB] = (b.month_year || '').split('/');
      if (yearA !== yearB) return Number(yearA) - Number(yearB);
      return Number(monthA) - Number(monthB);
    });

    // เก็บค่ามิเตอร์ล่าสุดของแต่ละห้อง
    sortedInvoices.forEach(inv => {
      if (inv.room_number) {
        this.lastMeterReadings[inv.room_number] = {
          water: Number(inv.water_curr_meter) || 0,
          electricity: Number(inv.electricity_curr_meter) || 0
        };
      }
    });
  }

  // เซ็ตค่ามิเตอร์จากเดือนก่อน
  private setPreviousMonthReadings(room: string) {
    if (this.lastMeterReadings[room]) {
      this.form.patchValue({
        water_prev_meter: this.lastMeterReadings[room].water,
        electricity_prev_meter: this.lastMeterReadings[room].electricity
      });
    } else {
      // ถ้าไม่มีข้อมูลเดือนก่อน ให้เซ็ตเป็น 0
      this.form.patchValue({
        water_prev_meter: 0,
        electricity_prev_meter: 0
      });
    }
  }

  // คืนรายการหลังกรอง searchRoom
  filteredInvoices() {
    const q = this.searchRoom.trim().toLowerCase();
    return this.invoices.filter(inv => {
      const matchRoom = inv.room_number.toLowerCase().includes(q);
      const matchStatus = this.filterStatus === 'all' || inv.payment_status === this.filterStatus;
      return matchRoom && matchStatus;
    });
  }

  getPaidCount(): number {
    return this.invoices.filter(inv => inv.payment_status === 'paid').length;
  }

  getUnpaidCount(): number {
    return this.invoices.filter(inv => inv.payment_status === 'waiting_payment').length;
  }

  getReviewCount(): number {
    return this.invoices.filter(inv => inv.payment_status === 'waiting_review').length;
  }

  total(inv: any): number {
    const base = (+inv.water_fee || 0)
               + (+inv.electricity_fee || 0)
               + (+inv.common_fee || 0)
               + (+inv.room_rent || 0);
    const extra = (inv.extra_charges || [])
      .reduce((sum: number, x: any) => sum + (+x.amount || 0), 0);
    return base + extra;
  }

  calcFees() {
    const v = this.form.value;
    const waterUsed = (+v.water_curr_meter || 0) - (+v.water_prev_meter || 0);
    const waterFee = waterUsed * (+v.water_unit_price || 0);
    const elecUsed = (+v.electricity_curr_meter || 0) - (+v.electricity_prev_meter || 0);
    const elecFee = elecUsed * (+v.electricity_unit_price || 0);
    
    this.form.patchValue({
      water_fee: waterFee,
      electricity_fee: elecFee
    }, { emitEvent: false });
  }

  save() {
    if (this.form.invalid) {
      return alert('กรุณากรอกข้อมูลในฟอร์มให้ครบและถูกต้อง');
    }
    const v = this.form.value;
    // หา user_id ตาม room_number
    const user = this.users.find(u => u.room_number === v.room_number);
    if (!user) {
      return alert(`ไม่พบห้อง "${v.room_number}" ในระบบ`);
    }

    // สร้าง month_year ในรูปแบบ MM/YYYY
    const month_year = `${v.month}/${v.year}`;

    const payload = {
      user_id:         user.id,
      month_year:      month_year,
      water_prev_meter:       v.water_prev_meter,
      water_curr_meter:       v.water_curr_meter,
      water_unit_price:       v.water_unit_price,
      water_fee:       v.water_fee,
      electricity_prev_meter: v.electricity_prev_meter,
      electricity_curr_meter: v.electricity_curr_meter,
      electricity_unit_price: v.electricity_unit_price,
      electricity_fee: v.electricity_fee,
      common_fee:      v.common_fee,
      room_rent:       v.room_rent,
      extra_charges:   v.extra_charges
    };

    if (v.id) {
      this.svc.updateInvoice(v.id, payload)
        .subscribe(() => {
          this.loadAll();
          this.form.reset({
            id:null, room_number:'', month_year:'',
            water_prev_meter:0, water_curr_meter:0, water_unit_price:0, water_fee:0,
            electricity_prev_meter:0, electricity_curr_meter:0, electricity_unit_price:0, electricity_fee:0,
            common_fee:0, room_rent:0, extra_charges:[]
          });
          this.extras.clear();
        });
    } else {
      this.svc.createInvoice(payload)
        .subscribe(() => {
          this.loadAll();
          this.form.reset({
            id:null, room_number:'', month_year:'',
            water_prev_meter:0, water_curr_meter:0, water_unit_price:0, water_fee:0,
            electricity_prev_meter:0, electricity_curr_meter:0, electricity_unit_price:0, electricity_fee:0,
            common_fee:0, room_rent:0, extra_charges:[]
          });
          this.extras.clear();
        });
    }
  }

  edit(inv: any) {
    this.form.patchValue({
      id:              inv.id,
      room_number:     inv.room_number,
      month_year:      inv.month_year,
      water_prev_meter:       inv.water_prev_meter,
      water_curr_meter:       inv.water_curr_meter,
      water_unit_price:       inv.water_unit_price,
      water_fee:       inv.water_fee,
      electricity_prev_meter: inv.electricity_prev_meter,
      electricity_curr_meter: inv.electricity_curr_meter,
      electricity_unit_price: inv.electricity_unit_price,
      electricity_fee: inv.electricity_fee,
      common_fee:      inv.common_fee,
      room_rent:       inv.room_rent
    });
    this.extras.clear();
    (inv.extra_charges || []).forEach((x: any) =>
      this.extras.push(this.fb.group({ label: [x.label], amount: [x.amount] }))
    );
  }

  togglePaid(inv: any) {
    this.svc.toggleInvoicePaid(inv.id, !inv.paid)
      .subscribe(() => this.loadAll());
  }

  delete(id: number) {
    if (!confirm('ลบใบแจ้งหนี้นี้?')) return;
    this.svc.deleteInvoice(id).subscribe(() => this.loadAll());
  }

  handleImgError(event: Event) {
    (event.target as HTMLImageElement).src = 'building.svg';
  }

  openImage(src: string) {
    this.selectedImage = src;
  }
}
