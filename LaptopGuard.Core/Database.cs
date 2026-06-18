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
                 $recordId, $uploaded, $photos, $hashes);";
        cmd.Parameters.AddWithValue("$ts", incident.Timestamp.ToString("o"));
        cmd.Parameters.AddWithValue("$user", incident.Username);
        cmd.Parameters.AddWithValue("$logon", incident.LogonType);
        cmd.Parameters.AddWithValue("$reason", incident.FailureReason);
        cmd.Parameters.AddWithValue("$recordId", incident.EventRecordId);
        cmd.Parameters.AddWithValue("$uploaded", incident.Uploaded ? 1 : 0);
        cmd.Parameters.AddWithValue("$photos", incident.PhotoPaths);
        cmd.Parameters.AddWithValue("$hashes", incident.PhotoHashes);
        cmd.ExecuteNonQuery();
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
}