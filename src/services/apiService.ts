/**
 * API Service Layer
 * Handles all HTTP requests to the backend
 */

import axios, { AxiosInstance, AxiosError } from 'axios';
import { API_BASE_URL, API_ENDPOINTS, getBackendStartupWarnings } from '@/config/api';
import {
  SensorData,
  Alert,
  HealthAlert,
  PaginatedResponse,
  Statistics,
  UserClassification,
  ClassificationConfig,
  UserProfile,
} from '@/types';
import {
  normalizeSensorPayload,
  normalizeClassificationList,
  toBackendClassification,
  toFrontendClassification,
  normalizeHealthAlertPayload,
} from '@/lib/utils';

class ApiService {
  private client: AxiosInstance;

  constructor() {
    if (typeof window !== 'undefined') {
      const startupWarnings = getBackendStartupWarnings(window.location.origin);
      startupWarnings.forEach((warning) => console.warn(`[Config Warning] ${warning}`));
    }

    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response) {
          const responseData = error.response.data;
          const dataSummary =
            typeof responseData === 'string'
              ? responseData.slice(0, 180)
              : responseData;
          const isHtmlResponse =
            typeof responseData === 'string' &&
            /<!doctype html>|<html/i.test(responseData);

          // Server responded with error status
          console.error('API Error:', {
            status: error.response.status,
            url: error.config?.url,
            message: error.message,
            data: dataSummary,
            hint: isHtmlResponse
              ? 'Received HTML instead of JSON. Check NEXT_PUBLIC_API_URL points to backend, not Next.js frontend.'
              : undefined,
          });
        } else if (error.request) {
          // Request made but no response
          console.error('No response from server:', {
            url: error.config?.url,
            message: error.message,
          });
        } else {
          // Error in request setup
          console.error('API Request Error:', error.message);
        }
        throw error;
      }
    );
  }

  // ============== SENSOR DATA ==============

  /**
   * Get latest sensor reading
   */
  async getLatestSensorData(): Promise<SensorData | null> {
    try {
      console.log('[API] getLatestSensorData calling', API_ENDPOINTS.DATA);
      const response = await this.client.get<{ success: boolean; data: SensorData }>(
        API_ENDPOINTS.DATA
      );
      const raw = response.data.data;
      if (process.env.NEXT_PUBLIC_DEBUG_RAW === 'true') {
        console.log('[API][raw] GET /api/data response:', raw);
      }
      return normalizeSensorPayload(raw as unknown);
    } catch (error) {
      // If backend returns 404 when no data available, return null for caller to handle
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      console.error('[API] getLatestSensorData error', error);
      throw error;
    }
  }

  /**
   * Get historical sensor data
   */
  async getSensorHistory(
    limit: number = 100,
    skip: number = 0
  ): Promise<PaginatedResponse<SensorData>> {
    const response = await this.client.get<{
      success: boolean;
      data: SensorData[];
      pagination: { limit: number; skip: number; count: number };
    }>(API_ENDPOINTS.HISTORY, {
      params: { limit, skip },
    });
    const rawItems = response.data.data || [];
    if (process.env.NEXT_PUBLIC_DEBUG_RAW === 'true') {
      console.log('[API][raw] GET /api/history response items:', rawItems);
    }
    const items = rawItems.map((r) => normalizeSensorPayload(r as unknown));
    return {
      data: items,
      pagination: response.data.pagination
        ? {
            limit: response.data.pagination.limit,
            skip: response.data.pagination.skip ?? 0,
            count: response.data.pagination.count,
          }
        : undefined,
    };
  }

  /**
   * Get sensor statistics
   */
  async getStatistics(hours: number = 24): Promise<Statistics> {
    const response = await this.client.get<{ success: boolean; data: Statistics }>(
      API_ENDPOINTS.STATISTICS,
      {
        params: { hours },
      }
    );
    return response.data.data;
  }

  /**
   * Get sensor data between start and end dates (ISO strings)
   */
  async getSensorDataRange(startDate: string, endDate: string): Promise<SensorData[]> {
    const response = await this.client.get<{
      success: boolean;
      data: SensorData[];
      dateRange?: { start: string; end: string; count: number };
    }>(API_ENDPOINTS.DATA_RANGE, {
      params: { startDate, endDate },
    });
    const rawItems = response.data.data || [];
    return rawItems.map((r) => normalizeSensorPayload(r as unknown));
  }

  // ============== ALERTS ==============

  /**
   * Get all alerts
   */
  async getAlerts(
    limit: number = 50,
    unacknowledged: boolean = false
  ): Promise<PaginatedResponse<Alert>> {
    const response = await this.client.get<{
      success: boolean;
      data: Alert[];
      pagination?: { limit: number; skip?: number; count: number };
      filter?: Record<string, unknown>;
    }>(API_ENDPOINTS.ALERTS, {
      params: { limit, unacknowledged },
    });
    return {
      data: response.data.data,
      pagination: response.data.pagination
        ? {
            limit: response.data.pagination.limit,
            skip: response.data.pagination.skip ?? 0,
            count: response.data.pagination.count,
          }
        : undefined,
    };
  }

  /**
   * Acknowledge an alert
   */
  async acknowledgeAlert(id: string, acknowledgedBy?: string): Promise<Alert> {
    const body = acknowledgedBy ? { acknowledgedBy } : {};
    const response = await this.client.post<{ success: boolean; data: Alert }>(
      API_ENDPOINTS.ACKNOWLEDGE_ALERT(id),
      body
    );
    return response.data.data;
  }

  /**
   * Get alert statistics
   */
  async getAlertStats(hours: number = 24): Promise<Record<string, unknown>> {
    const response = await this.client.get<{
      success: boolean;
      data: Record<string, unknown>;
    }>(API_ENDPOINTS.ALERTS_STATS, {
      params: { hours },
    });
    return response.data.data;
  }

  // ============== HEALTH ALERTS ==============

  /**
   * Get health alerts with optional filtering
   */
  async getHealthAlerts(
    limit: number = 50,
    classification?: UserClassification,
    level?: string,
    unacknowledged: boolean = false
  ): Promise<PaginatedResponse<HealthAlert>> {
    const params: Record<string, string | number | boolean | undefined> = {
      limit,
    };

    if (classification) params.classification = toBackendClassification(classification);
    if (level) params.level = level;
    if (unacknowledged) params.unacknowledged = unacknowledged;

    const response = await this.client.get<{
      success: boolean;
      data: HealthAlert[];
      filter: { limit: number; unacknowledged: boolean };
    }>(API_ENDPOINTS.HEALTH_ALERTS, { params });
    return {
      data: (response.data.data || []).map((alert) => normalizeHealthAlertPayload(alert)),
    };
  }

  /**
   * Get unacknowledged health alerts for a classification
   */
  async getUnacknowledgedHealthAlerts(
    classification: UserClassification
  ): Promise<PaginatedResponse<HealthAlert>> {
    const response = await this.client.get<{
      success: boolean;
      data: HealthAlert[];
      filter: { limit: number; unacknowledged: boolean };
    }>(API_ENDPOINTS.HEALTH_ALERTS_UNACKNOWLEDGED(toBackendClassification(classification)));
    return {
      data: (response.data.data || []).map((alert) => normalizeHealthAlertPayload(alert)),
    };
  }

  /**
   * Get health alert by ID
   */
  async getHealthAlert(id: string): Promise<HealthAlert> {
    const response = await this.client.get<{ success: boolean; data: HealthAlert }>(
      API_ENDPOINTS.HEALTH_ALERT_BY_ID(id)
    );
    return normalizeHealthAlertPayload(response.data.data);
  }

  /**
   * Acknowledge a health alert
   */
  async acknowledgeHealthAlert(id: string): Promise<HealthAlert> {
    const response = await this.client.post<{ success: boolean; data: HealthAlert }>(
      API_ENDPOINTS.ACKNOWLEDGE_HEALTH_ALERT(id)
    );
    return normalizeHealthAlertPayload(response.data.data);
  }

  /**
   * Get health alert statistics
   */
  async getHealthAlertStats(
    classification: UserClassification,
    hours: number = 24
  ): Promise<Record<string, unknown>> {
    const response = await this.client.get<{
      success: boolean;
      data: Record<string, unknown>;
    }>(API_ENDPOINTS.HEALTH_ALERT_STATS(toBackendClassification(classification)), {
      params: { hours },
    });
    return response.data.data;
  }

  /**
   * Get alerts for a specific user
   */
  async getAlertsForUser(userId: string): Promise<PaginatedResponse<HealthAlert>> {
    const response = await this.client.get<{
      success: boolean;
      data: HealthAlert[];
      filter: { limit: number; unacknowledged: boolean };
    }>(API_ENDPOINTS.HEALTH_ALERTS_BY_USER(userId));
    return {
      data: (response.data.data || []).map((alert) => normalizeHealthAlertPayload(alert)),
    };
  }

  // ============== CLASSIFICATIONS ==============

  /**
   * Get available classifications
   */
  async getAvailableClassifications(): Promise<UserClassification[]> {
    const response = await this.client.get<{
      success: boolean;
      classifications: string[];
      count: number;
    }>(API_ENDPOINTS.AVAILABLE_CLASSIFICATIONS);
    return normalizeClassificationList(response.data.classifications);
  }

  /**
   * Get thresholds for a classification
   */
  async getClassificationThresholds(
    classification: UserClassification
  ): Promise<ClassificationConfig> {
    const response = await this.client.get<{
      success: boolean;
      data: ClassificationConfig;
    }>(API_ENDPOINTS.USER_THRESHOLDS(toBackendClassification(classification)));
    return {
      ...response.data.data,
      classification:
        toFrontendClassification(response.data.data.classification) ?? classification,
    };
  }

  // ============== USER MANAGEMENT ==============

  /**
   * Create a new user
   */
  async createUser(
    email: string,
    name: string,
    classification: UserClassification
  ): Promise<UserProfile> {
    const response = await this.client.post<UserProfile>(API_ENDPOINTS.CREATE_USER, {
      email,
      name,
      classification: toBackendClassification(classification),
    });
    return {
      ...response.data,
      classification:
        toFrontendClassification(response.data.classification) ?? classification,
    };
  }

  /**
   * Get user by email
   */
  async getUserByEmail(email: string): Promise<UserProfile | null> {
    try {
      const response = await this.client.get<{ success: boolean; data: UserProfile }>(
        API_ENDPOINTS.GET_USER_BY_EMAIL(email)
      );
      return {
        ...response.data.data,
        classification:
          toFrontendClassification(response.data.data.classification) ?? 'adult',
      };
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Update user
   */
  async updateUser(
    id: string,
    updates: Partial<UserProfile>
  ): Promise<UserProfile> {
    const updatePayload: Omit<Partial<UserProfile>, 'classification'> & { classification?: string } = {
      ...updates,
    };
    if (updates.classification) {
      updatePayload.classification = toBackendClassification(updates.classification);
    }

    const response = await this.client.put<UserProfile>(
      API_ENDPOINTS.UPDATE_USER(id),
      updatePayload
    );
    return {
      ...response.data,
      classification:
        toFrontendClassification(response.data.classification) ??
        updates.classification ??
        'adult',
    };
  }
}

export const apiService = new ApiService();
