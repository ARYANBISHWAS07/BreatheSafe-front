/**
 * API Configuration
 * Centralized API endpoint and configuration
 */

// Default backend target is :3000. Frontend app runs on :3001 (see package.json scripts).
// Override in .env.local for your backend host/port.
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
export const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000';

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '::1']);

const toUrl = (value: string): URL | null => {
  try {
    return new URL(value);
  } catch {
    return null;
  }
};

/**
 * Returns startup warnings for likely frontend/backend target misconfiguration.
 */
export const getBackendStartupWarnings = (frontendOrigin?: string): string[] => {
  const warnings: string[] = [];
  const apiUrl = toUrl(API_BASE_URL);
  const socketUrl = toUrl(SOCKET_URL);
  const frontendUrl = frontendOrigin ? toUrl(frontendOrigin) : null;

  if (!apiUrl) {
    warnings.push(`Invalid NEXT_PUBLIC_API_URL: "${API_BASE_URL}"`);
  }
  if (!socketUrl) {
    warnings.push(`Invalid NEXT_PUBLIC_SOCKET_URL: "${SOCKET_URL}"`);
  }

  if (!frontendUrl || !apiUrl || !socketUrl) {
    return warnings;
  }

  const frontendIsLocal = LOCAL_HOSTS.has(frontendUrl.hostname);
  const apiIsLocal = LOCAL_HOSTS.has(apiUrl.hostname);
  const socketIsLocal = LOCAL_HOSTS.has(socketUrl.hostname);
  const apiHitsFrontendOrigin = frontendUrl.origin === apiUrl.origin;
  const socketHitsFrontendOrigin = frontendUrl.origin === socketUrl.origin;

  if (frontendIsLocal && apiIsLocal && socketIsLocal && apiHitsFrontendOrigin && socketHitsFrontendOrigin) {
    warnings.push(
      `Frontend origin (${frontendUrl.origin}) matches API/socket target. If backend is separate, run frontend on a different port and keep NEXT_PUBLIC_API_URL/NEXT_PUBLIC_SOCKET_URL on backend port.`
    );
  }

  return warnings;
};

export const API_ENDPOINTS = {
  // Sensor data
  DATA: '/api/data',
  HISTORY: '/api/history',
  STATISTICS: '/api/statistics',
  DATA_RANGE: '/api/data/range',

  // Alerts
  ALERTS: '/api/alerts',
  ALERTS_STATS: '/api/alerts/stats',
  ACKNOWLEDGE_ALERT: (id: string) => `/api/alerts/${id}/acknowledge`,

  // Health alerts
  HEALTH_ALERTS: '/api/health-alerts',
  HEALTH_ALERT_BY_ID: (id: string) => `/api/health-alerts/${id}`,
  HEALTH_ALERT_STATS: (classification: string) => `/api/health-alerts/stats/${classification}`,
  ACKNOWLEDGE_HEALTH_ALERT: (id: string) => `/api/health-alerts/${id}/acknowledge`,
  HEALTH_ALERTS_BY_USER: (userId: string) => `/api/health-alerts/by-user/${userId}`,
  HEALTH_ALERTS_UNACKNOWLEDGED: (classification: string) => `/api/health-alerts/classification/${classification}/unacknowledged`,

  // User & Classification
  USERS: '/api/users',
  USER_BY_ID: (id: string) => `/api/users/${id}`,
  AVAILABLE_CLASSIFICATIONS: '/api/users/classifications/available',
  USER_THRESHOLDS: (classification: string) => `/api/users/thresholds/${classification}`,
  CREATE_USER: '/api/users',
  GET_USER_BY_EMAIL: (email: string) => `/api/users/email/${email}`,
  UPDATE_USER: (id: string) => `/api/users/${id}`,
  GET_USERS_BY_CLASSIFICATION: (classification: string) => `/api/users/classification/${classification}`,
  UPDATE_ALERT_PREFERENCES: (id: string) => `/api/users/${id}/alert-preferences`,
  DELETE_USER: (id: string) => `/api/users/${id}`,
};

export const SOCKET_EVENTS = {
  // Client emits
  SUBSCRIBE_SENSOR_UPDATES: 'subscribe-sensor-updates',
  SUBSCRIBE_ALERTS: 'subscribe-alerts',
  SUBSCRIBE_HEALTH_ALERTS: 'subscribe-health-alerts',
  UNSUBSCRIBE: 'unsubscribe',
  REQUEST_LATEST_SENSOR_DATA: 'request-latest-sensor-data',
  REQUEST_SYSTEM_STATUS: 'request-system-status',

  // Server emits
  CONNECTION_CONFIRMATION: 'connection-confirmation',
  SUBSCRIPTION_CONFIRMED: 'subscription-confirmed',
  SENSOR_UPDATE: 'sensor-update',
  ALERT_TRIGGERED: 'alert-triggered',
  HEALTH_ALERT: 'health-alert',
  HEALTH_ALERT_UNDERSCORE: 'health_alert',
  SYSTEM_STATUS: 'system-status',
  ERROR: 'error',
};
