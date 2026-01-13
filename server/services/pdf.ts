import type { LinkedInProfile } from '../types';
import { extractProfileFromText } from './ai';

const pdf = require('pdf-parse');

export async function parseLinkedInPDF(file: File): Promise<LinkedInProfile> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const pdfData = await pdf(buffer);
  console.log('PDF text extracted, length:', pdfData.text.length);

  const profile = await extractProfileFromText(pdfData.text);
  console.log('Profile extracted:', profile.name);

  return profile;
}
