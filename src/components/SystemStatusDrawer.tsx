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
      return 'text-emerald-100';
    case 'disconnected':
      return 'text-rose-100';
    case 'error':
      return 'text-amber-100';
    default:
      return 'text-slate-200';
  }
};

const getStatusBg = (status: string): string => {
  switch (status) {
    case 'connected':
      return 'bg-emerald-400/15 border border-emerald-300/45';
    case 'disconnected':
      return 'bg-rose-400/15 border border-rose-300/45';
    case 'error':
      return 'bg-amber-400/15 border border-amber-300/45';
    default:
      return 'bg-slate-500/15 border border-slate-300/35';
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
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="absolute right-0 top-0 bottom-0 w-96 max-w-full panel-strong overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-sky-50 tracking-wide">System Status</h2>
            <button
              onClick={onClose}
              className="text-slate-300 hover:text-sky-100"
            >
              ✕
            </button>
          </div>

          <div className="space-y-4">
            {/* Connection Status */}
            <div className="bg-slate-900/55 rounded-xl p-4 border border-sky-200/20">
              <h3 className="font-semibold text-slate-100 mb-3">Connection</h3>
              <div className={`${getStatusBg(status.connected ? 'connected' : 'disconnected')} ${getStatusColor(status.connected ? 'connected' : 'disconnected')} rounded-lg p-3 text-sm font-medium`}>
                {status.connected ? 'LINKED' : 'OFFLINE'}
              </div>
            </div>

            {/* Database Status */}
            <div className="bg-slate-900/55 rounded-xl p-4 border border-sky-200/20">
              <h3 className="font-semibold text-slate-100 mb-3">Database</h3>
              <div className={`${getStatusBg(status.database)} ${getStatusColor(status.database)} rounded-lg p-3 text-sm font-medium uppercase tracking-wide`}>
                {status.database}
              </div>
            </div>

            {/* Sensor Connection */}
            <div className="bg-slate-900/55 rounded-xl p-4 border border-sky-200/20">
              <h3 className="font-semibold text-slate-100 mb-3">Sensor Connection</h3>
              <div className={`${getStatusBg(status.sensorConnection)} ${getStatusColor(status.sensorConnection)} rounded-lg p-3 text-sm font-medium uppercase tracking-wide`}>
                {status.sensorConnection}
              </div>
            </div>

            {/* Uptime */}
            <div className="bg-slate-900/55 rounded-xl p-4 border border-sky-200/20">
              <h3 className="font-semibold text-slate-100 mb-3">Uptime</h3>
              <p className="text-2xl font-bold text-cyan-100">
                {hours}h {minutes}m {seconds}s
              </p>
              <p className="text-xs text-slate-400 mt-2">System running time</p>
            </div>

            {/* Last Update */}
            <div className="bg-slate-900/55 rounded-xl p-4 border border-sky-200/20">
              <h3 className="font-semibold text-slate-100 mb-3">Last Update</h3>
              <p className="text-sm text-slate-300">
                {new Date(status.lastUpdate).toLocaleString()}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full mt-6 px-4 py-2.5 bg-cyan-400/20 text-cyan-100 rounded-xl font-semibold border border-cyan-300/45 hover:border-cyan-200/80"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
