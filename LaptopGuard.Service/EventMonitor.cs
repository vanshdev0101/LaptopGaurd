using System.Diagnostics.Eventing.Reader;

namespace LaptopGuard.Service;

public class EventMonitor
{
    public event Action<EventRecord>? FailedLogonDetected;

    private EventLogWatcher? _watcher;

    public void Start()
    {
        var query = new EventLogQuery(
            "Security",
            PathType.LogName,
            "*[System/EventID=4625]");

        _watcher = new EventLogWatcher(query);

        _watcher.EventRecordWritten += OnEventRecordWritten;

        _watcher.Enabled = true;
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

        FailedLogonDetected?.Invoke(
            e.EventRecord);
    }
}