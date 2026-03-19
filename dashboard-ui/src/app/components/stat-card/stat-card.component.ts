import { NgClass, NgIf } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-stat-card',
  imports: [NgClass, NgIf],
  templateUrl: './stat-card.component.html',
  styleUrl: './stat-card.component.scss',
})
export class StatCardComponent {
  @Input() label: string = '';
  @Input() value: string | number = '-';
  @Input() unit: string = '';
  @Input() theme: 'teal' | 'purple' | 'amber' | 'coral' = 'teal';

  // Optional: pass a function to decide the status color of the value
  // e.g. CPU > 80% should show red

  @Input() statusFn?: (
    value: string | number,
  ) => 'normal' | 'warn' | 'critical';

  get status(): 'normal' | 'warn' | 'critical' {
    return this.statusFn ? this.statusFn(this.value) : 'normal';
  }
}
