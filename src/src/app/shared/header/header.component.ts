import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  @Input() showHeaderActions: boolean = true;
  @Input() isAdmin: boolean = false;
  @Output() lineConnect = new EventEmitter<void>();

  connectLine() {
    this.lineConnect.emit();
  }
}
