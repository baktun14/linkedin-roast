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

    return parts.join('\n');
  }

  return `Roast this LinkedIn bio:\n\n${bioText}`;
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
          content: `You write brutal LinkedIn roasts. Rules:
1. Aim for 200-240 characters (for Twitter, max 280) - THIS IS THE MOST IMPORTANT RULE
2. NO intro like "Here's a roast" - just the roast itself
3. Write in 3rd person using their name (never "you" or "this guy")
4. Mock corporate jargon, buzzwords, inflated titles
5. Be savage but clever, like a Comedy Central roast
6. One punchy line or two, end with a mic-drop

Output ONLY the roast text, nothing else.`,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.8,
      max_tokens: 100,
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
