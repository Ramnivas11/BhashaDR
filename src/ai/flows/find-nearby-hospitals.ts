'use server';
/**
 * @fileOverview A flow to find nearby open hospitals using OpenStreetMap (Overpass API).
 *
 * - findNearbyHospitals - A function that handles finding nearby open hospitals.
 * - FindNearbyHospitalsInput - The input type for the findNearbyHospitals function.
 * - FindNearbyHospitalsOutput - The return type for the findNearbyHospitals function.
 */
import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// 🏥 Hospital schema
const HospitalSchema = z.object({
  name: z.string().describe('The name of the hospital.'),
  address: z.string().optional().describe('The address of the hospital (if available).'),
  isOpen: z.boolean().describe('Whether the hospital is open right now.'),
  distance: z.string().optional().describe('The distance from the user in km.'),
});

// 📍 Input schema
const FindNearbyHospitalsInputSchema = z.object({
  latitude: z.number().describe('The latitude of the user.'),
  longitude: z.number().describe('The longitude of the user.'),
});
export type FindNearbyHospitalsInput = z.infer<typeof FindNearbyHospitalsInputSchema>;

// 📤 Output schema
const FindNearbyHospitalsOutputSchema = z.object({
  hospitals: z.array(HospitalSchema).describe('A list of nearby hospitals that are open.'),
});
export type FindNearbyHospitalsOutput = z.infer<typeof FindNearbyHospitalsOutputSchema>;

// 📌 Haversine formula for distance
function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // 🌍 Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) *
      Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // km
}

// 🚀 Fetch hospitals using OpenStreetMap Overpass API
async function fetchHospitalsFromOSM(lat: number, lon: number) {
  const query = `
    [out:json];
    node["amenity"="hospital"](around:5000,${lat},${lon});
    out;
  `;

  const response = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    body: query,
  });

  const data = await response.json();

  // Map & calculate distance
  const hospitals = data.elements.map((h: any) => {
    const distance = haversineDistance(lat, lon, h.lat, h.lon).toFixed(2); // km
    return {
      name: h.tags?.name || 'Unknown Hospital',
      address: h.tags?.['addr:full'] || h.tags?.['addr:street'] || 'Address not available',
      isOpen: true, // assumed open
      distance: `${distance} km`,
    };
  });

  // Sort by distance (nearest first)
  hospitals.sort((a: any, b: any) => parseFloat(a.distance) - parseFloat(b.distance));

  // ✅ Return top 5 nearest hospitals
  return hospitals.slice(0, 5);
}

// 🏃 Flow
export async function findNearbyHospitals(
  input: FindNearbyHospitalsInput
): Promise<FindNearbyHospitalsOutput> {
  const hospitals = await fetchHospitalsFromOSM(input.latitude, input.longitude);
  return { hospitals };
}

// (Optional) Genkit flow definition for consistency
const findNearbyHospitalsFlow = ai.defineFlow(
  {
    name: 'findNearbyHospitalsFlow',
    inputSchema: FindNearbyHospitalsInputSchema,
    outputSchema: FindNearbyHospitalsOutputSchema,
  },
  async input => {
    const hospitals = await fetchHospitalsFromOSM(input.latitude, input.longitude);
    return { hospitals };
  }
);
