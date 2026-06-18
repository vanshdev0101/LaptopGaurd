namespace LaptopGuard.Core.Models;

public class Incident
{
    public int Id { get; set; }
    public DateTime Timestamp { get; set; }
    public string Username { get; set; } = string.Empty;
    public int LogonType { get; set; }
    public string FailureReason { get; set; } = string.Empty;
    public long EventRecordId { get; set; } = 0;
    public bool Uploaded { get; set; } = false;
    public string PhotoPaths { get; set; } = string.Empty;
    public string PhotoHashes { get; set; } = string.Empty;

    public List<string> GetPhotos()
    {
        return PhotoPaths.Split(',', StringSplitOptions.RemoveEmptyEntries).ToList();
    }
}