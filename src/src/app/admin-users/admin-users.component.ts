import { Component, OnInit } from '@angular/core';
import { CommonModule }        from '@angular/common';
import { FormsModule }         from '@angular/forms';
import { HttpClient, HttpHeaders, HttpClientModule } from '@angular/common/http';

interface User {
  id?: number;
  username: string;
  password?: string;
  fullname: string;
  room_number: string;
  role: 'resident'|'admin';
}

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './admin-users.component.html',
  styleUrls: ['./admin-users.component.css']
})
export class AdminUsersComponent implements OnInit {
  users: User[] = [];
  searchKeyword = '';

  // สำหรับสร้างใหม่ / แก้ไข
  isEdit = false;
  formModel: User = {
    username: '',
    password: '',
    fullname: '',
    room_number: '',
    role: 'resident'
  };

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.fetchUsers();
  }

  private getHeaders() {
    const token = localStorage.getItem('token') || '';
    return { headers: new HttpHeaders({ Authorization: `Bearer ${token}` })};
  }

  fetchUsers() {
    this.http.get<User[]>('/api/users', this.getHeaders()).subscribe({
      next: users => this.users = users,
      error: err  => console.error('โหลดผู้ใช้ล้มเหลว:', err)
    });
  }

  // สลับโหมด create / edit
  startCreate() {
    this.isEdit = false;
    this.formModel = { username:'', password:'', fullname:'', room_number:'', role:'resident' };
  }
  startEdit(user: User) {
    this.isEdit = true;
    this.formModel = { 
      id: user.id,
      username: user.username,
      password: '',
      fullname: user.fullname,
      room_number: user.room_number,
      role: user.role
    };
  }

  submitForm() {
    if (this.isEdit) {
      // PUT /api/users/:id
      this.http.put(`/api/users/${this.formModel.id}`, this.formModel, this.getHeaders())
        .subscribe({ next: () => this.fetchUsers(), error: e=>console.error(e) });
    } else {
      // POST /api/users
      this.http.post(`/api/users`, this.formModel, this.getHeaders())
        .subscribe({ next: () => this.fetchUsers(), error: e=>console.error(e) });
    }
  }

  deleteUser(id: number) {
    if (!confirm('ยืนยันการลบผู้ใช้นี้?')) return;
    this.http.delete(`/api/users/${id}`, this.getHeaders())
      .subscribe({ next: ()=>this.fetchUsers(), error: e=>console.error(e) });
  }

  get filteredUsers() {
    const key = this.searchKeyword.toLowerCase();
    return this.users.filter(u =>
      u.fullname.toLowerCase().includes(key) ||
      u.room_number.toLowerCase().includes(key)
    );
  }
}
