# 0001. Data Model for System Design Visualizer

**Date**: 2026-08-07
**Status**: Proposed

## Summary

This decision defines the Mongoose schema layer and TypeScript interfaces for System Design Visualizer across three models: Topic, SM2State, and QuizSession. Topic stores system design curriculum loaded from JSON files using human readable string keys. SM2State maintains spaced repetition parameters and rolling performance averages per topic without resetting on curriculum re-seeds. QuizSession captures append only evaluation history with structured scores and free text feedback, accelerated by compound database indexes for fast analytical queries.

## Context

System Design Visualizer requires a persistence layer to support three core capabilities: curriculum browsing, spaced repetition scheduling (SM-2 algorithm), and user analytical dashboards. The technical challenge is to store content idempotently while accumulating user performance metrics over time.

Without a well structured data model, curriculum re-seeding risks wiping out user spaced repetition progress. Furthermore, evaluating user quiz answers requires tracking multiple analytical dimensions (correctness, tradeoff reasoning, and scalability awareness). Evaluating these dimensions as purely free text creates a performance bottleneck if numerical scores are needed for rolling averages. A clear strategy is required to compute dimension averages reliably without making expensive secondary LLM calls or relying on fragile text parsing.

## Requirements

**User stories**:
- As a user, I want system design topic data to load cleanly from JSON files so that URLs remain readable (such as `/topic/url-shortener`) and content can be updated idempotently.
- As a user, I want my spaced repetition progress (review dates and mastery scores) preserved across content updates so that my learning history is never lost.
- As a user, I want structured feedback on my quiz answers across correctness, tradeoff reasoning, and scalability awareness so that I can track my weak dimensions over time.

**Acceptance criteria**:
- **AC-1**: Topic model uses a human readable string `_id` (matching `id` in `content/*.json`), storing name, difficulty enum ("easy", "medium", "hard"), mermaid diagram string, tradeoffs array (with `option_a`, `option_b`, `chosen`, `reason`), and interview questions array.
- **AC-2**: SM2State model maintains a unique index on `topicId` referencing Topic `_id`, storing SM-2 fields (`interval`, `easeFactor` >= 1.3, `repetitions`, `nextReview`), overall `masteryScore`, and per dimension rolling averages (`avgCorrectness`, `avgTradeoffReasoning`, `avgScalabilityAwareness`).
- **AC-3**: QuizSession model stores append only quiz attempts with `topicId`, `question`, `answer`, `qualityScore` (integer 1 to 5), numeric dimension scores (`correctnessScore`, `tradeoffScore`, `scalabilityScore`), structured text feedback, `missed_points` string array, and `createdAt` timestamp. Enforces a compound index on `{ topicId: 1, createdAt: -1 }`.
- **AC-4**: SM2State per-dimension rolling averages (`avgCorrectness`, `avgTradeoffReasoning`, `avgScalabilityAwareness`) read numeric score fields (`correctnessScore`, `tradeoffScore`, `scalabilityScore`) directly from QuizSession documents, enabling deterministic rolling average calculations without extra Groq API calls or text parsing.
- **AC-5**: The `seed.ts` script deletes and recreates Topic documents on every run, but upserts SM2State documents using `findOneAndUpdate` with `$setOnInsert` and `upsert: true` to preserve user learning progress.
- **AC-6**: Strict TypeScript interfaces (`ITopic`, `ISM2State`, `IQuizSession`) are defined and exported matching project naming conventions (`PascalCase` models and types, `camelCase` fields).

## Options considered

### Option 1: Dual numeric and text evaluation fields with compound indexing (Chosen)

In this approach, Groq returns both numeric 1 to 5 ratings (`correctnessScore`, `tradeoffScore`, `scalabilityScore`) and detailed text feedback strings in a single evaluation JSON response. QuizSession stores both. SM2State per dimension rolling averages read the numeric scores directly. QuizSession uses a compound index on `{ topicId: 1, createdAt: -1 }`.

