# 0002. Topic Browser and Detail Views

**Date**: 2026-08-08
**Status**: Proposed

## Summary

This decision specifies the Topic browser home page and Topic detail page for System Design Visualizer using Next.js 15 App Router Server Components. Topics are loaded through an isolated data access layer reading the 8 curriculum JSON files directly from the filesystem, typed with the shared ITopic interface. The browser displays responsive topic cards with difficulty badges and unstarted mastery placeholders. The detail view renders client side Mermaid.js SVG architecture diagrams, side by side trade-off comparison panels, and an interview questions list with a stubbed quiz CTA button.

## Context

System Design Visualizer needs a user interface for browsing system design topics and studying architectural trade-offs. While the Mongoose data models for Topic, SM2State, and QuizSession are built, live MongoDB database connectivity and seed script execution are scheduled for later integration phases.

Building UI pages against placeholder mock data files would create duplication and risk schema drift from the approved curriculum JSON files in `/content`. Conversely, blocking UI development until database clusters are provisioned delays product progress. 

A clear data access abstraction is needed so that Server Components can fetch curriculum data cleanly today from disk and seamlessly transition to querying MongoDB via Mongoose in the future without modifying any UI component signatures or page layouts.

## Requirements

**User stories**:
- As a user, I want to browse all system design topics on the home page so that I can see available curriculum items, difficulty levels, and learning status.
- As a user, I want to view a topic detail page at a readable URL (such as `/topic/url-shortener`) so that I can study its Mermaid.js architecture diagram and trade-offs.
- As a user, I want to compare architectural trade-offs side by side with the chosen option highlighted so that I can understand why specific design choices were made.

**Acceptance criteria**:
- **AC-1**: An isolated data access module (`src/lib/getTopics.ts`) exports `getTopics(): Promise<ITopic[]>` and `getTopicById(id: string): Promise<ITopic | null>`, reading `/content/*.json` files via Node's `fs` module, typed using the `ITopic` interface from `src/models/Topic.ts`.
- **AC-2**: The home page (`src/app/page.tsx`) renders a responsive grid of 8 topic cards, each showing the topic name, difficulty badge ("easy": green, "medium": amber, "hard": rose), and a grayed mastery ring placeholder displaying "Not started yet".
- **AC-3**: Clicking a topic card navigates to `/topic/[id]` matching the kebab case topic ID (for example `/topic/url-shortener`), returning Next.js `notFound()` if the topic ID does not exist.
- **AC-4**: The topic detail page (`src/app/topic/[id]/page.tsx`) renders the topic header, a client side `MermaidDiagram` component rendering the Mermaid.js string to interactive SVG, trade-off comparison panels, interview questions, and a stubbed "Start Quiz" button.
- **AC-5**: Architectural trade-offs render in side by side comparison cards highlighting `option_a` vs `option_b`, emphasizing the `chosen` selection with a distinct badge and detailed `reason` text block.
- **AC-6**: Error boundaries and safe file parsing handle missing or malformed JSON files gracefully without breaking the entire application grid.

## Options considered

### Option 1: Isolated data access module with Server Components (Chosen)

Create a dedicated `src/lib/getTopics.ts` module that encapsulates filesystem reads. Next.js Server Components call `getTopics()` and `getTopicById()`. When MongoDB integration lands in a future milestone, only `src/lib/getTopics.ts` changes internally to query Mongoose (`Topic.find().lean()`), leaving UI components untouched.

**Pros**:
- Zero code changes required in UI components when transitioning from filesystem to MongoDB.
- Leverages Next.js 15 Server Components for zero client JavaScript footprint on data fetching.
- Uses official curriculum JSON files as the single source of truth, avoiding mock data drift.

**Cons**:
- Requires creating a small data access abstraction wrapper.

### Option 2: Inline filesystem reads in page components

Read `/content/*.json` directly inside `src/app/page.tsx` and `src/app/topic/[id]/page.tsx` using `fs.readFileSync`.

**Pros**:
- Slightly fewer files to create initially.

**Cons**:
- Tight coupling between page components and filesystem operations.
- Requires rewriting page data fetching code when connecting MongoDB later.

### Option 3: Separate mock data file

Create a dedicated `src/lib/mockTopics.ts` array containing mock topic objects.

**Pros**:
- Simple static array import.

**Cons**:
- Duplicates content from `/content/*.json` leading to maintenance overhead and drift.

## Decision

**Chosen option**: Option 1: Isolated data access module with Server Components

We select Option 1 because it establishes a clean seam between the data layer and UI components, enabling instant UI progress using official content files while preparing for seamless MongoDB integration.

## Rationale

