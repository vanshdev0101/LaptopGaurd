namespace LaptopGuard.Core.Models;

public class AppEvent
{
    public int Id { get; set; }
    public DateTime Timestamp { get; set; }
    public string AppName { get; set; } = string.Empty;
    public string ExecutablePath { get; set; } = string.Empty;
    public string Publisher { get; set; } = string.Empty;
    public int ProcessId { get; set; }
    public int IncidentId { get; set; } = 0;
}