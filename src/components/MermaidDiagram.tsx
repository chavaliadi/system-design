'use client';

import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

mermaid.initialize({
  startOnLoad: false,
  theme: 'base',
  securityLevel: 'loose',
  fontFamily:
    'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  themeVariables: {
    darkMode: true,
    background: '#020617', // slate-950 matching design system
    mainBkg: '#0f172a', // slate-900 node background
    nodeBorder: '#334155', // slate-700 node border
    clusterBkg: '#020617',
    clusterBorder: '#1e293b', // slate-800
    defaultLinkColor: '#818cf8', // indigo-400 edge lines
    lineColor: '#818cf8', // indigo-400
    titleColor: '#f8fafc',
    textColor: '#f8fafc',
    nodeTextColor: '#f8fafc',

    // High contrast edge label box styling
    edgeLabelBackground: '#0f172a', // slate-900 background
    actorTextColor: '#f8fafc',

    // Primary & accents
    primaryColor: '#1e1b4b', // indigo-950 / dark indigo
    primaryBorderColor: '#6366f1', // indigo-500
    primaryTextColor: '#f8fafc',

    secondaryColor: '#0f172a', // slate-900
    secondaryBorderColor: '#38bdf8', // sky-400
    secondaryTextColor: '#f8fafc',

    tertiaryColor: '#1e293b', // slate-800
    tertiaryBorderColor: '#a855f7', // purple-500
    tertiaryTextColor: '#f8fafc',
  },
  flowchart: {
    nodeSpacing: 75,
    rankSpacing: 95,
    curve: 'basis',
    htmlLabels: true,
    useMaxWidth: true,
  },
});

interface MermaidDiagramProps {
  diagram: string;
}

export function MermaidDiagram({ diagram }: MermaidDiagramProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    if (!ref.current || !diagram) return;

    const renderDiagram = async () => {
      try {
        setLoading(true);
        setError(null);

        // Ensure mermaid configuration is fresh
        mermaid.initialize({
          startOnLoad: false,
          theme: 'base',
          securityLevel: 'loose',
          fontFamily:
            'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          themeVariables: {
            darkMode: true,
            background: '#020617',
            mainBkg: '#0f172a',
            nodeBorder: '#334155',
            clusterBkg: '#020617',
            clusterBorder: '#1e293b',
            defaultLinkColor: '#818cf8',
            lineColor: '#818cf8',
            titleColor: '#f8fafc',
            textColor: '#f8fafc',
            nodeTextColor: '#f8fafc',
            edgeLabelBackground: '#0f172a',
            actorTextColor: '#f8fafc',
            primaryColor: '#1e1b4b',
            primaryBorderColor: '#6366f1',
            primaryTextColor: '#f8fafc',
            secondaryColor: '#0f172a',
            secondaryBorderColor: '#38bdf8',
            secondaryTextColor: '#f8fafc',
            tertiaryColor: '#1e293b',
            tertiaryBorderColor: '#a855f7',
            tertiaryTextColor: '#f8fafc',
          },
          flowchart: {
            nodeSpacing: 75,
            rankSpacing: 95,
            curve: 'basis',
            htmlLabels: true,
            useMaxWidth: true,
          },
        });

        const id = `mermaid-${Math.random().toString(36).substring(2, 9)}`;
        const { svg } = await mermaid.render(id, diagram);

        if (isMounted && ref.current) {
          ref.current.innerHTML = svg;
          setLoading(false);
        }
      } catch (err: unknown) {
        console.error('[MermaidDiagram] Rendering error:', err);
        if (isMounted) {
          const message =
            err instanceof Error ? err.message : 'Failed to render system design diagram';
          setError(message);
          setLoading(false);
        }
      }
    };

    renderDiagram();

    return () => {
      isMounted = false;
    };
  }, [diagram]);

  if (error) {
    return (
      <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-6 text-center text-rose-600 dark:text-rose-400">
        <p className="font-semibold">Unable to render diagram</p>
        <p className="text-xs opacity-80 mt-1">{error}</p>
      </div>
    );
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
        className={`w-full overflow-x-auto flex justify-center [&_svg]:max-w-full [&_svg]:h-auto
          [&_.edgeLabel]:bg-slate-900/90 [&_.edgeLabel]:text-slate-100 [&_.edgeLabel]:px-2.5 [&_.edgeLabel]:py-1 [&_.edgeLabel]:rounded-md [&_.edgeLabel]:border [&_.edgeLabel]:border-slate-700/80 [&_.edgeLabel]:shadow-lg [&_.edgeLabel]:text-xs [&_.edgeLabel]:font-medium
          [&_.edgeLabel_rect]:fill-slate-900 [&_.edgeLabel_rect]:opacity-95 [&_.edgeLabel_rect]:stroke-slate-700
          ${loading ? 'hidden' : 'block'}`}
      />
    </div>
  );
}
