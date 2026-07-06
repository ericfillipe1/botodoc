'use client';

import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { TechIcon } from './TechIcon';
import { UsageCommunication } from '@/types';

interface UsageNodeProps {
  data: {
    usage: UsageCommunication;
  };
}

function UsageNodeComponent({ data }: UsageNodeProps) {
  const usage = data.usage;

  return (
    <div className="bg-white rounded-xl p-6 border-2 border-gray-200 min-w-[550px] shadow-md">
      <Handle type="target" position={Position.Left} style={{ background: '#9ca3af' }} />
      <Handle type="source" position={Position.Right} style={{ background: '#9ca3af' }} />
      
      {/* Fluxo: Componente -> Tecnologia -> Componente */}
      <div className="flex items-center gap-6">
        {/* Origem */}
        {usage.origin && (
          <div className="flex flex-col items-center gap-3 p-4 bg-blue-50 rounded-xl border-2 border-blue-200 min-w-[150px]">
            <div className="p-3 bg-white rounded-full shadow-sm">
              <TechIcon component={usage.origin} size={32} />
            </div>
            <div className="text-sm font-semibold text-blue-900 text-center leading-tight">
              {usage.origin.name}
            </div>
          </div>
        )}

        {/* Seta + Tecnologia com nome do tópico/endpoint */}
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-0.5 bg-gray-400" />
            <div className="p-3 bg-indigo-100 rounded-xl border-2 border-indigo-300">
              <TechIcon technology={usage.technology} size={28} />
            </div>
            <div className="w-8 h-0.5 bg-gray-400 relative">
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-l-5 border-l-gray-400 border-t-3 border-t-transparent border-b-3 border-b-transparent" />
            </div>
          </div>
          <span className="text-sm font-mono bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full">
            {usage.technology}
          </span>
          {/* Nome do tópico ou endpoint abaixo */}
          {(usage as any).techName && (
            <span className="text-xs text-gray-600 font-medium mt-1 max-w-[250px] text-center break-all bg-gray-50 px-2 py-1 rounded">
              {(usage as any).techName}
            </span>
          )}
        </div>

        {/* Destino */}
        {usage.destination && (
          <div className="flex flex-col items-center gap-3 p-4 bg-green-50 rounded-xl border-2 border-green-200 min-w-[150px]">
            <div className="p-3 bg-white rounded-full shadow-sm">
              <TechIcon component={usage.destination} size={32} />
            </div>
            <div className="text-sm font-semibold text-green-900 text-center leading-tight">
              {usage.destination.name}
            </div>
          </div>
        )}
      </div>

      {/* Descrição */}
      {usage.description && (
        <p className="text-sm text-gray-600 mt-4 pt-3 border-t border-gray-100 italic leading-relaxed">
          💡 {usage.description}
        </p>
      )}
      
      <Handle type="source" position={Position.Right} style={{ background: '#9ca3af' }} />
    </div>
  );
}

export const UsageNode = memo(UsageNodeComponent);
