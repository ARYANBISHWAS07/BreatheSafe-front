'use client';

import React from 'react';
import { SystemStatus } from '@/types';

interface SystemStatusDrawerProps {
  status: SystemStatus | null;
  isOpen: boolean;
  onClose: () => void;
}

const getStatusColor = (status: string): string => {
  switch (status) {
    case 'connected':
      return 'text-green-600';
    case 'disconnected':
      return 'text-red-600';
    case 'error':
      return 'text-orange-600';
    default:
      return 'text-gray-600';
  }
};

const getStatusBg = (status: string): string => {
  switch (status) {
    case 'connected':
      return 'bg-green-100';
    case 'disconnected':
      return 'bg-red-100';
    case 'error':
      return 'bg-orange-100';
    default:
      return 'bg-gray-100';
  }
};

export const SystemStatusDrawer: React.FC<SystemStatusDrawerProps> = ({
  status,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !status) return null;

  const uptime = Math.floor(status.uptime / 1000); // Convert to seconds
  const hours = Math.floor(uptime / 3600);
  const minutes = Math.floor((uptime % 3600) / 60);
  const seconds = uptime % 60;

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      <div className="absolute right-0 top-0 bottom-0 w-96 bg-white shadow-lg overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">System Status</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          <div className="space-y-4">
            {/* Connection Status */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-700 mb-3">Connection</h3>
              <div className={`${getStatusBg(status.connected ? 'connected' : 'disconnected')} ${getStatusColor(status.connected ? 'connected' : 'disconnected')} rounded p-3 text-sm font-medium`}>
                {status.connected ? '🟢 Connected' : '🔴 Disconnected'}
              </div>
            </div>

            {/* Database Status */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-700 mb-3">Database</h3>
              <div className={`${getStatusBg(status.database)} ${getStatusColor(status.database)} rounded p-3 text-sm font-medium capitalize`}>
                {status.database === 'connected' && '🟢'}
                {status.database === 'disconnected' && '🔴'}
                {status.database === 'error' && '🟠'}
                {' '}{status.database}
              </div>
            </div>

            {/* Sensor Connection */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-700 mb-3">Sensor Connection</h3>
              <div className={`${getStatusBg(status.sensorConnection)} ${getStatusColor(status.sensorConnection)} rounded p-3 text-sm font-medium capitalize`}>
                {status.sensorConnection === 'connected' && '🟢'}
                {status.sensorConnection === 'disconnected' && '🔴'}
                {status.sensorConnection === 'error' && '🟠'}
                {' '}{status.sensorConnection}
              </div>
            </div>

            {/* Uptime */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-700 mb-3">Uptime</h3>
              <p className="text-2xl font-bold text-gray-800">
                {hours}h {minutes}m {seconds}s
              </p>
              <p className="text-xs text-gray-500 mt-2">System running time</p>
            </div>

            {/* Last Update */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-700 mb-3">Last Update</h3>
              <p className="text-sm text-gray-700">
                {new Date(status.lastUpdate).toLocaleString()}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full mt-6 px-4 py-2 bg-gray-800 text-white rounded-lg font-medium hover:bg-gray-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
