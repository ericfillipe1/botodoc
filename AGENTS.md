# Botodoc Next.js - Agent Rules

## Project Overview
Botodoc is a flow visualization tool that analyzes Java repositories and displays process flows using React Flow.

## Tech Stack
- **Next.js 16** with App Router and Turbopack
- **React Flow** for diagram visualization
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **MongoDB** for data persistence (optional)
- **Iconify** for technology icons

## Key Features
- Parses `botodoc.json` configuration files from Java repositories
- Extracts step definitions and usage communications from Java comments
- Visualizes flows with main steps, substeps, and technology connections
- Automatic detection of Kafka topics, REST endpoints, and MongoDB collections
- Interactive diagram with zoom, pan, and fit view

## File Structure
```
botodoc-nextjs/
├── app/
│   ├── api/
│   │   ├── analyze/     # POST endpoint to analyze repositories
│   │   └── flow/        # GET endpoint for latest flow
│   └── page.tsx         # Main application page
├── components/
│   ├── FlowDiagram.tsx  # React Flow wrapper
│   ├── StepNode.tsx     # Custom node for steps/substeps
│   ├── UsageNode.tsx    # Custom node for technology connections
│   └── TechIcon.tsx     # Technology icon component
├── lib/
│   ├── parser.ts        # Repository parser
│   ├── javaParser.ts    # Java file parser
│   └── iconConfig.ts    # Icon and color configuration
├── utils/
│   └── flowConverter.ts # Converts steps to React Flow elements
└── types/
    └── index.ts         # TypeScript type definitions
```

## Development Commands
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm start        # Start production server
```

## Code Conventions
- Use TypeScript for all new files
- Follow existing component patterns
- Keep components small and focused
- Use Tailwind CSS classes for styling
- Add proper type definitions in `types/index.ts`

## Important Notes
- The parser extracts flow information from `/** */` comments in Java files
- Usage connections are displayed horizontally next to substeps
- All nodes have consistent width (320px) for visual alignment
- Technology icons use official brand colors from `iconConfig.ts`
