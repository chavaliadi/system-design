'use client'

import { useEffect, useRef, useState } from 'react'
import mermaid from 'mermaid'

mermaid.initialize({
  startOnLoad: false,
  theme: 'dark',
  securityLevel: 'loose',
  fontFamily: 'inherit'
})

interface MermaidDiagramProps {
  diagram: string
}

export function MermaidDiagram({ diagram }: MermaidDiagramProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    let isMounted = true

    if (!ref.current || !diagram) return

    const renderDiagram = async () => {
      try {
        setLoading(true)
        setError(null)

        const id = `mermaid-${Math.random().toString(36).substring(2, 9)}`
        const { svg } = await mermaid.render(id, diagram)

        if (isMounted && ref.current) {
          ref.current.innerHTML = svg
          setLoading(false)
        }
      } catch (err: unknown) {
        console.error('[MermaidDiagram] Rendering error:', err)
        if (isMounted) {
          const message = err instanceof Error ? err.message : 'Failed to render system design diagram'
          setError(message)
          setLoading(false)
        }
      }
    }

    renderDiagram()

    return () => {
      isMounted = false
    }
  }, [diagram])

  if (error) {
    return (
      <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-6 text-center text-rose-600 dark:text-rose-400">
        <p className="font-semibold">Unable to render diagram</p>
        <p className="text-xs opacity-80 mt-1">{error}</p>
      </div>
    )
  }

  return (
    <div className="relative w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-950 p-6 shadow-sm dark:border-slate-800">
      {loading && (
        <div className="flex h-64 items-center justify-center text-sm font-medium text-slate-400">
          Rendering Architecture Diagram...
        </div>
      )}
      <div
        ref={ref}
        className={`w-full overflow-x-auto flex justify-center [&_svg]:max-w-full [&_svg]:h-auto ${
          loading ? 'hidden' : 'block'
        }`}
      />
    </div>
  )
}
