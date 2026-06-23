using LaptopGuard.Core;
using LaptopGuard.Core.Models;
using System.Management;

namespace LaptopGuard.Service;

public class UsbMonitor : IDisposable
{
    private readonly Database _db;
    private readonly ILogger _logger;
    private ManagementEventWatcher? _insertWatcher;
    private ManagementEventWatcher? _removeWatcher;
    private DateTime _lastInsert = DateTime.MinValue;
    private DateTime _lastRemove = DateTime.MinValue;
    private const int DebounceSeconds = 3;

    public UsbMonitor(Database db, ILogger logger)
    {
        _db = db;
        _logger = logger;
    }

    public void Start()
    {
        try
        {
            _insertWatcher = new ManagementEventWatcher(
                new WqlEventQuery(
                    "__InstanceCreationEvent",
                    TimeSpan.FromSeconds(1),
                    "TargetInstance ISA 'Win32_USBControllerDevice'"));
            _insertWatcher.EventArrived += OnUsbInserted;
            _insertWatcher.Start();

            _removeWatcher = new ManagementEventWatcher(
                new WqlEventQuery(
                    "__InstanceDeletionEvent",
                    TimeSpan.FromSeconds(1),
                    "TargetInstance ISA 'Win32_USBControllerDevice'"));
            _removeWatcher.EventArrived += OnUsbRemoved;
            _removeWatcher.Start();

            _logger.LogInformation("[*] USB Monitor started.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[-] Failed to start USB monitor.");
        }
    }

    private void OnUsbInserted(object sender, EventArrivedEventArgs e)
    {
        // debounce — ignore if we already fired within DebounceSeconds
        if ((DateTime.Now - _lastInsert).TotalSeconds < DebounceSeconds) return;
        _lastInsert = DateTime.Now;

        try
        {
            // small delay so device info is available
            Thread.Sleep(1500);
            var info = GetUsbDeviceInfo();
            var evt = new UsbEvent
            {
                Timestamp = DateTime.Now,
                EventType = "Inserted",
                DeviceName = info.name,
                DeviceType = info.type,
                VendorId = info.vid,
                ProductId = info.pid,
                SerialNumber = info.serial,
                DriveLetter = info.drive
            };
            _db.SaveUsbEvent(evt);
            _logger.LogWarning("[!] USB Inserted: {Name} {Drive}", info.name, info.drive);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[-] USB insert error.");
        }
    }

    private void OnUsbRemoved(object sender, EventArrivedEventArgs e)
    {
        if ((DateTime.Now - _lastRemove).TotalSeconds < DebounceSeconds) return;
        _lastRemove = DateTime.Now;

        try
        {
            var evt = new UsbEvent
            {
                Timestamp = DateTime.Now,
                EventType = "Removed",
                DeviceName = "USB Device",
                DeviceType = "Unknown"
            };
            _db.SaveUsbEvent(evt);
            _logger.LogInformation("[*] USB Removed.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[-] USB remove error.");
        }
    }

    private static (string name, string type, string vid, string pid, string serial, string drive) GetUsbDeviceInfo()
    {
        try
        {
            using var searcher = new ManagementObjectSearcher(
                "SELECT * FROM Win32_DiskDrive WHERE InterfaceType='USB'");
            foreach (ManagementObject disk in searcher.Get())
            {
                return (
                    name: disk["Caption"]?.ToString() ?? "USB Device",
                    type: disk["MediaType"]?.ToString() ?? "USB Mass Storage",
                    vid: disk["Manufacturer"]?.ToString() ?? "",
                    pid: disk["Model"]?.ToString() ?? "",
                    serial: disk["SerialNumber"]?.ToString() ?? "",
                    drive: GetDriveLetter(disk["DeviceID"]?.ToString() ?? "")
                );
            }
        }
        catch { }

        // fallback: check for HID devices like keyboards/mice
        try
        {
            using var searcher = new ManagementObjectSearcher(
                "SELECT * FROM Win32_PnPEntity WHERE PNPClass='HIDClass' AND Present=True");
            foreach (ManagementObject device in searcher.Get())
            {
                var name = device["Name"]?.ToString() ?? "";
                if (!string.IsNullOrEmpty(name))
                    return (name, "HID Device", "", "", "", "");
            }
        }
        catch { }

        return ("USB Device", "Unknown", "", "", "", "");
    }

    private static string GetDriveLetter(string deviceId)
    {
        try
        {
            using var searcher = new ManagementObjectSearcher(
                $"ASSOCIATORS OF {{Win32_DiskDrive.DeviceID='{deviceId}'}} " +
                "WHERE AssocClass=Win32_DiskDriveToDiskPartition");
            foreach (ManagementObject partition in searcher.Get())
            {
                using var logical = new ManagementObjectSearcher(
                    $"ASSOCIATORS OF {{Win32_DiskPartition.DeviceID='{partition["DeviceID"]}'}} " +
                    "WHERE AssocClass=Win32_LogicalDiskToPartition");
                foreach (ManagementObject disk in logical.Get())
                    return disk["DeviceID"]?.ToString() ?? "";
            }
        }
        catch { }
        return "";
    }

    public void Dispose()
    {
        _insertWatcher?.Stop();
        _insertWatcher?.Dispose();
        _removeWatcher?.Stop();
        _removeWatcher?.Dispose();
    }
}