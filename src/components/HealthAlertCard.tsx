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
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-300/50',
        badge: 'bg-emerald-300/20 text-emerald-100 border border-emerald-300/35',
        icon: 'OK',
      };
    case 'CAUTION':
      return {
        bg: 'bg-amber-500/10',
        border: 'border-amber-300/50',
        badge: 'bg-amber-300/20 text-amber-100 border border-amber-300/35',
        icon: '!',
      };
    case 'WARNING':
      return {
        bg: 'bg-orange-500/10',
        border: 'border-orange-300/50',
        badge: 'bg-orange-300/20 text-orange-100 border border-orange-300/35',
        icon: '!',
      };
    case 'DANGER':
      return {
        bg: 'bg-rose-500/10',
        border: 'border-rose-300/55',
        badge: 'bg-rose-300/20 text-rose-100 border border-rose-300/40',
        icon: 'X',
      };
    default:
      return {
        bg: 'bg-slate-500/10',
        border: 'border-slate-300/40',
        badge: 'bg-slate-300/20 text-slate-100 border border-slate-300/35',
        icon: '-',
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
      className={`${styles.bg} border ${styles.border} rounded-2xl p-4 mb-3 transition-all backdrop-blur-sm ${
        !acknowledged ? 'animate-in fade-in slide-in-from-top-2 duration-300' : ''
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3 flex-1">
          <div
            className={`${styles.badge} rounded-full h-8 w-8 flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5`}
          >
            {styles.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-slate-100">{alert.message}</h3>
              {!acknowledged && (
                <span className="inline-block h-2 w-2 bg-rose-300 rounded-full animate-pulse" />
              )}
            </div>
            {metricLabel && metricValue !== undefined && metricValue !== null && (
              <p className="text-xs text-slate-300">
                {metricLabel}: {Number(metricValue).toFixed(1)}
                {thresholdValue !== undefined && thresholdValue !== null
                  ? ` (threshold: ${Number(thresholdValue).toFixed(1)})`
                  : ''}
              </p>
            )}
            {alert.timestamp && <p className="text-xs text-slate-400 mt-1">{formatTime(alert.timestamp)}</p>}
          </div>
        </div>

        {!acknowledged && (
          <button
            onClick={handleAcknowledge}
            disabled={isLoading}
            className="ml-2 px-3 py-1.5 bg-slate-900/70 border border-cyan-200/35 rounded text-xs font-semibold text-cyan-100 hover:border-cyan-200/70 disabled:opacity-50 whitespace-nowrap"
          >
            {isLoading ? 'Acknowledging...' : 'Acknowledge'}
          </button>
        )}
        {acknowledged && (
          <span className="ml-2 text-xs text-slate-400 font-medium">Acknowledged</span>
        )}
      </div>

      {/* Health Effects */}
      {healthEffects && healthEffects.length > 0 && (
        <div className="mb-3 bg-slate-950/45 border border-sky-200/20 rounded-xl p-2.5">
          <p className="text-xs font-medium text-slate-200 mb-1">Potential Health Effects:</p>
          <ul className="text-xs text-slate-300 space-y-0.5">
            {healthEffects.map((effect, idx) => (
              <li key={idx} className="flex gap-2">
                <span className="text-sky-300">•</span>
                <span>{effect}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recommendation */}
      {alertRecommendation && (
        <div className="mb-3 bg-slate-950/45 border border-sky-200/20 rounded-xl p-2.5">
          <p className="text-xs font-medium text-slate-200 mb-1">Recommendation:</p>
          <p className="text-xs text-slate-300">{alertRecommendation}</p>
        </div>
      )}

      {/* Suggested Actions */}
      {recommendations.length > 0 && (
        <div className="bg-slate-950/45 border border-sky-200/20 rounded-xl p-2.5">
          <p className="text-xs font-medium text-slate-200 mb-1">Recommended Actions:</p>
          <ul className="text-xs text-slate-300 space-y-0.5">
            {recommendations.map((action, idx) => (
              <li key={idx} className="flex gap-2">
                <span className="text-cyan-300">+</span>
                <span>{action}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
