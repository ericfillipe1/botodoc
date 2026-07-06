import { UsageCommunication } from '@/types';
import fs from 'fs';
import path from 'path';
import * as yaml from 'js-yaml';

interface ParsedStep {
  id: string;
  title?: string;
  description?: string;
  subSteps: string[];
  usages: UsageCommunication[];
}

interface DefaultComponent {
  type: string;
  name: string;
  description?: string;
}

export function extractAllStepsFromJavaFiles(repoPath: string, defaultComponent?: DefaultComponent): Map<string, ParsedStep> {
  const stepsMap = new Map<string, ParsedStep>();
  const srcPath = path.join(repoPath, 'src');
  
  if (!fs.existsSync(srcPath)) {
    console.log('src path não existe:', srcPath);
    return stepsMap;
  }

  // Usa componente padrão do botodoc.json ou fallback
  const projectName = defaultComponent?.name || 'example-1';

  const javaFiles = findJavaFiles(srcPath);
  console.log('Arquivos Java encontrados:', javaFiles.length);
  
  for (const file of javaFiles) {
    const content = fs.readFileSync(file, 'utf-8');
    const className = path.basename(file, '.java');
    
    // Extrai blocos botodoc do arquivo
    const botodocBlocks = extractBotodocBlocks(content);
    console.log(`Blocos botodoc em ${className}:`, botodocBlocks.length);
    
    for (const block of botodocBlocks) {
      try {
        const parsed = yaml.load(block) as any;
        console.log('Parsed YAML:', JSON.stringify(parsed));
        
        if (parsed.step) {
          const stepId = parsed.step.id;
          console.log('Step ID encontrado:', stepId);
          
          if (!stepsMap.has(stepId)) {
            stepsMap.set(stepId, {
              id: stepId,
              title: '',
              description: '',
              subSteps: [],
              usages: [],
            });
          }
          
          const existing = stepsMap.get(stepId)!;
          
          // Extrai recursos (agora é uma lista)
          const resources = Array.isArray(parsed.resource) ? parsed.resource : [];
          console.log('Resources encontrados:', resources.length);
          
          const usagesFromResources = resources.map((r: any) => {
            let techType = r.technology?.type || '';
            let techName = r.technology?.name || '';
            
            // Se não tem tecnologia especificada, deduz do código
            if (!techType) {
              techType = detectTechnology(content, className);
            }
            
            // Extrai nome do tópico ou endpoint automaticamente se não especificado
            if (!techName) {
              if (techType.toLowerCase().includes('kafka')) {
                techName = extractTopicFromContext(content, className) || '';
              } else if (techType.toLowerCase().includes('rest')) {
                techName = extractEndpointFromContext(content, className) || '';
              } else if (techType.toLowerCase().includes('mongo')) {
                techName = extractCollectionFromContext(content, className) || '';
              }
            }
            
            // Determina se é entrada (só tem origin) ou saída (só tem destination)
            const hasOrigin = !!r.origin;
            const hasDestination = !!r.destination;
            
            let origin, destination, description;
            
            if (hasOrigin && !hasDestination) {
              // Entrada: origin -> technology -> este componente
              origin = {
                type: normalizeType(r.origin.type),
                name: r.origin.name || '',
              };
              // Adiciona componente atual como destino
              destination = defaultComponent ? {
                type: normalizeType(defaultComponent.type),
                name: defaultComponent.name,
              } : {
                type: 'SPRING-BOOT',
                name: projectName,
              };
              description = r.origin.description || `Consome ${techType}`;
            } else if (!hasOrigin && hasDestination) {
              // Saída: este componente -> technology -> destination
              // Usa componente padrão do botodoc.json como origem
              origin = defaultComponent ? {
                type: normalizeType(defaultComponent.type),
                name: defaultComponent.name,
              } : {
                type: 'SPRING-BOOT',
                name: projectName,
              };
              destination = {
                type: normalizeType(r.destination.type),
                name: r.destination.name || '',
              };
              description = r.destination.description || `Envia via ${techType}`;
            } else if (hasOrigin && hasDestination) {
              // Completo: origin -> technology -> destination
              origin = {
                type: normalizeType(r.origin.type),
                name: r.origin.name || '',
              };
              destination = {
                type: normalizeType(r.destination.type),
                name: r.destination.name || '',
              };
              description = r.destination.description || r.origin.description || `${techType}`;
            } else {
              // Só tecnologia
              origin = undefined;
              destination = undefined;
              description = `Usa ${techType}`;
            }
            
            return {
              origin,
              technology: techType,
              destination,
              description,
              techName, // Nome do tópico/endpoint extraído
            };
          }).filter((u: any) => u.technology);
          
          console.log('Usages extraídos:', usagesFromResources.length);
          
          // Merge das informações
          stepsMap.set(stepId, {
            ...existing,
            title: parsed.step.nome || parsed.step.title || existing.title,
            description: parsed.step.descricao || parsed.step.description || existing.description,
            subSteps: [...existing.subSteps],
            usages: [...existing.usages, ...usagesFromResources],
          });
        }
      } catch (e: any) {
        console.log('Erro ao parsear YAML:', e.message);
      }
    }
    
    // Extrai subSteps automaticamente do código e adiciona aos steps encontrados
    const autoSubSteps = extractSubStepsFromCode(content, className);
    console.log(`SubSteps automáticos em ${className}:`, autoSubSteps.length);
    
    for (const [stepId, step] of stepsMap.entries()) {
      if (autoSubSteps.length > 0 && step.subSteps.length === 0) {
        console.log(`Adicionando ${autoSubSteps.length} subSteps ao step ${stepId}`);
        step.subSteps = autoSubSteps;
      }
    }
  }
  
  console.log('Total de steps mapeados:', stepsMap.size);
  return stepsMap;
}

