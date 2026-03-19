import { AsyncPipe, DatePipe, NgClass, NgIf } from '@angular/common';
import { Component, inject } from '@angular/core';
import { StatCardComponent } from '../stat-card/stat-card.component';
import { SignalRService } from '../../services/signal-r.service';
import { DashboardMetrics } from '../../models/dashboard.models';

@Component({
  selector: 'app-dashboard',
  imports: [AsyncPipe, NgClass, DatePipe, StatCardComponent, NgIf],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  signalR = inject(SignalRService);

  metrics$ = this.signalR.metrics$;
  connectionState$ = this.signalR.connectionState$;

  // Status functions — tell each card when to change color
  cpuStatus = (val: string | number): 'normal' | 'warn' | 'critical' => {
    const n = Number(val);
    if (n > 85) return 'critical';
    if (n > 65) return 'warn';
    return 'normal';
  };

  errorStatus = (val: string | number): 'normal' | 'warn' | 'critical' => {
    const n = Number(val);
    if (n > 2) return 'critical';
    if (n > 1) return 'warn';
    return 'normal';
  };

  // Format helpers
  formatCpu(m: DashboardMetrics): string {
    return m.cpuUsage.toFixed(1);
  }

  formatError(m: DashboardMetrics): string {
    return m.errorRate.toFixed(2);
  }
}
