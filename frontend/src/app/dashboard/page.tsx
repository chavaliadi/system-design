import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function DashboardPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 text-center bg-background text-foreground">
      <div className="max-w-2xl space-y-6">
        <h1 className="text-3xl font-bold">Review Dashboard</h1>
        <p className="text-muted-foreground">
          Spaced repetition mastery dashboard and Recharts analytics will be built in Feature 9.
        </p>
        <div className="pt-4">
          <Link href="/">
            <Button variant="outline">Back to Home</Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
