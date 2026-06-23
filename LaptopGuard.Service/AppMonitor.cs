using LaptopGuard.Core.Models;
using System.Diagnostics;
using System.Management;

namespace LaptopGuard.Service;

public class AppMonitor
{
    public static List<AppEvent> GetRunningApps(int incidentId = 0)
    {
        var apps = new List<AppEvent>();
        try
        {
            var processes = Process.GetProcesses()
                .Where(p => !string.IsNullOrEmpty(p.MainWindowTitle))
                .OrderBy(p => p.ProcessName)
                .Take(30);

            foreach (var proc in processes)
            {
                try
                {
                    var app = new AppEvent
                    {
                        Timestamp = DateTime.Now,
                        AppName = proc.ProcessName,
                        ExecutablePath = GetExecutablePath(proc),
                        Publisher = GetPublisher(proc),
                        ProcessId = proc.Id,
                        IncidentId = incidentId
                    };
                    apps.Add(app);
                }
                catch { }
            }
        }
        catch { }
        return apps;
    }

    private static string GetExecutablePath(Process proc)
    {
        try { return proc.MainModule?.FileName ?? ""; }
        catch { return ""; }
    }

    private static string GetPublisher(Process proc)
    {
        try
        {
            var path = proc.MainModule?.FileName;
            if (string.IsNullOrEmpty(path)) return "";
            var info = FileVersionInfo.GetVersionInfo(path);
            return info.CompanyName ?? "";
        }
        catch { return ""; }
    }
}