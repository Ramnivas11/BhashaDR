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
  possibleConditions: z.string().describe('The possible common health issues based on the symptoms, translated to the user\'s language.'),
  remedies: z.string().describe('Suggested over-the-counter remedies, translated to the user\'s language.'),
});
export type TranslateSymptomsAndSuggestionsOutput = z.infer<typeof TranslateSymptomsAndSuggestionsOutputSchema>;

export async function translateSymptomsAndSuggestions(input: TranslateSymptomsAndSuggestionsInput): Promise<TranslateSymptomsAndSuggestionsOutput> {
  return translateSymptomsAndSuggestionsFlow(input);
}

const systemPrompt = `You are a friendly medical assistant that helps users in India describe symptoms 
and get possible common health issues and over-the-counter remedies in simple, non-technical words.

Rules:
- The user will describe their health symptoms.
- If symptoms are unclear, ask simple follow-up questions.
- Give only POSSIBLE common conditions (not a diagnosis).
- Suggest only safe, common, over-the-counter remedies. DO NOT provide prescriptions.
- Always add this disclaimer at the end of your entire response:
  \"⚠️ This is not medical advice. Please consult a doctor for confirmation.\"
- Keep the explanation short and easy to understand.
- Reply in the same language as the user’s input.
`;

const translateSymptomsAndSuggestionsPrompt = ai.definePrompt({
  name: 'translateSymptomsAndSuggestionsPrompt',
  input: {schema: TranslateSymptomsAndSuggestionsInputSchema},
  output: {schema: TranslateSymptomsAndSuggestionsOutputSchema},
  system: systemPrompt,
  prompt: `Translate the following symptoms from {{language}} to English: {{{symptoms}}}. 
Then, based on the English translation, provide:
1. Possible common health issues.
2. Safe, over-the-counter remedies for emergency relief.

Finally, translate both the possible conditions and the remedies back to {{language}}.`
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
