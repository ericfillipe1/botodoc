'use client';

import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';

interface ConditionalNodeProps {
  data: {
    label: string;
    variable?: string;
  };
}

function ConditionalNodeComponent({ data }: ConditionalNodeProps) {
  return (
    <div className="relative w-[120px] h-[120px] flex items-center justify-center">
      {/* Diamante usando clip-path */}
      <div 
        className="absolute inset-0 bg-gradient-to-br from-amber-400 to-orange-500 border-3 border-amber-600 shadow-lg"
        style={{
          clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
        }}
      />
      
      {/* Handles nas 4 direções */}
      <Handle type="target" position={Position.Top} style={{ background: '#f59e0b' }} />
      <Handle type="source" position={Position.Bottom} id="bottom" style={{ background: '#f59e0b' }} />
      <Handle type="source" position={Position.Right} id="right" style={{ background: '#f59e0b' }} />
      <Handle type="source" position={Position.Left} id="left" style={{ background: '#f59e0b' }} />
    </div>
  );
}

export const ConditionalNode = memo(ConditionalNodeComponent);
