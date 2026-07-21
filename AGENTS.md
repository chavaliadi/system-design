# System Design Visualizer

## Stack

- **Language / Runtime**: TypeScript, Node.js
- **Framework**: Next.js 15 (App Router)
- **Key dependencies**: React 19, Mongoose, Zustand, Mermaid.js, Recharts, Vercel AI SDK, Groq API
- **Package manager**: npm

## Build approach

Skateboard (ship the thinnest usable whole first, then grow it).

## Commands

```bash
# Install
npm install

# Dev server
npm run dev

# Build
npm run build

# Test
npm test
```

## Specs

Stored in `docs/specs/`. Format: `docs/specs/NNNN-title.md`.

## Rules

- **Content First, Feature First**: System design topics are defined as JSON under `/content/`. Keep components small, reusable, and composition-based.
- **Server Components by Default**: Prefer Server Components for data loading; Client Components only when client interaction or hooks (e.g. Zustand, state) are required.
- **Strict TypeScript & Imports**: Strict TypeScript mode. Named exports by default. Absolute imports mapped using `@/*`.
- **Naming Conventions**: camelCase for variables/functions; PascalCase for components, models, and types; kebab-case for route folders.
- **Decoupled Architecture**: API routes contain minimal business logic and delegate to service classes under `lib/services/`.
- **Error Handling & Security**: Ensure consistent error handling, validate environment variables, and prioritize accessibility (a11y) from the beginning.
- **Single Responsibility**: One responsibility per file. Avoid duplicated code (DRY, SOLID, KISS).

## Agent skills

- [architect](.agents/skills/architect/): `JavaScript-Mastery-Pro/skills`, Weighs options and writes specs to docs/specs/
- [audit](.agents/skills/audit/): `JavaScript-Mastery-Pro/skills`, Context bootstrapper for AGENTS.md
- [check](.agents/skills/check/): `JavaScript-Mastery-Pro/skills`, Static code reviews and runtime verification
- [debug](.agents/skills/debug/): `JavaScript-Mastery-Pro/skills`, Root cause investigator loop
- [develop](.agents/skills/develop/): `JavaScript-Mastery-Pro/skills`, Builds features, UI, and logic
- [document](.agents/skills/document/): `JavaScript-Mastery-Pro/skills`, Generates PR descriptions and changelogs
- [scope](.agents/skills/scope/): `JavaScript-Mastery-Pro/skills`, Decomposes product ideas into roadmaps
- [sync](.agents/skills/sync/): `JavaScript-Mastery-Pro/skills`, Reconciles tasks and spec statuses
- [test](.agents/skills/test/): `JavaScript-Mastery-Pro/skills`, Test writer and runner preference manager

## Context files

_Drafted by /audit from the repo, worth a quick human pass. Edit freely: once a line stops matching this draft, later runs treat it as curated and will flag rather than overwrite it._
