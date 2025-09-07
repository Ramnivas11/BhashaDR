'use server';
/**
 * @fileOverview A flow to find nearby open hospitals.
 *
 * - findNearbyHospitals - A function that handles finding nearby open hospitals.
 * - FindNearbyHospitalsInput - The input type for the findNearbyHospitals function.
 * - FindNearbyHospitalsOutput - The return type for the findNearbyHospitals function.
 */
import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {findPlaces} from '@/ai/tools/google-places';

const HospitalSchema = z.object({
  name: z.string().describe('The name of the hospital.'),
  address: z.string().describe('The address of the hospital.'),
  isOpen: z.boolean().describe('Whether the hospital is open right now.'),
  distance: z
    .string()
    .optional()
    .describe('The distance from the user.'),
});

const FindNearbyHospitalsInputSchema = z.object({
  latitude: z.number().describe('The latitude of the user.'),
  longitude: z.number().describe('The longitude of the user.'),
});
export type FindNearbyHospitalsInput = z.infer<
  typeof FindNearbyHospitalsInputSchema
>;

const FindNearbyHospitalsOutputSchema = z.object({
  hospitals: z
    .array(HospitalSchema)
    .describe('A list of nearby hospitals that are open.'),
});
export type FindNearbyHospitalsOutput = z.infer<
  typeof FindNearbyHospitalsOutputSchema
>;

export async function findNearbyHospitals(
  input: FindNearbyHospitalsInput
): Promise<FindNearbyHospitalsOutput> {
  return findNearbyHospitalsFlow(input);
}

const findNearbyHospitalsPrompt = ai.definePrompt({
  name: 'findNearbyHospitalsPrompt',
  input: {schema: FindNearbyHospitalsInputSchema},
  output: {schema: FindNearbyHospitalsOutputSchema},
  tools: [findPlaces],
  prompt: `Find hospitals near the user's location (latitude: {{latitude}}, longitude: {{longitude}}).
You must determine if the hospital is open now. Hospitals are generally open 24/7.
Return a list of the closest hospitals that are currently open.`,
});

const findNearbyHospitalsFlow = ai.defineFlow(
  {
    name: 'findNearbyHospitalsFlow',
    inputSchema: FindNearbyHospitalsInputSchema,
    outputSchema: FindNearbyHospitalsOutputSchema,
  },
  async input => {
    const {output} = await findNearbyHospitalsPrompt(input);
    return output!;
  }
);
