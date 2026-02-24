'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SymptomAnalysisInputSchema = z.object({
  symptoms: z.string().describe('A detailed description of the user\'s symptoms.'),
});
export type SymptomAnalysisInput = z.infer<typeof SymptomAnalysisInputSchema>;

const SymptomAnalysisOutputSchema = z.object({
  potentialConditions: z.array(z.string()).describe('A list of potential medical conditions based on the symptoms.'),
  recommendations: z.string().describe('Recommendations for appropriate next steps, such as consulting a doctor or self-care.'),
});
export type SymptomAnalysisOutput = z.infer<typeof SymptomAnalysisOutputSchema>;

export async function analyzeSymptoms(input: SymptomAnalysisInput): Promise<SymptomAnalysisOutput> {
  return symptomAnalysisFlow(input);
}

const symptomAnalysisPrompt = ai.definePrompt({
  name: 'symptomAnalysisPrompt',
  input: { schema: SymptomAnalysisInputSchema },
  output: { schema: SymptomAnalysisOutputSchema },
  prompt: `You are a helpful and professional medical assistant.
Your task is to analyze a user's described symptoms and provide:
1. A list of potential medical conditions that could be associated with these symptoms.
2. Clear and appropriate recommendations for next steps.

Symptoms: {{{symptoms}}}

Please provide your response in a JSON object that matches this structure:
{
  "potentialConditions": ["condition1", "condition2"],
  "recommendations": "string"
}`,
});

const symptomAnalysisFlow = ai.defineFlow(
  {
    name: 'symptomAnalysisFlow',
    inputSchema: SymptomAnalysisInputSchema,
    outputSchema: SymptomAnalysisOutputSchema,
  },
  async (input) => {
    const { output } = await symptomAnalysisPrompt(input);
    
    if (!output) {
      throw new Error('No output from symptom analysis prompt.');
    }
    
    return output;
  }
);
