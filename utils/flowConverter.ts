import { type Node, type Edge, Position } from '@xyflow/react';
import { Step } from '../types';

interface FlowElements {
  nodes: Node[];
  edges: Edge[];
}

const LAYOUT = {
  NODE_WIDTH: 320,
  STEP_HEIGHT: 120,
  VERTICAL_SPACING: 50,
  LEVEL_INDENT: 80, // Indentação por nível
  USAGE_OFFSET: 400, // Distância horizontal para nodes de usage
};




export function convertStepsToFlowElements(steps: Step[]): FlowElements {
  let nodes: Node[] = [];
  let edges: Edge[] = [];

  let currentY = 0;
  let previousNodeId: string | null = null;

  // Passo 1 & 2: Renderizar steps principais e subSteps
  steps.forEach((step, index) => {
    const nodeId = `${step.id}-${index}`;
    const { currentY: _currentY,
      previousNodeId: _previousNodeId,
    } = convertSteps({
      currentY,
      currentX: 0,
      previousNodeId,
      nodeId,
      step,
      edges,
      nodes,
      level: 0
    });
    currentY = _currentY;
    previousNodeId = _previousNodeId;

  });

  return { nodes, edges };
}

type StepRender = {
  currentY: number,
  currentX: number,
  previousNodeId: string | null,
  nodeId: string,
  step: Step,
  level: number,


  nodes: Node[];
  edges: Edge[];
}

export function convertSteps(stepRender: StepRender) {
  const { nodeId, step, level } = stepRender;
  let previousNodeId = stepRender.previousNodeId;
  let currentY = stepRender.currentY;
  let currentX = stepRender.currentX;




  const indentX = level * LAYOUT.LEVEL_INDENT;
  const intialY = currentY;
  // Determinar o tipo de node baseado no stepType
  const nodeType = step.stepType === 'CONDITIONAL' ? 'conditionalNode' : 'stepNode';

  if (step.stepType !== 'CONDITIONAL') {

    stepRender.nodes.push({
      id: nodeId,
      type: nodeType,
      position: { x:  currentX  + indentX, y: currentY },
      data: {
        label: `${step.title}`,
        isSubStep: level > 0,
        stepType: step.stepType || 'NORMAL',
        level: level,
      },
      style: { background: 'transparent', border: 'none' },
      width: LAYOUT.NODE_WIDTH,
    });

  }

  if (previousNodeId) {
    stepRender.edges.push({
      id: `connection-${previousNodeId}-to-${nodeId}`,
      source: previousNodeId,
      target: nodeId,
      type: 'smoothstep',
      animated: true,
      style: { stroke: '#667eea', strokeWidth: 3 },
      markerEnd: { type: 'arrowclosed', color: '#667eea' },
    });
  }

  if (step.usages && step.usages.length > 0) {
    step.usages.forEach((usage, usageIndex) => {
      const usageNodeId = `${nodeId}-usage-${usageIndex}`;
      const usageX = currentX  + indentX + LAYOUT.USAGE_OFFSET;
      const usageY = currentY +300;

      stepRender.nodes.push({
        id: usageNodeId,
        type: 'usageNode',
        position: { x: usageX, y: usageY },
        data: {
          usage: usage,
        },
        style: { background: 'transparent', border: 'none' },
      });

      // Conectar o step ao usage
      stepRender.edges.push({
        id: `edge-${nodeId}-to-${usageNodeId}`,
        source: nodeId,
        target: usageNodeId,
        type: 'smoothstep',
        animated: true,
        style: { stroke: '#667eea', strokeWidth: 3 },
        markerEnd: { type: 'arrowclosed', color: '#667eea' },
      });
      currentY = currentY+ 900
    });
  }

  previousNodeId = nodeId;
  currentY += LAYOUT.STEP_HEIGHT + LAYOUT.VERTICAL_SPACING;

  // Adicionar subSteps se existirem
  if (step.subSteps && step.subSteps.length > 0) {
    step.subSteps.forEach((subStep, subIndex) => {
      let newCurrentX = currentX;

      if (step.stepType === 'CONDITIONAL' || step.stepType === "CONDITIONAL_BRANCH") {
        newCurrentX = newCurrentX + 1000;
      }
      const { currentY: _currentY,
        previousNodeId: _previousNodeId,
        nodes: _nodes,
        edges: _edges
      } = convertSteps({
        nodes: stepRender.nodes,
        edges: stepRender.edges,
        currentY,
        currentX:newCurrentX,
        previousNodeId,
        nodeId: `${nodeId}-${subIndex}`,
        step: subStep,
        level: level + 1
      });
      currentY = _currentY;
      if (step.stepType === 'CONDITIONAL') {

        previousNodeId = nodeId;

      } else {
        previousNodeId = _previousNodeId;
      }

      currentY += 200; // Aumentado de 80 para 120
    });

    currentY += LAYOUT.VERTICAL_SPACING;
  }
  if (step.stepType === 'CONDITIONAL') {

    stepRender.nodes.push({
      id: nodeId,
      type: nodeType,
      position: { x:  indentX, y: intialY + (currentY - intialY) / 2 },
      data: {
        label: `${step.title}`,
        isSubStep: level > 0,
        stepType: step.stepType || 'NORMAL',
        level: level,
      },
      style: { background: 'transparent', border: 'none' },
      width: LAYOUT.NODE_WIDTH,
    });
    previousNodeId = nodeId
  }

  return { nodes: stepRender.nodes, edges: stepRender.edges, currentY, previousNodeId };
}
