'use client';

import React from 'react';
import { UserClassification } from '@/types';
import { getClassificationDisplayName } from '@/lib/utils';

interface ClassificationTabsProps {
  classifications: UserClassification[];
  selected: UserClassification;
  onSelect: (classification: UserClassification) => void;
}

export const ClassificationTabs: React.FC<ClassificationTabsProps> = ({
  classifications,
  selected,
  onSelect,
}) => {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {classifications.map((classification) => (
        <button
          key={classification}
          onClick={() => onSelect(classification)}
          className={`whitespace-nowrap rounded-xl border px-4 py-2.5 text-sm font-semibold tracking-wide transition-all ${
            selected === classification
              ? 'border-cyan-300/80 bg-cyan-400/20 text-cyan-100 shadow-[0_0_24px_-10px_rgba(60,247,255,0.9)]'
              : 'border-sky-200/25 bg-slate-900/45 text-slate-300 hover:border-cyan-300/55 hover:text-cyan-100'
          }`}
        >
          {getClassificationDisplayName(classification)}
        </button>
      ))}
    </div>
  );
};
