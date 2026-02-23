'use server';
/**
 * @fileOverview A medical AI agent that analyzes blood test reports.
 *
 * - analyzeBloodReport - A function that handles the interpretation of lab results.
 * - BloodReportInput - The input type for the analyzeBloodReport function.
 * - BloodReportOutput - The return type for the analyzeBloodReport function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const BloodReportInputSchema = z.object({
  reportPhotoDataUri: z
    .string()
    .optional()
    .describe(
      "A photo of the blood test report, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  reportText: z.string().optional().describe('Text content extracted from a blood test report.'),
});
export type BloodReportInput = z.infer<typeof BloodReportInputSchema>;

const LabFindingSchema = z.object({
  parameter: z.string().describe('The name of the test parameter (e.g., Hemoglobin, Glucose).'),
  value: z.string().describe('The measured value in the report.'),
  unit: z.string().describe('The unit of measurement.'),
  referenceRange: z.string().describe('The normal reference range provided by the lab.'),
  status: z.enum(['low', 'normal', 'high']).describe('Whether the value is below, within, or above the normal range.'),
  explanation: z.string().describe('A brief explanation of what this parameter means for the user.'),
});

const BloodReportOutputSchema = z.object({
  summary: z.string().describe('A high-level brief of the overall report findings.'),
  findings: z.array(LabFindingSchema).describe('A detailed list of specific lab parameters and their status.'),
  detailedAnalysis: z.string().describe('A comprehensive explanation of the clinical significance of these results.'),
  recommendations: z.string().describe('Suggestions for next steps or questions to ask a doctor.'),
});
export type BloodReportOutput = z.infer<typeof BloodReportOutputSchema>;

export async function analyzeBloodReport(input: BloodReportInput): Promise<BloodReportOutput> {
  return bloodReportAnalysisFlow(input);
}

const bloodReportPrompt = ai.definePrompt({
  name: 'bloodReportPrompt',
  input: { schema: BloodReportInputSchema },
  output: { schema: BloodReportOutputSchema },
  config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_NONE',
      },
    ],
  },
  prompt: `You are an expert clinical pathologist and medical assistant.
Analyze the provided blood test report data and provide a detailed interpretation.

{{#if reportPhotoDataUri}}
REPORT IMAGE PROVIDED: {{media url=reportPhotoDataUri}}
{{/if}}

{{#if reportText}}
REPORT TEXT CONTENT:
{{{reportText}}}
{{/if}}

Please perform the following:
1. Extract every lab parameter mentioned.
2. For each parameter, determine the status: "low", "normal", or "high" based on the provided reference ranges.
3. Provide a brief summary of the most significant findings.
4. Give a detailed explanation of what the results mean collectively (e.g., signs of anemia, infection, metabolic issues).
5. Suggest appropriate next steps, emphasizing consultation with a primary care physician.

IMPORTANT: 
- Always include units.
- If a reference range is missing, use standard clinical ranges but note it.
- Ensure the JSON output matches the requested schema exactly.
- Status values MUST be lowercase: "low", "normal", or "high".`,
});

const bloodReportAnalysisFlow = ai.defineFlow(
  {
    name: 'bloodReportAnalysisFlow',
    inputSchema: BloodReportInputSchema,
    outputSchema: BloodReportOutputSchema,
  },
  async (input) => {
    const { output } = await bloodReportPrompt(input);
    if (!output) {
      throw new Error('The AI model returned no results. Please ensure the report data is clear and try again.');
    }
    return output;
  }
);
