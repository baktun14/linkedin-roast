import { useState, useCallback } from 'react';
import { generateRoast, type RoastResult } from '../services/roastService';
import { parseLinkedInPDF } from '../services/linkedinService';
import type { LinkedInProfile } from '../types/linkedin';

interface UseRoastGeneratorReturn {
  roast: string | null;
  name: string | null;
  profile: LinkedInProfile | null;
  isLoading: boolean;
  isParsingPDF: boolean;
  error: string | null;
  generateFromPDF: (pdfFile: File) => Promise<void>;
  generateFromText: (text: string) => Promise<void>;
  reset: () => void;
}

export function useRoastGenerator(): UseRoastGeneratorReturn {
  const [roast, setRoast] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);
  const [profile, setProfile] = useState<LinkedInProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isParsingPDF, setIsParsingPDF] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateFromPDF = useCallback(async (pdfFile: File) => {
    setIsParsingPDF(true);
    setIsLoading(true);
    setError(null);
    setRoast(null);
    setName(null);
    setProfile(null);

    try {
      // First parse the PDF
      const parsedProfile = await parseLinkedInPDF(pdfFile);
      setProfile(parsedProfile);
      setIsParsingPDF(false);

      // Then generate the roast
      const result = await generateRoast({ profile: parsedProfile });
      setRoast(result.roast);
      setName(result.name || parsedProfile.name);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate roast');
    } finally {
      setIsLoading(false);
      setIsParsingPDF(false);
    }
  }, []);

  const generateFromText = useCallback(async (text: string) => {
    setIsLoading(true);
    setError(null);
    setRoast(null);
    setName(null);
    setProfile(null);

    try {
      const result = await generateRoast({ bioText: text });
      setRoast(result.roast);
      setName(result.name || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate roast');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setRoast(null);
    setName(null);
    setProfile(null);
    setError(null);
  }, []);

  return {
    roast,
    name,
    profile,
    isLoading,
    isParsingPDF,
    error,
    generateFromPDF,
    generateFromText,
    reset,
  };
}