Decoupling data fetching into `src/lib/getTopics.ts` ensures that page components depend on an abstract contract (`Promise<ITopic[]>`) rather than specific storage mechanics. 

Rendering the topic browser and detail views as Server Components ensures optimal load performance, SEO friendliness, and fast initial page loads. Interactive elements such as the Mermaid.js diagram renderer are encapsulated cleanly into dedicated Client Components (`'use client'`).

Using explicit placeholder indicators ("Not started yet") for SM-2 spaced repetition state accurately communicates learning progress to the user without displaying fake progress metrics.

## Feature design

**Data access signature**:

```typescript
// src/lib/getTopics.ts
import { ITopic } from '@/models/Topic'

export async function getTopics(): Promise<ITopic[]>
export async function getTopicById(id: string): Promise<ITopic | null>
```

**Component hierarchy**:

```
src/app/page.tsx (Server Component)
  ├── Header & Title Banner
  └── TopicGrid (Responsive Grid: 1 col mobile, 2 col tablet, 3 col desktop)
        └── TopicCard (Card with difficulty badge & mastery placeholder)

src/app/topic/[id]/page.tsx (Server Component)
  ├── TopicHeader (Back link, Title, Difficulty badge, Placeholder status)
  ├── DiagramSection
  │     └── MermaidDiagram (Client Component, renders SVG via mermaid.js)
  ├── TradeoffSection
  │     └── TradeoffPanel (Side-by-side Option A vs Option B with Chosen badge)
  ├── InterviewQuestionsList (Accordion or list of system design questions)
  └── QuizActionFooter (Stubbed "Start Quiz" button)
```

**API surface**:

| Route / Component | Type | Inputs | Outputs | Auth | Key errors |
|---|---|---|---|---|---|
| `/` | Server Page | None | Topic browser HTML | Public | 500 Server Error |
| `/topic/[id]` | Server Page | `params.id: string` | Topic detail HTML | Public | 404 Not Found |
| `MermaidDiagram` | Client Component | `chart: string` | Interactive SVG | N/A | Syntax / Render error |

**Key invariants**:
- Topic IDs match kebab case filename slugs in `/content/*.json` (for example `url-shortener`).
- `getTopicById` returns `null` for unknown topic IDs, triggering Next.js `notFound()`.
- `MermaidDiagram` must render safely on client side without crashing if diagram syntax is invalid.

**Security model**:
- All filesystem reads occur strictly on the server during server-side rendering.
- No raw file system paths are exposed to the client.

**Configuration required**:
- None required for interim filesystem data source.

**Critical test scenarios**:
- Happy path: Browsing home page displays 8 topic cards with correct names and difficulty badges, verifies **AC-2**.
- Navigation path: Clicking `url-shortener` card opens `/topic/url-shortener` rendering Mermaid diagram and trade-offs, verifies **AC-3**, **AC-4**, **AC-5**.
- Error path: Accessing `/topic/non-existent-topic` returns 404 Not Found page, verifies **AC-3**.

## Build plan

1. Create `src/lib/getTopics.ts` data access abstraction reading `/content/*.json` files and returning typed `ITopic` objects, satisfies **AC-1**, **AC-6**.
2. Create `src/components/TopicCard.tsx` component rendering topic title, difficulty badge, and unstarted mastery placeholder, satisfies **AC-2**.
3. Implement `src/app/page.tsx` home page rendering the responsive 8 topic card grid, satisfies **AC-2**.
4. Create `src/components/MermaidDiagram.tsx` client component initializing and rendering Mermaid.js diagrams to SVG, satisfies **AC-4**.
5. Create `src/components/TradeoffPanel.tsx` component rendering side-by-side Option A vs Option B comparisons with highlighted chosen badge and rationale, satisfies **AC-5**.
6. Implement `src/app/topic/[id]/page.tsx` detail page fetching topic data, rendering diagram, trade-offs, interview questions, and stubbed quiz CTA, satisfies **AC-3**, **AC-4**, **AC-5**.

## Consequences

**Positive**:
- UI development proceeds immediately without waiting for MongoDB cluster setup.
- Swapping to MongoDB in Feature 6 requires editing only `src/lib/getTopics.ts`.
- Page loads are fast and server rendered with zero client side data fetching overhead.

**Negative / tradeoffs**:
- Spaced repetition progress and quiz metrics display placeholder states until database integration.

**Neutral**:
- `mermaid` npm package must be added as a dependency for client side diagram rendering.

## Follow-up

- [ ] Install `mermaid` package for diagram rendering during implementation.
- [ ] Swap `src/lib/getTopics.ts` implementation to `Topic.find().lean()` when MongoDB is connected in Feature 6.
