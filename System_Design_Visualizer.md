# System Design Visualizer
**Tagline:** Learn system design by doing — study 8 canonical architectures, get AI trade-off questions with structured feedback, and track your weak areas with spaced repetition.

---

## 1. Purpose

### Problem it solves
System design interview prep has one gap: you memorize the design but freeze when asked "why Cassandra instead of PostgreSQL?" because you never practiced the reasoning — only the diagram.

This project fixes that.

### What it is
An adaptive system design learning platform:
1. **Study layer** — 8 pre-built topics with Mermaid.js diagrams + trade-off explanations
2. **Quiz layer** — Groq/Llama generates "why not X instead?" questions; returns structured evaluation with multiple dimensions (correctness, tradeoff reasoning, scalability awareness, missed points)
3. **Learning layer** — SM-2 spaced repetition (reused from Conceptra) schedules review based on answer quality
4. **Analytics layer** — tracks which dimensions (correctness vs scalability thinking) you're weakest on

### Design principles
- **Content first, code second.** The JSON topic files are the product. The code serves them.
- **Extensible by design.** Dropping a new `.json` into `/content/` and running `npm run seed` adds a new topic. No code changes needed.
- **AI supplements, not replaces.** The diagram, trade-offs, and questions are hand-crafted. AI generates variations and evaluates answers — it doesn't own the curriculum.

### Why MongoDB
Each topic is a self-contained document: diagram string, nested tradeoff array, question array, difficulty. No joins. No normalization needed. Document model is the natural fit.

You already use PostgreSQL in DevLog, KnowledgeHub, Conquer, GeoMind, and Conceptra — where relational structure, transactions, pgvector, or PostGIS are required. MongoDB here demonstrates selection reasoning, not just familiarity.

---

## 2. How the Project Works (End-to-End User Flow)

```
User opens app → Topic Browser
    │
    ▼
8 cards, each showing:
  → Topic name + difficulty badge
  → Mastery ring (avg quality score, color coded)
  → "Due now" badge or "Review in X days"
    │
    ▼
Click a topic → Topic Page
    │
    ▼
Mermaid.js renders architecture diagram as SVG (browser-side, free)
Trade-off panels: "Why Cassandra over PostgreSQL → reason"
"Start Quiz" button
    │
    ▼
Quiz Mode
    │
    ▼
Groq generates question from topic context:
  "Your design uses Base62 encoding. Why not MD5 truncation?
   What happens to collision rate under high write load?"
    │
    ▼
User types answer → Submit
    │
    ▼
Groq evaluates with STRUCTURED output (not just a score):
  {
    "score": 4,
    "correctness": "Correctly identified collision risk with MD5",
    "tradeoff_reasoning": "Good awareness of Base62 counter coordination",
    "scalability_awareness": "Missing: didn't address what happens at 10B URLs",
    "missed_points": ["ZooKeeper coordination overhead", "counter rollover at 62^7"],
    "feedback": "Strong core answer. Consider addressing the upper scale boundary."
  }
    │
    ▼
Evaluation display:
  Score ring (4/5) + per-dimension breakdown
  Green ✓ for strong dimensions, amber for gaps, missed points listed
    │
    ▼
SM-2 updates review schedule:
  Score 4–5 → interval increases (review in X days)
  Score 1–2 → interval resets to 1 day
  Score 3   → interval unchanged
    │
    ▼
Review Dashboard
    │
    ▼
Due topics (next_review <= now) at top
Mastery rings per topic
Score history line chart per topic (Recharts)
Weak dimensions: "Your scalability_awareness scores average 2.4 — lowest dimension"
Weak topics sorted by mastery score ascending
```

---

## 3. Build Roadmap

### Phase 1 — Content (Week 1, before any code)
**Goal:** All 8 JSON topic files complete and valid.
**Milestone:** All 8 Mermaid diagrams render correctly at mermaid.live.

- Write `url-shortener.json` first — simplest, most familiar
- Validate Mermaid string at mermaid.live before saving
- Write remaining 7 topics
- For each trade-off: if you can't write a clear, specific reason, you don't understand it well enough to quiz on yet. Research first.
- This phase is research and writing, not code.

