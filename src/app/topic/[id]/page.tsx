import { getTopicById, getTopics } from '@/lib/getTopics'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { MermaidDiagram } from '@/components/MermaidDiagram'
import { TradeoffPanel } from '@/components/TradeoffPanel'

interface TopicPageProps {
  params: Promise<{
    id: string
  }>
}

export async function generateStaticParams() {
  const topics = await getTopics()
  return topics.map((t) => ({
    id: t._id
  }))
}

export async function generateMetadata({ params }: TopicPageProps) {
  const { id } = await params
  const topic = await getTopicById(id)
  if (!topic) return { title: 'Topic Not Found' }
  return {
    title: `${topic.name} | System Design Visualizer`,
    description: `Architectural diagrams and trade-offs for ${topic.name}.`
  }
}

export default async function TopicDetailPage({ params }: TopicPageProps) {
  const { id } = await params
  const topic = await getTopicById(id)

  if (!topic) {
    notFound()
  }

  const difficultyColors = {
    easy: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    medium: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    hard: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
  }

  const difficultyClass = difficultyColors[topic.difficulty] || difficultyColors.medium

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      {/* Top Bar */}
      <div className="border-b border-slate-200 bg-white/80 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
          >
            ← Back to Topics
          </Link>
        </div>
      </div>

      {/* Main Container */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-200 pb-8 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span
                className={`inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-semibold uppercase tracking-wider ${difficultyClass}`}
              >
                {topic.difficulty}
              </span>
              <span className="inline-flex items-center rounded-full bg-slate-200/60 px-3 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                Spaced Repetition: Not started yet
              </span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
              {topic.name}
            </h1>
          </div>

          {/* Stubbed Quiz Button */}
          <div>
            <button
              disabled
              title="Quiz evaluation API will be enabled in Feature 6"
              className="w-full md:w-auto inline-flex items-center justify-center rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-sm opacity-60 cursor-not-allowed"
            >
              Start Adaptive Quiz (Coming Soon)
            </button>
          </div>
        </div>

        {/* Section 1: Mermaid Architecture Diagram */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Architecture Diagram
            </h2>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Interactive Component View
            </span>
          </div>
          <MermaidDiagram diagram={topic.mermaid_diagram} />
        </section>

        {/* Section 2: Trade-off Comparisons */}
        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Architectural Trade-offs
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Evaluating option pros/cons and rationale behind chosen design decisions
            </p>
          </div>
          <TradeoffPanel tradeoffs={topic.tradeoffs} />
        </section>

        {/* Section 3: Interview Practice Questions */}
        {topic.interview_questions && topic.interview_questions.length > 0 && (
          <section className="space-y-4">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                Interview Questions
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Key follow-up questions asked in system design interviews for this topic
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
              {topic.interview_questions.map((q, idx) => (
                <div
                  key={idx}
                  className="flex gap-4 p-4 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800/60"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-500/10 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                    {idx + 1}
                  </span>
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200 leading-relaxed">
                    {q}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
