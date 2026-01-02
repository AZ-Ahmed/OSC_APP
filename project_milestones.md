# Obsidian Smart Capture — Milestones

## Phase 1 — Core MVP (v1.0)

### Frontend
- [ ] PWA shell (React + Tailwind)
- [ ] Zen capture UI (textarea)
- [ ] Image upload / camera
- [ ] Project selector dropdown
- [ ] Loading + toast feedback

### Backend
- [ ] API Gateway endpoint
- [ ] Lambda handler (Node 20)
- [ ] OpenAI GPT-4o integration
- [ ] OCR + Markdown structuring
- [ ] YAML frontmatter validation

### GitHub Connector
- [ ] Octokit setup
- [ ] Dynamic path resolution
- [ ] Filename slug + date
- [ ] Commit to main branch

### Security
- [ ] Env vars management
- [ ] CORS restriction

---

## Phase 2 — Post-MVP
- [ ] Auth (OAuth or user tokens)
- [ ] Capture history
- [ ] Vault introspection (RAG)
- [ ] Conflict resolution
- [ ] Retry & dead-letter queue

---

## Architectural Decisions Log
- Stateless over DB
- GitHub as source of truth
- AI = deterministic transformer