### Phase 2 — MongoDB + Next.js Setup (Week 1–2)
**Goal:** Topics seeded in MongoDB, topic browser renders from real data.
**Milestone:** All 8 topic cards visible at localhost:3000.

- Create MongoDB Atlas free cluster
- Next.js + TypeScript + Tailwind setup
- Mongoose models: `Topic`, `SM2State`, `QuizSession`
- `src/lib/mongodb.ts` connection singleton
- Write and run `seed.ts` to populate topics collection
- Build topic browser page (server component)
- Build topic page: load by ID, render Mermaid + trade-off panels

### Phase 3 — AI Quiz Layer (Week 2–3)
**Goal:** Full quiz cycle with structured evaluation output.
**Milestone:** Complete a quiz on URL Shortener and see structured feedback.

- `POST /api/quiz/generate` — stream question from Groq
- `POST /api/quiz/evaluate` — structured JSON evaluation (6 fields)
- `QuizInterface.tsx` — streaming question display + textarea
- `EvaluationResult.tsx` — score ring + per-dimension breakdown
- Save `QuizSession` with all 6 evaluation fields to MongoDB
- Test with all 8 topics, verify question quality and specificity

### Phase 4 — SM-2 + Review Dashboard (Week 3)
**Goal:** Learning loop complete. Dashboard shows weak areas correctly.
**Milestone:** After 3 topic quizzes, dashboard shows different intervals + weak dimension identified.

- Copy SM-2 from Conceptra (`src/lib/sm2.ts`)
- Wire SM-2 into evaluate route: update `SM2State` after each quiz
- Track per-dimension rolling averages in `SM2State` (new fields: `avg_correctness`, `avg_tradeoff_reasoning`, `avg_scalability_awareness`)
- Build `ReviewDashboard.tsx`: due topics, mastery rings, Recharts score charts
- Weak dimensions panel: "scalability_awareness avg: 2.4 — focus here"

### Phase 5 — Polish + Deployment (Week 3–4)
**Goal:** Live, shareable.

- Loading states, error boundaries, empty states (first-time user)
- README with MongoDB justification section
- Deploy to Vercel (MONGODB_URI + GROQ_API_KEY)
- Demo recording

---

## 4. Module Breakdown

### Module 1: `/content/*.json` — 8 topic files
**Purpose:** The source of truth. The code serves these files, not the other way around.

**Format:**
```json
{
  "id": "url-shortener",
  "name": "URL Shortener",
  "difficulty": "medium",
  "mermaid_diagram": "graph TD\n    Client([Client]) --> LB[Load Balancer]\n    LB --> AS1 & AS2\n    AS1 & AS2 --> Cache[(Redis)]\n    AS1 & AS2 --> DB[(Cassandra)]\n    AS1 & AS2 --> IDGen[ID Generator]\n    IDGen --> ZK[(ZooKeeper)]",
  "tradeoffs": [
    {
      "option_a": "SQL (PostgreSQL)",
      "option_b": "NoSQL (Cassandra)",
      "chosen": "NoSQL (Cassandra)",
      "reason": "Simple key-value access pattern (short→long URL). High write throughput. No complex queries. Easy horizontal sharding by short_code."
    },
    {
      "option_a": "MD5 hash (truncated)",
      "option_b": "Base62 counter encoding",
      "chosen": "Base62 counter",
      "reason": "No collision risk. Predictable 7-char length. ZooKeeper coordinates counter across servers to avoid duplicates."
    }
  ],
  "interview_questions": [
    "Why Base62 encoding instead of MD5 hashing? What happens at 100M URLs?",
    "Which component is the bottleneck at 100M redirects/day and how do you scale it?",
    "A user generates 10 short URLs pointing to the same long URL. Same short code or different?"
  ]
}
```

**Extensibility rule:** Any `.json` file dropped into `/content/` with valid format and valid Mermaid diagram is automatically seeded on next `npm run seed`. No code changes required for new topics.

**The 8 topics:**

1. **URL Shortener** — hashing, redirect, DB choice, scaling reads, ZooKeeper coordination
2. **Rate Limiter** — token bucket vs leaky bucket, Redis counters, distributed race conditions
3. **Chat Application** — WebSockets, message ordering, fan-out on write vs read, offline delivery
4. **News Feed** — push vs pull model, celebrity problem, ranking, cache invalidation
5. **Distributed Cache** — consistent hashing, LRU vs LFU eviction, cache invalidation strategies
6. **Job Queue** — exactly-once vs at-least-once, idempotent handlers, dead-letter (use DevLog depth here)
7. **Search Autocomplete** — trie vs inverted index, prefix matching, real-time updates
8. **Video Streaming** — HLS vs DASH, CDN edge caching, adaptive bitrate, storage tiers

