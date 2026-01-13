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
          content: `You are a professional comedy roast writer specializing in LinkedIn profiles. Your job is to create brutally funny, clever roasts that poke fun at corporate jargon, inflated titles, buzzword-heavy descriptions, and the general absurdity of professional self-promotion on LinkedIn.

STYLE GUIDELINES:
- Be savage but not mean-spirited (punch up at corporate culture, not down at the person)
- Reference specific details from their profile to make it personal
- Mock buzzwords like "synergy," "thought leader," "passionate," "ninja," "rockstar"
- Call out humble-brags and virtue signaling
- Poke fun at vague accomplishments and inflated job titles
- Keep it under 280 characters so it fits in a tweet (CRITICAL!)
- Use witty observations, not crude insults
- Channel the energy of a Comedy Central Roast

TONE:
- Playfully brutal, like a roast between friends
- Self-aware about LinkedIn culture
- Clever wordplay over cheap shots
- The person should laugh at themselves, not feel attacked

FORMAT:
- One punchy paragraph, no introduction or explanation
- If given a name, start with their name for personalization
- End with a mic-drop line if possible
- MUST be under 280 characters`,
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
