/**
 * Utility functions for the dashboard
 */

import { HealthAlert, UserClassification, SensorData, Alert } from '@/types';

/**
 * Get severity level and color based on AQI value
 */
export const getAQISeverity = (aqi: number): {
  level: 'SAFE' | 'CAUTION' | 'WARNING' | 'DANGER';
  color: string;
  bgColor: string;
  textColor: string;
  description: string;
} => {
  if (aqi <= 50) {
    return {
      level: 'SAFE',
      color: '#4CAF50',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700',
      description: 'Good - Air quality is satisfactory',
    };
  }
  if (aqi <= 100) {
    return {
      level: 'CAUTION',
      color: '#F2A65A',
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-700',
      description: 'Moderate - Some members of the general public may experience health effects',
    };
  }
  if (aqi <= 150) {
    return {
      level: 'WARNING',
      color: '#F2A65A',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-700',
      description: 'Unhealthy for Sensitive Groups - Members of sensitive groups may experience health effects',
    };
  }
  return {
    level: 'DANGER',
    color: '#D95D39',
    bgColor: 'bg-red-50',
    textColor: 'text-red-700',
    description: 'Unhealthy - General public may begin to experience health effects; members of sensitive groups may experience more serious health effects',
  };
};

/**
 * Get PM2.5 severity
 */
export const getPM25Severity = (pm25: number): {
  level: string;
  color: string;
  description: string;
} => {
  if (pm25 <= 12) return { level: 'Good', color: '#4CAF50', description: 'Good air quality' };
  if (pm25 <= 35.4) return { level: 'Moderate', color: '#F2A65A', description: 'Moderate air quality' };
  if (pm25 <= 55.4) return { level: 'Unhealthy for Sensitive', color: '#F2A65A', description: 'Unhealthy for sensitive groups' };
  if (pm25 <= 150.4) return { level: 'Unhealthy', color: '#D95D39', description: 'Unhealthy' };
  if (pm25 <= 250.4) return { level: 'Very Unhealthy', color: '#9C27B0', description: 'Very unhealthy' };
  return { level: 'Hazardous', color: '#3F2C2C', description: 'Hazardous' };
};

/**
 * Format timestamp to readable format
 */
export const formatTime = (timestamp: string): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString();
};

/**
 * Format timestamp to full datetime
 */
export const formatDateTime = (timestamp: string): string => {
  const date = new Date(timestamp);
  return date.toLocaleString();
};

/**
 * Format number with appropriate decimal places
 */
export const formatNumber = (value: number | undefined | null, decimals: number = 1): string => {
  if (value === undefined || value === null) return 'N/A';
  return value.toFixed(decimals);
};

/**
 * Get health alert icon based on level
 */
export const getHealthAlertIcon = (level: string): string => {
  switch (level) {
    case 'SAFE':
      return '✓';
    case 'CAUTION':
      return '⚠';
    case 'WARNING':
      return '⚠';
    case 'DANGER':
      return '✕';
    default:
      return '•';
  }
};

/**
 * Get classification display name
 */
export const getClassificationDisplayName = (classification: UserClassification): string => {
  const names: Record<UserClassification, string> = {
    asthma_patient: 'Asthma Patient',
    children: 'Children',
    elderly: 'Elderly',
    adults: 'Adults',
  };
  return names[classification] || classification;
};

/**
 * Get classification description
 */
export const getClassificationDescription = (classification: UserClassification): string => {
  const descriptions: Record<UserClassification, string> = {
    asthma_patient: 'Specialized thresholds for individuals with respiratory conditions',
    children: "Lower thresholds for children's developing lungs",
    elderly: 'Thresholds for seniors with age-related sensitivities',
    adults: 'Standard thresholds for healthy adults',
  };
  return descriptions[classification] || '';
};

/**
 * Calculate trend direction
 */
export const getTrend = (current: number, previous: number): {
  direction: 'up' | 'down' | 'stable';
  percentage: number;
} => {
  if (current === previous) {
    return { direction: 'stable', percentage: 0 };
  }
  const percentage = Math.abs(((current - previous) / previous) * 100);
  return {
    direction: current > previous ? 'up' : 'down',
    percentage: Math.round(percentage * 10) / 10,
  };
};

/**
 * Generate mock sensor data for demo purposes
 */
export const generateMockSensorData = () => {
  const now = new Date();
  return {
    id: Math.random().toString(36).substr(2, 9),
    timestamp: now.toISOString(),
    pm25: Math.floor(Math.random() * 150) + 5,
    aqi: Math.floor(Math.random() * 200) + 10,
    mq135_ppm: Math.floor(Math.random() * 800) + 100,
    correctedPPM: Math.floor(Math.random() * 600) + 80,
    aci: Math.random() * 100,
    uaqs: Math.random() * 100,
    cri: Math.random() * 100,
    temperature: Math.round((Math.random() * 15 + 15) * 10) / 10,
    humidity: Math.round((Math.random() * 40 + 30) * 10) / 10,
    lastUpdated: now.toISOString(),
  };
};

/**
 * Determine if health alert is critical
 */
export const isCriticalAlert = (alert: HealthAlert): boolean => {
  return alert.level === 'DANGER' || alert.level === 'WARNING';
};

/**
 * Get recommended actions based on alert level
 */
