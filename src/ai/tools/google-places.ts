'use server';

import {ai} from '@/ai/genkit';
import {z} from 'zod';

// This is a mocked tool. In a real application, you would use the Google
// Places API to find nearby places.
export const findPlaces = ai.defineTool(
  {
    name: 'findPlaces',
    description: 'Finds places of a certain type near a location.',
    inputSchema: z.object({
      latitude: z.number(),
      longitude: z.number(),
      query: z.string(),
    }),
    outputSchema: z.any(),
  },
  async ({latitude, longitude, query}) => {
    console.log(
      `Finding places for query "${query}" near ${latitude}, ${longitude}`
    );
    // Mocked data. In a real app, you would use an API to get this data.
    return [
      {
        name: 'City Hospital',
        address: '123 Health St, Downtown',
        opening_hours: {open_now: true},
        distance: '2.3 km',
      },
      {
        name: 'Apollo Clinic',
        address: '456 Wellness Ave, Uptown',
        opening_hours: {open_now: true},
        distance: '1.5 km',
      },
      {
        name: 'Community Medical Center',
        address: '789 Care Rd, Suburbia',
        opening_hours: {open_now: true},
        distance: '5.1 km',
      },
      {
        name: 'Dental Care Center',
        address: '101 Tooth Ln, Molarville',
        opening_hours: {open_now: false},
        distance: '3.5 km',
      },
    ];
  }
);
