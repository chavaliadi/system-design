import { getTopics } from '@/lib/getTopics'
import { TopicCard } from '@/components/TopicCard'

export const metadata = {
  title: 'System Design Visualizer | Adaptive Learning Platform',
  description: 'Master system design interview topics through interactive diagrams and architectural trade-offs.'
}

export default async function HomePage() {
  const topics = await getTopics()

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      {/* Header Banner */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
              System Design Visualizer
            </h1>
            <p className="max-w-2xl text-base text-slate-600 dark:text-slate-400">
              Master complex architectural patterns, study Mermaid.js component diagrams, and analyze critical trade-offs for high-scale system design interviews.
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              System Design Curriculum
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Select a topic to explore architectural diagrams and trade-offs
            </p>
          </div>
          <span className="inline-flex items-center rounded-md bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
            {topics.length} Topics Available
          </span>
        </div>

        {topics.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 p-12 text-center text-slate-500 dark:border-slate-800 dark:text-slate-400">
            No system design topics found.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
            {topics.map((topic) => (
              <TopicCard key={topic._id} topic={topic} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
