'use client';

import React from 'react';

interface ConnectionBadgeProps {
  connected: boolean;
  className?: string;
}

export const ConnectionBadge: React.FC<ConnectionBadgeProps> = ({ connected, className = '' }) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div
        className={`h-2 w-2 rounded-full ${
          connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
        }`}
      />
      <span className={`text-xs font-medium ${connected ? 'text-green-600' : 'text-red-600'}`}>
        {connected ? 'Connected' : 'Disconnected'}
      </span>
    </div>
  );
};
