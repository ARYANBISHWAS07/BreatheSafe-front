'use client';

import React from 'react';

interface ConnectionBadgeProps {
  connected: boolean;
  className?: string;
}

export const ConnectionBadge: React.FC<ConnectionBadgeProps> = ({ connected, className = '' }) => {
  return (
    <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold tracking-[0.2em] uppercase ${connected ? 'border-emerald-300/60 bg-emerald-400/10 text-emerald-200' : 'border-rose-300/60 bg-rose-400/10 text-rose-200'} ${className}`}>
      <div
        className={`h-2 w-2 rounded-full ${
          connected ? 'bg-emerald-300 animate-pulse' : 'bg-rose-300'
        }`}
      />
      <span>
        {connected ? 'Linked' : 'Offline'}
      </span>
    </div>
  );
};
