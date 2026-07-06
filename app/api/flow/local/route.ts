import { NextResponse } from 'next/server';
import { parseRepository } from '@/lib/parser';
import fs from 'fs';
import path from 'path';

// Caminho padrão para o repositório local
const DEFAULT_REPO_PATH = '/home/ericfillipe/develop/sicredi/example_1';

export async function GET() {
  try {
    // Verifica se o repositório existe
    if (!fs.existsSync(DEFAULT_REPO_PATH)) {
      return NextResponse.json(
        { error: 'Repositório exemplo não encontrado' },
        { status: 404 }
      );
    }

    // Analisa o repositório em tempo real (sem cache)
    const flow = parseRepository(DEFAULT_REPO_PATH);

    return NextResponse.json(flow);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erro ao buscar fluxo' },
      { status: 500 }
    );
  }
}
