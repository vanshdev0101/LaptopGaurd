using LaptopGuard.Core;
using LaptopGuard.Core.Models;
using System.Diagnostics.Eventing.Reader;

namespace LaptopGuard.Service;

public class Worker : BackgroundService
{
    private readonly ILogger<Worker> _logger;
    private readonly Database _db;
    private readonly CameraCapture _camera;
    private readonly EventMonitor _monitor;
    private readonly string _photoFolder = @"C:\ProgramData\LaptopGuard\Photos";
    private readonly string _keyPath = @"C:\ProgramData\LaptopGuard\guard.key";

    public Worker(ILogger<Worker> logger)
    {
        _logger = logger;
        var dbPath = @"C:\ProgramData\LaptopGuard\laptopguard.db";
        Directory.CreateDirectory(@"C:\ProgramData\LaptopGuard");
        _db = new Database(dbPath);
        _camera = new CameraCapture(_photoFolder);
        _monitor = new EventMonitor();
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("[*] LaptopGuard Service started.");
        _monitor.FailedLogonDetected += OnFailedLogon;
        _monitor.Start();

        while (!stoppingToken.IsCancellationRequested)
            await Task.Delay(5000, stoppingToken);

        _monitor.Stop();
        _logger.LogInformation("[*] LaptopGuard Service stopped.");
    }

    private void OnFailedLogon(EventRecord record)
    {
        try
        {
            if (_db.IsEventAlreadyProcessed(record.RecordId ?? 0))
                return;

            _logger.LogWarning("[!] Failed login detected at {Time}", DateTime.Now);

            var photos = _camera.CapturePhotos(3);
            if (photos.Count == 0)
            {
                _logger.LogWarning("[!] No photos captured.");
                return;
            }

            var key = SecurityHelper.LoadOrCreateKey(_keyPath);
            var paths = new List<string>();
            var hashes = new List<string>();

            foreach (var photo in photos)
            {
                var hash = SecurityHelper.HashFile(photo);
                var encrypted = SecurityHelper.EncryptFile(photo, key);
                File.WriteAllBytes(photo.Replace(".jpg", ".enc"), encrypted);
                paths.Add(photo);
                hashes.Add(hash);
                _logger.LogInformation("[+] Photo captured: {Photo}", photo);
            }

            // ONE incident per failed login event
            var incident = new Incident
            {
                Timestamp = DateTime.Now,
                Username = GetUsername(record),
                LogonType = GetLogonType(record),
                FailureReason = GetFailureReason(record),
                EventRecordId = record.RecordId ?? 0,
                PhotoPaths = string.Join(",", paths),
                PhotoHashes = string.Join(",", hashes),
                Uploaded = false
            };
            _db.SaveIncident(incident);
            _logger.LogInformation("[+] Incident #{Id} saved with {Count} photos.",
                                   incident.Id, photos.Count);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[-] Error handling failed logon event.");
        }
    }

    private static string GetUsername(EventRecord record)
    {
        try
        {
            var username = record.Properties[5].Value?.ToString();
            if (string.IsNullOrWhiteSpace(username) || username == "-")
                username = record.Properties[1].Value?.ToString();
            return username ?? "Unknown";
        }
        catch { return "Unknown"; }
    }

    private static int GetLogonType(EventRecord record)
    {
        try { return Convert.ToInt32(record.Properties[10].Value); }
        catch { return 0; }
    }

    private static string GetFailureReason(EventRecord record)
    {
        try { return record.Properties[8].Value?.ToString() ?? ""; }
        catch { return ""; }
    }
}