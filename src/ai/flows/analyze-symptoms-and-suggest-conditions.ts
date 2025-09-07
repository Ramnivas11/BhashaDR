'use server';

/**
 * @fileOverview Analyzes user-described symptoms and suggests possible common health issues.
 *
 * - analyzeSymptomsAndSuggestPossibleConditions - A function that takes symptom descriptions and returns potential health issues.
 * - AnalyzeSymptomsAndSuggestPossibleConditionsInput - The input type for the analyzeSymptomsAndSuggestPossibleConditions function.
 * - AnalyzeSymptomsAndSuggestPossibleConditionsOutput - The return type for the analyzeSymptomsAndSuggestPossibleConditions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeSymptomsAndSuggestPossibleConditionsInputSchema = z.object({
  symptoms: z
    .string()
    .describe('The description of the symptoms in the user\'s native language.'),
  language: z.string().describe('The language of the symptoms description.'),
});

export type AnalyzeSymptomsAndSuggestPossibleConditionsInput = z.infer<
  typeof AnalyzeSymptomsAndSuggestPossibleConditionsInputSchema
>;

const AnalyzeSymptomsAndSuggestPossibleConditionsOutputSchema = z.object({
  suggestions: z
    .string()
    .describe(
      'Possible common health issues based on the symptoms described, translated back into the user\'s language.'
    ),
  disclaimer: z.string().describe('A safety disclaimer.'),
});

export type AnalyzeSymptomsAndSuggestPossibleConditionsOutput = z.infer<
  typeof AnalyzeSymptomsAndSuggestPossibleConditionsOutputSchema
>;

export async function analyzeSymptomsAndSuggestPossibleConditions(
  input: AnalyzeSymptomsAndSuggestPossibleConditionsInput
): Promise<AnalyzeSymptomsAndSuggestPossibleConditionsOutput> {
  return analyzeSymptomsAndSuggestPossibleConditionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeSymptomsAndSuggestPossibleConditionsPrompt',
  input: {schema: AnalyzeSymptomsAndSuggestPossibleConditionsInputSchema},
  output: {schema: AnalyzeSymptomsAndSuggestPossibleConditionsOutputSchema},
  prompt: `You are a friendly medical assistant that helps users in India describe symptoms
and get possible common health issues in simple, non-technical words.

Rules:
- The user will describe their health symptoms in {{{language}}}.
- If symptoms are unclear, ask simple follow-up questions.
- Give only POSSIBLE common conditions (not diagnosis).
- Always add this disclaimer at the end:
  "⚠️ This is not medical advice. Please consult a doctor for confirmation."
- Keep the explanation short and easy to understand.
- Reply in the same language as the user’s input.

Symptoms: {{{symptoms}}}`,
});

const analyzeSymptomsAndSuggestPossibleConditionsFlow = ai.defineFlow(
  {
    name: 'analyzeSymptomsAndSuggestPossibleConditionsFlow',
    inputSchema: AnalyzeSymptomsAndSuggestPossibleConditionsInputSchema,
    outputSchema: AnalyzeSymptomsAndSuggestPossibleConditionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return {
      suggestions: output?.suggestions ?? 'Could not determine possible conditions.',
      disclaimer: '⚠️ This is not medical advice. Please consult a doctor for confirmation.',
    };
  }
);
