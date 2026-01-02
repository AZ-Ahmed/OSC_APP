# Obsidian Smart Capture (OSC)

A stateless serverless middleware that transforms raw captures into structured Obsidian-ready Markdown files and commits them to GitHub.

## Architecture

```
User (PWA) → API Gateway → AWS Lambda → OpenAI GPT-4o → GitHub Repo → Obsidian Vault
```

## Project Structure

```
├── frontend/          # React + Tailwind PWA
│   └── src/
│       ├── components/    # UI components
│       ├── pages/         # Route-level views
│       ├── hooks/         # Custom React hooks
│       ├── services/      # API calls
│       └── types/         # TypeScript interfaces
│
└── backend/           # AWS Lambda (Node.js 20)
    └── src/
        ├── core/          # Functional Core (pure logic)
        │   ├── transform/     # Markdown transformation
        │   ├── validation/    # YAML frontmatter validation
        │   └── prompts/       # Externalized AI prompts
        ├── adapters/      # Imperative Shell (side effects)
        │   ├── openai/        # GPT-4o adapter
        │   └── github/        # Octokit adapter
        └── handlers/      # Lambda entry points
```

## Getting Started

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Backend
```bash
cd backend
npm install
npm run build
```

## Key Properties
- **Stateless** — No database, no session memory
- **Deterministic** — Same input = same output
- **Zero vendor lock-in** — Markdown + Git
