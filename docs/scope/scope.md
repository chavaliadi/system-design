# Scope: System Design Visualizer

An adaptive learning platform for practicing system design interviews. Users study pre-built topics via Mermaid.js diagrams, answer AI-generated quiz questions evaluating specific architectural trade-offs, and track progress using an SM-2 spaced repetition scheduler.

**Build approach:** Skateboard (ship the thinnest usable whole first, then grow it).

---

## At a glance

| # | Feature | Phase | Status | Critical Path? | Dependencies |
|---|---------|-------|--------|----------------|--------------|
| 1 | Topic JSON Content | Foundation | planned | Yes | None |
| 2 | Next.js & UI Scaffold | Foundation | planned | Yes | None |
| 3 | Coding standards & tooling | Foundation | planned | No | 2 |
| 4 | Data model | Foundation | planned | Yes | 2 |
| 5 | Topic browser & detail views | Skeleton | planned | Yes | 1, 2, 4 |
| 6 | Quiz generation & evaluation API | Slice 1 | planned | Yes | 4 |
| 7 | Quiz interface & results | Slice 1 | planned | Yes | 5, 6 |
| 8 | SM-2 spaced repetition | Slice 2 | planned | No | 4, 6 |
| 9 | Review dashboard & charts | Slice 2 | planned | No | 5, 8 |
| 10 | Production polish & deployment | Polish | planned | Yes | 7, 9 |

---

## Foundation

### 1. Topic JSON Content
Create and validate the JSON files for the 8 system design topics, including Mermaid diagram strings and trade-offs. This acts as the extensibility anchor; adding new topics is zero-code.
**Done when:** All 8 JSON files are complete, valid, and their Mermaid diagrams render successfully.
- [ ] Write and validate content files: `/develop topic-content`

### 2. Next.js & UI Scaffold
Scaffold the Next.js 15 App Router codebase with Tailwind CSS, shadcn/ui, and absolute import layouts.
**Done when:** A blank project boots locally, is free of compile errors, and includes base configurations.
- [ ] Scaffold the project: `/develop nextjs-scaffold`

### 3. Coding standards & tooling
Configure ESLint, Prettier, TypeScript strict mode, and pre-commit checks.
**Done when:** `/audit` has run to align `AGENTS.md` and all quality gates pass without warnings.
- [ ] Capture conventions and tooling setup: `/audit`
- [ ] Configure lint, formatting, and pre-commit checks: `/develop tooling`

### 4. Data model · needs a decision
Define Mongoose schemas for Topic, SM2State, and QuizSession to persist curriculum data and user history.
**Done when:** The database schema supports spaced repetition state and structured quiz session analytics.
- [ ] Design it (spec): `/architect data-model`

---

## Skeleton

### 5. Topic browser & detail views · needs a decision
Build the landing page card view and the detail page rendering Mermaid diagrams and trade-offs.
**Done when:** Users can browse topics with mastery indicators, click a topic, see the rendering diagram, and read architectural trade-offs.
- [ ] Design it (spec): `/architect topic-views`

---

## Slice 1: Quiz Layer

### 6. Quiz generation & evaluation API · needs a decision · full weight
Create Next.js API routes that stream quiz questions from Groq and perform structured JSON evaluations on user answers.
**Done when:** The evaluate API returns structured JSON matching correctness, tradeoff reasoning, and scalability awareness, updating MongoDB.
- [ ] Design it (spec): `/architect quiz-apis`

### 7. Quiz interface & results · needs a decision
Build the quiz screen with real-time text streaming and the score-ring feedback UI displaying per-dimension evaluations.
**Done when:** A user can answer a generated question, see structured results with amber/green status indicators, and list missed points.
- [ ] Design it (spec): `/architect quiz-ui`

---

## Slice 2: Learning Loop

### 8. SM-2 spaced repetition · needs a decision
Integrate the SM-2 algorithm to calculate review dates and track rolling averages for analytical dimensions.
**Done when:** Each quiz attempt dynamically schedules the next review date and recalculates rolling mastery scores.
- [ ] Design it (spec): `/architect spaced-repetition`

### 9. Review dashboard & charts · needs a decision
Build a centralized review page displaying due items, mastery scores, and Recharts line charts showing progress.
**Done when:** Users see due topics sorted by urgency, a historical score chart, and a highlights panel calling out their weakest dimension.
- [ ] Design it (spec): `/architect review-dashboard`

---

## Polish & Deploy

### 10. Production polish & deployment · needs a decision
Add loading states, error boundaries, environmental validations, and deploy the application to Vercel.
**Done when:** The application runs in production, connected to MongoDB Atlas and Groq, with no visual or functional regressions.
- [ ] Design it (spec): `/architect production-deploy`

---

## Legend

**The decision box.** Every feature carries exactly one, the sub-task whose label ends with `(spec)`. Its wording varies (`Design it (spec)` normally, `Decide the stack (spec)` on Stack & architecture), so skills locate it by that `(spec)` suffix, never by an exact label. Every other box is an execution box and `/architect` never ticks one.

**Feature lifecycle**: the scope updates as a feature moves; each row is what it shows and who sets it:

| State | Set by | The feature shows |
|---|---|---|
| `planned` · needs a decision | `/scope` | one box: `Design it (spec): /architect <feature>` |
| `in-progress` (designed) | **`/architect` at spec capture** | `Design it` ticked; spec linked; `Build it: /develop <feature>` + **2 to 5 milestones rolled up from the spec**; `Verify it` + `Test it` boxes; any surfaced follow-up enrolled |
| `in-progress` (building) | `/develop` | milestone sub-boxes tick one by one; code pointer filled |
| `in-progress` (verified) | `/check verify` | `Build it` + milestones ticked; `Verify it` ticked |
| `done` | `/test`, then `/sync` | all boxes ticked; `/sync` captures the slice's conventions into `AGENTS.md` |

- **Next step** = the first unticked box (always a command or a tracked milestone).
- **needs a decision** = run `/architect` first; otherwise straight to `/develop` (or `/audit` for standards & tooling). The tag drops once the spec is captured.
- **Atomic build tasks live in the spec's `## Build plan`, not here**: the scope carries only the milestone rollup.
- **Status** `planned` → `in-progress` → `done`, plus `existing` (pre-workflow) and `dropped` (de-scoped, kept for history).
- **Approach tag** beside a heading (e.g. `· Facade`) overrides the project default for that feature; no tag = inherits it.
- **Weight tag** `· full` = a fresh-model `/check review` warranted; `lean`/`medium` get no tag.
- **Pointer line** (`spec <n> · code in <path>`): the spec link added by `/architect`, the code path by `/develop`.
