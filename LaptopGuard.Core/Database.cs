using Microsoft.Data.Sqlite;
using LaptopGuard.Core.Models;

namespace LaptopGuard.Core;

public class Database
{
    private readonly string _connectionString;

    public Database(string dbPath)
    {
        _connectionString = $"Data Source={dbPath}";
        Initialize();
    }

    private void Initialize()
    {
        using var conn = new SqliteConnection(_connectionString);
        conn.Open();
        var cmd = conn.CreateCommand();
        cmd.CommandText = @"
            CREATE TABLE IF NOT EXISTS Incidents (
                Id            INTEGER PRIMARY KEY AUTOINCREMENT,
                Timestamp     TEXT    NOT NULL,
                Username      TEXT    NOT NULL,
                LogonType     INTEGER NOT NULL,
                FailureReason TEXT    NOT NULL DEFAULT '',
                EventRecordId INTEGER NOT NULL DEFAULT 0,
                Uploaded      INTEGER NOT NULL DEFAULT 0,
                PhotoPaths    TEXT    NOT NULL DEFAULT '',
                PhotoHashes   TEXT    NOT NULL DEFAULT ''
            );";
        cmd.ExecuteNonQuery();

        cmd.CommandText = @"
            CREATE TABLE IF NOT EXISTS UsbEvents (
                Id             INTEGER PRIMARY KEY AUTOINCREMENT,
                Timestamp      TEXT    NOT NULL,
                EventType      TEXT    NOT NULL,
                DeviceName     TEXT    NOT NULL DEFAULT '',
                DeviceType     TEXT    NOT NULL DEFAULT '',
                VendorId       TEXT    NOT NULL DEFAULT '',
                ProductId      TEXT    NOT NULL DEFAULT '',
                SerialNumber   TEXT    NOT NULL DEFAULT '',
                DriveLetter    TEXT    NOT NULL DEFAULT '',
                DuringIncident INTEGER NOT NULL DEFAULT 0
            );";
        cmd.ExecuteNonQuery();

        cmd.CommandText = @"
            CREATE TABLE IF NOT EXISTS AppEvents (
                Id             INTEGER PRIMARY KEY AUTOINCREMENT,
                Timestamp      TEXT    NOT NULL,
                AppName        TEXT    NOT NULL DEFAULT '',
                ExecutablePath TEXT    NOT NULL DEFAULT '',
                Publisher      TEXT    NOT NULL DEFAULT '',
                ProcessId      INTEGER NOT NULL DEFAULT 0,
                IncidentId     INTEGER NOT NULL DEFAULT 0
            );";
        cmd.ExecuteNonQuery();
    }

    public void SaveIncident(Incident incident)
    {
        using var conn = new SqliteConnection(_connectionString);
        conn.Open();
        var cmd = conn.CreateCommand();
        cmd.CommandText = @"
            INSERT INTO Incidents
                (Timestamp, Username, LogonType, FailureReason,
                 EventRecordId, Uploaded, PhotoPaths, PhotoHashes)
            VALUES
                ($ts, $user, $logon, $reason,
                 $recordId, $uploaded, $photos, $hashes);
            SELECT last_insert_rowid();";
        cmd.Parameters.AddWithValue("$ts", incident.Timestamp.ToString("o"));
        cmd.Parameters.AddWithValue("$user", incident.Username);
        cmd.Parameters.AddWithValue("$logon", incident.LogonType);
        cmd.Parameters.AddWithValue("$reason", incident.FailureReason);
        cmd.Parameters.AddWithValue("$recordId", incident.EventRecordId);
        cmd.Parameters.AddWithValue("$uploaded", incident.Uploaded ? 1 : 0);
        cmd.Parameters.AddWithValue("$photos", incident.PhotoPaths);
        cmd.Parameters.AddWithValue("$hashes", incident.PhotoHashes);
        incident.Id = Convert.ToInt32(cmd.ExecuteScalar());
    }

    public List<Incident> GetAllIncidents()
    {
        var incidents = new List<Incident>();
        using var conn = new SqliteConnection(_connectionString);
        conn.Open();
        var cmd = conn.CreateCommand();
        cmd.CommandText = "SELECT * FROM Incidents ORDER BY Timestamp DESC;";
        using var reader = cmd.ExecuteReader();
        while (reader.Read())
        {
            incidents.Add(new Incident
            {
                Id = reader.GetInt32(0),
                Timestamp = DateTime.Parse(reader.GetString(1)),
                Username = reader.GetString(2),
                LogonType = reader.GetInt32(3),
                FailureReason = reader.GetString(4),
                EventRecordId = reader.GetInt64(5),
                Uploaded = reader.GetInt32(6) == 1,
                PhotoPaths = reader.GetString(7),
                PhotoHashes = reader.GetString(8)
            });
        }
        return incidents;
    }

