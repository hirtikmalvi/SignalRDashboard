import { AsyncPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { SignalRService } from './services/signal-r.service';
import { DashboardComponent } from './components/dashboard/dashboard.component';

@Component({
  selector: 'app-root',
  imports: [AsyncPipe, DashboardComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  constructor(public signalRService: SignalRService) {}
  title = 'Dashboard';
}
