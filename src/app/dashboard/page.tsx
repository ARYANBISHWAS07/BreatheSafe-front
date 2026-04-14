'use client';

import React, { useEffect, useState } from 'react';
import { apiService } from '@/services/apiService';
import { socketService } from '@/services/socketService';
import {
  ConnectionBadge,
  ClassificationTabs,
  AirQualityHero,
  MetricCard,
  HealthAlertCard,
  AlertsFeed,
  SystemStatusDrawer,
} from '@/components';
import { useDashboard } from '@/context/DashboardContext';
import { HealthAlert, UserClassification, SystemStatus, Alert } from '@/types';
import { FRONTEND_CLASSIFICATIONS, generateMockSensorData } from '@/lib/utils';

export default function Dashboard() {
  const {
    currentSensorData,
    healthAlerts,
    userClassification,
    isLoading,
    setSensorData,
    setHealthAlerts,
    addHealthAlert,
    setUserClassification,
    setIsConnected,
    setIsLoading,
    setError,
  } = useDashboard();

  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [showSystemStatus, setShowSystemStatus] = useState(false);
  const [availableClassifications, setAvailableClassifications] = useState<UserClassification[]>(
    FRONTEND_CLASSIFICATIONS
  );
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [acknowledgingAlertId, setAcknowledgingAlertId] = useState<string | null>(null);

  // Initialize socket connection and load initial data
  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true);
      try {
        // Connect to socket
        await socketService.connect();
        setIsConnected(true);

        // Subscribe to events
        socketService.subscribeSensorUpdates();
        socketService.subscribeAlerts();
        socketService.subscribeHealthAlerts(userClassification);
        socketService.requestSystemStatus();

        // Load initial data
        const sensorData = await apiService.getLatestSensorData();
        if (sensorData) {
          setSensorData(sensorData);
        } else {
          // No data available yet on backend - use mock fallback for UI
          setSensorData(generateMockSensorData());
        }

        const healthAlertsData = await apiService.getHealthAlerts(50, userClassification);
        setHealthAlerts(healthAlertsData.data);

        const alertsData = await apiService.getAlerts(50);
        setAlerts(alertsData.data);

        const classifications = await apiService.getAvailableClassifications();
        setAvailableClassifications(classifications);
      } catch (error) {
        console.error('Failed to initialize:', error);
        setError('Failed to connect to the server');
        // Use mock data as fallback
        setSensorData(generateMockSensorData());
      } finally {
        setIsLoading(false);
      }
    };

    initialize();

    return () => {
      socketService.disconnect();
    };
  }, [setError, setHealthAlerts, setIsConnected, setIsLoading, setSensorData, userClassification]);

  // Set up socket event listeners
  useEffect(() => {
    const unsubscribers = [
      socketService.onConnectionStatusChange((connected) => {
        setIsConnected(connected);
      }),
      socketService.onSensorUpdate((data) => {
        setSensorData(data);
      }),
      socketService.onHealthAlert((alert) => {
        addHealthAlert(alert);
      }),
      socketService.onAlert((alert) => {
        setAlerts((prev) => [alert, ...prev].slice(0, 50));
      }),
      socketService.onSystemStatus((status) => {
        setSystemStatus(status);
      }),
    ];

    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe());
    };
  }, [setSensorData, addHealthAlert, setIsConnected]);

  // Handle classification change
  useEffect(() => {
    const handleClassificationChange = async () => {
      try {
        setIsLoading(true);
        socketService.subscribeHealthAlerts(userClassification);
        // Get health alerts filtered by classification
        const healthAlertsData = await apiService.getHealthAlerts(50, userClassification);
        setHealthAlerts(healthAlertsData.data);
      } catch (error) {
        console.error('Failed to update health alerts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    handleClassificationChange();
  }, [userClassification, setHealthAlerts, setIsLoading]);

  const handleAcknowledgeHealthAlert = async (id: string) => {
    try {
      setAcknowledgingAlertId(id);
      await apiService.acknowledgeHealthAlert(id);
      setHealthAlerts((prev: HealthAlert[]) =>
        prev.map((a: HealthAlert) =>
          (a.id ?? a._id) === id
            ? { ...a, acknowledged: true, isAcknowledged: true, acknowledgedAt: new Date().toISOString() }
            : a
        )
      );
    } catch (error) {
      console.error('Failed to acknowledge alert:', error);
    } finally {
      setAcknowledgingAlertId(null);
    }
  };

  const handleAcknowledgeAlert = async (id: string) => {
    try {
      setAcknowledgingAlertId(id);
      await apiService.acknowledgeAlert(id);
      setAlerts((prev: Alert[]) =>
        prev.map((a: Alert) =>
          (a.id ?? a._id) === id
            ? { ...a, isAcknowledged: true, acknowledgedAt: new Date().toISOString() }
            : a
        )
      );
    } catch (error) {
      console.error('Failed to acknowledge alert:', error);
    } finally {
      setAcknowledgingAlertId(null);
    }
  };

  if (!currentSensorData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full border border-cyan-300/50 bg-cyan-300/10 animate-spin mb-4">
            <div className="w-8 h-8 rounded-full border-4 border-cyan-200/20 border-t-cyan-200" />
          </div>
          <p className="text-slate-200 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative z-10">
      {/* Top Navigation */}
      <nav className="sticky top-0 z-40 backdrop-blur-xl bg-slate-950/55 border-b border-sky-200/20 shadow-[0_20px_40px_-35px_rgba(15,23,42,0.8)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-cyan-300/30 via-sky-400/20 to-lime-300/20 text-cyan-100 flex items-center justify-center shadow-lg border border-cyan-200/40">
                AQ
              </div>
              <div>
                <h1 className="text-3xl font-semibold text-slate-50 tracking-tight">Air Quality Command Grid</h1>
                <p className="text-xs text-slate-300">Real-time environmental intelligence and sensor health</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setShowSystemStatus(true)}
                className="px-4 py-2 rounded-full border border-cyan-300/50 bg-cyan-400/15 text-cyan-100 text-sm font-semibold shadow-md shadow-cyan-900/30 hover:border-cyan-200/80 transition-colors"
              >
                System Status
              </button>
              <ConnectionBadge connected={socketService.isConnected()} />
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Classification Selector */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-sky-100 uppercase tracking-[0.3em]">
              User Classification
            </h2>
            <span className="text-xs text-slate-300">Adaptive thresholds by age and health class</span>
          </div>
          <div className="panel rounded-2xl p-3">
            <ClassificationTabs
              classifications={availableClassifications}
              selected={userClassification}
              onSelect={setUserClassification}
            />
          </div>
        </section>

        {/* Hero Section */}
        <section className="mb-10">
          <AirQualityHero
            aqi={currentSensorData?.aqi}
            pm25={currentSensorData?.pm25}
            lastUpdated={currentSensorData?.lastUpdated}
            isLoading={isLoading}
          />
        </section>

        {/* Metric Grid */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-semibold text-sky-100 uppercase tracking-[0.3em]">
              Live Sensor Readings
            </h2>
            <span className="text-xs text-slate-300">Latest stream from devices</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
            <MetricCard
              label="PM2.5"
              value={currentSensorData.pm25}
              unit="µg/m³"
              type="number"
              icon="P2"
            />
            <MetricCard
              label="Air Quality Index"
              value={currentSensorData.aqi}
              unit=""
              type="aqi"
              icon="AQ"
            />
            <MetricCard
              label="Temperature"
              value={currentSensorData.temperature}
              unit="°C"
              icon="T"
            />
            <MetricCard
              label="Humidity"
              value={currentSensorData.humidity}
              unit="%"
              icon="H"
            />
            <MetricCard
              label="Gas Score"
              value={currentSensorData.mq_score ?? currentSensorData.mq135_ppm}
              unit=""
              icon="M"
            />
            <MetricCard
              label="Corrected PPM"
              value={currentSensorData.correctedPPM}
              unit="ppm"
              icon="C"
            />
            <MetricCard
              label="ACI"
              value={currentSensorData.aci}
              unit=""
              type="percentage"
              icon="A"
            />
            <MetricCard
              label="UAQS"
              value={currentSensorData.uaqs}
              unit=""
              type="percentage"
              icon="U"
            />
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Health Alerts Panel */}
          <section className="lg:col-span-2">
            <h2 className="text-sm font-semibold text-sky-100 uppercase tracking-wide mb-4">
              Health Alerts
            </h2>
            <div className="panel rounded-2xl shadow p-6">
              {healthAlerts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="text-4xl mb-2 text-emerald-300">OK</div>
                  <p className="text-slate-100 font-medium">No active health alerts</p>
                  <p className="text-sm text-slate-300">Current air quality is safe for this classification</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[34rem] overflow-y-auto pr-1">
                  {healthAlerts.map((alert) => (
                    <HealthAlertCard
                      key={alert.id ?? alert._id ?? `${alert.timestamp}-${alert.message}`}
                      alert={alert}
                      onAcknowledge={handleAcknowledgeHealthAlert}
                      isLoading={acknowledgingAlertId === (alert.id ?? alert._id)}
                    />
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Alerts Summary */}
          <section>
            <h2 className="text-sm font-semibold text-sky-100 uppercase tracking-wide mb-4">
              Recent System Alerts
            </h2>
            <div className="panel rounded-2xl shadow p-6">
              <div className="max-h-[34rem] overflow-y-auto pr-1">
                <AlertsFeed
                  alerts={alerts}
                  onAcknowledge={handleAcknowledgeAlert}
                  isLoading={acknowledgingAlertId !== null}
                  maxItems={50}
                />
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* System Status Drawer */}
      <SystemStatusDrawer
        status={systemStatus}
        isOpen={showSystemStatus}
        onClose={() => setShowSystemStatus(false)}
      />

      {/* Footer */}
      <footer className="mt-16 border-t border-sky-200/20 bg-slate-950/40 py-8 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-slate-300 text-sm">
          <p>Air Quality Monitoring Dashboard • Real-time data updates every minute</p>
          <p className="mt-2 text-slate-400">
            For health concerns, please consult with a healthcare professional
          </p>
        </div>
      </footer>
    </div>
  );
}
