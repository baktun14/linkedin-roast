import * as pdfjsLib from 'pdfjs-dist';
import type { LinkedInProfile } from '../types/linkedin';

// Set the worker source for pdf.js - use unpkg which works better with Vite
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

const AKASH_API_URL = 'https://api.akashml.com/v1/chat/completions';
const API_KEY = import.meta.env.VITE_AKASHML_API_KEY;

async function extractTextFromPDF(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  let fullText = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item) => ('str' in item ? item.str : ''))
      .join(' ');
    fullText += pageText + '\n';
  }

  return fullText;
}

async function extractProfileWithAI(pdfText: string): Promise<LinkedInProfile> {
  if (!API_KEY) {
    throw new Error('API key not configured');
  }

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
          content: `You are a data extraction assistant. Extract LinkedIn profile information from the provided PDF text and return it as valid JSON only, with no additional text or markdown formatting.

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
- Return ONLY the JSON, no markdown code blocks or explanations`,
        },
        {
          role: 'user',
          content: `Extract the LinkedIn profile data from this PDF text:\n\n${pdfText.slice(0, 8000)}`,
        },
      ],
      temperature: 0.1,
      max_tokens: 1000,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`AI extraction failed: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content?.trim();

  if (!content) {
    throw new Error('No response from AI');
  }

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

export async function parseLinkedInPDF(pdfFile: File): Promise<LinkedInProfile> {
  // Extract text from PDF using pdf.js
  const pdfText = await extractTextFromPDF(pdfFile);
  console.log('PDF text extracted, length:', pdfText.length);

  // Use AI to extract structured profile data
  const profile = await extractProfileWithAI(pdfText);
  console.log('Profile extracted:', profile.name);

  return profile;
}