    public Incident? GetIncidentById(int id)
    {
        using var conn = new SqliteConnection(_connectionString);
        conn.Open();
        var cmd = conn.CreateCommand();
        cmd.CommandText = "SELECT * FROM Incidents WHERE Id = $id;";
        cmd.Parameters.AddWithValue("$id", id);
        using var reader = cmd.ExecuteReader();
        if (reader.Read())
        {
            return new Incident
            {
                Id = reader.GetInt32(0),
                Timestamp = DateTime.Parse(reader.GetString(1)),
                Username = reader.GetString(2),
                LogonType = reader.GetInt32(3),
                FailureReason = reader.GetString(4),
                EventRecordId = reader.GetInt64(5),
                Uploaded = reader.GetInt32(6) == 1,
                PhotoPaths = reader.GetString(7),
                PhotoHashes = reader.GetString(8)
            };
        }
        return null;
    }

    public bool IsEventAlreadyProcessed(long eventRecordId)
    {
        using var conn = new SqliteConnection(_connectionString);
        conn.Open();
        var cmd = conn.CreateCommand();
        cmd.CommandText = "SELECT COUNT(*) FROM Incidents WHERE EventRecordId = $id;";
        cmd.Parameters.AddWithValue("$id", eventRecordId);
        return Convert.ToInt32(cmd.ExecuteScalar()) > 0;
    }

    public int GetTotalCount()
    {
        using var conn = new SqliteConnection(_connectionString);
        conn.Open();
        var cmd = conn.CreateCommand();
        cmd.CommandText = "SELECT COUNT(*) FROM Incidents;";
        return Convert.ToInt32(cmd.ExecuteScalar());
    }

    public int GetTodayCount()
    {
        using var conn = new SqliteConnection(_connectionString);
        conn.Open();
        var cmd = conn.CreateCommand();
        cmd.CommandText = "SELECT COUNT(*) FROM Incidents WHERE DATE(Timestamp) = DATE('now');";
        return Convert.ToInt32(cmd.ExecuteScalar());
    }

    public List<Incident> GetPendingUploads()
    {
        var incidents = new List<Incident>();
        using var conn = new SqliteConnection(_connectionString);
        conn.Open();
        var cmd = conn.CreateCommand();
        cmd.CommandText = "SELECT * FROM Incidents WHERE Uploaded = 0;";
        using var reader = cmd.ExecuteReader();
        while (reader.Read())
        {
            incidents.Add(new Incident
            {
                Id = reader.GetInt32(0),
                Timestamp = DateTime.Parse(reader.GetString(1)),
                Username = reader.GetString(2),
                LogonType = reader.GetInt32(3),
                FailureReason = reader.GetString(4),
                EventRecordId = reader.GetInt64(5),
                Uploaded = false,
                PhotoPaths = reader.GetString(7),
                PhotoHashes = reader.GetString(8)
            });
        }
        return incidents;
    }

    public void MarkUploaded(int incidentId)
    {
        using var conn = new SqliteConnection(_connectionString);
        conn.Open();
        var cmd = conn.CreateCommand();
        cmd.CommandText = "UPDATE Incidents SET Uploaded = 1 WHERE Id = $id;";
        cmd.Parameters.AddWithValue("$id", incidentId);
        cmd.ExecuteNonQuery();
    }

    public void SaveUsbEvent(UsbEvent usbEvent)
    {
        using var conn = new SqliteConnection(_connectionString);
        conn.Open();
        var cmd = conn.CreateCommand();
        cmd.CommandText = @"
            INSERT INTO UsbEvents
                (Timestamp, EventType, DeviceName, DeviceType,
                 VendorId, ProductId, SerialNumber, DriveLetter, DuringIncident)
            VALUES
                ($ts, $type, $name, $dtype,
                 $vid, $pid, $serial, $drive, $incident);";
        cmd.Parameters.AddWithValue("$ts", usbEvent.Timestamp.ToString("o"));
        cmd.Parameters.AddWithValue("$type", usbEvent.EventType);
        cmd.Parameters.AddWithValue("$name", usbEvent.DeviceName);
        cmd.Parameters.AddWithValue("$dtype", usbEvent.DeviceType);
        cmd.Parameters.AddWithValue("$vid", usbEvent.VendorId);
        cmd.Parameters.AddWithValue("$pid", usbEvent.ProductId);
        cmd.Parameters.AddWithValue("$serial", usbEvent.SerialNumber);
        cmd.Parameters.AddWithValue("$drive", usbEvent.DriveLetter);
        cmd.Parameters.AddWithValue("$incident", usbEvent.DuringIncident ? 1 : 0);
        cmd.ExecuteNonQuery();
    }

