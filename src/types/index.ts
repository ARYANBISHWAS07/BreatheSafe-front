/**
 * Type definitions for the Air Quality Monitoring Dashboard
 */

// Sensor data types
export interface SensorReading {
  id?: string;
  timestamp: string;
  pm25: number;
  aqi: number;
  mq_score?: number;
  mq135_ppm: number;
  correctedPPM: number;
  aci: number;
  uaqs: number;
  cri: number;
  temperature: number;
  humidity: number;
  exposure?: number;
  average_1h_UAQS?: number;
  average_3h_UAQS?: number;
}

export interface SensorData extends SensorReading {
  lastUpdated: string;
}

// Alert types
export interface Alert {
  _id: string;
  id?: string;
  level: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  type: 'AIR_QUALITY_ALERT' | 'HEALTH_ALERT' | string;
  classification?: UserClassification | null;
  title?: string;
  message: string;
  recommendations?: string;
  potentialHealthEffects?: string[];
  breachedMetrics?: Array<{
    metric: string;
    value: number;
    severity?: string;
    threshold?: number;
  }>;
  triggerValues: {
    pm25?: number;
    aqi?: number;
    mq_score?: number;
    mq135PPM?: number;
    mq135_ppm?: number;
    aci?: number;
    uaqs?: number;
    ucri?: number;
    cri?: number;
    temperature?: number;
    humidity?: number;
    timestamp?: string;
  };
  exposureMetrics?: {
    exposure1h?: number;
    exposure3h?: number;
    cumulativeExposure?: number;
  };
  riskAssessment?: {
    healthImplication?: string;
    recommendation?: string;
    affectedClassification?: string;
  };
  isAcknowledged: boolean;
  acknowledgedAt?: string | null;
  acknowledgedBy?: string | null;
  cooldownUntil?: string | null;
  sensorDataId?: string;
  createdAt: string;
  expiresAt?: string;
  severity?: 'INFO' | 'WARNING' | 'DANGER';
}

export interface HealthAlert {
  _id?: string;
  id?: string;
  classification?: UserClassification;
  classificationDisplayName?: string;
  title?: string;
  timestamp?: string;
  level: 'LOW' | 'MODERATE' | 'HIGH' | 'SAFE' | 'CAUTION' | 'WARNING' | 'DANGER';
  metric?: string;
  value?: number;
  threshold?: number;
  message: string;
  recommendation?: string;
  recommendations?: string;
  healthEffects?: string[];
  potentialHealthEffects?: string[];
  breachedMetrics?: Array<{
    metric: string;
    value: number;
    severity?: string;
    threshold?: number;
  }>;
  riskAssessment?: {
    healthImplication?: string;
    recommendation?: string;
    affectedClassification?: string;
  };
  acknowledged?: boolean;
  isAcknowledged?: boolean;
  acknowledgedAt?: string;
}

export interface AlertStats {
  total: number;
  acknowledged: number;
  unacknowledged: number;
  byLevel: {
    LOW: number;
    MODERATE: number;
    HIGH: number;
  };
}

// User classification types used in the frontend
export type UserClassification = 'asthma' | 'child' | 'old' | 'adult';

// Backend classification types exposed by existing APIs
export type BackendUserClassification = 'asthma_patient' | 'children' | 'elderly' | 'adults';

export interface ClassificationThreshold {
  metric: string;
  safe: number;
  caution: number;
  warning: number;
  danger: number;
}

export interface ClassificationConfig {
  classification: UserClassification;
  thresholds: ClassificationThreshold[];
  displayName: string;
  description: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  classification: UserClassification;
  createdAt: string;
  updatedAt: string;
}

// Statistics types
export interface Statistics {
  timestamp: string;
  averageAQI: number;
  maxPM25: number;
  minPM25: number;
  averageTemperature: number;
  averageHumidity: number;
  alertCount: number;
  healthAlertCount: number;
}

// System status
export interface SystemStatus {
  connected: boolean;
  database: 'connected' | 'disconnected' | 'error';
  sensorConnection: 'connected' | 'disconnected' | 'error';
  lastUpdate: string;
  uptime: number;
}

// Pagination types
export interface PaginatedResponse<T> {
  data: T[];
  pagination?: {
    limit: number;
    skip: number;
    count: number;
  };
  total?: number;
  limit?: number;
  skip?: number;
}

// API Response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
