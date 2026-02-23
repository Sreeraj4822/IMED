'use server';
/**
 * @fileOverview A medical assistant that analyzes user-provided symptoms.
 *
 * - analyzeSymptoms - A function that handles the symptom analysis process.
 * - SymptomAnalysisInput - The input type for the analyzeSymptoms function.
 * - SymptomAnalysisOutput - The return type for the analyzeSymptoms function.
 */

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
2. Clear and appropriate recommendations for next steps (e.g., "Consult a doctor for further evaluation", "Monitor symptoms and rest", "Seek immediate medical attention").

Symptoms: {{{symptoms}}}

Please provide your response in a JSON object with the following structure:
{{json-schema SymptomAnalysisOutputSchema}}`,
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
