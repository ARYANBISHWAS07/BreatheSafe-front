'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { SensorData, HealthAlert, UserClassification, UserProfile } from '@/types';

interface DashboardContextType {
  // Data
  currentSensorData: SensorData | null;
  healthAlerts: HealthAlert[];
  userClassification: UserClassification;
  userProfile: UserProfile | null;

  // State
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  setSensorData: (data: SensorData) => void;
  setHealthAlerts: (alerts: HealthAlert[] | ((prev: HealthAlert[]) => HealthAlert[])) => void;
  addHealthAlert: (alert: HealthAlert) => void;
  removeHealthAlert: (id: string) => void;
  setUserClassification: (classification: UserClassification) => void;
  setUserProfile: (profile: UserProfile) => void;
  setIsConnected: (connected: boolean) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const DashboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentSensorData, setCurrentSensorData] = useState<SensorData | null>(null);
  const [healthAlerts, setHealthAlerts] = useState<HealthAlert[]>([]);
  const [userClassification, setUserClassification] = useState<UserClassification>('adult');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setSensorDataCallback = useCallback((data: SensorData) => {
    setCurrentSensorData(data);
  }, []);

  const setHealthAlertsCallback = useCallback(
    (alerts: HealthAlert[] | ((prev: HealthAlert[]) => HealthAlert[])) => {
      setHealthAlerts((prev) => {
        if (typeof alerts === 'function') {
          return alerts(prev);
        }
        return alerts;
      });
    },
    []
  );

  const addHealthAlertCallback = useCallback((alert: HealthAlert) => {
    setHealthAlerts((prev) => {
      // Check if alert already exists
      const exists = prev.find((a) => a.id === alert.id);
      if (exists) return prev;
      return [alert, ...prev];
    });
  }, []);

  const removeHealthAlertCallback = useCallback((id: string) => {
    setHealthAlerts((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const setUserClassificationCallback = useCallback((classification: UserClassification) => {
    setUserClassification(classification);
  }, []);

  const setUserProfileCallback = useCallback((profile: UserProfile) => {
    setUserProfile(profile);
  }, []);

  const value: DashboardContextType = {
    currentSensorData,
    healthAlerts,
    userClassification,
    userProfile,
    isConnected,
    isLoading,
    error,
    setSensorData: setSensorDataCallback,
    setHealthAlerts: setHealthAlertsCallback,
    addHealthAlert: addHealthAlertCallback,
    removeHealthAlert: removeHealthAlertCallback,
    setUserClassification: setUserClassificationCallback,
    setUserProfile: setUserProfileCallback,
    setIsConnected,
    setIsLoading,
    setError,
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = (): DashboardContextType => {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};
