'use client';

import React from 'react';
import { Alert } from '@/types';
import { formatTime } from '@/lib/utils';

interface AlertsFeedProps {
  alerts: Alert[];
  onAcknowledge: (id: string) => Promise<void>;
  isLoading?: boolean;
  maxItems?: number;
}

const getSeverityStyles = (level: string) => {
  switch (level) {
    case 'CRITICAL':
      return 'border-rose-300/60 bg-rose-500/12';
    case 'HIGH':
      return 'border-rose-300/55 bg-rose-500/10';
    case 'MODERATE':
      return 'border-amber-300/55 bg-amber-500/10';
    case 'LOW':
      return 'border-emerald-300/55 bg-emerald-500/10';
    default:
      return 'border-slate-300/35 bg-slate-600/10';
  }
};

const getLevelColor = (level: string) => {
  switch (level) {
    case 'CRITICAL':
      return 'text-rose-200';
    case 'HIGH':
      return 'text-rose-200';
    case 'MODERATE':
      return 'text-amber-200';
    case 'LOW':
      return 'text-emerald-200';
    default:
      return 'text-slate-300';
  }
};

export const AlertsFeed: React.FC<AlertsFeedProps> = ({
  alerts,
  onAcknowledge,
  isLoading = false,
  maxItems = 10,
}) => {
  const displayAlerts = alerts.slice(0, maxItems);

  if (displayAlerts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="text-3xl mb-2 text-emerald-300">OK</div>
        <p className="text-slate-200 font-medium">No alerts</p>
        <p className="text-sm text-slate-400">System baseline is stable</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {displayAlerts.map((alert) => (
        <div
          key={alert._id}
          className={`${getSeverityStyles(alert.level)} border rounded-xl p-4 flex items-start justify-between backdrop-blur-sm`}
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-medium text-slate-100">{alert.message}</h4>
              <span className={`text-xs font-semibold ${getLevelColor(alert.level)}`}>{alert.level}</span>
            </div>
            <div className="space-y-1 mb-2">
              {alert.triggerValues && (
                <p className="text-sm text-slate-300">
                  UAQS: {alert.triggerValues.uaqs?.toFixed(1) || 'N/A'} | 
                  MQ135: {alert.triggerValues.mq135PPM?.toFixed(2) || 'N/A'} PPM | 
                  UCRI: {alert.triggerValues.ucri?.toFixed(1) || 'N/A'}
                </p>
              )}
              {alert.riskAssessment && (
                <p className="text-xs text-slate-400 italic">{alert.riskAssessment.recommendation}</p>
              )}
            </div>
            <p className="text-xs text-slate-400">{formatTime(alert.createdAt)}</p>
          </div>
          {!alert.isAcknowledged && (
            <button
              onClick={() => onAcknowledge(alert._id)}
              disabled={isLoading}
              className="ml-3 px-2.5 py-1.5 bg-slate-900/70 border border-cyan-200/35 rounded text-xs font-semibold text-cyan-100 hover:border-cyan-200/70 disabled:opacity-50 whitespace-nowrap"
            >
              Acknowledge
            </button>
          )}
          {alert.isAcknowledged && (
            <span className="ml-3 text-xs text-slate-400 whitespace-nowrap">Ack.</span>
          )}
        </div>
      ))}
    </div>
  );
};
