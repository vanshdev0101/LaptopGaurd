# LaptopGuard 🛡️

A Windows endpoint security monitor that detects failed login attempts, captures webcam photos as evidence, tracks USB activity, and presents everything on a real-time authenticated dashboard — accessible remotely over Tailscale.

> Built as a portfolio project to explore Windows internals, C# service development, and full-stack security tooling.

---

## What It Does

When someone fails to log into your Windows machine, LaptopGuard:
- Captures the event from the Windows Security Log (Event ID 4625)
- Takes a webcam photo as evidence
- Logs all running processes at the time of the incident
- Detects any USB devices connected or removed around the same time
- Stores everything in a local SQLite database
- Surfaces it all on a live dashboard you can access from anywhere via Tailscale

---

## Screenshots

> Dashboard · Incidents · USB Activity · Gallery · Analytics

*(add screenshots here)*

---

## Architecture

```
Windows Security Log (Event ID 4625)
        │
        ▼
LaptopGuard.Service  (C# Windows Service)
        │
        ├── EventMonitor.cs     → watches for failed logins
        ├── CameraCapture.cs    → takes webcam photo on incident
        ├── UsbMonitor.cs       → WMI-based USB insert/remove detection
        └── AppMonitor.cs       → snapshots running processes
        │
        ▼
LaptopGuard.Core
        └── Database.cs         → SQLite via Microsoft.Data.Sqlite
        │
        ▼
LaptopGuard.Web  (ASP.NET Minimal API, .NET 10)
        └── Program.cs          → REST API endpoints, TOTP session auth
        │
        ▼
laptopguard-dashboard  (Next.js 16 + React 19 + TypeScript)
        └── Real-time dashboard, accessible over Tailscale
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS v4, Recharts |
| Backend | ASP.NET Minimal API, .NET 10, C# |
| Database | SQLite (Microsoft.Data.Sqlite) |
| Auth | TOTP via Otp.NET (Google Authenticator compatible) |
| Monitoring | WMI (Win32_PnPEntity), Windows Event Log, System.Diagnostics |
| Network | Tailscale (private overlay network, no public internet exposure) |
| Photos | AES-256 encrypted at rest |

---

## Features

### Monitoring
- **Failed Login Detection** — polls Windows Security Log for Event ID 4625
- **Webcam Capture** — takes photo evidence automatically on each incident
- **USB Monitoring** — detects device connect/remove with 3-second debounce to prevent duplicate events
- **App Snapshot** — captures all running processes at the time of each incident

### Dashboard Pages
- **Overview** — metric cards, 7-day incident bar chart, live activity feed, security status panel
- **Incidents** — full table with timestamps, usernames, failure reasons, evidence count
- **Incident Detail** — photo strip with lightbox, running apps at time of incident, nearby USB events (±5 min)
- **USB Activity** — filterable table (by date range and event type), search, auto-refreshes every 30s
- **Applications** — flat list or grouped-by-app view of all captured processes
- **Gallery** — photo grid with lightbox, keyboard navigation (← →)
- **Analytics** — incidents and USB trends over 7/14/30 days, hourly distribution chart, failure reason breakdown
- **Settings** — system info, DB stats, session token, sign out

### Security
- TOTP authentication (compatible with Google Authenticator, Authy)
- 8-hour session tokens stored in-memory on the backend
- API only exposed over Tailscale — no public internet access
- AES-256 photo encryption at rest

---

## Project Structure

```
LaptopGaurd/
├── LaptopGuard.Core/           # .NET class library
│   ├── Database.cs             # All SQLite queries
│   └── Models/
│       ├── Incident.cs
│       ├── UsbEvent.cs
│       └── AppEvent.cs
├── LaptopGuard.Service/        # Windows Service
│   ├── Worker.cs               # Main event loop
│   ├── EventMonitor.cs         # Event ID 4625 watcher
│   ├── CameraCapture.cs        # Webcam capture
│   ├── UsbMonitor.cs           # USB insert/remove via WMI
│   └── AppMonitor.cs           # Process snapshot
├── LaptopGuard.Web/            # ASP.NET Minimal API
│   └── Program.cs              # All API endpoints + session auth
└── laptopguard-dashboard/      # Next.js frontend
    ├── app/                    # App Router pages
    ├── components/layout/      # DashboardShell, Sidebar, Topbar
    └── lib/api.ts              # All fetch calls
```

---

## API Endpoints

All endpoints (except `/photo`) require `?token=SESSION_TOKEN`.

```
POST /api/verify              → authenticate with TOTP code
GET  /api/stats               → { total, today, photos }
GET  /api/incidents           → Incident[]
GET  /api/incidents/{id}      → Incident (with photos + apps)
GET  /api/usb                 → UsbEvent[]
GET  /api/apps                → AppEvent[]
GET  /api/apps/{incidentId}   → AppEvent[] for specific incident
GET  /photo/{filename}        → image/jpeg (public, no auth)
```

---

## Running Locally

**Prerequisites:**
- Windows 10/11
- .NET 10 SDK
- Node.js 18+
- Tailscale installed and connected
- Google Authenticator (or any TOTP app)

**Setup:**
```powershell
# 1. Clone the repo
git clone https://github.com/vanshdev0101/LaptopGaurd.git
cd LaptopGaurd

# 2. Generate OTP secret (run once)
dotnet run --project LaptopGuard.Service --setup

# 3. Scan the QR code with Google Authenticator
```

**Running:**
```powershell
# Terminal 1 — Backend API
dotnet run --project LaptopGuard.Web

# Terminal 2 — Frontend
cd laptopguard-dashboard
npm install
npm run dev

# Terminal 3 — Windows Service (monitoring)
dotnet run --project LaptopGuard.Service
```

Open `http://localhost:3001` and log in with your TOTP code.

---

## Data Storage

| Type | Location |
|---|---|
| Database | `C:\ProgramData\LaptopGuard\laptopguard.db` |
| Photos | `C:\ProgramData\LaptopGuard\Photos\` |
| OTP Secret | `C:\ProgramData\LaptopGuard\otp.secret` |

---

## Known Limitations

- Single-machine only — monitors the machine it runs on
- Session tokens are in-memory — backend restart invalidates all sessions
- USB device names depend on Windows driver quality — generic devices show as "USB Device"
- No push notifications — dashboard requires manual check or auto-refresh

---

## Built With

- [ASP.NET Core](https://dotnet.microsoft.com/en-us/apps/aspnet) — backend API
- [Next.js](https://nextjs.org/) — frontend framework
- [Tailscale](https://tailscale.com/) — secure remote access
- [Otp.NET](https://github.com/kspearrin/Otp.NET) — TOTP authentication
- [Recharts](https://recharts.org/) — dashboard charts
- [Microsoft.Data.Sqlite](https://docs.microsoft.com/en-us/dotnet/standard/data/sqlite/) — local database

---

## Author

**Vansh Rajput**  
B.Tech CSE (AI/ML) — SRM Institute of Science and Technology  
[GitHub](https://github.com/vanshdev0101) · [Portfolio](https://vansh-portfoli.vercel.app)