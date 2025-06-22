import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from './auth.service';
import { Router } from '@angular/router'; // ✅ เพิ่ม router

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent {
  username = '';
  password = '';
  message = '';

  constructor(
    private authService: AuthService,
    private router: Router // ✅ Inject Router
  ) {}

  login() {
    this.authService.login(this.username, this.password).subscribe({
      next: (res) => {
        localStorage.setItem('token', res.token);
        this.message = '✅ Login success!';
        this.router.navigate(['/home']); // ✅ Redirect ไปหน้า Home
      },
      error: (err) => {
        this.message = '❌ Login failed: ' + err.error.message;
      }
    });
  }
}
