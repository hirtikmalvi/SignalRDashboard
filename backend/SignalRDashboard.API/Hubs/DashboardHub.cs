using Microsoft.AspNetCore.SignalR;
using SignalRDashboard.API.Models;

namespace SignalRDashboard.API.Hubs
{
    public class DashboardHub: Hub
    {
        // Called automatically when a client connects
        public override Task OnConnectedAsync()
        {
            Console.WriteLine($"Client connected: {Context.ConnectionId}");
            return base.OnConnectedAsync();
        }

        // Called automatically when a client disconnects
        public override Task OnDisconnectedAsync(Exception? exception)
        {
            Console.WriteLine($"Client disconnected: {Context.ConnectionId}");
            return base.OnDisconnectedAsync(exception);
        }

        // A method the CLIENT can call on the SERVER
        // Angular will call this to send a message to everyone
        public async Task SendMessage(string message)
        {
            var entry = new LogEntry
            {
                Message = $"[Client #{Context.ConnectionId[..6]}] {message}",
                Level = "info",
                Timestamp = DateTime.UtcNow
            };

            // Push this log entry to ALL connected clients
            await Clients.All.SendAsync("ReceiveLogEntry", entry);
        }
    }
}
