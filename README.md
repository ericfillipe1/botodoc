# Botodoc Next.js

Versão unificada do Botodoc usando Next.js (frontend + backend).

## Tecnologias

- **Next.js 16** - Framework React com App Router
- **React Flow** - Visualização de diagramas
- **MongoDB** - Banco de dados
- **Tailwind CSS** - Estilização

## Configuração

1. Instale as dependências:
```bash
npm install
```

2. Configure o MongoDB no arquivo `.env.local`:
```
MONGODB_URI=mongodb://localhost:27017
```

3. Inicie o MongoDB:
```bash
mkdir -p /tmp/mongodb/data
mongod --dbpath /tmp/mongodb/data --port 27017 --fork --logpath /tmp/mongodb/mongod.log
```

## Desenvolvimento

```bash
npm run dev
```

Acesse: http://localhost:3000

## Build

```bash
npm run build
npm start
```

## Estrutura

```
botodoc-nextjs/
├── app/
│   ├── api/           # API Routes (backend)
│   │   ├── analyze/   # Endpoint para analisar repositório
│   │   └── flow/      # Endpoint para buscar fluxos
│   └── page.tsx       # Página principal
├── components/        # Componentes React
├── lib/              # Utilitários e configurações
└── types/            # Tipos TypeScript
```

## Diferenças da versão anterior

- **Unificado**: Frontend e backend no mesmo projeto
- **API Routes**: Backend integrado via Next.js API Routes
- **Server Components**: Melhor performance com React Server Components
- **Simplificado**: Sem necessidade de proxy ou configuração de CORS
# botodoc
