"use client";

import { useState } from 'react';
import { Search, Sparkles, BrainCircuit, Activity, Pill, Calendar, Hospital, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { VoiceInput } from '@/components/medical/VoiceInput';
import { answerMedicalQuery } from '@/ai/flows/medical-query-answer';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function Home() {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setResult(null);
    try {
      const response = await answerMedicalQuery({ query });
      setResult(response.answer);
    } catch (error) {
      console.error(error);
      setResult("Sorry, I encountered an error while searching for your medical query.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTranscript = (text: string) => {
    setQuery(text);
  };

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-6xl">
      <section className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-primary mb-4 font-headline">
          Medical Insights at Your Fingertips
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Ask IMED Search AI any medical question or query. Get intelligent, database-backed answers in seconds.
        </p>
      </section>

      <section className="mb-16">
        <div className="relative max-w-3xl mx-auto">
          <form onSubmit={handleSearch} className="relative flex items-center gap-2 bg-card p-2 rounded-2xl shadow-xl border border-border">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                placeholder="How can I manage type 2 diabetes?"
                className="pl-10 h-14 border-none shadow-none focus-visible:ring-0 text-lg"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <VoiceInput onTranscript={handleTranscript} />
            <Button size="lg" className="h-12 px-8 rounded-xl" disabled={isLoading}>
              {isLoading ? "Searching..." : "Ask AI"}
            </Button>
          </form>

          {result && (
            <Card className="mt-8 border-primary/20 bg-primary/5 shadow-lg animate-in fade-in zoom-in-95 duration-500">
              <CardHeader className="flex flex-row items-center gap-2">
                <BrainCircuit className="h-6 w-6 text-primary" />
                <CardTitle className="text-xl font-headline">AI Medical Response</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-blue max-w-none text-foreground leading-relaxed">
                  {result.split('\n').map((paragraph, i) => (
                    <p key={i} className="mb-4">{paragraph}</p>
                  ))}
                </div>
                <div className="mt-6 flex items-center text-xs text-muted-foreground bg-accent/30 p-3 rounded-md border border-accent">
                  <Sparkles className="h-4 w-4 mr-2 text-primary" />
                  Disclaimer: This information is for educational purposes only and not a substitute for professional medical advice.
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-center mb-8 font-headline">Core Medical Tools</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ToolCard 
            title="Blood Report Analyzer" 
            description="Upload or paste blood test results for a detailed AI interpretation." 
            icon={<FileText className="h-6 w-6" />}
            href="/blood-report"
            color="bg-primary"
          />
          <ToolCard 
            title="Symptom Checker" 
            description="Input your symptoms and get potential medical conditions." 
            icon={<Activity className="h-6 w-6" />}
            href="/symptoms"
            color="bg-secondary"
          />
          <ToolCard 
            title="Medicine Database" 
            description="Find detailed information about prescriptions and drugs." 
            icon={<Pill className="h-6 w-6" />}
            href="/medicines"
            color="bg-primary/80"
          />
          <ToolCard 
            title="Appt. Reminders" 
            description="Keep track of your upcoming doctor appointments." 
            icon={<Calendar className="h-6 w-6" />}
            href="/appointments"
            color="bg-secondary/80"
          />
          <ToolCard 
            title="Hospital Locator" 
            description="Find the nearest hospitals and clinics in your area." 
            icon={<Hospital className="h-6 w-6" />}
            href="/hospitals"
            color="bg-primary/70"
          />
          <ToolCard 
            title="Medical Search" 
            description="Ask our AI about any health topic for quick, cited info." 
            icon={<Search className="h-6 w-6" />}
            href="/"
            color="bg-secondary/70"
          />
        </div>
      </section>
    </div>
  );
}

function ToolCard({ title, description, icon, href, color }: { title: string, description: string, icon: React.ReactNode, href: string, color: string }) {
  return (
    <Link href={href}>
      <Card className="h-full transition-all hover:shadow-md hover:-translate-y-1 group">
        <CardHeader>
          <div className={cn("p-3 w-fit rounded-lg text-white mb-2 transition-transform group-hover:scale-110", color)}>
            {icon}
          </div>
          <CardTitle className="text-xl font-headline">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription className="text-base">{description}</CardDescription>
        </CardContent>
      </Card>
    </Link>
  );
}
