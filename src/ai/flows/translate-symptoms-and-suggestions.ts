'use server';
/**
 * @fileOverview A flow to translate user's symptoms to English, get AI suggestions, and translate back to the user's language.
 *
 * - translateSymptomsAndSuggestions - A function that handles the translation and suggestion process.
 * - TranslateSymptomsAndSuggestionsInput - The input type for the translateSymptomsAndSuggestions function.
 * - TranslateSymptomsAndSuggestionsOutput - The return type for the translateSymptomsAndSuggestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TranslateSymptomsAndSuggestionsInputSchema = z.object({
  symptoms: z.string().describe('The symptoms described by the user in their native language.'),
  language: z.string().describe('The language of the symptoms description.'),
});
export type TranslateSymptomsAndSuggestionsInput = z.infer<typeof TranslateSymptomsAndSuggestionsInputSchema>;

const TranslateSymptomsAndSuggestionsOutputSchema = z.object({
  suggestions: z.string().describe('The AI suggestions translated back to the user\'s native language.'),
});
export type TranslateSymptomsAndSuggestionsOutput = z.infer<typeof TranslateSymptomsAndSuggestionsOutputSchema>;

export async function translateSymptomsAndSuggestions(input: TranslateSymptomsAndSuggestionsInput): Promise<TranslateSymptomsAndSuggestionsOutput> {
  return translateSymptomsAndSuggestionsFlow(input);
}

const systemPrompt = `You are a friendly medical assistant that helps users in India describe symptoms 
and get possible common health issues in simple, non-technical words.

Rules:
- The user will describe their health symptoms.
- If symptoms are unclear, ask simple follow-up questions.
- Give only POSSIBLE common conditions (not diagnosis).
- Always add this disclaimer at the end:
  \"⚠️ This is not medical advice. Please consult a doctor for confirmation.\"
- Keep the explanation short and easy to understand.
- Reply in the same language as the user’s input.
`;

const translateSymptomsAndSuggestionsPrompt = ai.definePrompt({
  name: 'translateSymptomsAndSuggestionsPrompt',
  input: {schema: TranslateSymptomsAndSuggestionsInputSchema},
  output: {schema: TranslateSymptomsAndSuggestionsOutputSchema},
  system: systemPrompt,
  prompt: `Translate the following symptoms from {{language}} to english: {{{symptoms}}}. Then, based on the english translation of the symptoms, provide possible common health issues. Finally translate the suggestions back to {{language}}.`
});

const translateSymptomsAndSuggestionsFlow = ai.defineFlow(
  {
    name: 'translateSymptomsAndSuggestionsFlow',
    inputSchema: TranslateSymptomsAndSuggestionsInputSchema,
    outputSchema: TranslateSymptomsAndSuggestionsOutputSchema,
  },
  async input => {
    const {output} = await translateSymptomsAndSuggestionsPrompt(input);
    return output!;
  }
);
