import { Step, ProcessFlow, UsageCommunication, StepType } from '@/types';
import fs from 'fs';
import path from 'path';
import { extractAllStepsFromJavaFiles } from './javaParser';

interface BotodocConfig {
  processo: string;
  componente_padrao?: {
    type: string;
    name: string;
    description?: string;
  };
  steps: Array<{
    passo_vertical: number;
    nome: string;
    condicional?: {
      variavel: string;
      ramos: Array<{
        condicao: string;
        label: string;
        steps: Array<{
          passo_vertical: number;
          nome: string;
        }>;
      }>;
    };
  }>;
}

export function parseRepository(repoPath: string): ProcessFlow {
  const configPath = path.join(repoPath, 'botodoc.json');
  
  if (!fs.existsSync(configPath)) {
    throw new Error('botodoc.json não encontrado no repositório');
  }

  const configContent = fs.readFileSync(configPath, 'utf-8');
  const config: BotodocConfig = JSON.parse(configContent);

  // Extrai steps e vínculos dos arquivos Java
  const javaSteps = extractAllStepsFromJavaFiles(repoPath, config.componente_padrao);

  // Monta os steps na ordem do config, expandindo condicionais
  const allSteps: Step[] = [];
  let stepCounter = 1;

  config.steps.forEach((configStep) => {
    if (configStep.condicional) {
      // Verifica se há diferenças reais entre os ramos
      let hasRealDifferences = false;
      
      if (configStep.condicional.ramos.length >= 2) {
        const firstRamo = configStep.condicional.ramos[0];
        
        // Compara cada ramo com o primeiro
        for (let i = 1; i < configStep.condicional.ramos.length; i++) {
          const otherRamo = configStep.condicional.ramos[i];
          
          // Verifica diferença no número de steps
          if (firstRamo.steps.length !== otherRamo.steps.length) {
            hasRealDifferences = true;
            break;
          }
          
          // Verifica diferença nos nomes dos steps
          for (let j = 0; j < firstRamo.steps.length; j++) {
            if (firstRamo.steps[j].nome !== otherRamo.steps[j].nome) {
              hasRealDifferences = true;
              break;
            }
          }
          
          if (hasRealDifferences) break;
        }
      }
      
      // Só cria condicional se houver diferenças reais
      if (!hasRealDifferences && configStep.condicional.ramos.length > 0) {
        // Trata como step normal sem condicional
        const stepId = `STEP_${String(stepCounter++).padStart(3, '0')}`;
        const javaStep = javaSteps.get(stepId);
        
        const subStepsList = javaStep?.subSteps || [];
        const usagesList = javaStep?.usages || [];
        
        const subSteps = subStepsList.map((sub: string, i: number) => ({
          id: `${stepId}.${i + 1}`,
          title: sub,
          usages: usagesList.length > 0 && i < usagesList.length ? [usagesList[i]] : [],
          subSteps: [],
          stepType: 'NORMAL' as const,
        }));
        
        allSteps.push({
          id: stepId,
          title: configStep.nome,
          description: javaStep?.description,
          usages: [],
          stepType: 'NORMAL',
          subSteps,
        });
        
        return; // Skip conditional creation
      }
      
      // Step principal NORMAL
      const mainStepId = `STEP_${String(stepCounter++).padStart(3, '0')}`;
      
      // Cria subStep CONDITIONAL que contém os ramos
      const conditionalSubStep: Step = {
        id: mainStepId,
        title: configStep.nome,
        description: `Condicional: ${configStep.condicional.variavel}`,
        usages: [],
        stepType: 'CONDITIONAL',
        subSteps: configStep.condicional.ramos.map((ramo, ramoIndex) => {
          // Coleta todos os usos e steps do ramo
          let ramoUsages: UsageCommunication[] = [];
          const ramoSubSteps: Step[] = [];
          
          ramo.steps.forEach((ramoStep, stepIdx) => {
            const ramoStepId = `STEP_${String(stepCounter++).padStart(3, '0')}`;
            const javaStep = javaSteps.get(ramoStepId);
            
            // Adiciona o step do ramo como subStep
            if (javaStep) {
              const subStepsList = javaStep.subSteps || [];
              const usagesList = javaStep.usages || [];
              
              // Agrega usos deste step
              ramoUsages = [...ramoUsages, ...usagesList];
              
              // Adiciona subSteps deste step
              subStepsList.forEach((sub, i) => {
                ramoSubSteps.push({
                  id: `${ramoStepId}.${i + 1}`,
                  title: sub,
                  usages: usagesList.length > 0 && i < usagesList.length ? [usagesList[i]] : [],
                  subSteps: [],
                  stepType: 'NORMAL' as const,
                });
              });
            }
          });
          
          // Cada ramo é um CONDITIONAL_BRANCH com todos seus usos e subSteps agregados
          return {
            id: `${mainStepId}.${ramoIndex + 1}`,
            title: ramo.label,
            description: `Ramo: ${ramo.condicao}`,
            usages: ramoUsages,
            stepType: 'CONDITIONAL_BRANCH',
            subSteps: ramoSubSteps,
          };
        }),
      };
      
      allSteps.push({
        id: mainStepId,
        title: configStep.nome,
        description: undefined,
        usages: [],
        stepType: 'NORMAL',
        subSteps: [conditionalSubStep],
      });

    } else {
      // Step normal sem condicional
      const stepId = `STEP_${String(stepCounter++).padStart(3, '0')}`;
      const javaStep = javaSteps.get(stepId);
      
      const subStepsList = javaStep?.subSteps || [];
      const usagesList = javaStep?.usages || [];
      
      const subSteps = subStepsList.map((sub: string, i: number) => ({
        id: `${stepId}.${i + 1}`,
        title: sub,
        usages: usagesList.length > 0 && i < usagesList.length ? [usagesList[i]] : [],
        subSteps: [],
        stepType: 'NORMAL' as const,
      }));
      
      allSteps.push({
        id: stepId,
        title: configStep.nome || javaStep?.title || stepId,
        description: javaStep?.description,
        usages: [],
        stepType: 'NORMAL',
        subSteps,
      });
    }
  });

  return {
    name: config.processo,
    steps: allSteps,
  };
}
