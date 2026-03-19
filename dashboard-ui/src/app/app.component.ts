import { AsyncPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { SignalRService } from './services/signal-r.service';

@Component({
  selector: 'app-root',
  imports: [AsyncPipe],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  constructor(public signalRService: SignalRService) {}
  title = 'Dashboard';

  ngOnInit(): void {
    // Temporary: log every metrics push to the console so we can see it working
    this.signalRService.metrics$.subscribe((m) => {
      if (m) console.log('Got metrics:', m);
    });
    this.signalRService.log$.subscribe((e) => {
      console.log('Got log entry:', e);
    });
  }
}
