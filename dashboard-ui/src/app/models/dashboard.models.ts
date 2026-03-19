export interface DashboardMetrics {
  activeUsers: number;
  cpuUsage: number;
  ordersToday: number;
  errorRate: number;
  timestamp: string;   // comes as ISO string over JSON
}

export interface LogEntry {
  message: string;
  level: 'info' | 'warn' | 'error';
  timestamp: string;
}
