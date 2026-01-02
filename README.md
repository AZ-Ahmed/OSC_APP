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

## 🛠 How to Add a New Prompt

To add a new capture mode (e.g., `checklist`, `journal`):

### 1. Create the Prompt File
Create a new file in `backend/src/core/prompts/my-prompt.md`.
**Important**: Do NOT include formatting rules (JSON, YAML). Focus only on content guidance.

```markdown
Tu es un expert en...

TON OBJECTIF :
Transformer la note brute en une checklist actionnable.

STRUCTURE :
1. Titre
2. Liste de tâches
```

### 2. Register in Backend
Edit `backend/src/core/prompts/index.ts`:

```typescript
export const PROMPTS = {
    default: loadPrompt("default.md"),
    // ...
    checklist: loadPrompt("checklist.md"), // Add this
} as const;
```

### 3. Update Frontend (Optional)
If you want to select it in the UI, update `frontend/src/types/capture.ts`:

```typescript
export type PromptKey = 'default' | 'action' | 'checklist';
```

