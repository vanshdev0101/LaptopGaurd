using System.Diagnostics.Eventing.Reader;

namespace LaptopGuard.Service;

public class EventMonitor
{
    public event Action<EventRecord>? FailedLogonDetected;

    private EventLogWatcher? _watcher;

    public void Start()
    {
        try
        {
            Console.WriteLine("[*] Attempting to start EventLogWatcher...");

            var query = new EventLogQuery(
                "Security",
                PathType.LogName,
                "*[System/EventID=4625]");

            Console.WriteLine("[*] Query created.");

            _watcher = new EventLogWatcher(query);

            Console.WriteLine("[*] Watcher created.");

            _watcher.EventRecordWritten += OnEventRecordWritten;
            _watcher.Enabled = true;

            Console.WriteLine("[*] EventLogWatcher started successfully.");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[!] EventLogWatcher FAILED: {ex.GetType().Name}: {ex.Message}");
        }
    }

    public void Stop()
    {
        if (_watcher is not null)
        {
            _watcher.Enabled = false;
            _watcher.Dispose();
        }
    }

    private void OnEventRecordWritten(
        object? sender,
        EventRecordWrittenEventArgs e)
    {
        if (e.EventRecord is null)
            return;

        FailedLogonDetected?.Invoke(e.EventRecord);
    }
}