namespace LaptopGuard.Core.Models;

public class UsbEvent
{
    public int Id { get; set; }
    public DateTime Timestamp { get; set; }
    public string EventType { get; set; } = string.Empty;  // "Inserted" or "Removed"
    public string DeviceName { get; set; } = string.Empty;
    public string DeviceType { get; set; } = string.Empty;
    public string VendorId { get; set; } = string.Empty;
    public string ProductId { get; set; } = string.Empty;
    public string SerialNumber { get; set; } = string.Empty;
    public string DriveLetter { get; set; } = string.Empty;
    public bool DuringIncident { get; set; } = false;
}