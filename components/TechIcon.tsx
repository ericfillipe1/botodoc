'use client';

import { Icon } from '@iconify/react';
import { Component } from '@/types';
import { getTechnologyIcon, getComponentIcon } from '@/lib/iconConfig';

interface TechIconProps {
  component?: Component;
  technology?: string;
  size?: number;
}

export function TechIcon({ component, technology, size = 24 }: TechIconProps) {
  let config;
  
  if (technology) {
    // Usa configuração de tecnologia
    config = getTechnologyIcon(technology);
  } else if (component) {
    // Usa configuração de componente
    config = getComponentIcon(component.type, component.name);
  } else {
    // Fallback
    config = { icon: 'mdi:code-braces', color: '#6B7280' };
  }
  
  return <Icon icon={config.icon} width={size} height={size} style={{ color: config.color }} />;
}