**Pros**:
- Deterministic numerical scoring for rolling averages with zero extra LLM API calls.
- Preserves full textual feedback for user display in the UI.
- Compound index directly optimizes dashboard query patterns for recent sessions.

**Cons**:
- Slightly expands the Groq evaluation JSON output schema requirement.

### Option 2: Regex text score parsing with single field indexing

This option stores only free text feedback strings in QuizSession (for example "4 out of 5: Technical reasoning was strong"). A regex utility `scoreFromText()` attempts to extract leading numbers from the text string, falling back to the overall `qualityScore` if parsing fails. Database indexes are maintained separately on `topicId` and `createdAt`.

**Pros**:
- Keeps the QuizSession schema slightly smaller.

**Cons**:
- Brittle text parsing prone to failure if Groq formats response text unexpectedly.
- Queries sorting recent sessions per topic require in memory sorting stages in MongoDB.

### Option 3: Secondary LLM rescoring service call

This option calls a second lightweight LLM request or sentiment analysis function whenever rolling averages need updating to evaluate free text fields into numbers.

**Pros**:
- Keeps initial evaluation prompt simple.

**Cons**:
- Doubles Groq API call volume and latency for quiz evaluations.
- Increases cost and operational failure points.

## Decision

**Chosen option**: Option 1: Dual numeric and text evaluation fields with compound indexing

We choose Option 1 because it delivers deterministic numerical tracking for spaced repetition analytics while avoiding extra API latency and fragile text parsing.

## Rationale

Storing structured integer scores (`correctnessScore`, `tradeoffScore`, `scalabilityScore`) alongside textual feedback in QuizSession solves the core problem of tracking performance dimensions cleanly. Rolling averages in SM2State can be computed instantly via standard database array aggregations or array mappings without secondary Groq calls.

The compound index `{ topicId: 1, createdAt: -1 }` on QuizSession directly supports the two key read queries required by the dashboard: fetching the last 5 sessions for rolling average calculations and fetching the last 10 sessions for progress line charts.

Using human readable string IDs for Topic documents ensures clean application routing (`/topic/url-shortener`) and enables `seed.ts` to re-seed curriculum topics idempotently without invalidating existing SM2State documents linked by `topicId`.

## Feature design

**Data model sketch**:

```
Topic
  _id: String (PK, e.g. "url-shortener")
  name: String (required)
  difficulty: String (enum: ["easy", "medium", "hard"])
  mermaid_diagram: String (required)
  tradeoffs: Array of {
    option_a: String (required),
    option_b: String (required),
    chosen: String (required),
    reason: String (required)
  }
  interview_questions: Array of String

SM2State
  _id: ObjectId (PK)
  topicId: String (FK -> Topic._id, unique index, required)
  interval: Number (default 0, min 0)
  easeFactor: Number (default 2.5, min 1.3)
  repetitions: Number (default 0, min 0)
  nextReview: Date (default Date.now)
  masteryScore: Number (default 0, min 0, max 5)
  avgCorrectness: Number (default 0, min 0, max 5)
  avgTradeoffReasoning: Number (default 0, min 0, max 5)
  avgScalabilityAwareness: Number (default 0, min 0, max 5)
  updatedAt: Date (default Date.now)

QuizSession
  _id: ObjectId (PK)
  topicId: String (FK -> Topic._id, required)
  question: String (required)
  answer: String (required)
  qualityScore: Number (required, integer 1 to 5)
  correctnessScore: Number (required, integer 1 to 5)
  tradeoffScore: Number (required, integer 1 to 5)
  scalabilityScore: Number (required, integer 1 to 5)
  correctness: String (required)
  tradeoff_reasoning: String (required)
  scalability_awareness: String (required)
  missed_points: Array of String
  feedback: String (required)
  createdAt: Date (default Date.now)

  Compound Index: { topicId: 1, createdAt: -1 }
```

**State transitions**:

