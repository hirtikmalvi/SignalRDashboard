import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { BehaviorSubject, Subject } from 'rxjs';
import { DashboardMetrics, LogEntry } from '../models/dashboard.models';

@Injectable({
  providedIn: 'root', // singleton — one connection for the whole app
})
export class SignalRService {
  private readonly HUB_URL = 'http://localhost:5112/hubs/dashboard';

  // HubConnection is the SignalR client object
  private connection!: signalR.HubConnection;

  // --- Observables that components will subscribe to ---

  // BehaviorSubject: holds the LATEST value and replays it to new subscribers
  // Perfect for metrics — a new component gets the current value immediately

  private metricsSubject = new BehaviorSubject<DashboardMetrics | null>(null);
  public metrics$ = this.metricsSubject.asObservable();

  // Subject: no initial value — only emits NEW events going forward
  // Perfect for the log — we don't replay old log entries to new subscribers
  private logSubject = new Subject<LogEntry>();
  public log$ = this.logSubject.asObservable();

  // Connection state so UI can show "Connecting..." / "Connected" / "Disconnected"
  private connectionStateSubject = new BehaviorSubject<string>('disconnected');
  public connectionState$ = this.connectionStateSubject.asObservable();

  constructor() {
    this.initializeConnection();
  }

  private initializeConnection(): void {
    // Build the connection — configure it before starting
    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(this.HUB_URL)
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
      // ^^ Retry delays in ms: immediately, 2s, 5s, 10s, 30s
      //     After these attempts, it stops trying automatically
      .configureLogging(signalR.LogLevel.Information)
      //  ^^ Logs connection events to browser console — very useful while learning
      .build();

    // Register listener BEFORE starting the connection
    // "ReceiveMetrics" must match exactly what the server sends

    this.connection.on('ReceiveMetrics', (data: DashboardMetrics) => {
      this.metricsSubject.next(data);
    });

    this.connection.on('ReceiveLogEntry', (entry: LogEntry) => {
      this.logSubject.next(entry);
    });

    // React to reconnecting state
    this.connection.onreconnecting(() => {
      console.warn('SignalR: reconnecting...');
      this.connectionStateSubject.next('reconnecting');
    });

    // React to successful reconnection
    this.connection.onreconnected(() => {
      console.log('SignalR: reconnected');
      this.connectionStateSubject.next('connected');
    });

    // React to permanent disconnection (all retries exhausted)
    this.connection.onclose(() => {
      console.error('SignalR: connection closed');
      this.connectionStateSubject.next('disconnected');
    });

    // Now start the connection
    this.startConnection();
  }

  public async startConnection(): Promise<void> {
    this.connectionStateSubject.next('connecting');

    try {
      await this.connection.start();
      this.connectionStateSubject.next('connected');
      console.log(
        'SignalR connected. Connection ID:',
        this.connection.connectionId,
      );
    } catch (error) {
      this.connectionStateSubject.next('disconnected');
      console.error('SignalR connection failed:', error);

      // Retry after 5 seconds if initial connection fails
      setTimeout(() => this.startConnection(), 5000);
    }
  }

  // Call a method ON the server Hub from Angular
  // This is Step 6 — we wire this up to a UI input later
  async sendMessage(message: string): Promise<void> {
    if (this.connection.state !== signalR.HubConnectionState.Connected) {
      console.warn('Cannot send — not connected');
      return;
    }
    // 'SendMessage' must match the Hub method name exactly
    await this.connection.invoke('SendMessage', message);
  }
}
