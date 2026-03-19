using Microsoft.AspNetCore.SignalR;
using SignalRDashboard.API.Hubs;
using SignalRDashboard.API.Models;

namespace SignalRDashboard.API.Services
{
    public class MetricsService : BackgroundService
    {
        // IHubContext is our bridge to push data to connected clients
        private readonly IHubContext<DashboardHub> hubContext;

        // ILogger is good practice — lets us see what's happening in the console
        private readonly ILogger<MetricsService> logger;

        // Random for generating realistic-looking fake data
        private readonly Random _random = new();

        // We'll track some values and drift them over time
        // so the dashboard looks alive, not random noise
        private int _activeUsers = 120;
        private int _ordersToday = 800;
        private double _cpuUsage = 45.0;
        private double _errorRate = 0.3;

        public MetricsService(
            IHubContext<DashboardHub> _hubContext, ILogger<MetricsService> _logger)
        {
            hubContext = _hubContext;
            logger = _logger;
        }

        // This method runs automatically when the app starts.
        // stoppingToken is cancelled when the app is shutting down.
        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            logger.LogInformation("MetricsService started. Will push metrics every 2 seconds.");

            // Keep looping until the app shuts down
            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    // 1. Generate new metrics
                    var metrics = GenerateMetrics();

                    // 2. Push metrics to ALL connected Angular clients
                    // "ReceiveMetrics" is the method name Angular will listen for
                    await hubContext.Clients.All.SendAsync("ReceiveMetrics",
                        metrics,
                        stoppingToken);

                    // 3. Occasionally push a log entry too
                    if (_random.Next(0, 5) == 0)  // ~20% chance each tick
                    {
                        var logEntry = GenerateLogEntry();
                        await hubContext.Clients.All.SendAsync(
                            "ReceiveLogEntry",
                            logEntry,
                            stoppingToken
                        );
                    }

                    logger.LogDebug("Pushed metrics: Users={Users}, CPU={Cpu}%",
                    metrics.ActiveUsers, metrics.CpuUsage);
                }
                catch (Exception ex) when (ex is not OperationCanceledException)
                {
                    logger.LogError(ex, "Error while pushing metrics");
                }

                // Wait 2 seconds before the next push
                await Task.Delay(TimeSpan.FromSeconds(2), stoppingToken);
            }
            logger.LogInformation("MetricsService stopped.");
        }


        private DashboardMetrics GenerateMetrics()
        {
            // Drift values gradually — looks more realistic than pure random
            _activeUsers = Clamp(_activeUsers + _random.Next(-8, 10), 50, 500);
            _ordersToday = _ordersToday + _random.Next(0, 5);   // orders only go up
            _cpuUsage = Clamp(_cpuUsage + (_random.NextDouble() * 6 - 3), 5, 95);
            _errorRate = Clamp(_errorRate + (_random.NextDouble() * 0.4 - 0.2), 0, 5);

            return new DashboardMetrics
            {
                ActiveUsers = _activeUsers,
                OrdersToday = _ordersToday,
                CpuUsage = Math.Round(_cpuUsage, 1),
                ErrorRate = Math.Round(_errorRate, 2),
                Timestamp = DateTime.UtcNow
            };
       }

        private LogEntry GenerateLogEntry()
        {
            var events = new[]
            {
            ("User session started", "info"),
            ("Payment processed successfully", "info"),
            ("New order received", "info"),
            ("High CPU usage detected", "warn"),
            ("Slow query detected on DB", "warn"),
            ("Failed login attempt", "error"),
        };

            var (msg, level) = events[_random.Next(events.Length)];

            return new LogEntry
            {
                Message = msg,
                Level = level,
                Timestamp = DateTime.UtcNow
            };
        }

        // Helper: keep a value within min-max bounds
        private static double Clamp(double value, double min, double max)
            => Math.Max(min, Math.Min(max, value));

        private static int Clamp(int value, int min, int max)
            => Math.Max(min, Math.Min(max, value));
    }
}
