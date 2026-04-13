'use client';

import React from 'react';
import { getAQISeverity, formatNumber } from '@/lib/utils';

interface MetricCardProps {
  label: string;
  value: number;
  unit: string;
  threshold?: number;
  type?: 'number' | 'aqi' | 'percentage';
  trend?: {
    direction: 'up' | 'down' | 'stable';
    percentage: number;
  };
  icon?: React.ReactNode;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  unit,
  threshold,
  type = 'number',
  trend,
  icon,
}) => {
  // Determine color based on type and threshold
  const getColor = (): { bg: string; border: string; text: string; icon: string; ring: string } => {
    if (type === 'aqi') {
      const severity = getAQISeverity(value);
      return {
        bg: 'bg-slate-900/65',
        border: 'border border-cyan-300/45',
        text: 'text-cyan-100',
        icon: severity.color,
        ring: `shadow-[0_24px_60px_-45px_${severity.color}]`,
      };
    }

    if (threshold) {
      if (value <= threshold * 0.5)
        return {
          bg: 'bg-emerald-500/10',
          border: 'border border-emerald-300/45',
          text: 'text-emerald-100',
          icon: '#78ff6e',
          ring: 'shadow-[0_20px_55px_-40px_rgba(120,255,110,0.9)]',
        };
      if (value <= threshold)
        return {
          bg: 'bg-amber-500/10',
          border: 'border border-amber-300/45',
          text: 'text-amber-100',
          icon: '#ffc857',
          ring: 'shadow-[0_20px_55px_-40px_rgba(255,200,87,0.95)]',
        };
      return {
        bg: 'bg-rose-500/10',
        border: 'border border-rose-300/50',
        text: 'text-rose-100',
        icon: '#ff5b8a',
        ring: 'shadow-[0_20px_55px_-40px_rgba(255,91,138,0.9)]',
      };
    }

    return {
      bg: 'bg-slate-900/55',
      border: 'border border-sky-300/35',
      text: 'text-sky-100',
      icon: '#3cf7ff',
      ring: 'shadow-[0_20px_55px_-40px_rgba(60,247,255,0.8)]',
    };
  };

  const colors = getColor();

  return (
    <div
      className={`${colors.bg} ${colors.border} ${colors.ring} rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl backdrop-blur-xl relative overflow-hidden`}
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/70 to-transparent" />
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-[0.65rem] font-semibold text-slate-400 uppercase tracking-[0.3em]">
            {label}
          </p>
          <p className="text-xs text-slate-500">telemetry stream</p>
        </div>
        {icon && (
          <div
            className="h-10 w-10 rounded-xl flex items-center justify-center bg-slate-950/70 text-xl border border-cyan-300/30"
            style={{ color: colors.icon }}
          >
            {icon}
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-2 mb-3">
        <span className={`text-3xl font-semibold ${colors.text}`}>{formatNumber(value)}</span>
        <span className={`text-sm font-medium ${colors.text}`}>{unit}</span>
      </div>

      {trend && (
        <div className="flex items-center gap-1 text-xs font-semibold text-slate-400">
          <span className={trend.direction === 'up' ? 'text-rose-300' : 'text-emerald-300'}>
            {trend.direction === 'up' ? '↑' : trend.direction === 'down' ? '↓' : '→'}
          </span>
          <span className={trend.direction === 'up' ? 'text-rose-300' : 'text-emerald-300'}>
            {trend.percentage.toFixed(1)}%
          </span>
          <span>vs prev hour</span>
        </div>
      )}

      {threshold && (
        <p className="text-xs text-slate-400 mt-3">
          Threshold: {formatNumber(threshold)} {unit}
        </p>
      )}
    </div>
  );
};
