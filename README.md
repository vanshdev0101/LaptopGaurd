# LaptopGuard

LaptopGuard is a Windows security monitoring application designed to detect failed Windows login attempts, capture evidence using the system webcam, and securely store incident information for later review.

The application monitors Windows Security Event Logs and automatically creates incident records whenever a failed authentication attempt is detected.

## Features

### Current Features

* Monitor Windows Security Event ID 4625 (Failed Login)
* SQLite-based incident storage
* SHA-256 evidence hashing
* AES file encryption support
* Centralized application configuration
* Modular architecture using .NET projects
* Git version control support

### Planned Features

* Webcam photo capture on failed login
* Multi-frame evidence collection
* Face detection
* Google Drive evidence backup
* WPF dashboard
* Live activity monitoring
* Service auto-start and recovery
* Evidence integrity verification
* Dashboard authentication
* Incident reporting and export

---

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
│   ├── Event Monitoring
│   ├── Camera Capture
│   ├── Background Processing
│   └── Incident Creation
│
└── LaptopGuard.UI
    ├── Dashboard
    ├── Photo Gallery
    ├── Activity Logs
    └── System Controls
```

---

## Technology Stack

### Backend

* C#
* .NET
* Windows Service
* SQLite

### Security

* SHA-256
* AES Encryption

### Monitoring

* Windows Event Logs
* Event ID 4625

### User Interface

* WPF

### Future Integrations

* OpenCV
* Google Drive API

---

## Project Structure

```text
LaptopGuard/
│
├── LaptopGuard.Core/
│   ├── AppConfig.cs
│   ├── Database.cs
│   ├── Incident.cs
│   └── SecurityHelper.cs
│
├── LaptopGuard.Service/
│   ├── EventMonitor.cs
│   ├── Worker.cs
│   └── Program.cs
│
├── LaptopGuard.UI/
│
├── .gitignore
└── LaptopGuard.slnx
```

---

## Current Development Status

### Core Layer

Completed:

* Incident Model
* SQLite Database Layer
* SHA-256 Hashing
* AES Encryption Utilities
* Configuration System

### Service Layer

In Progress:

* Event Monitoring
* Failed Login Detection

### UI Layer

Not Started

---

## Planned Workflow

```text
Failed Windows Login
          │
          ▼
   Event ID 4625
          │
          ▼
    Event Monitor
          │
          ▼
    Capture Photos
          │
          ▼
    Generate Hash
          │
          ▼
     Encrypt Data
          │
          ▼
    Save Incident
          │
          ▼
   Upload Evidence
          │
          ▼
  Update Dashboard
```

---

## Security Goals

* Detect unauthorized access attempts
* Preserve evidence integrity
* Prevent evidence tampering
* Maintain encrypted local storage
* Provide off-device backups
* Operate independently as a Windows Service

---

## Roadmap

### Phase 1

* Complete Core Layer
* Complete Event Monitoring

### Phase 2

* Implement Camera Capture
* Integrate Worker Service
* Validate End-to-End Pipeline

### Phase 3

* Build WPF Dashboard
* Add Incident Management Features

### Phase 4

* Google Drive Synchronization
* Face Detection
* Advanced Security Controls

---

## License

This project is currently under active development.
