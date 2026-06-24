export interface Incident {
    id: number;
    timestamp: string;
    username: string;
    logonType: number;
    failureReason: string;
    eventRecordId: number;
    uploaded: boolean;
    photos: string[];
    photoHashes: string[];
}

export interface UsbEvent {
    id: number;
    timestamp: string;
    eventType: string;
    deviceName: string;
    deviceType: string;
    vendorId: string;
    productId: string;
    serialNumber: string;
    driveLetter: string;
    duringIncident: boolean;
}

export interface AppEvent {
    id: number;
    timestamp: string;
    appName: string;
    executablePath: string;
    publisher: string;
    processId: number;
    incidentId: number;
}

export interface Stats {
    total: number;
    today: number;
    usbCount: number;
    photos: number;
}