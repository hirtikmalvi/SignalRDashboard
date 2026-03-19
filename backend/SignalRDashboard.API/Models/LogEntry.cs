namespace SignalRDashboard.API.Models
{
    public class LogEntry
    {
        public string Message { get; set; } = string.Empty;
        public string Level { get; set; } = "info";   // info | warn | error
        public DateTime Timestamp { get; set; }
    }
}
