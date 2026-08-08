import { ITradeoff } from '@/models/Topic'

interface TradeoffPanelProps {
  tradeoffs: ITradeoff[]
}

export function TradeoffPanel({ tradeoffs }: TradeoffPanelProps) {
  if (!tradeoffs || tradeoffs.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-slate-500 dark:border-slate-800 dark:text-slate-400">
        No trade-offs recorded for this topic yet.
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {tradeoffs.map((tradeoff, idx) => {
        const isOptionAChosen =
          tradeoff.chosen.toLowerCase().trim() === tradeoff.option_a.toLowerCase().trim()
        const isOptionBChosen =
          tradeoff.chosen.toLowerCase().trim() === tradeoff.option_b.toLowerCase().trim()

        return (
          <div
            key={idx}
            className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4">
              Trade-off Decision {idx + 1}
            </h4>

            {/* Side-by-side Options Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {/* Option A */}
              <div
                className={`relative flex flex-col justify-between rounded-lg p-5 border transition-all ${
                  isOptionAChosen
                    ? 'border-indigo-500 bg-indigo-500/5 dark:border-indigo-500/80 dark:bg-indigo-500/10 ring-1 ring-indigo-500'
                    : 'border-slate-200 bg-slate-50/50 opacity-75 dark:border-slate-800 dark:bg-slate-900/50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">
                      Option A
                    </span>
                    {isOptionAChosen && (
                      <span className="inline-flex items-center rounded-full bg-indigo-600 px-2.5 py-0.5 text-xs font-bold text-white shadow-sm">
                        ✓ Chosen Architecture
                      </span>
                    )}
                  </div>
                  <h5 className="text-lg font-bold text-slate-900 dark:text-white">
                    {tradeoff.option_a}
                  </h5>
                </div>
              </div>

              {/* Option B */}
              <div
                className={`relative flex flex-col justify-between rounded-lg p-5 border transition-all ${
                  isOptionBChosen
                    ? 'border-indigo-500 bg-indigo-500/5 dark:border-indigo-500/80 dark:bg-indigo-500/10 ring-1 ring-indigo-500'
                    : 'border-slate-200 bg-slate-50/50 opacity-75 dark:border-slate-800 dark:bg-slate-900/50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">
                      Option B
                    </span>
                    {isOptionBChosen && (
                      <span className="inline-flex items-center rounded-full bg-indigo-600 px-2.5 py-0.5 text-xs font-bold text-white shadow-sm">
                        ✓ Chosen Architecture
                      </span>
                    )}
                  </div>
                  <h5 className="text-lg font-bold text-slate-900 dark:text-white">
                    {tradeoff.option_b}
                  </h5>
                </div>
              </div>
            </div>

            {/* Rationale Explanation */}
            <div className="rounded-lg bg-slate-50 p-4 border border-slate-200/80 dark:bg-slate-950/60 dark:border-slate-800/80">
              <h6 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-2">
                Architectural Rationale & Trade-off Analysis
              </h6>
              <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                {tradeoff.reason}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