---

### Module 2: `src/lib/mongodb.ts`
**Purpose:** MongoDB connection singleton. Prevents Next.js API routes from creating a new connection per request.

```typescript
import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI!
let cached = (global as any).mongoose ?? { conn: null, promise: null }
;(global as any).mongoose = cached

export async function connectDB() {
  if (cached.conn) return cached.conn
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, { bufferCommands: false })
  }
  cached.conn = await cached.promise
  return cached.conn
}
```

**Workflow:**
```
API route called
    │
    ▼
connectDB()
    ├── cached.conn exists → return immediately (fast path, most calls)
    └── no connection → mongoose.connect() → cache → return
```

---

### Module 3: `src/models/` — Three Mongoose models

**Topic.ts** — System design topic content. `_id` is a human-readable string (`"url-shortener"`) for clean URLs and idempotent seeding.

**SM2State.ts** — Spaced repetition state per topic. Fields:
```typescript
{
  topicId: string,           // unique index
  interval: number,          // days until next review
  easeFactor: number,        // SM-2 ease (min 1.3)
  repetitions: number,       // successful streak
  nextReview: Date,          // when to surface this topic
  masteryScore: number,      // rolling avg of last 5 quality scores
  // Per-dimension tracking (new — enables weak dimension analytics)
  avg_correctness: number,
  avg_tradeoff_reasoning: number,
  avg_scalability_awareness: number,
  updatedAt: Date
}
```

**QuizSession.ts** — One document per quiz attempt. Append-only. Fields:
```typescript
{
  topicId: string,
  question: string,
  answer: string,
  qualityScore: number,           // 1-5 overall
  // Structured evaluation fields (new)
  correctness: string,
  tradeoff_reasoning: string,
  scalability_awareness: string,
  missed_points: string[],
  feedback: string,
  createdAt: Date
}
```

---

### Module 4: `src/scripts/seed.ts`
**Purpose:** One-time script to populate MongoDB from JSON files. Re-runnable — safe to run multiple times.

**Workflow:**
```
Connect to MongoDB
    │
    ▼
Topic.deleteMany({})         ← clean slate every time
    │
    ▼
Read all .json from /content/
    │
    ▼
For each file:
  Topic.create({ _id: data.id, ...rest })
  SM2State.findOneAndUpdate(
    { topicId: data.id },
    { $setOnInsert: { topicId: data.id } },
    { upsert: true }           ← don't reset SM-2 progress on re-seed
  )
    │
    ▼
Log each: "Seeded: URL Shortener"
Disconnect
```

Run: `npx ts-node src/scripts/seed.ts`

---

### Module 5: `src/components/MermaidDiagram.tsx`
**Purpose:** Client component that renders a Mermaid text string into SVG. Display only.

```typescript
'use client'
import { useEffect, useRef } from 'react'
import mermaid from 'mermaid'

mermaid.initialize({ startOnLoad: false, theme: 'neutral', securityLevel: 'loose' })

export function MermaidDiagram({ diagram }: { diagram: string }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return
    const id = `mermaid-${Math.random().toString(36).slice(2)}`
    mermaid.render(id, diagram).then(({ svg }) => {
      if (ref.current) ref.current.innerHTML = svg
    })
  }, [diagram])

  return <div ref={ref} className="w-full overflow-auto rounded-lg border p-4" />
}
```

**Validate every diagram string at mermaid.live before saving to JSON.**

---

### Module 6: `src/app/api/quiz/generate/route.ts`
**Purpose:** Generate one quiz question per topic using Groq. Single responsibility — question generation only.

**System prompt (generates specific, not vague questions):**
```
You are a senior software engineer conducting a system design interview.
Ask ONE specific, challenging question about WHY a specific trade-off was made.
Point at a concrete decision in the architecture (not "tell me about your design").
Focus on: failure modes at scale, alternatives considered, or operational trade-offs.
Return ONLY the question — no preamble, no labels.
```

