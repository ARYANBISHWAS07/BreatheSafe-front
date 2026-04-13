/**
 * API Configuration
 * Centralized API endpoint and configuration
 */

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
export const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000';

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
  SYSTEM_STATUS: 'system-status',
  ERROR: 'error',
};
