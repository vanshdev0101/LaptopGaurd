using LaptopGuard.Core;
using OtpNet;

var builder = WebApplication.CreateBuilder(args);

// only listen on Tailscale IP
builder.WebHost.UseUrls("http://100.92.192.6:5000");

var app = builder.Build();

var db = new Database(@"C:\ProgramData\LaptopGuard\laptopguard.db");
var photoFolder = @"C:\ProgramData\LaptopGuard\Photos";

// ── OTP Verification ──────────────────────────────────────────────────────────
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

// ── Serve photos ──────────────────────────────────────────────────────────────
app.MapGet("/photo/{filename}", (string filename) =>
{
    var path = Path.Combine(photoFolder, filename);
    if (!File.Exists(path)) return Results.NotFound();
    return Results.File(path, "image/jpeg");
});

// ── API: verify OTP ───────────────────────────────────────────────────────────
app.MapPost("/api/verify", (OtpRequest req) =>
    Results.Ok(new { success = VerifyOtp(req.Code) }));

// ── API: incidents ────────────────────────────────────────────────────────────
app.MapGet("/api/incidents", (string token) =>
{
    if (!VerifyOtp(token)) return Results.Unauthorized();
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

// ── API: stats ────────────────────────────────────────────────────────────────
app.MapGet("/api/stats", (string token) =>
{
    if (!VerifyOtp(token)) return Results.Unauthorized();
    return Results.Ok(new
    {
        total = db.GetTotalCount(),
        today = db.GetTodayCount(),
        photos = Directory.Exists(photoFolder)
                    ? Directory.GetFiles(photoFolder, "*.jpg").Length : 0
    });
});

// ── API: USB events ───────────────────────────────────────────────────────────
app.MapGet("/api/usb", (string token) =>
{
    if (!VerifyOtp(token)) return Results.Unauthorized();
    var events = db.GetUsbEvents().Select(e => new
    {
        e.Id,
        e.Timestamp,
        e.DeviceName,
        e.EventType
    });
    return Results.Ok(events);
});

// ── API: app events ───────────────────────────────────────────────────────────
app.MapGet("/api/apps", (string token) =>
{
    if (!VerifyOtp(token)) return Results.Unauthorized();
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

// ── API: apps by incident ─────────────────────────────────────────────────────
app.MapGet("/api/apps/{incidentId}", (int incidentId, string token) =>
{
    if (!VerifyOtp(token)) return Results.Unauthorized();
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

// ── Web UI ────────────────────────────────────────────────────────────────────
app.MapGet("/", () => Results.Content(LaptopGuard.Web.Html.Page, "text/html"));

app.Run();

record OtpRequest(string Code);