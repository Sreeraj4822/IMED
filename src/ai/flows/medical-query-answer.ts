'use server';
/**
 * @fileOverview A medical query AI agent.
 *
 * - answerMedicalQuery - A function that handles answering medical questions.
 * - MedicalQueryInput - The input type for the answerMedicalQuery function.
 * - MedicalQueryOutput - The return type for the answerMedicalQuery function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Input Schema
const MedicalQueryInputSchema = z.object({
  query: z.string().describe('The user\'s medical question.'),
});
export type MedicalQueryInput = z.infer<typeof MedicalQueryInputSchema>;

// Output Schema
const MedicalQueryOutputSchema = z.object({
  answer: z.string().describe('The AI\'s informative answer to the medical question.'),
});
export type MedicalQueryOutput = z.infer<typeof MedicalQueryOutputSchema>;

// Define a placeholder tool for searching medical data
const searchMedicalDatabase = ai.defineTool(
  {
    name: 'searchMedicalDatabase',
    description: 'Searches a comprehensive medical database for information related to the user\'s query. Use this tool to get factual medical information before answering complex medical questions.',
    inputSchema: z.object({
      topic: z.string().describe('The specific medical topic or keyword to search for in the database.'),
    }),
    outputSchema: z.string().describe('Relevant information found in the medical database. If no information is found for the given topic, it will indicate so.'),
  },
  async (input) => {
    // In a real application, this would call an external API or database.
    // For this implementation, we'll return a mock response.
    console.log(`Searching medical database for topic: "${input.topic}"`);
    if (input.topic.toLowerCase().includes('diabetes')) {
      return `Diabetes is a chronic condition that affects how your body turns food into energy. Most of the food you eat is broken down into sugar (also called glucose) and released into your bloodstream. When your blood sugar goes up, it signals your pancreas to release insulin. Insulin acts like a key to let blood sugar into your body’s cells for use as energy. With diabetes, your body doesn’t make enough insulin or can’t use the insulin it makes as well as it should.`;
    } else if (input.topic.toLowerCase().includes('hypertension')) {
      return `Hypertension, also known as high blood pressure, is a common condition in which the long-term force of the blood against your artery walls is high enough that it may eventually cause health problems, such as heart disease. Blood pressure is determined both by the amount of blood your heart pumps and the amount of resistance to blood flow in your arteries. The more blood your heart pumps and the narrower your arteries, the higher your blood pressure.`;
    } else if (input.topic.toLowerCase().includes('common cold')) {
        return `The common cold is a viral infection of your nose and throat (upper respiratory tract). It's usually harmless, although it might not feel that way. Many types of viruses can cause a common cold. Symptoms include a runny or stuffy nose, sore throat, cough, congestion, slight body aches or a mild headache, sneezing, and low-grade fever.`;
    }
    return `No specific information found for "${input.topic}" in the medical database.`;
  }
);

// Prompt Definition
const medicalQueryPrompt = ai.definePrompt({
  name: 'medicalQueryPrompt',
  input: {schema: MedicalQueryInputSchema},
  output: {schema: MedicalQueryOutputSchema},
  tools: [searchMedicalDatabase], // Make the tool available to the prompt
  prompt: `You are IMED Search AI, an AI medical assistant designed to provide accurate and informative answers to medical questions.
  Always provide a professional, helpful, and concise answer.
  If the user's question requires detailed medical information that you might not have readily, use the 'searchMedicalDatabase' tool to find relevant information before formulating your answer.
  When citing information from the tool, integrate it naturally into your response.
  Always emphasize that this information is not a substitute for professional medical advice.

  User's medical question: {{{query}}}`,
});

// Flow Definition
const medicalQueryAnswerFlow = ai.defineFlow(
  {
    name: 'medicalQueryAnswerFlow',
    inputSchema: MedicalQueryInputSchema,
    outputSchema: MedicalQueryOutputSchema,
  },
  async (input) => {
    const {output} = await medicalQueryPrompt(input);
    // The output will be in the format { answer: "..." }
    return output!;
  }
);

// Wrapper function for external usage
export async function answerMedicalQuery(input: MedicalQueryInput): Promise<MedicalQueryOutput> {
  return medicalQueryAnswerFlow(input);
}
