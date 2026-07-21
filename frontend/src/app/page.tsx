import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 text-center bg-background text-foreground">
      <div className="max-w-2xl space-y-6">
        <h1 className="text-4xl font-bold tracking-tight">System Design Visualizer</h1>
        <p className="text-muted-foreground text-lg">
          Adaptive learning platform for practicing cloud & distributed system architecture trade-offs.
        </p>
        <div className="flex flex-wrap justify-center gap-4 pt-4">
          <Link href="/topic/url-shortener">
            <Button variant="default">Topic View (Placeholder)</Button>
          </Link>
          <Link href="/quiz/url-shortener">
            <Button variant="secondary">Quiz View (Placeholder)</Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="outline">Dashboard (Placeholder)</Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
