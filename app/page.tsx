'use client';

import { useState, useEffect } from 'react';
import { FlowDiagram } from '@/components/FlowDiagram';
import { ProcessFlow } from '@/types';

export default function Home() {
  const [currentFlow, setCurrentFlow] = useState<ProcessFlow | null>(null);
  const [loading, setLoading] = useState(true);
  const [repoPath, setRepoPath] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasConfiguredPath, setHasConfiguredPath] = useState(false);

  useEffect(() => {
    // Verifica se já tem path configurado no localStorage
    const savedPath = localStorage.getItem('botodoc_repo_path');
    if (savedPath) {
      loadFlowFromPath(savedPath);
    } else {
      setLoading(false);
    }
  }, []);

  const loadFlowFromPath = async (path: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pathOrUrl: path }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao analisar repositório');
      }

      const flow = await response.json();
      setCurrentFlow(flow);
      setHasConfiguredPath(true);
    } catch (e: any) {
      setError(e.message || 'Erro ao carregar fluxo');
      setHasConfiguredPath(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSavePath = async () => {
    if (!repoPath.trim()) {
      setError('Informe o caminho do repositório');
      return;
    }

    localStorage.setItem('botodoc_repo_path', repoPath);
    await loadFlowFromPath(repoPath);
  };

  const handleChangePath = () => {
    localStorage.removeItem('botodoc_repo_path');
    setCurrentFlow(null);
    setHasConfiguredPath(false);
    setRepoPath('');
    setError(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-pulse">⏳</div>
          <p className="text-gray-600 text-lg">Carregando fluxo...</p>
        </div>
      </div>
    );
  }

  // Tela de configuração
  if (!hasConfiguredPath || !currentFlow) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center p-6">
        <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl p-10">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">📂</div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Configurar Repositório</h2>
            <p className="text-gray-600 mb-6">Informe o caminho do repositório local para analisar</p>
          </div>

          <div className="space-y-4">
            <input
              type="text"
              value={repoPath}
              onChange={(e) => setRepoPath(e.target.value)}
              placeholder="/caminho/para/repositorio"
              className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:border-indigo-600 focus:outline-none text-lg"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSavePath();
                }
              }}
            />
            
            <button
              onClick={handleSavePath}
              disabled={analyzing}
              className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-400 text-white rounded-2xl font-bold text-lg transition-all shadow-xl"
            >
              {analyzing ? '⏳ Analisando...' : '💾 Salvar e Analisar'}
            </button>
          </div>

          {error && (
            <div className="mt-6 bg-red-50 border-l-4 border-red-500 p-5 rounded-r-xl text-red-700">
              ❌ {error}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Diagrama
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="fixed top-0 left-0 right-0 z-[100] bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg h-[70px]">
        <div className="flex items-center justify-between h-full px-6">
          <div>
            <h1 className="text-xl font-bold">🔍 Botodoc</h1>
            <p className="text-xs opacity-90">{currentFlow.name}</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => loadFlowFromPath(localStorage.getItem('botodoc_repo_path') || '')}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 border-2 border-white/50 rounded-lg font-semibold text-sm transition-all"
            >
              🔄 Atualizar
            </button>
            <button 
              onClick={handleChangePath}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 border-2 border-white/50 rounded-lg font-semibold text-sm transition-all"
            >
              ⚙️ Trocar Path
            </button>
          </div>
        </div>
      </header>

      <FlowDiagram steps={currentFlow.steps} />
    </div>
  );
}