function extractProjectName(repoPath: string): string {
  const pomPath = path.join(repoPath, 'pom.xml');
  if (!fs.existsSync(pomPath)) {
    return 'example-1';
  }
  
  const pomContent = fs.readFileSync(pomPath, 'utf-8');
  const artifactIdMatch = pomContent.match(/<artifactId>([^<]+)<\/artifactId>/);
  
  if (artifactIdMatch) {
    return artifactIdMatch[1];
  }
  
  return 'example-1';
}

function extractBotodocBlocks(content: string): string[] {
  const blocks: string[] = [];
  
  // Extrai de comentários de bloco /** */
  const blockPattern = /\/\*\*[\s\S]*?botodoc:[\s\S]*?\*\//g;
  let match;
  
  while ((match = blockPattern.exec(content)) !== null) {
    const commentBlock = match[0];
    // Remove /*, */, ** e * do início das linhas
    const yamlLines = commentBlock
      .replace(/\/\*\*/g, '')
      .replace(/\*\//g, '')
      .split('\n')
      .map(line => line.replace(/^\s*\*\s?/, ''))
      .filter(line => !line.includes('botodoc:') && line.trim())
      .join('\n');
    
    if (yamlLines.trim()) {
      blocks.push(yamlLines);
    }
  }
  
  // Também extrai de comentários de linha // botodoc:
  const linePattern = /\/\/\s*botodoc:\s*\n([\s\S]*?)(?=\n\s*(?:public|private|protected|@|\/\*\*)|$)/g;
  while ((match = linePattern.exec(content)) !== null) {
    const commentBlock = match[1];
    const lines = commentBlock.split('\n').filter(l => l.trim().startsWith('//'));
    const yamlLines = lines.map(line => line.replace(/^\s*\/\/\s*/, '')).join('\n');
    
    if (yamlLines.trim()) {
      blocks.push(yamlLines);
    }
  }
  
  return blocks;
}

function extractSubStepsFromCode(content: string, className: string): string[] {
  const subSteps: string[] = [];
  const lines = content.split('\n');
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    // Detecta operações significativas
    if (trimmed.includes('repository.save')) {
      subSteps.push('Salva entidade no banco de dados');
    } else if (trimmed.includes('kafkaTemplate.send')) {
      subSteps.push('Publica mensagem no Kafka');
    } else if (trimmed.includes('restClient.') || trimmed.includes('.post(') || trimmed.includes('.get(')) {
      subSteps.push('Chama serviço externo via REST');
    } else if (trimmed.includes('@KafkaListener')) {
      subSteps.push('Escuta tópico Kafka');
    } else if (trimmed.includes('new ') && !trimmed.includes('//')) {
      const className_match = trimmed.match(/new\s+(\w+)/);
      if (className_match) {
        subSteps.push(`Cria instância de ${className_match[1]}`);
      }
    }
  }
  
  return subSteps.length > 0 ? subSteps : ['Executa lógica da classe'];
}

function detectTechnology(content: string, className: string): string {
  if (content.includes('@KafkaListener') || content.includes('kafkaTemplate')) {
    return 'Apache Kafka';
  }
  if (content.includes('RestClient') || content.includes('restTemplate')) {
    return 'REST API';
  }
  if (content.includes('MongoRepository') || content.includes('mongo')) {
    return 'MongoDB';
  }
  return '';
}

function extractTopicFromContext(content: string, className: string): string | null {
  const kafkaListenerMatch = /@KafkaListener\s*\(\s*topics\s*=\s*"([^"]+)"/.exec(content);
  if (kafkaListenerMatch) {
    return kafkaListenerMatch[1];
  }
  
  const kafkaSendMatch = /kafkaTemplate\.send\s*\(\s*"([^"]+)"/.exec(content);
  if (kafkaSendMatch) {
    return kafkaSendMatch[1];
  }
  
  return null;
}

function extractEndpointFromContext(content: string, className: string): string | null {
  const uriMatch = /\.uri\s*\(\s*"([^"]+)"/.exec(content);
  if (uriMatch) {
    return uriMatch[1];
  }
  
  const baseUrlMatch = /\.baseUrl\s*\(\s*"([^"]+)"/.exec(content);
  if (baseUrlMatch) {
    return baseUrlMatch[1];
  }
  
  return null;
}

function extractCollectionFromContext(content: string, className: string): string | null {
  const collectionMatch = /MongoRepository<\w+,\s*\w+>\s*\{\s*(?:\/\/.*)*\n\s*(?:Optional<)?\w+\s+\w+\(/.exec(content);
  if (collectionMatch) {
    const entityMatch = /MongoRepository<(\w+)/.exec(content);
    if (entityMatch) {
      return `colecao.${entityMatch[1].toLowerCase()}`;
    }
  }
  return null;
}

function normalizeType(type: string | undefined): string {
  if (!type) return 'API';
  const normalized = type.toLowerCase();
  if (normalized.includes('spring')) return 'SPRING-BOOT';
  if (normalized.includes('mongo')) return 'DATABASE';
  if (normalized.includes('kafka') || normalized.includes('rabbit')) return 'QUEUE';
  if (normalized.includes('rest') || normalized.includes('api')) return 'API';
  return type.toUpperCase();
}

function findJavaFiles(dir: string): string[] {
  const files: string[] = [];
  const entries = fs.readdirSync(dir);
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !entry.startsWith('.') && entry !== 'target') {
      files.push(...findJavaFiles(fullPath));
    } else if (stat.isFile() && entry.endsWith('.java')) {
      files.push(fullPath);
    }
  }
  
  return files;
}
