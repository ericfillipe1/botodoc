'use client';

import { Step, UsageCommunication } from '@/types';
import { TechIcon } from './TechIcon';

interface UsagePanelProps {
  step?: Step;
}

export function UsagePanel({ step }: UsagePanelProps) {
  if (!step || !step.usages || step.usages.length === 0) {
    return (
      <div className="w-80 bg-white border-l border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">🔗 Vínculos</h3>
        <p className="text-gray-500 text-sm">Selecione um step para ver seus vínculos de comunicação</p>
      </div>
    );
  }

  return (
    <div className="w-80 bg-white border-l border-gray-200 p-6 overflow-y-auto">
      <h3 className="text-lg font-bold text-gray-800 mb-4">🔗 Vínculos</h3>
      
      <div className="mb-4 pb-4 border-b border-gray-200">
        <h4 className="font-semibold text-indigo-600">{step.id}</h4>
        <p className="text-sm text-gray-600">{step.title}</p>
      </div>

      <div className="space-y-3">
        {step.usages.map((usage, index) => (
          <UsageCard key={index} usage={usage} />
        ))}
      </div>
    </div>
  );
}

function UsageCard({ usage }: { usage: UsageCommunication }) {
  return (
    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
      <div className="flex items-center gap-2 mb-2">
        <TechIcon technology={usage.technology} size={18} />
        <span className="text-xs font-mono bg-indigo-100 text-indigo-700 px-2 py-1 rounded">
          {usage.technology}
        </span>
      </div>

      {usage.origin && (
        <div className="flex items-center gap-2 text-sm mb-2">
          <TechIcon component={usage.origin} size={16} />
          <span className="font-medium text-gray-700">{usage.origin.name}</span>
        </div>
      )}

      <div className="flex items-center justify-center my-2">
        <span className="text-gray-400">↓</span>
      </div>

      {usage.destination && (
        <div className="flex items-center gap-2 text-sm">
          <TechIcon component={usage.destination} size={16} />
          <span className="font-medium text-gray-700">{usage.destination.name}</span>
        </div>
      )}

      {usage.description && (
        <p className="text-xs text-gray-500 mt-2 italic">{usage.description}</p>
      )}
    </div>
  );
}
