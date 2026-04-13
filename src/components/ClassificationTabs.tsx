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
          className={`whitespace-nowrap px-4 py-2 rounded-lg font-medium transition-all ${
            selected === classification
              ? 'bg-teal-600 text-white shadow-md'
              : 'bg-white text-gray-700 border border-gray-200 hover:border-teal-300'
          }`}
        >
          {getClassificationDisplayName(classification)}
        </button>
      ))}
    </div>
  );
};
