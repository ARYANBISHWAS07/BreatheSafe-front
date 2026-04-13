/**
 * Socket.IO Service Layer
 * Handles real-time WebSocket connections and events
 */

import { io, Socket } from 'socket.io-client';
import { SOCKET_URL, SOCKET_EVENTS } from '@/config/api';
import { SensorData, Alert, HealthAlert, SystemStatus, UserClassification } from '@/types';
import {
  normalizeSensorPayload,
  normalizeAlertPayload,
  normalizeHealthAlertPayload,
  toBackendClassification,
} from '@/lib/utils';

type SocketEventCallback<T> = (data: T) => void;
type ConnectionStatusCallback = (connected: boolean) => void;

class SocketService {
  private socket: Socket | null = null;
  private connectionCallbacks: ConnectionStatusCallback[] = [];
  private sensorUpdateCallbacks: SocketEventCallback<SensorData>[] = [];
  private alertCallbacks: SocketEventCallback<Alert>[] = [];
  private healthAlertCallbacks: SocketEventCallback<HealthAlert>[] = [];
  private systemStatusCallbacks: SocketEventCallback<SystemStatus>[] = [];
  private errorCallbacks: SocketEventCallback<{ message: string }>[] = [];

  /**
   * Initialize socket connection
   */
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // Debug: log connection attempt so we can verify client is trying to connect
        console.log('[Socket] Attempting to connect to', SOCKET_URL);
        this.socket = io(SOCKET_URL, {
          transports: ['websocket', 'polling'],
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          reconnectionAttempts: 10,
          withCredentials: true,
        });

        // Connection event
        this.socket.on('connect', () => {
          console.log('[Socket] connected, id=', this.socket?.id);
          // Re-subscribe on every successful connect (initial and reconnect)
          try {
            this.subscribeSensorUpdates();
            this.subscribeAlerts();
          } catch {
            // swallow
          }
          this.notifyConnectionStatus(true);
          resolve();
        });

        // Disconnection event
        this.socket.on('disconnect', (reason?: string) => {
          console.log('[Socket] disconnected, reason=', reason);
          this.notifyConnectionStatus(false);
        });

        // Connection confirmation
        this.socket.on(SOCKET_EVENTS.CONNECTION_CONFIRMATION, (data: Record<string, unknown>) => {
          console.log('Connection confirmed:', data);
        });

        // Subscription confirmed
        this.socket.on(SOCKET_EVENTS.SUBSCRIPTION_CONFIRMED, (data: Record<string, unknown>) => {
          console.log('Subscription confirmed:', data);
        });

        // Sensor updates
        this.socket.on(SOCKET_EVENTS.SENSOR_UPDATE, (data: unknown) => {
          try {
            // Optionally log raw payload for debugging (enable by setting NEXT_PUBLIC_DEBUG_RAW=true)
            if (process.env.NEXT_PUBLIC_DEBUG_RAW === 'true') {
              console.log('[Socket][raw] sensor-update payload:', data);
            }
            const normalized = normalizeSensorPayload(data);
            console.log('🔴 [Socket] Sensor Update received:', normalized);
            this.notifySensorUpdate(normalized);
          } catch (err) {
            console.warn('Failed to normalize sensor payload', err, data);
          }
        });

        // Alert triggered
        this.socket.on(SOCKET_EVENTS.ALERT_TRIGGERED, (data: unknown) => {
          try {
            if (process.env.NEXT_PUBLIC_DEBUG_RAW === 'true') {
              console.log('[Socket][raw] alert-triggered payload:', data);
            }
            const normalized = normalizeAlertPayload(data);
            console.log('🟡 [Socket] Alert Triggered received:', normalized);
            this.notifyAlert(normalized);
          } catch (err) {
            console.warn('Failed to normalize alert payload', err, data);
          }
        });

        const handleHealthAlertEvent = (data: unknown) => {
          try {
            if (process.env.NEXT_PUBLIC_DEBUG_RAW === 'true') {
              console.log('[Socket][raw] health-alert payload:', data);
            }
            const normalized = normalizeHealthAlertPayload(data);
            console.log('🟠 [Socket] Health Alert received:', normalized);
            this.notifyHealthAlert(normalized);
          } catch (err) {
            console.warn('Failed to normalize health alert payload', err, data);
          }
        };

        // Health alert emits are currently inconsistent in backend, so listen to both names.
        this.socket.on(SOCKET_EVENTS.HEALTH_ALERT, handleHealthAlertEvent);
        this.socket.on(SOCKET_EVENTS.HEALTH_ALERT_UNDERSCORE, handleHealthAlertEvent);

        // System status
        this.socket.on(SOCKET_EVENTS.SYSTEM_STATUS, (data: SystemStatus) => {
          console.log('🟢 [Socket] System Status received:', data);
          this.notifySystemStatus(data);
        });

        // Error
        this.socket.on(SOCKET_EVENTS.ERROR, (data: { message: string }) => {
          console.error('Socket error:', data);
          this.notifyError(data);
        });

        // Connection error
        this.socket.on('connect_error', (error: Error) => {
          console.error('[Socket] connect_error:', error);
          reject(error);
        });

