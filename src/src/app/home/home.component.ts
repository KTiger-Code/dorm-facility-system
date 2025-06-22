import { Component, OnInit } from '@angular/core';
import { CommonModule }      from '@angular/common';
import { RouterModule }      from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  isAdmin = false;

  ngOnInit() {
    // ตรวจ role จาก JWT ใน localStorage
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        this.isAdmin = payload.role === 'admin';
      } catch {
        this.isAdmin = false;
      }
    }
  }

  connectLine() {
    // สมมติว่าเราเรียก endpoint /api/line/login และแนบ token ไปใน query
    const token = localStorage.getItem('token');
    window.location.href = `/api/line/login?token=${token}`;
  }
}