**Workflow:**
```
POST /api/quiz/generate { topicId }
    │
    ▼
connectDB() → Topic.findById(topicId)
    │
    ▼
Build context:
  tradeoffContext = topic.tradeoffs.map(t =>
    `Chose ${t.chosen} over [other]: ${t.reason}`
  ).join('\n')
    │
    ▼
streamText(groq Llama-3.3-70B, system prompt, user prompt with context)
    │
    ▼
Return streaming response → frontend renders character by character
```

---

### Module 7: `src/app/api/quiz/evaluate/route.ts`
**Purpose:** Evaluate answer, save session, update SM-2. Most complex route — does three things but each is a distinct step.

**Structured evaluation output (key improvement):**

Instead of parsing a fragile `"SCORE: 4\nFEEDBACK: ..."` string, prompt Groq to return structured JSON:

```
You are a senior engineer evaluating a system design answer.
Return ONLY valid JSON with this exact structure, no other text:
{
  "score": <1-5>,
  "correctness": "<was the core answer technically correct?>",
  "tradeoff_reasoning": "<did they explain WHY, not just WHAT?>",
  "scalability_awareness": "<did they consider scale implications?>",
  "missed_points": ["<specific thing they missed>", ...],
  "feedback": "<2-3 sentences of actionable improvement advice>"
}

Scoring:
1 = Wrong or missing
2 = Basic, misses key considerations
3 = Adequate, covers the main idea
4 = Strong, good trade-off reasoning
5 = Excellent, covers edge cases and scale
```

**Workflow:**
```
POST /api/quiz/evaluate { topicId, question, answer }
    │
    ▼
connectDB() → Topic.findById(topicId)
    │
    ▼
generateText(Groq) → parse JSON response
  Handle parse failure: retry once, then return default score 3
    │
    ▼
QuizSession.create({
  topicId, question, answer,
  qualityScore: evaluation.score,
  correctness: evaluation.correctness,
  tradeoff_reasoning: evaluation.tradeoff_reasoning,
  scalability_awareness: evaluation.scalability_awareness,
  missed_points: evaluation.missed_points,
  feedback: evaluation.feedback
})
    │
    ▼
Compute rolling mastery (last 5 sessions):
  recent = QuizSession.find({ topicId }).sort(-createdAt).limit(5)
  masteryScore = avg(recent.map(s => s.qualityScore))
  avg_correctness = avg(recent.map(s => scoreFromText(s.correctness)))
  avg_scalability_awareness = avg(recent.map(s => scoreFromText(s.scalability_awareness)))
    │
    ▼
SM-2 update:
  current = SM2State.findOne({ topicId })
  result = sm2Update(evaluation.score, current.repetitions, current.easeFactor, current.interval)
  SM2State.findOneAndUpdate({ topicId }, {
    ...result,
    masteryScore,
    avg_correctness,
    avg_tradeoff_reasoning,
    avg_scalability_awareness,
    updatedAt: new Date()
  }, { upsert: true })
    │
    ▼
Return: { score, correctness, tradeoff_reasoning, scalability_awareness, missed_points, feedback }
```

---

### Module 8: `src/components/EvaluationResult.tsx`
**Purpose:** Display structured evaluation results. Shows per-dimension feedback, not just a score. Display only.

**What it renders:**
```
┌─────────────────────────────────────────────┐
│  Score: 4/5                                 │
│  ████████████████░░░░                       │
├─────────────────────────────────────────────┤
│  Correctness:           ✓ Strong            │
│  "Correctly identified collision risk"      │
│                                             │
│  Trade-off Reasoning:   ✓ Good             │
│  "Good awareness of Base62 coordination"    │
│                                             │
│  Scalability Awareness: ⚠ Needs work       │
│  "Didn't address what happens at 10B URLs"  │
├─────────────────────────────────────────────┤
│  Missed Points:                             │
│  • ZooKeeper coordination overhead          │
│  • Counter rollover at 62^7                 │
├─────────────────────────────────────────────┤
│  Feedback:                                  │
│  "Strong core answer. Consider addressing   │
│   the upper scale boundary next time."      │
└─────────────────────────────────────────────┘
```

---