        // On reconnect attempts, ensure we re-subscribe when connected (socket.io fires 'connect' after successful reconnect)
        this.socket.on('reconnect', (attempt: number) => {
          console.log(`Socket reconnected after ${attempt} attempts, re-subscribing...`);
          try {
            this.subscribeSensorUpdates();
            this.subscribeAlerts();
          } catch {
            // ignore
          }
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Disconnect socket
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  /**
   * Check if socket is connected
   */
  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  /**
   * Get socket ID
   */
  getSocketId(): string | undefined {
    return this.socket?.id;
  }

  // ============== SUBSCRIPTIONS ==============

  /**
   * Subscribe to sensor updates
   */
  subscribeSensorUpdates(): void {
    if (this.socket) {
      console.log('📡 [Socket] Subscribing to sensor updates...');
      this.socket.emit(SOCKET_EVENTS.SUBSCRIBE_SENSOR_UPDATES);
    }
  }

  /**
   * Subscribe to alerts
   */
  subscribeAlerts(): void {
    if (this.socket) {
      console.log('📡 [Socket] Subscribing to alerts...');
      this.socket.emit(SOCKET_EVENTS.SUBSCRIBE_ALERTS);
    }
  }

  /**
   * Subscribe to health alerts for a classification
   */
  subscribeHealthAlerts(classification: UserClassification): void {
    if (this.socket) {
      console.log('📡 [Socket] Subscribing to health alerts for classification:', classification);
      this.socket.emit(SOCKET_EVENTS.SUBSCRIBE_HEALTH_ALERTS, {
        classification: toBackendClassification(classification),
      });
    }
  }

  /**
   * Unsubscribe from all events
   */
  unsubscribe(): void {
    if (this.socket) {
      this.socket.emit(SOCKET_EVENTS.UNSUBSCRIBE);
    }
  }

  // ============== REQUESTS ==============

  /**
   * Request latest sensor data
   */
  requestLatestSensorData(): void {
    if (this.socket) {
      this.socket.emit(SOCKET_EVENTS.REQUEST_LATEST_SENSOR_DATA);
    }
  }

  /**
   * Request system status
   */
  requestSystemStatus(): void {
    if (this.socket) {
      this.socket.emit(SOCKET_EVENTS.REQUEST_SYSTEM_STATUS);
    }
  }

  // ============== EVENT LISTENERS ==============

  /**
   * Listen for connection status changes
   */
  onConnectionStatusChange(callback: ConnectionStatusCallback): () => void {
    this.connectionCallbacks.push(callback);
    return () => {
      this.connectionCallbacks = this.connectionCallbacks.filter((cb) => cb !== callback);
    };
  }

  /**
   * Listen for sensor updates
   */
  onSensorUpdate(callback: SocketEventCallback<SensorData>): () => void {
    this.sensorUpdateCallbacks.push(callback);
    return () => {
      this.sensorUpdateCallbacks = this.sensorUpdateCallbacks.filter((cb) => cb !== callback);
    };
  }

  /**
   * Listen for alerts
   */
  onAlert(callback: SocketEventCallback<Alert>): () => void {
    this.alertCallbacks.push(callback);
    return () => {
      this.alertCallbacks = this.alertCallbacks.filter((cb) => cb !== callback);
    };
  }

  /**
   * Listen for health alerts
   */
  onHealthAlert(callback: SocketEventCallback<HealthAlert>): () => void {
    this.healthAlertCallbacks.push(callback);
    return () => {
      this.healthAlertCallbacks = this.healthAlertCallbacks.filter((cb) => cb !== callback);
    };
  }

  /**
   * Listen for system status
   */
  onSystemStatus(callback: SocketEventCallback<SystemStatus>): () => void {
    this.systemStatusCallbacks.push(callback);
    return () => {
      this.systemStatusCallbacks = this.systemStatusCallbacks.filter((cb) => cb !== callback);
    };
  }

  /**
   * Listen for errors
   */
  onError(callback: SocketEventCallback<{ message: string }>): () => void {
    this.errorCallbacks.push(callback);
    return () => {
      this.errorCallbacks = this.errorCallbacks.filter((cb) => cb !== callback);
    };
  }

  // ============== PRIVATE NOTIFY METHODS ==============

  private notifyConnectionStatus(connected: boolean): void {
    this.connectionCallbacks.forEach((cb) => cb(connected));
  }

  private notifySensorUpdate(data: SensorData): void {
    this.sensorUpdateCallbacks.forEach((cb) => cb(data));
  }

  private notifyAlert(data: Alert): void {
    this.alertCallbacks.forEach((cb) => cb(data));
  }

  private notifyHealthAlert(data: HealthAlert): void {
    this.healthAlertCallbacks.forEach((cb) => cb(data));
  }

  private notifySystemStatus(data: SystemStatus): void {
    this.systemStatusCallbacks.forEach((cb) => cb(data));
  }

  private notifyError(data: { message: string }): void {
    this.errorCallbacks.forEach((cb) => cb(data));
  }
}

export const socketService = new SocketService();
