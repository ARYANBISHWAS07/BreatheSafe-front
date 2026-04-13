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
import { generateMockSensorData } from '@/lib/utils';

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
  const [availableClassifications, setAvailableClassifications] = useState<UserClassification[]>([
    'adults',
    'children',
    'elderly',
    'asthma_patient',
  ]);
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-teal-100 animate-spin mb-4">
            <div className="w-8 h-8 rounded-full border-4 border-teal-200 border-t-teal-600" />
          </div>
          <p className="text-gray-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Top Navigation */}
      <nav className="sticky top-0 z-40 backdrop-blur-xl bg-white/70 border-b border-white/70 shadow-[0_20px_40px_-35px_rgba(15,23,42,0.8)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-sky-500 via-cyan-500 to-emerald-400 text-white flex items-center justify-center shadow-lg">
                🌍
              </div>
              <div>
                <h1 className="text-3xl font-semibold text-slate-900 tracking-tight">Air Quality Dashboard</h1>
                <p className="text-xs text-slate-500">Real-time environmental intelligence & sensor health</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setShowSystemStatus(true)}
                className="px-4 py-2 rounded-full bg-slate-900 text-white text-sm font-semibold shadow-md shadow-slate-900/30 hover:bg-slate-800 transition-colors"
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
            <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-[0.3em]">
              User Classification
            </h2>
            <span className="text-xs text-slate-500">Adaptive thresholds by user group</span>
          </div>
          <div className="bg-white/70 backdrop-blur-xl border border-white/60 rounded-2xl p-3 shadow-[0_20px_50px_-40px_rgba(15,23,42,0.6)]">
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
            <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-[0.3em]">
              Live Sensor Readings
            </h2>
            <span className="text-xs text-slate-500">Latest stream from devices</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
            <MetricCard
              label="PM2.5"
              value={currentSensorData.pm25}
              unit="µg/m³"
              type="number"
              icon="💨"
            />
            <MetricCard
              label="Air Quality Index"
              value={currentSensorData.aqi}
              unit=""
              type="aqi"
              icon="📊"
            />
            <MetricCard
              label="Temperature"
              value={currentSensorData.temperature}
              unit="°C"
              icon="🌡️"
            />
            <MetricCard
              label="Humidity"
              value={currentSensorData.humidity}
              unit="%"
              icon="💧"
            />
            <MetricCard
              label="MQ135 PPM"
              value={currentSensorData.mq135_ppm}
              unit="ppm"
              icon="⚗️"
            />
            <MetricCard
              label="Corrected PPM"
              value={currentSensorData.correctedPPM}
              unit="ppm"
              icon="⚗️"
            />
            <MetricCard
              label="ACI"
              value={currentSensorData.aci}
              unit=""
              type="percentage"
              icon="📈"
            />
            <MetricCard
              label="UAQS"
              value={currentSensorData.uaqs}
              unit=""
              type="percentage"
              icon="📊"
            />
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Health Alerts Panel */}
          <section className="lg:col-span-2">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
              Health Alerts
            </h2>
            <div className="bg-white rounded-lg shadow p-6">
              {healthAlerts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="text-4xl mb-2">✓</div>
                  <p className="text-gray-600 font-medium">No active health alerts</p>
                  <p className="text-sm text-gray-500">Your air quality is safe for this classification</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {healthAlerts.map((alert) => (
                    <HealthAlertCard
                      key={alert.id}
                      alert={alert}
                      onAcknowledge={handleAcknowledgeHealthAlert}
                      isLoading={acknowledgingAlertId === alert.id}
                    />
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Alerts Summary */}
          <section>
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
              Recent System Alerts
            </h2>
            <div className="bg-white rounded-lg shadow p-6">
              <AlertsFeed
                alerts={alerts}
                onAcknowledge={handleAcknowledgeAlert}
                isLoading={acknowledgingAlertId !== null}
                maxItems={5}
              />
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
      <footer className="mt-16 border-t border-gray-200 bg-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-600 text-sm">
          <p>Air Quality Monitoring Dashboard • Real-time data updates every minute</p>
          <p className="mt-2 text-gray-500">
            For health concerns, please consult with a healthcare professional
          </p>
        </div>
      </footer>
    </div>
  );
}
