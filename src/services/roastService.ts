import type { LinkedInProfile } from '../types/linkedin';

const API_URL = '/api/roast';

interface RoastResponse {
  roast?: string;
  name?: string;
  error?: string;
}

export interface RoastResult {
  roast: string;
  name?: string;
}

export async function generateRoast(options: {
  profile?: LinkedInProfile;
  bioText?: string;
}): Promise<RoastResult> {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(options),
  });

  const data: RoastResponse = await response.json();

  if (!response.ok || data.error) {
    throw new Error(data.error || `API Error (${response.status})`);
  }

  if (!data.roast) {
    throw new Error('No roast generated');
  }

  return {
    roast: data.roast,
    name: data.name,
  };
}