### Module 9: `src/lib/sm2.ts`
**Purpose:** Spaced repetition algorithm. Determines next review date based on answer quality. Copied from Conceptra — single definition, no reinvention.

```typescript
export function sm2Update(
  quality: number,       // 1–5
  repetitions: number,
  easeFactor: number,
  interval: number
) {
  const q = quality - 1  // map to 0–5 for SM-2 formula

  let newRep = repetitions
  let newEF = easeFactor
  let newInterval = interval

  if (q >= 3) {
    if (repetitions === 0) newInterval = 1
    else if (repetitions === 1) newInterval = 6
    else newInterval = Math.round(interval * easeFactor)
    newRep = repetitions + 1
  } else {
    newRep = 0
    newInterval = 1
  }

  newEF = Math.max(1.3, easeFactor + 0.1 - (5-q) * (0.08 + (5-q) * 0.02))

  const nextReview = new Date()
  nextReview.setDate(nextReview.getDate() + newInterval)

  return { repetitions: newRep, easeFactor: newEF, interval: newInterval, nextReview }
}
```

---

### Module 10: `src/app/dashboard/page.tsx` + `ReviewDashboard.tsx`
**Purpose:** Shows learning progress, due topics, weak areas, and weak dimensions.

**Server component fetches:**
```typescript
// Due topics
const dueStates = await SM2State.find({ nextReview: { $lte: new Date() } }).lean()

// All states for mastery display
const allStates = await SM2State.find({}).sort({ masteryScore: 1 }).lean()

// Score history per topic (last 10 sessions)
const scoreHistory = {}
for (const state of allStates) {
  const sessions = await QuizSession
    .find({ topicId: state.topicId })
    .sort({ createdAt: 1 })
    .limit(10)
    .select('qualityScore createdAt')
    .lean()
  scoreHistory[state.topicId] = sessions.map(s => s.qualityScore)
}

// Weak dimension across all topics
const avgScalability = allStates.reduce((s, st) =>
  s + (st.avg_scalability_awareness || 0), 0) / allStates.length
const avgTradeoff = allStates.reduce((s, st) =>
  s + (st.avg_tradeoff_reasoning || 0), 0) / allStates.length
const avgCorrectness = allStates.reduce((s, st) =>
  s + (st.avg_correctness || 0), 0) / allStates.length
```

**Dashboard sections:**
1. **Due now** — topics where `nextReview <= now`, with "Quiz now" CTA
2. **Mastery overview** — all 8 topics with colored mastery rings, sorted weakest first
3. **Score history** — Recharts LineChart per topic (session number vs quality score)
4. **Weak dimension** — "Your scalability_awareness avg: 2.4. Focus on explaining what happens at 10× load when answering."
5. **Weak topics** — bottom 3 by mastery score with direct quiz links

---

## 5. DRY / SOLID / KISS Principles

### DRY (Don't Repeat Yourself)
- SM-2 function defined once in `sm2.ts`, called from the evaluate route only. Not reimplemented in any component.
- Groq client and prompt templates defined once in `src/lib/groq.ts`. Both API routes import from there — no prompt strings scattered across routes.
- MongoDB connection defined once in `mongodb.ts`. Every route calls `connectDB()` — no route creates its own connection.
- `feature_names` / dimension labels defined once as constants. Used in both the QuizSession schema and the EvaluationResult component.
- The evaluation JSON format is defined once in the Groq system prompt. Parsing logic is one function in `lib/groq.ts`.

### SOLID
- **Single Responsibility:** `generate` route generates questions only. `evaluate` route evaluates, saves, and updates SM-2 — three sequential steps but one cohesive concern (process a quiz submission). `seed.ts` seeds only. `mongodb.ts` connects only. Each component renders one thing.
- **Open/Closed:** Adding a 9th topic requires dropping a JSON file and running `npm run seed`. No existing code changes. The seed script, API routes, and components all handle any number of topics without modification.
- **Interface Segregation:** `TopicCard` receives only `{ topic, sm2State }` — not the full quiz session history it doesn't need. `EvaluationResult` receives only the evaluation object. No component receives data it doesn't use.
- **Dependency Inversion:** API routes depend on `connectDB()` abstraction, not on `mongoose.connect()` directly. If you swap MongoDB for a different store, only `mongodb.ts` and the models change.