Quiz attempt triggers state update on SM2State:
`(qualityScore, repetitions, easeFactor, interval)` -> `(newRepetitions, newEaseFactor, newInterval, nextReviewDate)`
Where `easeFactor` is clamped to a minimum of 1.3 and `nextReview` is calculated as `now + newInterval` days.

**API surface**:

| Endpoint / Operation | Method | Key inputs | Key outputs | Auth | Key errors |
|---|---|---|---|---|---|
| Mongoose models initialization | N/A | Database connection | Initialized Mongoose models | Internal | Connection error |
| Topic.findById(id) | GET | topicId: string | Topic document | Public | 404 Not Found |
| SM2State.findOne({ topicId }) | GET | topicId: string | SM2State document | Public | 404 Not Found |
| QuizSession.create(data) | POST | QuizSession fields | Saved QuizSession document | Internal | 400 Validation Error |

**Key invariants**:
- Topic `_id` is a non empty kebab case string matching `content/*.json` filename.
- `SM2State.topicId` must be unique across the SM2State collection.
- `SM2State.easeFactor` cannot fall below 1.3.
- `QuizSession` is strictly append only (no updates or deletes).
- All score fields (`qualityScore`, `correctnessScore`, `tradeoffScore`, `scalabilityScore`) must be integers between 1 and 5 inclusive.

**Security model**:
- All database operations are executed server side in Next.js Server Components or API routes.
- No direct database access is exposed to the client.

**Configuration required**:
- `MONGODB_URI`: Connection string for MongoDB database instance.

**Critical test scenarios**:
- Happy path: Running `seed.ts` populates Topic collection with 8 topics using string `_id` and initializes SM2State documents without overwriting existing learning metrics, verifies **AC-1**, **AC-2**, **AC-5**.
- Failure case: Attempting to insert a QuizSession with `qualityScore` set to 6 fails Mongoose schema validation, verifies **AC-3**.
- Dimension scores verification: QuizSession numeric dimension score fields (`correctnessScore`, `tradeoffScore`, `scalabilityScore`) enforce integer validation (1 to 5) directly at schema level for SM2State rolling average calculations, verifies **AC-4**.

## Build plan

1. Create `src/models/Topic.ts` declaring schema validation (string `_id`, difficulty enum, tradeoffs array) and TypeScript types (`ITopic`), satisfies **AC-1**, **AC-6**.
2. Create `src/models/SM2State.ts` declaring core SM-2 fields, unique `topicId` index, minimum easeFactor validator, rolling average fields, and TypeScript types (`ISM2State`), satisfies **AC-2**, **AC-6**.
3. Create `src/models/QuizSession.ts` declaring evaluation scores (1 to 5 validation), text fields, compound index `{ topicId: 1, createdAt: -1 }`, and TypeScript types (`IQuizSession`), satisfies **AC-3**, **AC-6**.
4. Implement SM-2 algorithm helper `sm2Update` in `src/lib/sm2.ts`, satisfies **AC-2**, **AC-4**.
5. Update `src/scripts/seed.ts` script to delete/recreate Topic collection while performing non destructive `$setOnInsert` upserts on SM2State collection, satisfies **AC-5**.

## Consequences

**Positive**:
- Guarantees data integrity at Mongoose layer.
- Enables efficient index accelerated queries for dashboard charts and rolling average calculations.
- Avoids secondary LLM calls for dimension score tracking.
- Preserves user spaced repetition history during topic updates.

**Negative / tradeoffs**:
- Quiz evaluation route (`/api/quiz/evaluate`) must prompt Groq to include numeric dimension scores in its JSON response.

**Neutral**:
- Developers running local setup must execute `npm run seed` to seed initial topics and SM-2 state documents.

## Follow-up

- [ ] Update Groq prompt output schema in `/api/quiz/evaluate` (Module 7) to return `correctnessScore`, `tradeoffScore`, and `scalabilityScore` integers alongside text feedback.
