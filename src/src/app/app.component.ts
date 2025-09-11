import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SessionWarningComponent } from './shared/session-warning.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SessionWarningComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.css'
})
export class App {
  protected title = 'src';
}
