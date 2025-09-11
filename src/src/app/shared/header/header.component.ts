import { Component, Input, Output, EventEmitter, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  @Input() showHeaderActions: boolean = true;
  @Input() isAdmin: boolean = false;
  @Output() lineConnect = new EventEmitter<void>();
  @Output() logout = new EventEmitter<void>();

  isMenuOpen: boolean = false;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.checkAdminStatus();
    // Re-check admin status periodically
    setInterval(() => this.checkAdminStatus(), 2000);
  }

  checkAdminStatus() {
    // ใช้ AuthService เป็นหลักและ localStorage เป็น fallback
    const isAdminFromService = this.authService.isAdmin();
    const localStorageRole = localStorage.getItem('userRole');
    
    this.isAdmin = isAdminFromService || localStorageRole === 'admin';
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    const hamburgerBtn = document.querySelector('.hamburger-btn');
    const dropdownMenu = document.querySelector('.dropdown-menu');
    
    if (!hamburgerBtn?.contains(target) && !dropdownMenu?.contains(target)) {
      this.isMenuOpen = false;
    }
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu() {
    this.isMenuOpen = false;
  }

  connectLine() {
    this.lineConnect.emit();
  }

  onConnectLine() {
    this.connectLine();
    this.closeMenu();
  }

  onLogout() {
    this.logout.emit();
    this.closeMenu();
  }
}
