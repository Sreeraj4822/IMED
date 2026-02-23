
"use client";

import { useState } from 'react';
import { Activity, AlertCircle, Info, RefreshCcw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { analyzeSymptoms, SymptomAnalysisOutput } from '@/ai/flows/symptom-analysis';
import { VoiceInput } from '@/components/medical/VoiceInput';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

export default function SymptomsPage() {
  const [symptoms, setSymptoms] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<SymptomAnalysisOutput | null>(null);

  const handleAnalysis = async () => {
    if (!symptoms.trim()) return;
    setIsLoading(true);
    try {
      const result = await analyzeSymptoms({ symptoms });
      setAnalysis(result);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setSymptoms('');
    setAnalysis(null);
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="flex items-center gap-3 mb-8">
        <Activity className="h-8 w-8 text-secondary" />
        <div>
          <h1 className="text-3xl font-bold text-primary font-headline">Symptom Checker</h1>
          <p className="text-muted-foreground">Describe how you're feeling for an AI-powered analysis.</p>
        </div>
      </div>

      {!analysis ? (
        <Card className="border-t-4 border-t-secondary">
          <CardHeader>
            <CardTitle>What symptoms are you experiencing?</CardTitle>
            <CardDescription>
              Provide details like location of pain, duration, and any other relevant observations.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Textarea
                placeholder="e.g., I have a sharp pain in my lower back that started yesterday and is accompanied by a mild fever..."
                className="min-h-[200px] text-lg p-4"
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
              />
              <div className="absolute bottom-4 right-4">
                <VoiceInput onTranscript={setSymptoms} />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setSymptoms('')}>Clear</Button>
            <Button onClick={handleAnalysis} disabled={isLoading || !symptoms.trim()}>
              {isLoading ? "Analyzing..." : "Analyze Symptoms"}
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Alert variant="destructive" className="bg-destructive/5 border-destructive/20">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Medical Disclaimer</AlertTitle>
            <AlertDescription>
              This tool is for informational purposes only. If you are experiencing a medical emergency, call emergency services immediately.
            </AlertDescription>
          </Alert>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5 text-secondary" />
                Analysis Results
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">Potential Conditions</h3>
                <div className="flex flex-wrap gap-2">
                  {analysis.potentialConditions.map((condition, idx) => (
                    <Badge key={idx} variant="secondary" className="text-sm py-1 px-3">
                      {condition}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">Recommendations</h3>
                <div className="p-4 bg-accent/30 rounded-lg border border-accent">
                  <p className="text-foreground leading-relaxed">{analysis.recommendations}</p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full flex items-center gap-2" onClick={reset}>
                <RefreshCcw className="h-4 w-4" />
                Check New Symptoms
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}
