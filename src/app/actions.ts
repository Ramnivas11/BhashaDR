'use server';

import { translateSymptomsAndSuggestions } from '@/ai/flows/translate-symptoms-and-suggestions';
import { findNearbyHospitals, FindNearbyHospitalsOutput } from '@/ai/flows/find-nearby-hospitals';
import { z } from 'zod';

const symptomSchema = z.object({
  symptoms: z.string().min(10, { message: "Please describe your symptoms in at least 10 characters." }),
  language: z.string({ required_error: "Please select a language." }),
});

type SymptomState = {
  suggestions?: string;
  error?: string | null;
}

export async function getSuggestionsAction(data: z.infer<typeof symptomSchema>): Promise<SymptomState> {
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

const locationSchema = z.object({
    latitude: z.number(),
    longitude: z.number(),
});

type HospitalState = {
    hospitals?: FindNearbyHospitalsOutput['hospitals'];
    error?: string | null;
}

export async function getNearbyHospitalsAction(data: z.infer<typeof locationSchema>): Promise<HospitalState> {
    const validatedFields = locationSchema.safeParse(data);

    if (!validatedFields.success) {
        return {
            error: "Invalid location provided. Please check the form and try again."
        };
    }

    try {
        const result = await findNearbyHospitals(validatedFields.data);
        return { hospitals: result.hospitals, error: null };
    } catch (e) {
        console.error(e);
        return {
            error: 'An AI error occurred while finding nearby hospitals. Please try again later.',
        };
    }
}
