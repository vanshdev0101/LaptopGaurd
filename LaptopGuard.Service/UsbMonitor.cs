// In LaptopGuard.Service/UsbMonitor.cs
// Replace your existing class with this debounced version

using System;
using System.Collections.Generic;
using System.Management;
using System.Threading;
using System.Threading.Tasks;
using LaptopGuard.Core;

namespace LaptopGuard.Service;

public class UsbMonitor : IDisposable
{
    private readonly Database _db;
    private ManagementEventWatcher? _insertWatcher;
    private ManagementEventWatcher? _removeWatcher;

    // Debounce: track last event time per device name
    private readonly Dictionary<string, DateTime> _lastEventTime = new();
    private readonly TimeSpan _debounceWindow = TimeSpan.FromSeconds(3);
    private readonly Lock _lock = new();

    public UsbMonitor(Database db)
    {
        _db = db;
    }

    public void Start()
    {
        try
        {
            _insertWatcher = new ManagementEventWatcher(
                new WqlEventQuery("SELECT * FROM __InstanceCreationEvent WITHIN 2 WHERE TargetInstance ISA 'Win32_PnPEntity'")
            );
            _insertWatcher.EventArrived += (s, e) => HandleEvent(e, "Inserted");
            _insertWatcher.Start();

            _removeWatcher = new ManagementEventWatcher(
                new WqlEventQuery("SELECT * FROM __InstanceDeletionEvent WITHIN 2 WHERE TargetInstance ISA 'Win32_PnPEntity'")
            );
            _removeWatcher.EventArrived += (s, e) => HandleEvent(e, "Removed");
            _removeWatcher.Start();
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[UsbMonitor] Failed to start: {ex.Message}");
        }
    }

    private void HandleEvent(EventArrivedEventArgs e, string eventType)
    {
        try
        {
            var target = (ManagementBaseObject)e.NewEvent["TargetInstance"];

            var deviceName = target["Name"]?.ToString() ?? "USB Device";
            var deviceType = target["PNPClass"]?.ToString() ?? "Unknown";
            var vendorId = "";
            var productId = "";
            var serial = "";
            var drive = "";

            // Parse VID/PID from DeviceID if available
            var deviceId = target["DeviceID"]?.ToString() ?? "";
            if (deviceId.Contains("VID_"))
            {
                var vidIdx = deviceId.IndexOf("VID_") + 4;
                vendorId = deviceId.Substring(vidIdx, Math.Min(4, deviceId.Length - vidIdx));
            }
            if (deviceId.Contains("PID_"))
            {
                var pidIdx = deviceId.IndexOf("PID_") + 4;
                productId = deviceId.Substring(pidIdx, Math.Min(4, deviceId.Length - pidIdx));
            }

            // Debounce key = deviceName + eventType
            var key = $"{deviceName}:{eventType}";
            lock (_lock)
            {
                if (_lastEventTime.TryGetValue(key, out var last))
                {
                    if (DateTime.UtcNow - last < _debounceWindow)
                    {
                        // Duplicate within debounce window — skip
                        return;
                    }
                }
                _lastEventTime[key] = DateTime.UtcNow;
            }

            Console.WriteLine($"[UsbMonitor] {eventType}: {deviceName}");

            var usbEvent = new LaptopGuard.Core.Models.UsbEvent
            {
                Timestamp = DateTime.Now,
                EventType = eventType,
                DeviceName = deviceName,
                DeviceType = deviceType,
                VendorId = vendorId,
                ProductId = productId,
                SerialNumber = serial,
                DriveLetter = drive,
                DuringIncident = false,
            };

            _db.SaveUsbEvent(usbEvent);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[UsbMonitor] Error handling event: {ex.Message}");
        }
    }

    public void Dispose()
    {
        _insertWatcher?.Stop();
        _insertWatcher?.Dispose();
        _removeWatcher?.Stop();
        _removeWatcher?.Dispose();
    }
}