namespace SignalRDashboard.API.Models
{
    public class DashboardMetrics
    {
        public int ActiveUsers { get; set; }
        public double CpuUsage { get; set; }        // percentage 0-100
        public int OrdersToday { get; set; }
        public double ErrorRate { get; set; }        // percentage 0-5
        public DateTime Timestamp { get; set; }
    }
}
