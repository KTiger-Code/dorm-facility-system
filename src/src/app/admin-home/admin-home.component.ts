import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { HeaderComponent } from '../shared/header/header.component';
import { AdminBaseComponent } from '../shared/admin-base.component';
import { SessionTimeoutService } from '../shared/session-timeout.service';

@Component({
  selector: 'app-admin-home',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent],
  templateUrl: './admin-home.component.html',
  styleUrls: ['./admin-home.component.css']
})
export class AdminHomeComponent extends AdminBaseComponent {
  constructor(router: Router, sessionTimeoutService: SessionTimeoutService) {
    super(router, sessionTimeoutService);
  }
}
