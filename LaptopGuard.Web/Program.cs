using LaptopGuard.Core;
using OtpNet;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddCors();
builder.WebHost.UseUrls("http://100.92.192.6:5000");

var app = builder.Build();

app.UseCors(policy => policy
    .AllowAnyOrigin()
    .AllowAnyMethod()
    .AllowAnyHeader());

var db = new Database(@"C:\ProgramData\LaptopGuard\laptopguard.db");
var photoFolder = @"C:\ProgramData\LaptopGuard\Photos";

// Simple session store — token → expiry
var sessions = new Dictionary<string, DateTime>();

bool VerifyOtp(string code)
{
    try
    {
        var secret = File.ReadAllText(@"C:\ProgramData\LaptopGuard\otp.secret").Trim();
        var key = Base32Encoding.ToBytes(secret);
        var totp = new Totp(key);
        return totp.VerifyTotp(code, out _, new VerificationWindow(1, 1));
    }
    catch { return false; }
}

bool VerifySession(string? token)
{
    if (string.IsNullOrEmpty(token)) return false;
    if (!sessions.TryGetValue(token, out var expiry)) return false;
    if (DateTime.UtcNow > expiry) { sessions.Remove(token); return false; }
    return true;
}

// Photos
app.MapGet("/photo/{filename}", (string filename) =>
{
    var path = Path.Combine(photoFolder, filename);
    if (!File.Exists(path)) return Results.NotFound();
    return Results.File(path, "image/jpeg");
});

// OTP Verify → returns session token
app.MapPost("/api/verify", (OtpRequest req) =>
{
    if (!VerifyOtp(req.Code))
        return Results.Ok(new { success = false, sessionToken = (string?)null });

    // Create 8-hour session token
    var sessionToken = Guid.NewGuid().ToString("N");
    sessions[sessionToken] = DateTime.UtcNow.AddHours(8);

    return Results.Ok(new { success = true, sessionToken });
});

// Stats
app.MapGet("/api/stats", (string? token) =>
{
    if (!VerifySession(token)) return Results.Unauthorized();
    return Results.Ok(new
    {
        total = db.GetTotalCount(),
        today = db.GetTodayCount(),
        photos = Directory.Exists(photoFolder)
            ? Directory.GetFiles(photoFolder, "*.jpg").Length : 0
    });
});

// Incidents
app.MapGet("/api/incidents", (string? token) =>
{
    if (!VerifySession(token)) return Results.Unauthorized();
    var incidents = db.GetAllIncidents().Select(i => new
    {
        i.Id,
        i.Timestamp,
        i.Username,
        i.LogonType,
        i.FailureReason,
        Photos = i.GetPhotos().Select(p => $"/photo/{Path.GetFileName(p)}")
    });
    return Results.Ok(incidents);
});

// Single Incident
app.MapGet("/api/incidents/{id:int}", (int id, string? token) =>
{
    if (!VerifySession(token)) return Results.Unauthorized();
    var incident = db.GetIncidentById(id);
    if (incident == null) return Results.NotFound();
    return Results.Ok(new
    {
        incident.Id,
        incident.Timestamp,
        incident.Username,
        incident.LogonType,
        incident.FailureReason,
        Photos = incident.GetPhotos().Select(p => $"/photo/{Path.GetFileName(p)}")
    });
});

// USB Events
app.MapGet("/api/usb", (string? token) =>
{
    if (!VerifySession(token)) return Results.Unauthorized();
    var events = db.GetUsbEvents().Select(e => new
    {
        e.Id,
        e.Timestamp,
        e.DeviceName,
        e.EventType,
        e.DeviceType,
        e.VendorId,
        e.ProductId,
        e.SerialNumber,
        e.DriveLetter,
        e.DuringIncident
    });
    return Results.Ok(events);
});

// Applications
app.MapGet("/api/apps", (string? token) =>
{
    if (!VerifySession(token)) return Results.Unauthorized();
    var apps = db.GetRecentApps().Select(a => new
    {
        a.Id,
        a.Timestamp,
        a.AppName,
        a.ExecutablePath,
        a.Publisher,
        a.ProcessId,
        a.IncidentId
    });
    return Results.Ok(apps);
});

// Applications for Incident
app.MapGet("/api/apps/{incidentId:int}", (int incidentId, string? token) =>
{
    if (!VerifySession(token)) return Results.Unauthorized();
    var apps = db.GetAppEvents(incidentId).Select(a => new
    {
        a.Id,
        a.Timestamp,
        a.AppName,
        a.ExecutablePath,
        a.Publisher,
        a.ProcessId
    });
    return Results.Ok(apps);
});

// Dashboard
app.MapGet("/", () =>
    Results.Content(LaptopGuard.Web.Html.Page, "text/html"));

app.Run();

record OtpRequest(string Code);