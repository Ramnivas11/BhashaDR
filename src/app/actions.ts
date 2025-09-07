'use server';

import { translateSymptomsAndSuggestions } from '@/ai/flows/translate-symptoms-and-suggestions';
import { z } from 'zod';

const symptomSchema = z.object({
  symptoms: z.string().min(10, { message: "Please describe your symptoms in at least 10 characters." }),
  language: z.string({ required_error: "Please select a language." }),
});

type State = {
  suggestions?: string;
  error?: string | null;
}

export async function getSuggestionsAction(data: z.infer<typeof symptomSchema>): Promise<State> {
  const validatedFields = symptomSchema.safeParse(data);

  if (!validatedFields.success) {
    // This server-side validation is a fallback for when client-side validation fails.
    return {
      error: "Invalid input provided. Please check the form and try again."
    };
  }
  
  try {
    const result = await translateSymptomsAndSuggestions({
      symptoms: validatedFields.data.symptoms,
      language: validatedFields.data.language,
    });
    return { suggestions: result.suggestions, error: null };
  } catch (e) {
    console.error(e);
    return {
      error: 'An AI error occurred while analyzing your symptoms. Please try again later.',
    };
  }
}
