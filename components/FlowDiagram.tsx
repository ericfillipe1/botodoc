'use client';

import { useCallback, useMemo } from 'react';
import { ReactFlow, Background, Controls, MiniMap } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Step } from '@/types';
import { convertStepsToFlowElements } from '@/utils/flowConverter';
import { COLORS } from '@/constants/layout';
import { StepNode } from './StepNode';
import { UsageNode } from './UsageNode';
import { ConditionalNode } from './ConditionalNode';

const nodeTypes = {
  stepNode: StepNode,
  usageNode: UsageNode,
  conditionalNode: ConditionalNode,
};

interface FlowDiagramProps {
  steps: Step[];
}

export function FlowDiagram({ steps }: FlowDiagramProps) {
  const { nodes, edges } = useMemo(() => convertStepsToFlowElements(steps), [steps]);

  const onNodesChange = useCallback(() => {}, []);
  const onEdgesChange = useCallback(() => {}, []);

  return (
    <div style={{ width: '100%', height: 'calc(100vh - 96px)' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
        minZoom={0.1}
        maxZoom={2}
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
      >
        <Background color={COLORS.BACKGROUND} gap={20} />
        <Controls />
        <MiniMap 
          nodeStrokeWidth={3}
          zoomable
          pannable
        />
      </ReactFlow>
    </div>
  );
}
