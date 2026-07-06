// Configuração centralizada de ícones e cores

export interface IconConfig {
  icon: string;
  color: string;
  label?: string;
}

export const TECHNOLOGY_ICONS: Record<string, IconConfig> = {
  'apache kafka': {
    icon: 'simple-icons:apachekafka',
    color: '#231F20',
    label: 'Kafka',
  },
  'rest api': {
    icon: 'mdi:api',
    color: '#4CAF50',
    label: 'REST',
  },
  'mongodb': {
    icon: 'simple-icons:mongodb',
    color: '#47A248',
    label: 'MongoDB',
  },
  'postgresql': {
    icon: 'simple-icons:postgresql',
    color: '#4169E1',
    label: 'PostgreSQL',
  },
  'rabbitmq': {
    icon: 'simple-icons:rabbitmq',
    color: '#FF6600',
    label: 'RabbitMQ',
  },
};

export const COMPONENT_TYPE_ICONS: Record<string, IconConfig> = {
  'spring-boot': {
    icon: 'simple-icons:springboot',
    color: '#6DB33F',
    label: 'Spring Boot',
  },
  'queue': {
    icon: 'simple-icons:apachekafka',
    color: '#231F20',
    label: 'Queue',
  },
  'database': {
    icon: 'simple-icons:mongodb',
    color: '#47A248',
    label: 'Database',
  },
  'api': {
    icon: 'mdi:api',
    color: '#4CAF50',
    label: 'API',
  },
  'frontend': {
    icon: 'mdi:monitor',
    color: '#3B82F6',
    label: 'Frontend',
  },
};

export function getTechnologyIcon(technology: string): IconConfig {
  const tech = technology.toLowerCase();
  
  // Busca exata primeiro
  if (TECHNOLOGY_ICONS[tech]) {
    return TECHNOLOGY_ICONS[tech];
  }
  
  // Busca parcial
  for (const [key, config] of Object.entries(TECHNOLOGY_ICONS)) {
    if (tech.includes(key)) {
      return config;
    }
  }
  
  // Fallback
  return {
    icon: 'mdi:code-braces',
    color: '#6B7280',
    label: technology,
  };
}

export function getComponentIcon(type: string, name?: string): IconConfig {
  const componentType = type.toLowerCase();
  
  // Busca por tipo
  if (COMPONENT_TYPE_ICONS[componentType]) {
    return COMPONENT_TYPE_ICONS[componentType];
  }
  
  // Busca por nome
  if (name) {
    const nameLower = name.toLowerCase();
    for (const [key, config] of Object.entries(TECHNOLOGY_ICONS)) {
      if (nameLower.includes(key)) {
        return config;
      }
    }
  }
  
  // Fallback
  return {
    icon: 'mdi:cube-outline',
    color: '#6B7280',
    label: name || type,
  };
}
