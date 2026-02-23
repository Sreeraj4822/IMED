import { config } from 'dotenv';
config();

import '@/ai/flows/symptom-analysis.ts';
import '@/ai/flows/medical-query-answer.ts';
import '@/ai/flows/blood-report-analysis.ts';
