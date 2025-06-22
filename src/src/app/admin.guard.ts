// src/app/admin.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AdminGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean {
    const token = localStorage.getItem('token');
    if (!token) {
      this.router.navigate(['/login']);
      return false;
    }
    try {
      // decode payload แบบง่าย
      const payload = JSON.parse(
        atob(token.split('.')[1])
      );
      if (payload.role === 'admin') {
        return true;
      }
    } catch {}
    this.router.navigate(['/home']);
    return false;
  }
}
