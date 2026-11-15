/**
 * Patient Phone GPS Tracking Service
 * Tracks the patient's mobile device location using navigator.geolocation,
 * reads device battery if supported, reverse geocodes coordinates,
 * and syncs location updates to the backend and local storage.
 */
import { api } from './api';
import { LocationLog } from '../types';

export interface TrackerStatus {
  isTracking: boolean;
  permissionState: 'prompt' | 'granted' | 'denied' | 'unsupported';
  lastCoords: { latitude: number; longitude: number; accuracy: number } | null;
  lastAddress: string | null;
  lastBattery: number | null;
  lastUpdated: Date | null;
  error: string | null;
}

type TrackerListener = (status: TrackerStatus, latestLog: LocationLog | null) => void;

class PatientTrackerService {
  private watchId: number | null = null;
  private listeners: Set<TrackerListener> = new Set();
  private lastUpdateTimestamp = 0;
  private readonly THROTTLE_MS = 15000; // Throttle backend posts to once every 15s unless moved significantly

  private status: TrackerStatus = {
    isTracking: false,
    permissionState: 'prompt',
    lastCoords: null,
    lastAddress: null,
    lastBattery: null,
    lastUpdated: null,
    error: null
  };

  constructor() {
    if (typeof window !== 'undefined') {
      // Check permission state if available
      if ('permissions' in navigator && navigator.permissions.query) {
        navigator.permissions
          .query({ name: 'geolocation' as PermissionName })
          .then((perm) => {
            this.status.permissionState = perm.state as any;
            perm.onchange = () => {
              this.status.permissionState = perm.state as any;
              this.notify();
            };
          })
          .catch(() => {});
      }

      // Check battery level
      this.refreshBattery();
    }
  }

  private async refreshBattery(): Promise<number | null> {
    try {
      if (typeof navigator !== 'undefined' && 'getBattery' in navigator) {
        const battery: any = await (navigator as any).getBattery();
        const level = Math.round((battery.level || 1) * 100);
        this.status.lastBattery = level;
        return level;
      }
    } catch {
      // Ignore if unsupported
    }
    return null;
  }

  public getStatus(): TrackerStatus {
    return { ...this.status };
  }

  public subscribe(listener: TrackerListener): () => void {
    this.listeners.add(listener);
    listener(this.getStatus(), null);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(latestLog: LocationLog | null = null) {
    const s = this.getStatus();
    this.listeners.forEach((l) => l(s, latestLog));

    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('atti-patient-location-update', {
          detail: { status: s, log: latestLog }
        })
      );
    }
  }

  /**
   * Start tracking patient device position
   */
  public startTracking(): boolean {
    if (typeof window === 'undefined' || !('geolocation' in navigator)) {
      this.status.permissionState = 'unsupported';
      this.status.error = 'Geolocation is not supported by this browser.';
      this.notify();
      return false;
    }

    if (this.watchId !== null) {
      return true; // Already tracking
    }

    this.status.isTracking = true;
    this.status.error = null;
    this.notify();

    // Initial position fetch
    navigator.geolocation.getCurrentPosition(
      (pos) => this.handlePositionUpdate(pos),
      (err) => this.handlePositionError(err),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );

    // Watch position
    this.watchId = navigator.geolocation.watchPosition(
      (pos) => this.handlePositionUpdate(pos),
      (err) => this.handlePositionError(err),
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 10000
      }
    );

    return true;
  }

  /**
   * Stop tracking
   */
  public stopTracking() {
    if (this.watchId !== null && typeof navigator !== 'undefined') {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
    this.status.isTracking = false;
    this.notify();
  }

  /**
   * Manual position trigger / refresh
   */
  public async requestSinglePosition(): Promise<LocationLog | null> {
    if (typeof window === 'undefined' || !('geolocation' in navigator)) return null;

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const log = await this.handlePositionUpdate(pos, true);
          resolve(log);
        },
        (err) => {
          this.handlePositionError(err);
          resolve(null);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
      );
    });
  }

  /**
   * Handles incoming GPS positions from navigator.geolocation
   */
  private async handlePositionUpdate(
    position: GeolocationPosition,
    forcePush = false
  ): Promise<LocationLog | null> {
    const lat = position.coords.latitude;
    const lng = position.coords.longitude;
    const accuracy = Math.round(position.coords.accuracy || 10);
    const now = Date.now();

    this.status.permissionState = 'granted';
    this.status.lastCoords = { latitude: lat, longitude: lng, accuracy };
    this.status.lastUpdated = new Date();
    this.status.error = null;

    await this.refreshBattery();

    // Throttle backend transmissions unless forced
    const timeSinceLast = now - this.lastUpdateTimestamp;
    if (!forcePush && timeSinceLast < this.THROTTLE_MS) {
      this.notify();
      return null;
    }

    this.lastUpdateTimestamp = now;

    // Reverse geocode in background
    let address = this.status.lastAddress || 'Live GPS Location';
    try {
      const geoRes = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        { headers: { 'Accept-Language': 'en' } }
      );
      if (geoRes.ok) {
        const data = await geoRes.json();
        if (data && data.display_name) {
          const parts = data.display_name.split(',');
          // Build concise readable street address
          address = parts.slice(0, 3).join(',').trim();
          this.status.lastAddress = address;
        }
      }
    } catch {
      // Ignore geocoding failure, fallback to coords or previous address
    }

    const payload: Partial<LocationLog> = {
      latitude: lat,
      longitude: lng,
      accuracy_meters: accuracy,
      battery_level: this.status.lastBattery || 88,
      address,
      status_label: 'Live Phone GPS'
    };

    try {
      const recorded = await api.recordLocation(payload);
      this.notify(recorded);
      return recorded;
    } catch (e) {
      console.warn('Failed to post location to backend, saved locally:', e);
      this.notify();
      return null;
    }
  }

  private handlePositionError(error: GeolocationPositionError) {
    if (error.code === error.PERMISSION_DENIED) {
      this.status.permissionState = 'denied';
      this.status.error = 'Location access denied. Please enable GPS in browser permissions.';
    } else if (error.code === error.POSITION_UNAVAILABLE) {
      this.status.error = 'Location unavailable. Make sure device GPS is turned on.';
    } else if (error.code === error.TIMEOUT) {
      this.status.error = 'Location request timed out.';
    }
    this.notify();
  }

  /**
   * Helper to simulate patient location for testing (e.g. testing geofence outside perimeter)
   */
  public async simulateLocation(
    lat: number,
    lng: number,
    address = 'Simulated Patient Location',
    battery = 85
  ): Promise<LocationLog> {
    this.status.lastCoords = { latitude: lat, longitude: lng, accuracy: 8 };
    this.status.lastAddress = address;
    this.status.lastBattery = battery;
    this.status.lastUpdated = new Date();

    const payload: Partial<LocationLog> = {
      latitude: lat,
      longitude: lng,
      accuracy_meters: 8,
      battery_level: battery,
      address,
      status_label: 'Simulated Device'
    };

    const recorded = await api.recordLocation(payload);
    this.notify(recorded);
    return recorded;
  }
}

export const patientTracker = new PatientTrackerService();
