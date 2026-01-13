import { config } from '../config';
import type { LinkedInProfile, ChatCompletionResponse } from '../types';

async function callAkashML(
  systemPrompt: string,
  userPrompt: string,
  options: { temperature?: number; maxTokens?: number } = {}
): Promise<string> {
  const { temperature = 0.7, maxTokens = 1000 } = options;

  const response = await fetch(`${config.akashML.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.akashML.apiKey}`,
    },
    body: JSON.stringify({
      model: config.akashML.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature,
      max_tokens: maxTokens,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`AkashML API error: ${response.status} - ${errorText}`);
  }

  const data = (await response.json()) as ChatCompletionResponse;
  const content = data.choices?.[0]?.message?.content?.trim();

  if (!content) {
    throw new Error('No response from AI');
  }

  return content;
}

export async function extractProfileFromText(pdfText: string): Promise<LinkedInProfile> {
  const systemPrompt = `You are a data extraction assistant. Extract LinkedIn profile information from the provided PDF text and return it as valid JSON only, with no additional text or markdown formatting.

Return ONLY a JSON object with these fields:
{
  "name": "Full name of the person",
  "headline": "Their professional headline/title",
  "about": "Their summary/about section (first 300 chars)",
  "linkedinUrl": "Their LinkedIn URL if found (format: https://linkedin.com/in/username)",
  "experience": ["Job 1 title at Company", "Job 2 title at Company", "Job 3 title at Company"],
  "skills": ["Skill 1", "Skill 2", "Skill 3", "Skill 4", "Skill 5"]
}

Important:
- The name is usually a person's full name (like "John Smith" or "Anil Murty"), NOT a section header like "Contact" or "Summary"
- Look for the actual person's name in the document
- LinkedIn URL format should be https://linkedin.com/in/username
- Return ONLY the JSON, no markdown code blocks or explanations`;

  const userPrompt = `Extract the LinkedIn profile data from this PDF text:\n\n${pdfText.slice(0, 8000)}`;

  const content = await callAkashML(systemPrompt, userPrompt, {
    temperature: 0.1,
    maxTokens: 1000,
  });

  // Parse the JSON response, handling potential markdown code blocks
  let jsonStr = content;
  if (jsonStr.startsWith('```')) {
    jsonStr = jsonStr.replace(/```json?\n?/g, '').replace(/```\n?/g, '');
  }

  try {
    const profile = JSON.parse(jsonStr);
    return {
      name: profile.name || 'Unknown',
      headline: profile.headline || '',
      about: profile.about || '',
      linkedinUrl: profile.linkedinUrl,
      experience: Array.isArray(profile.experience) ? profile.experience.slice(0, 3) : [],
      education: Array.isArray(profile.education) ? profile.education.slice(0, 2) : [],
      skills: Array.isArray(profile.skills) ? profile.skills.slice(0, 5) : [],
    };
  } catch {
    console.error('Failed to parse AI response:', content);
    throw new Error('Failed to parse profile data');
  }
}

export async function generateRoast(profile?: LinkedInProfile, bioText?: string): Promise<string> {
  const systemPrompt = `You are a professional comedy roast writer specializing in LinkedIn profiles. Create brutally funny roasts under 280 characters. Be savage but clever - mock corporate jargon and LinkedIn culture, not the person themselves. If given a name, start the roast with their name for personalization.`;

  let userPrompt: string;

  if (profile) {
    const parts = [
      `Roast ${profile.name}'s LinkedIn profile.`,
      profile.headline && `Headline: "${profile.headline}"`,
      profile.about && `About: "${profile.about}"`,
      profile.experience.length && `Experience: ${profile.experience.join('; ')}`,
      profile.skills.length && `Skills they're proud of: ${profile.skills.join(', ')}`,
    ].filter(Boolean);

    userPrompt =
      parts.join('\n') +
      '\n\nCreate a brutal but clever roast under 280 characters. Start with their name for personalization. Mock the corporate jargon, not the person.';
  } else {
    userPrompt = `Roast this LinkedIn bio:\n\n${bioText}\n\nCreate a brutal but clever roast under 280 characters. Mock the corporate jargon, not the person.`;
  }

  return callAkashML(systemPrompt, userPrompt, {
    temperature: 0.9,
    maxTokens: 300,
  });
}
