import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface QuizPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function QuizPage({ params }: QuizPageProps) {
  const { id } = await params;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 text-center bg-background text-foreground">
      <div className="max-w-2xl space-y-6">
        <h1 className="text-3xl font-bold">Quiz: {id}</h1>
        <p className="text-muted-foreground">
          AI scenario quiz & evaluation interface will be built in Feature 7.
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
