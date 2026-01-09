import type { LinkedInProfile } from '../types/linkedin';

const API_URL = import.meta.env.DEV
  ? 'http://localhost:8787/api/parse-pdf'
  : '/api/parse-pdf';

interface LinkedInResponse {
  profile?: LinkedInProfile;
  error?: string;
}

export async function parseLinkedInPDF(pdfFile: File): Promise<LinkedInProfile> {
  const formData = new FormData();
  formData.append('pdf', pdfFile);

  const response = await fetch(API_URL, {
    method: 'POST',
    body: formData,
  });

  const data: LinkedInResponse = await response.json();

  if (!response.ok || data.error) {
    throw new Error(data.error || `Failed to parse PDF (${response.status})`);
  }

  if (!data.profile) {
    throw new Error('No profile data extracted from PDF');
  }

  return data.profile;
}
