import { Stethoscope } from 'lucide-react';
import { SymptomChecker } from '@/components/symptom-checker';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-4 sm:p-8 md:p-12 lg:p-24">
      <header className="mb-12 text-center">
        <div className="inline-flex items-center gap-4">
          <Stethoscope className="h-12 w-12 text-primary" />
          <h1 className="text-4xl sm:text-5xl font-bold font-headline text-primary">
            Bhasha Doctor
          </h1>
        </div>
        <p className="mt-2 text-lg text-muted-foreground">
          Your AI-powered health companion
        </p>
      </header>
      <SymptomChecker />
    </main>
  );
}