### KISS (Keep It Simple)
- Mermaid.js renders diagrams from text strings — zero server cost, zero canvas management, works in any browser. React Flow would have doubled the complexity for the same visual output.
- Static JSON topics seeded at startup, not generated by AI. AI supplements the learning loop, it doesn't own the curriculum.
- 8 topics is the right scope for v1. Extensible to more, but 8 gives you enough depth to demonstrate the concept without scope creep.
- No Redis, no BullMQ, no Docker. Every quiz is synchronous — generate question, evaluate answer, update MongoDB. The simplest architecture that delivers the full learning loop.
- `SM2State` upserted with `findOneAndUpdate` + `upsert: true` — no separate "check if exists then create or update" logic.

---

## 6. Agent Skills Workflow (JSM Guide)

```
/architect   → Before writing evaluate route (most complex route — plan it before coding)
               Before dashboard (multiple MongoDB queries + dimension analytics)
               Prompt: "/architect quiz evaluate route that calls Groq, parses structured
                        JSON, saves QuizSession, and updates SM2State with dimension tracking"
               Prevents: discovering mid-build that SM2State schema doesn't have dimension fields

/remember    → Save at end of content-writing sessions (JSON format decisions)
  save         Save after evaluate route is working (Groq prompt format, parse logic)
  restore      Critical: Groq prompt format for structured JSON must not change between sessions
               Without this: agent generates a different JSON format that breaks the parser

/review      → After seed.ts runs and all 8 topics load in browser
               Prompt: "/review seed.ts — verify SM2State is upserted not overwritten,
                        verify all 8 topics have valid mermaid diagrams"
               After evaluate route is complete (before building EvaluationResult component)
               Prompt: "/review evaluate route — verify Groq JSON parse has error handling,
                        verify SM2State dimension fields are updated, verify QuizSession saved"
               After dashboard loads
               Prompt: "/review dashboard — verify due topics query uses lte not lt,
                        verify score history chart renders correctly with <5 sessions"

/recover     → When Groq returns malformed JSON (most likely failure)
               → Paste exact Groq response text
               → Add JSON.parse try/catch with retry logic
               When SM-2 intervals are wrong (nextReview in the past after answering correctly)
               → Paste SM2State document from MongoDB Atlas
               When Mermaid diagram doesn't render (blank div)
               → Paste exact diagram string from JSON file

/imprint     → After TopicCard.tsx (captures mastery ring + badge pattern)
               After QuizInterface.tsx (captures text area + submit pattern)
               After EvaluationResult.tsx (captures score ring + dimension breakdown pattern)
               Run before building ReviewDashboard — must match established card and chart patterns
```

**Groq JSON parsing safety:** Always wrap Groq response parsing in try/catch. If JSON.parse fails, retry the Groq call once. If it fails again, return a default evaluation `{ score: 3, feedback: "Unable to evaluate. Please try again." }`. Never crash the route on a parse failure.

---

## 7. Tech Stack

| Technology | Purpose | Status | Reason |
|---|---|---|---|
| Next.js 14 | Full-stack framework | USE | Already know from Conquer |
| TypeScript | Type safety | USE | |
| MongoDB Atlas | All three collections | USE | Document-oriented, no joins |
| Mongoose | ODM — schemas, validation | USE | Type-safe models |
| Groq (Llama 3.3 70B) | Quiz generation + evaluation | USE | Already set up |
| Vercel AI SDK | Streaming for question generation | USE | |
| Mermaid.js | Diagram rendering | USE | Free, browser-side, no server cost |
| SM-2 algorithm | Spaced repetition | USE | Copy from Conceptra |
| Zustand | Client state (quiz session) | USE | |
| shadcn/ui | UI components | USE | |
| Tailwind CSS | Styling | USE | |
| Recharts | Score history charts | USE | Already in your stack |
| Vercel | Deployment | USE | Next.js native |
| Drizzle ORM / Neon | SQL ORM / SQL DB | SKIP | No SQL database here |
| React Flow | Diagram library | SKIP | Mermaid is enough |
| Excalidraw | Whiteboard | SKIP | Wrong use case |
| Redis / BullMQ | Cache / Queue | SKIP | No async jobs needed |
| Docker | Containerization | SKIP | Vercel handles deployment |

---

