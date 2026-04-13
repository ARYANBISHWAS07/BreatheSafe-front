'use client';

import React from 'react';
import { getAQISeverity, formatNumber } from '@/lib/utils';

interface AirQualityHeroProps {
  aqi?: number | null;
  pm25?: number | null;
  lastUpdated?: string | null;
  isLoading?: boolean;
}

export const AirQualityHero: React.FC<AirQualityHeroProps> = ({ 
  aqi = null, 
  pm25 = null, 
  lastUpdated = null,
  isLoading = false 
}) => {
  // Handle loading state
  if (isLoading) {
    return (
      <div className="rounded-3xl p-8 panel-strong animate-pulse">
        <div className="relative z-10">
          <h2 className="text-xs font-semibold tracking-[0.4em] uppercase text-sky-200/70 mb-3">Air Quality Index</h2>
          <div className="flex items-baseline gap-4 mb-6">
            <div className="text-6xl font-bold text-sky-100/70">--</div>
            <div className="text-xl font-semibold text-sky-100/70">Syncing...</div>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-slate-950/50 backdrop-blur-sm rounded-2xl p-3 h-16 border border-sky-200/20" />
            <div className="bg-slate-950/50 backdrop-blur-sm rounded-2xl p-3 h-16 border border-sky-200/20" />
          </div>
        </div>
      </div>
    );
  }

  // Handle missing data
  if (aqi === null || aqi === undefined) {
    return (
      <div className="rounded-3xl p-8 bg-gradient-to-br from-rose-500/30 to-rose-800/50 text-rose-100 shadow-[0_20px_50px_-35px_rgba(220,38,38,0.65)] overflow-hidden relative border border-rose-300/55">
        <div className="relative z-10">
          <h2 className="text-xs font-semibold tracking-[0.4em] uppercase text-rose-200 mb-3">Air Quality Index</h2>
          <div className="text-xl font-semibold">No data available</div>
          <p className="text-sm mt-2 opacity-90">Unable to connect to sensor data. Please check your backend connection.</p>
        </div>
      </div>
    );
  }

  const severity = getAQISeverity(aqi);

  return (
    <div
      className="rounded-3xl p-8 text-white shadow-[0_24px_70px_-45px_rgba(60,247,255,0.65)] overflow-hidden relative border border-cyan-300/45 bg-slate-950/65 backdrop-blur-2xl"
      style={{
        boxShadow: `0 24px 70px -45px ${severity.color}`,
      }}
    >
      {/* Background effect */}
      <div className="absolute inset-0 opacity-50 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 40%, ${severity.color}55, transparent 45%)`,
          }}
        />
      </div>
      <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.08),transparent_40%,rgba(255,255,255,0.05))]" />
      <div className="absolute right-[-70px] top-[-70px] h-44 w-44 rounded-full border border-cyan-300/40" />
      <div className="absolute right-[-40px] top-[-40px] h-28 w-28 rounded-full border border-cyan-300/40" />

      <div className="relative z-10">
        <h2 className="text-xs font-semibold tracking-[0.45em] uppercase text-cyan-100/80 mb-3">Atmosphere Index</h2>

        <div className="flex flex-wrap items-end gap-5 mb-6">
          <div className="text-6xl font-semibold tracking-tight text-cyan-50">{Math.round(aqi)}</div>
          <div className="px-4 py-1 rounded-full bg-cyan-300/20 text-sm font-semibold uppercase tracking-widest text-cyan-100 border border-cyan-200/35">
            {severity.level}
          </div>
        </div>

        <p className="text-sm max-w-xl mb-8 text-slate-100/90">{severity.description}</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-slate-900/65 border border-cyan-200/25 backdrop-blur-sm rounded-2xl p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-sky-100/75 mb-2">PM2.5 Density</p>
            <p className="text-lg font-semibold text-sky-50">{formatNumber(pm25)} µg/m³</p>
          </div>
          <div className="bg-slate-900/65 border border-cyan-200/25 backdrop-blur-sm rounded-2xl p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-sky-100/75 mb-2">Last Sync</p>
            <p className="text-sm font-semibold text-sky-50">
              {lastUpdated
                ? new Date(lastUpdated).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : 'N/A'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
