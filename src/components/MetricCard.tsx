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
        bg: severity.bgColor,
        border: 'border border-white/60',
        text: severity.textColor,
        icon: severity.color,
        ring: `shadow-[0_20px_50px_-40px_${severity.color}]`,
      };
    }

    if (threshold) {
      if (value <= threshold * 0.5)
        return {
          bg: 'bg-green-50/80',
          border: 'border border-white/60',
          text: 'text-green-700',
          icon: '#4CAF50',
          ring: 'shadow-[0_20px_50px_-40px_rgba(34,197,94,0.9)]',
        };
      if (value <= threshold)
        return {
          bg: 'bg-amber-50/80',
          border: 'border border-white/60',
          text: 'text-amber-700',
          icon: '#F2A65A',
          ring: 'shadow-[0_20px_50px_-40px_rgba(245,158,11,0.9)]',
        };
      return {
        bg: 'bg-rose-50/80',
        border: 'border border-white/60',
        text: 'text-rose-700',
        icon: '#D95D39',
        ring: 'shadow-[0_20px_50px_-40px_rgba(244,63,94,0.9)]',
      };
    }

    return {
      bg: 'bg-white/70',
      border: 'border border-white/60',
      text: 'text-slate-800',
      icon: '#1F8A8A',
      ring: 'shadow-[0_20px_50px_-40px_rgba(14,165,233,0.9)]',
    };
  };

  const colors = getColor();

  return (
    <div
      className={`${colors.bg} ${colors.border} ${colors.ring} rounded-2xl p-5 transition-all hover:-translate-y-0.5 hover:shadow-xl backdrop-blur-xl`}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-[0.65rem] font-semibold text-slate-500 uppercase tracking-[0.3em]">
            {label}
          </p>
          <p className="text-xs text-slate-400">Live sensor metric</p>
        </div>
        {icon && (
          <div
            className="h-10 w-10 rounded-2xl flex items-center justify-center bg-white/70 text-xl shadow-inner"
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
        <div className="flex items-center gap-1 text-xs font-semibold text-slate-500">
          <span className={trend.direction === 'up' ? 'text-rose-600' : 'text-emerald-600'}>
            {trend.direction === 'up' ? '↑' : trend.direction === 'down' ? '↓' : '→'}
          </span>
          <span className={trend.direction === 'up' ? 'text-rose-600' : 'text-emerald-600'}>
            {trend.percentage.toFixed(1)}%
          </span>
          <span>vs prev hour</span>
        </div>
      )}

      {threshold && (
        <p className="text-xs text-slate-500 mt-3">
          Threshold: {formatNumber(threshold)} {unit}
        </p>
      )}
    </div>
  );
};
