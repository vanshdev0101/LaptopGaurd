# LaptopGuard

LaptopGuard is a Windows endpoint security monitoring application that detects failed Windows login attempts, captures evidence, stores incident data, and provides a secure remote dashboard for incident review.

The system runs as a Windows Service, monitors Windows Security Event Logs, records authentication failures, captures evidence, and allows secure remote access through an OTP-protected web dashboard.

## Features

### Security Monitoring

* Monitor Windows Security Event ID 4625 (Failed Login)
* Automatic incident creation
* Timestamped event tracking
* Failed login history
* Secure OTP authentication

### Evidence Collection

* Webcam photo capture
* Multi-photo incident support
* Evidence hashing using SHA-256
* Encrypted local storage
* Incident photo gallery

### Dashboard

* OTP-protected access
* Incident log viewer
* Evidence gallery
* Incident preview panel
* Statistics dashboard
* Remote access through Tailscale

### Storage

* SQLite database
* Persistent incident history
* Secure evidence storage
* Configurable application settings

## Architecture

```text
LaptopGuard
│
├── LaptopGuard.Core
│   ├── Incident Models
│   ├── Database Layer
│   ├── Security Utilities
│   └── Configuration Management
│
├── LaptopGuard.Service
│   ├── Windows Event Monitoring
│   ├── Webcam Capture
│   ├── Incident Processing
│   └── Background Services
│
├── LaptopGuard.Web
│   ├── OTP Authentication
│   ├── Incident Dashboard
│   ├── Evidence Gallery
│   └── Statistics API
│
└── LaptopGuard.UI
    └── Future Desktop Interface
```

## Technology Stack

### Backend

* C#
* .NET
* ASP.NET Core Minimal API
* Windows Service

### Storage

* SQLite

### Security

* SHA-256 Hashing
* AES Encryption
* TOTP Authentication
* Google Authenticator Compatible

### Monitoring

* Windows Security Event Logs
* Event ID 4625 Monitoring

### Remote Access

* Tailscale

## Workflow

```text
Failed Windows Login
          │
          ▼
   Event ID 4625
          │
          ▼
  LaptopGuard Service
          │
          ▼
   Capture Evidence
          │
          ▼
   Generate Hashes
          │
          ▼
   Store Incident
          │
          ▼
    SQLite Database
          │
          ▼
     Web Dashboard
```

## Project Structure

```text
LaptopGuard/
│
├── LaptopGuard.Core/
├── LaptopGuard.Service/
├── LaptopGuard.Web/
├── LaptopGuard.UI/
│
├── LaptopGuard.slnx
└── README.md
```

## Security Objectives

* Detect unauthorized login attempts
* Preserve evidence integrity
* Prevent evidence tampering
* Maintain encrypted local storage
* Support secure remote monitoring
* Operate continuously as a Windows Service

## Future Enhancements

* Telegram notifications
* Real-time dashboard updates
* Face detection
* Multi-monitor screenshot capture
* Evidence export (PDF/CSV)
* Device health monitoring
* Google Drive backup
* USB activity monitoring

## License

This project is currently under active development.
