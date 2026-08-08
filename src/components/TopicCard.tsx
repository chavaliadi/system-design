import Link from 'next/link'
import { ITopic } from '@/models/Topic'

interface TopicCardProps {
  topic: ITopic
}

export function TopicCard({ topic }: TopicCardProps) {
  const difficultyColors = {
    easy: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    medium: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    hard: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
  }

  const difficultyClass = difficultyColors[topic.difficulty] || difficultyColors.medium

  return (
    <Link
      href={`/topic/${topic._id}`}
      className="group relative flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-slate-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700 dark:hover:shadow-slate-900/50"
    >
      <div>
        {/* Top badges */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <span
            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider ${difficultyClass}`}
          >
            {topic.difficulty}
          </span>
          <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">
            {topic.tradeoffs?.length || 0} Trade-offs
          </span>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold tracking-tight text-slate-900 transition-colors group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400">
          {topic.name}
        </h3>
      </div>

      {/* Mastery & Review Status Placeholder */}
      <div className="mt-6 flex items-center gap-4 pt-4 border-t border-slate-100 dark:border-slate-800/80">
        {/* Grayed Placeholder Mastery Ring */}
        <div className="relative flex items-center justify-center w-12 h-12">
          <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
            <path
              className="text-slate-200 dark:text-slate-800"
              strokeWidth="3.5"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <span className="absolute text-xs font-medium text-slate-400 dark:text-slate-500">
            N/A
          </span>
        </div>

        <div className="flex flex-col">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Spaced Repetition
          </span>
          <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Not started yet
          </span>
        </div>
      </div>
    </Link>
  )
}
