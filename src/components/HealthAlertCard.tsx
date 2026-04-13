'use client';

import React from 'react';
import { HealthAlert } from '@/types';
import { formatTime, getRecommendedActions } from '@/lib/utils';

interface HealthAlertCardProps {
  alert: HealthAlert;
  onAcknowledge: (id: string) => Promise<void>;
  isLoading?: boolean;
}

const getLevelStyles = (level: string) => {
  switch (level) {
    case 'SAFE':
      return {
        bg: 'bg-green-50',
        border: 'border-green-200',
        badge: 'bg-green-100 text-green-800',
        icon: '✓',
      };
    case 'CAUTION':
      return {
        bg: 'bg-amber-50',
        border: 'border-amber-200',
        badge: 'bg-amber-100 text-amber-800',
        icon: '⚠',
      };
    case 'WARNING':
      return {
        bg: 'bg-orange-50',
        border: 'border-orange-300',
        badge: 'bg-orange-100 text-orange-800',
        icon: '⚠',
      };
    case 'DANGER':
      return {
        bg: 'bg-red-50',
        border: 'border-red-300',
        badge: 'bg-red-100 text-red-800',
        icon: '!',
      };
    default:
      return {
        bg: 'bg-gray-50',
        border: 'border-gray-200',
        badge: 'bg-gray-100 text-gray-800',
        icon: '•',
      };
  }
};

export const HealthAlertCard: React.FC<HealthAlertCardProps> = ({
  alert,
  onAcknowledge,
  isLoading = false,
}) => {
  const styles = getLevelStyles(alert.level);
  const recommendations = getRecommendedActions(alert.level);
  const acknowledged = alert.acknowledged ?? alert.isAcknowledged ?? false;
  const alertId = alert.id ?? alert._id ?? '';
  const primaryBreach = alert.breachedMetrics?.[0];
  const metricLabel = primaryBreach?.metric ?? alert.metric;
  const metricValue = primaryBreach?.value ?? alert.value;
  const thresholdValue = primaryBreach?.threshold ?? alert.threshold;
  const alertRecommendation =
    alert.recommendation ?? alert.recommendations ?? alert.riskAssessment?.recommendation;
  const healthEffects = alert.healthEffects ?? alert.potentialHealthEffects;

  const handleAcknowledge = async () => {
    if (!alertId) return;
    await onAcknowledge(alertId);
  };

  return (
    <div
      className={`${styles.bg} border-2 ${styles.border} rounded-lg p-4 mb-3 transition-all ${
        !acknowledged ? 'animate-in fade-in slide-in-from-top-2 duration-300' : ''
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3 flex-1">
          <div
            className={`${styles.badge} rounded-full h-8 w-8 flex items-center justify-center font-bold text-sm flex-shrink-0 mt-0.5`}
          >
            {styles.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-gray-800">{alert.message}</h3>
              {!acknowledged && (
                <span className="inline-block h-2 w-2 bg-red-500 rounded-full animate-pulse" />
              )}
            </div>
            {metricLabel && metricValue !== undefined && metricValue !== null && (
              <p className="text-xs text-gray-600">
                {metricLabel}: {Number(metricValue).toFixed(1)}
                {thresholdValue !== undefined && thresholdValue !== null
                  ? ` (threshold: ${Number(thresholdValue).toFixed(1)})`
                  : ''}
              </p>
            )}
            {alert.timestamp && <p className="text-xs text-gray-500 mt-1">{formatTime(alert.timestamp)}</p>}
          </div>
        </div>

        {!acknowledged && (
          <button
            onClick={handleAcknowledge}
            disabled={isLoading}
            className="ml-2 px-3 py-1 bg-white border border-gray-300 rounded text-xs font-medium hover:bg-gray-50 disabled:opacity-50 whitespace-nowrap"
          >
            {isLoading ? 'Acknowledging...' : 'Acknowledge'}
          </button>
        )}
        {acknowledged && (
          <span className="ml-2 text-xs text-gray-500 font-medium">Acknowledged</span>
        )}
      </div>

      {/* Health Effects */}
      {healthEffects && healthEffects.length > 0 && (
        <div className="mb-3 bg-white/50 rounded p-2">
          <p className="text-xs font-medium text-gray-700 mb-1">Potential Health Effects:</p>
          <ul className="text-xs text-gray-600 space-y-0.5">
            {healthEffects.map((effect, idx) => (
              <li key={idx} className="flex gap-2">
                <span className="text-gray-400">•</span>
                <span>{effect}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recommendation */}
      {alertRecommendation && (
        <div className="mb-3 bg-white/50 rounded p-2">
          <p className="text-xs font-medium text-gray-700 mb-1">Recommendation:</p>
          <p className="text-xs text-gray-600">{alertRecommendation}</p>
        </div>
      )}

      {/* Suggested Actions */}
      {recommendations.length > 0 && (
        <div className="bg-white/50 rounded p-2">
          <p className="text-xs font-medium text-gray-700 mb-1">Recommended Actions:</p>
          <ul className="text-xs text-gray-600 space-y-0.5">
            {recommendations.map((action, idx) => (
              <li key={idx} className="flex gap-2">
                <span className="text-gray-400">✓</span>
                <span>{action}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
