import type { LinkedInProfile } from '../types/linkedin';

const AKASH_API_URL = 'https://api.akashml.com/v1/chat/completions';
const API_KEY = import.meta.env.VITE_AKASHML_API_KEY;

export interface RoastResult {
  roast: string;
  name?: string;
}

function generateRoastPrompt(profile?: LinkedInProfile, bioText?: string): string {
  if (profile) {
    const parts = [
      `Roast ${profile.name}'s LinkedIn profile.`,
      profile.headline && `Headline: "${profile.headline}"`,
      profile.about && `About: "${profile.about}"`,
      profile.experience.length && `Experience: ${profile.experience.join('; ')}`,
      profile.skills.length && `Skills they're proud of: ${profile.skills.join(', ')}`,
    ].filter(Boolean);

    return (
      parts.join('\n') +
      '\n\nCreate a brutal but clever roast under 280 characters. Start with their name for personalization. Mock the corporate jargon, not the person.'
    );
  }

  return `Roast this LinkedIn bio:\n\n${bioText}\n\nCreate a brutal but clever roast under 280 characters. Mock the corporate jargon, not the person.`;
}

export async function generateRoast(options: {
  profile?: LinkedInProfile;
  bioText?: string;
}): Promise<RoastResult> {
  const { profile, bioText } = options;

  if (!profile && !bioText) {
    throw new Error('Either profile or bioText is required');
  }

  if (!API_KEY) {
    throw new Error('API key not configured');
  }

  const prompt = generateRoastPrompt(profile, bioText);

  const response = await fetch(AKASH_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: 'deepseek-ai/DeepSeek-V3.2',
      messages: [
        {
          role: 'system',
          content: `You are a professional comedy roast writer specializing in LinkedIn profiles. Create brutally funny roasts under 280 characters. Be savage but clever - mock corporate jargon and LinkedIn culture, not the person themselves. If given a name, start the roast with their name for personalization.`,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.9,
      max_tokens: 300,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API Error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const roast = data.choices?.[0]?.message?.content?.trim();

  if (!roast) {
    throw new Error('No roast generated');
  }

  return {
    roast,
    name: profile?.name,
  };
}