## 8. File Structure

```
system-design-visualizer/
├── content/
│   ├── url-shortener.json
│   ├── rate-limiter.json
│   ├── chat-app.json
│   ├── news-feed.json
│   ├── distributed-cache.json
│   ├── job-queue.json
│   ├── search-autocomplete.json
│   └── video-streaming.json
│          ↑ Add new topics here. Drop JSON + npm run seed. No code changes.
│
├── src/
│   ├── app/
│   │   ├── page.tsx                        # Topic browser
│   │   ├── topic/[id]/page.tsx             # Diagram + trade-offs
│   │   ├── quiz/[id]/page.tsx              # Quiz interface
│   │   ├── dashboard/page.tsx              # Review dashboard
│   │   └── api/
│   │       ├── quiz/generate/route.ts      # Groq question generation
│   │       └── quiz/evaluate/route.ts      # Evaluation + SM-2 update
│   │
│   ├── components/
│   │   ├── TopicCard.tsx                   # Card with mastery ring
│   │   ├── MermaidDiagram.tsx              # Mermaid text → SVG
│   │   ├── TradeoffPanel.tsx               # Option A vs B display
│   │   ├── QuizInterface.tsx               # Question + textarea
│   │   ├── EvaluationResult.tsx            # Score ring + dimension breakdown
│   │   └── ReviewDashboard.tsx             # Due topics + charts + weak areas
│   │
│   ├── lib/
│   │   ├── mongodb.ts                      # Connection singleton
│   │   ├── sm2.ts                          # SM-2 (copied from Conceptra)
│   │   └── groq.ts                         # Groq client + prompt templates
│   │
│   ├── models/
│   │   ├── Topic.ts
│   │   ├── SM2State.ts                     # Includes dimension avg fields
│   │   └── QuizSession.ts                  # Includes all 6 evaluation fields
│   │
│   └── scripts/
│       └── seed.ts                         # Populate MongoDB from /content/
│
├── .env.local                              # MONGODB_URI, GROQ_API_KEY
└── package.json
```

---

## 9. Deployment

**MongoDB Atlas:**
- Free M0 cluster at mongodb.com (512MB — more than enough)
- Add connection string as `MONGODB_URI` in Vercel env vars
- Run `npx ts-node src/scripts/seed.ts` once locally to populate topics

**Vercel:**
- Connect GitHub → set `MONGODB_URI` + `GROQ_API_KEY`
- Auto-deploys on push to main

---

## 10. Lessons Learned (fill in after building)

```markdown
## Lessons Learned

### Why I chose this architecture
[Write after building: why MongoDB over PostgreSQL for this specific content,
why Mermaid over React Flow, why static topic JSON over AI-generated diagrams,
why SM-2 over a simpler "review after 3 days" approach]

### Trade-offs I made
[Write after building: 8 topics vs more — what was the content writing cost,
static quiz questions vs fully dynamic — what did question quality look like,
structured JSON output from Groq vs free-text — how often did parsing fail]

### What I'd improve in v2
[Write after building: adaptive questioning (wrong answer → follow-up → foundational),
partial diagram completion mode (fill in the missing component),
collaborative topics (users can propose new JSON topics via PR)]

### Biggest technical challenge
[Write after building: most likely either the Groq structured JSON parsing reliability,
or the SM-2 dimension tracking (mapping text evaluation to a numeric score for each dimension)]
```

---

## 11. Interview Talking Points

- "I chose MongoDB because each system design topic is a self-contained document — nested tradeoffs, questions, a Mermaid diagram string. No joins between topics. I already use PostgreSQL in five other projects where relational structure is needed."
- "The quiz uses structured JSON evaluation from Groq — not just a score, but separate dimensions: correctness, tradeoff reasoning, and scalability awareness. The dashboard tracks which dimension you're weakest on across all topics."
- "I reused SM-2 spaced repetition from Conceptra rather than reinventing it. The algorithm is well-defined — copying it is the right engineering decision."
- "The project is extensible by design. Dropping a new JSON file into /content/ and running npm run seed adds a new topic — no code changes required."
- "Building the content actually taught me system design — writing the trade-off reasoning for all 8 topics forced me to understand why decisions are made, not just what the designs look like. It's a portfolio project that prepared me for the exact questions it teaches."