    public List<UsbEvent> GetUsbEvents(int limit = 50)
    {
        var events = new List<UsbEvent>();
        using var conn = new SqliteConnection(_connectionString);
        conn.Open();
        var cmd = conn.CreateCommand();
        cmd.CommandText = $"SELECT * FROM UsbEvents ORDER BY Timestamp DESC LIMIT {limit};";
        using var reader = cmd.ExecuteReader();
        while (reader.Read())
        {
            events.Add(new UsbEvent
            {
                Id = reader.GetInt32(0),
                Timestamp = DateTime.Parse(reader.GetString(1)),
                EventType = reader.GetString(2),
                DeviceName = reader.GetString(3),
                DeviceType = reader.GetString(4),
                VendorId = reader.GetString(5),
                ProductId = reader.GetString(6),
                SerialNumber = reader.GetString(7),
                DriveLetter = reader.GetString(8),
                DuringIncident = reader.GetInt32(9) == 1
            });
        }
        return events;
    }

    public List<UsbEvent> GetRecentUsbEvents(int hours = 24)
    {
        var events = new List<UsbEvent>();
        using var conn = new SqliteConnection(_connectionString);
        conn.Open();
        var cmd = conn.CreateCommand();
        cmd.CommandText = @"SELECT * FROM UsbEvents 
                            WHERE Timestamp >= $since 
                            ORDER BY Timestamp DESC;";
        cmd.Parameters.AddWithValue("$since",
            DateTime.UtcNow.AddHours(-hours).ToString("o"));
        using var reader = cmd.ExecuteReader();
        while (reader.Read())
        {
            events.Add(new UsbEvent
            {
                Id = reader.GetInt32(0),
                Timestamp = DateTime.Parse(reader.GetString(1)),
                EventType = reader.GetString(2),
                DeviceName = reader.GetString(3),
                DeviceType = reader.GetString(4),
                VendorId = reader.GetString(5),
                ProductId = reader.GetString(6),
                SerialNumber = reader.GetString(7),
                DriveLetter = reader.GetString(8),
                DuringIncident = reader.GetInt32(9) == 1
            });
        }
        return events;
    }

    public void SaveAppEvents(List<AppEvent> events)
    {
        using var conn = new SqliteConnection(_connectionString);
        conn.Open();
        foreach (var app in events)
        {
            var cmd = conn.CreateCommand();
            cmd.CommandText = @"
                INSERT INTO AppEvents
                    (Timestamp, AppName, ExecutablePath, Publisher, ProcessId, IncidentId)
                VALUES
                    ($ts, $name, $path, $pub, $pid, $incident);";
            cmd.Parameters.AddWithValue("$ts", app.Timestamp.ToString("o"));
            cmd.Parameters.AddWithValue("$name", app.AppName);
            cmd.Parameters.AddWithValue("$path", app.ExecutablePath);
            cmd.Parameters.AddWithValue("$pub", app.Publisher);
            cmd.Parameters.AddWithValue("$pid", app.ProcessId);
            cmd.Parameters.AddWithValue("$incident", app.IncidentId);
            cmd.ExecuteNonQuery();
        }
    }

    public List<AppEvent> GetRecentApps(int limit = 50)
    {
        var list = new List<AppEvent>();
        using var conn = new SqliteConnection(_connectionString);
        conn.Open();
        var cmd = conn.CreateCommand();
        cmd.CommandText = $"SELECT * FROM AppEvents ORDER BY Timestamp DESC LIMIT {limit};";
        using var reader = cmd.ExecuteReader();
        while (reader.Read())
        {
            list.Add(new AppEvent
            {
                Id = reader.GetInt32(0),
                Timestamp = DateTime.Parse(reader.GetString(1)),
                AppName = reader.GetString(2),
                ExecutablePath = reader.GetString(3),
                Publisher = reader.GetString(4),
                ProcessId = reader.GetInt32(5),
                IncidentId = reader.GetInt32(6)
            });
        }
        return list;
    }

    public List<AppEvent> GetAppEvents(int incidentId)
    {
        var list = new List<AppEvent>();
        using var conn = new SqliteConnection(_connectionString);
        conn.Open();
        var cmd = conn.CreateCommand();
        cmd.CommandText = @"SELECT * FROM AppEvents 
                            WHERE IncidentId = $id 
                            ORDER BY Timestamp DESC;";
        cmd.Parameters.AddWithValue("$id", incidentId);
        using var reader = cmd.ExecuteReader();
        while (reader.Read())
        {
            list.Add(new AppEvent
            {
                Id = reader.GetInt32(0),
                Timestamp = DateTime.Parse(reader.GetString(1)),
                AppName = reader.GetString(2),
                ExecutablePath = reader.GetString(3),
                Publisher = reader.GetString(4),
                ProcessId = reader.GetInt32(5),
                IncidentId = reader.GetInt32(6)
            });
        }
        return list; // ← this was missing
    }
}