export const getRecommendedActions = (level: string): string[] => {
  switch (level) {
    case 'SAFE':
      return ['Continue normal activities', 'Enjoy the fresh air'];
    case 'CAUTION':
      return [
        'Unusually sensitive people should limit prolonged outdoor exertion',
        'Consider wearing a mask if sensitive to air quality',
      ];
    case 'WARNING':
      return [
        'Members of sensitive groups should limit prolonged outdoor exertion',
        'Wear an N95 or P100 mask if you must go outside',
        'Consider staying indoors',
        'Use air purifiers indoors',
      ];
    case 'DANGER':
      return [
        'Avoid outdoor activities',
        'Stay indoors as much as possible',
        'Use air purifiers with HEPA filters',
        'Wear protective masks (N95/P100) if you must go out',
        'Seek medical attention if experiencing symptoms',
      ];
    default:
      return [];
  }
};

/**
 * Normalize incoming sensor payloads from the server into the frontend SensorData shape.
 * Server may send timestamp as epoch ms or ISO string and include fields both in `data` and at top-level.
 */
export const normalizeSensorPayload = (payload: unknown): SensorData => {
  const top = (payload as Record<string, unknown>) || {};
  const inner = (top.data as Record<string, unknown>) || {};

  const timestampVal = top.timestamp ?? inner.timestamp;
  // Normalize timestamp: backend may send epoch ms or seconds; if numeric and less than 1e12 assume seconds and convert
  let ts: Date;
  if (typeof timestampVal === 'number') {
    const maybeMs = timestampVal < 1e12 ? timestampVal * 1000 : timestampVal;
    ts = new Date(maybeMs);
  } else {
    ts = new Date(String(timestampVal ?? Date.now()));
  }

  const toNumber = (v: unknown) => (v === undefined || v === null ? NaN : Number(v));

  const normalized: SensorData = {
    // SensorData types expect timestamp and lastUpdated as strings in this project
    timestamp: ts.toISOString(),
    lastUpdated: ts.toISOString(),
    pm25: toNumber(top.pm25 ?? inner.pm25),
    aqi: toNumber(top.aqi ?? inner.aqi),
    // Support common backend aliases: mq_score, mq135, corrected_ppm, temp
    mq135_ppm: toNumber(
      top.mq135_ppm ?? top.mq_score ?? inner.mq135_ppm ?? inner.mq135PPM ?? inner.mq135 ?? null
    ),
    correctedPPM: toNumber(top.correctedPPM ?? top.corrected_ppm ?? inner.correctedPPM ?? inner.corrected_ppm),
    aci: toNumber(top.aci ?? inner.aci),
    uaqs: toNumber(top.uaqs ?? inner.uaqs),
    cri: toNumber(top.cri ?? inner.cri),
    exposure: toNumber(top.exposure ?? inner.exposure),
    average_1h_UAQS: toNumber(
      top.average_1h_UAQS ?? inner.average_1h_UAQS ?? top.avg1h ?? inner.avg1h ?? null
    ),
    average_3h_UAQS: toNumber(
      top.average_3h_UAQS ?? inner.average_3h_UAQS ?? top.avg3h ?? inner.avg3h ?? null
    ),
    // Accept `temp` alias
    temperature: toNumber(top.temperature ?? top.temp ?? inner.temperature ?? inner.temp),
    humidity: toNumber(top.humidity ?? inner.humidity),
  } as unknown as SensorData;

  return normalized;
};

/**
 * Normalize incoming alert payloads from server to frontend Alert shape.
 * Maps triggerValues field names and ensures timestamps are ISO strings.
 */
export const normalizeAlertPayload = (payload: unknown): Alert => {
  const p = payload as Record<string, unknown>;
  const alert = (p?.alert as Record<string, unknown>) || p || {};
  const trigger = (alert.triggerValues as Record<string, unknown>) || (alert.trigger as Record<string, unknown>) || {};

  const triggerTimestamp = trigger.timestamp || alert.createdAt || Date.now();
  const ts = typeof triggerTimestamp === 'number' ? new Date(triggerTimestamp) : new Date(String(triggerTimestamp));

  const normalizedTrigger = {
    pm25: Number((trigger.pm25 as unknown) ?? (trigger['pm25'] as unknown) ?? NaN),
    aqi: Number((trigger.aqi as unknown) ?? (trigger['aqi'] as unknown) ?? NaN),
    mq135PPM: Number((trigger.mq135_ppm as unknown) ?? (trigger.mq135PPM as unknown) ?? NaN),
    aci: Number((trigger.aci as unknown) ?? NaN),
    uaqs: Number((trigger.uaqs as unknown) ?? NaN),
    ucri: Number((trigger.cri as unknown) ?? (trigger.ucri as unknown) ?? NaN),
    temperature: Number((trigger.temperature as unknown) ?? NaN),
    humidity: Number((trigger.humidity as unknown) ?? NaN),
    timestamp: ts.toISOString(),
  } as unknown as Alert['triggerValues'];

  const normalized: Alert = {
    _id: alert._id ?? alert.id ?? String(Math.random()),
    level: alert.level ?? alert.severity ?? 'MODERATE',
    type: alert.type ?? alert.alertType ?? 'AIR_QUALITY_ALERT',
    message: alert.message ?? alert.title ?? '',
  triggerValues: normalizedTrigger,
  exposureMetrics: (alert.exposureMetrics as Record<string, unknown>) ?? { exposure1h: 0, exposure3h: 0, cumulativeExposure: 0 },
  riskAssessment: (alert.riskAssessment as Record<string, unknown>) ?? { healthImplication: '', recommendation: '' },
    isAcknowledged: Boolean(alert.isAcknowledged ?? alert.acknowledged),
    cooldownUntil: alert.cooldownUntil ?? null,
    sensorDataId: alert.sensorDataId ?? alert.dataId ?? '',
  createdAt: new Date(String(alert.createdAt ?? Date.now())).toISOString(),
    expiresAt: alert.expiresAt ? new Date(String(alert.expiresAt)).toISOString() : undefined,
  } as unknown as Alert;

  return normalized;
};
