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
      <div className="rounded-3xl p-8 bg-white/70 backdrop-blur-2xl shadow-[0_24px_60px_-40px_rgba(15,23,42,0.75)] border border-white/70 animate-pulse">
        <div className="relative z-10">
          <h2 className="text-xs font-semibold tracking-[0.4em] uppercase text-slate-400 mb-3">Air Quality Index</h2>
          <div className="flex items-baseline gap-4 mb-6">
            <div className="text-6xl font-bold text-slate-300">--</div>
            <div className="text-xl font-semibold text-slate-300">Loading...</div>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-white/40 backdrop-blur-sm rounded-2xl p-3 h-16" />
            <div className="bg-white/40 backdrop-blur-sm rounded-2xl p-3 h-16" />
          </div>
        </div>
      </div>
    );
  }

  // Handle missing data
  if (aqi === null || aqi === undefined) {
    return (
      <div className="rounded-3xl p-8 bg-gradient-to-br from-rose-500 to-red-600 text-white shadow-[0_20px_50px_-35px_rgba(220,38,38,0.65)] overflow-hidden relative border border-rose-400">
        <div className="relative z-10">
          <h2 className="text-xs font-semibold tracking-[0.4em] uppercase text-rose-100 mb-3">Air Quality Index</h2>
          <div className="text-xl font-semibold">No data available</div>
          <p className="text-sm mt-2 opacity-90">Unable to connect to sensor data. Please check your backend connection.</p>
        </div>
      </div>
    );
  }

  const severity = getAQISeverity(aqi);

  return (
    <div
      className={`rounded-3xl p-8 text-white shadow-[0_24px_60px_-40px_rgba(15,23,42,0.7)] overflow-hidden relative ${severity.bgColor} ${severity.textColor} border border-white/40`}
      style={{
        borderColor: severity.color,
      }}
    >
      {/* Background effect */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, ${severity.color}, transparent 55%)`,
          }}
        />
      </div>

      <div className="relative z-10">
        <h2 className="text-xs font-semibold tracking-[0.4em] uppercase opacity-80 mb-3">Air Quality Index</h2>

        <div className="flex flex-wrap items-end gap-5 mb-6">
          <div className="text-6xl font-semibold tracking-tight">{Math.round(aqi)}</div>
          <div className="px-4 py-1 rounded-full bg-white/15 text-sm font-semibold uppercase tracking-widest">
            {severity.level}
          </div>
        </div>

        <p className="text-sm max-w-xl mb-8 opacity-90">{severity.description}</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-4">
            <p className="text-xs uppercase tracking-[0.2em] opacity-70 mb-2">PM2.5</p>
            <p className="text-lg font-semibold">{formatNumber(pm25)} µg/m³</p>
          </div>
          <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-4">
            <p className="text-xs uppercase tracking-[0.2em] opacity-70 mb-2">Last Updated</p>
            <p className="text-sm font-semibold">
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
