import { NextRequest, NextResponse } from 'next/server';
import { parseRepository } from '@/lib/parser';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const { pathOrUrl } = await request.json();

    if (!pathOrUrl) {
      return NextResponse.json(
        { error: 'pathOrUrl é obrigatório' },
        { status: 400 }
      );
    }

    // Parse do repositório local (sem salvar no banco)
    const flow = parseRepository(pathOrUrl);

    return NextResponse.json(flow);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erro ao analisar repositório' },
      { status: 400 }
    );
  }
}
