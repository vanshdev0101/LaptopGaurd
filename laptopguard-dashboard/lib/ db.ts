import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = 'C:\\ProgramData\\LaptopGuard\\laptopguard.db';

let db: Database.Database;

export function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH, { readonly: true });
  }
  return db;
}

export interface Incident {
  Id: number;
  Timestamp: string;
  Username: string;
  LogonType: number;
  FailureReason: string;
  EventRecordId: number;
  Uploaded: number;
  PhotoPaths: string;
  PhotoHashes: string;
}

export interface UsbEvent {
  Id: number;
  Timestamp: string;
  EventType: string;
  DeviceName: string;
  DeviceType: string;
  VendorId: string;
  ProductId: string;
  SerialNumber: string;
  DriveLetter: string;
  DuringIncident: number;
}

export interface AppEvent {
  Id: number;
  Timestamp: string;
  AppName: string;
  ExecutablePath: string;
  Publisher: string;
  ProcessId: number;
  IncidentId: number;
}

export function getAllIncidents(): Incident[] {
  return getDb()
    .prepare('SELECT * FROM Incidents ORDER BY Timestamp DESC')
    .all() as Incident[];
}

export function getIncidentById(id: number): Incident | undefined {
  return getDb()
    .prepare('SELECT * FROM Incidents WHERE Id = ?')
    .get(id) as Incident | undefined;
}

export function getTotalCount(): number {
  const row = getDb()
    .prepare('SELECT COUNT(*) as count FROM Incidents')
    .get() as { count: number };
  return row.count;
}

export function getTodayCount(): number {
  const row = getDb()
    .prepare("SELECT COUNT(*) as count FROM Incidents WHERE DATE(Timestamp) = DATE('now')")
    .get() as { count: number };
  return row.count;
}

export function getUsbEvents(limit = 50): UsbEvent[] {
  return getDb()
    .prepare('SELECT * FROM UsbEvents ORDER BY Timestamp DESC LIMIT ?')
    .all(limit) as UsbEvent[];
}

export function getAppEvents(limit = 50): AppEvent[] {
  return getDb()
    .prepare('SELECT * FROM AppEvents ORDER BY Timestamp DESC LIMIT ?')
    .all(limit) as AppEvent[];
}

export function getAppEventsByIncident(incidentId: number): AppEvent[] {
  return getDb()
    .prepare('SELECT * FROM AppEvents WHERE IncidentId = ? ORDER BY Timestamp DESC')
    .all(incidentId) as AppEvent[];
}

export function getPhotoCount(): number {
  const fs = require('fs');
  const photoDir = 'C:\\ProgramData\\LaptopGuard\\Photos';
  try {
    return fs.readdirSync(photoDir).filter((f: string) => f.endsWith('.jpg')).length;
  } catch {
    return 0;
  }
}