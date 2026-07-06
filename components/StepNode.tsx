'use client';

import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';

interface StepNodeProps {
  data: {
    label: string;
    isSubStep?: boolean;
    stepType?: 'NORMAL' | 'CONDITIONAL' | 'CONDITIONAL_BRANCH';
    level?: number;
  };
}

function StepNodeComponent({ data }: StepNodeProps) {
  const isSubStep = data.isSubStep === true;
  const stepType = data.stepType || 'NORMAL';
  const level = data.level ?? 0;
  
  let bgColor, textColor, borderColor;
  
  if (stepType === 'CONDITIONAL_BRANCH') {
    bgColor = '#fef3c7'; // amber-100
    textColor = '#92400e'; // amber-800
    borderColor = '#f59e0b'; // amber-500
  } else if (level === 0) {
    bgColor = '#4f46e5'; // indigo-600
    textColor = '#ffffff';
    borderColor = '#4338ca'; // indigo-700
  } else if (level === 1) {
    bgColor = '#10b981'; // emerald-500
    textColor = '#ffffff';
    borderColor = '#059669'; // emerald-600
  } else {
    bgColor = '#f9fafb'; // gray-50
    textColor = '#374151'; // gray-700
    borderColor = '#d1d5db'; // gray-300
  }
  
  const width = level > 0 ? 320 - (level * 20) : 320;
  
  return (
    <div 
      className="relative rounded-xl p-5 flex items-center justify-center font-bold text-center border-2 shadow-lg"
      style={{ 
        width: `${width}px`, 
        minHeight: '120px',
        backgroundColor: bgColor,
        color: textColor,
        borderColor: borderColor,
      }}
    >
      <Handle type="target" position={Position.Top} style={{ background: '#6b7280' }} />
      <div className="whitespace-pre-wrap text-sm leading-relaxed">{data.label}</div>
      <Handle type="source" position={Position.Bottom} style={{ background: '#6b7280' }} />
    </div>
  );
}

export const StepNode = memo(StepNodeComponent);
