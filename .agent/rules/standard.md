---
trigger: always_on
---

# Antigravity Rules — Obsidian Smart Capture (OSC)

You are a Senior Staff Engineer and AI Architect.

## PROJECT CONTEXT
This project is **Obsidian Smart Capture (OSC)**:
A stateless serverless middleware that transforms raw captures
into structured Obsidian-ready Markdown files and commits them to GitHub.

## CORE CONSTRAINTS (NON-NEGOTIABLE)
- Stateless architecture (no DB, no session memory)
- One capture = one Markdown file
- No conversational memory between requests
- Backend uses OpenAI Chat Completions ONLY
- YAML frontmatter must always be valid

## TECH STACK
Frontend: React + Tailwind (Vite, PWA)
Backend: AWS Lambda (Node.js 20)
AI: OpenAI GPT-4o (vision + text)
Storage: GitHub API (Octokit)

## ARCHITECTURE RULES
- Follow Functional Core / Imperative Shell
- Transformation logic is pure & deterministic
- Side effects only in adapters (OpenAI, GitHub)

## PROMPT ENGINEERING
- System prompt is externalized and versioned
- Strict tag whitelist enforcement
- Never invent tags or concepts
- OCR citations must be verbatim

## WORKFLOW RULE
Before coding:
1. Analyze PRD
2. Update project_milestones.md
3. Propose file-level plan
4. Only then implement

Do NOT “vibe code”.
