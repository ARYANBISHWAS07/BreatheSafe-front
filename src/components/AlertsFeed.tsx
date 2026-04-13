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
      return 'border-l-4 border-red-600 bg-red-50';
    case 'HIGH':
      return 'border-l-4 border-red-500 bg-red-50';
    case 'MODERATE':
      return 'border-l-4 border-amber-500 bg-amber-50';
    case 'LOW':
      return 'border-l-4 border-green-500 bg-green-50';
    default:
      return 'border-l-4 border-gray-500 bg-gray-50';
  }
};

const getLevelColor = (level: string) => {
  switch (level) {
    case 'CRITICAL':
      return 'text-red-700';
    case 'HIGH':
      return 'text-red-600';
    case 'MODERATE':
      return 'text-amber-600';
    case 'LOW':
      return 'text-green-700';
    default:
      return 'text-gray-600';
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
        <div className="text-4xl mb-2">✓</div>
        <p className="text-gray-600 font-medium">No alerts</p>
        <p className="text-sm text-gray-500">Everything is looking good</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {displayAlerts.map((alert) => (
        <div
          key={alert._id}
          className={`${getSeverityStyles(alert.level)} rounded-lg p-4 flex items-start justify-between`}
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-medium text-gray-800">{alert.message}</h4>
              <span className={`text-xs font-semibold ${getLevelColor(alert.level)}`}>{alert.level}</span>
            </div>
            <div className="space-y-1 mb-2">
              {alert.triggerValues && (
                <p className="text-sm text-gray-600">
                  UAQS: {alert.triggerValues.uaqs?.toFixed(1) || 'N/A'} | 
                  MQ135: {alert.triggerValues.mq135PPM?.toFixed(2) || 'N/A'} PPM | 
                  UCRI: {alert.triggerValues.ucri?.toFixed(1) || 'N/A'}
                </p>
              )}
              {alert.riskAssessment && (
                <p className="text-xs text-gray-600 italic">{alert.riskAssessment.recommendation}</p>
              )}
            </div>
            <p className="text-xs text-gray-500">{formatTime(alert.createdAt)}</p>
          </div>
          {!alert.isAcknowledged && (
            <button
              onClick={() => onAcknowledge(alert._id)}
              disabled={isLoading}
              className="ml-3 px-2 py-1 bg-white border border-gray-300 rounded text-xs font-medium hover:bg-gray-50 disabled:opacity-50 whitespace-nowrap"
            >
              Acknowledge
            </button>
          )}
          {alert.isAcknowledged && (
            <span className="ml-3 text-xs text-gray-500 whitespace-nowrap">Ack.</span>
          )}
        </div>
      ))}
    </div>
  );
};
