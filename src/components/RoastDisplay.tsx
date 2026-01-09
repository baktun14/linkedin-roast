import { ShareButtons } from './ShareButtons';
import type { LinkedInProfile } from '../types/linkedin';

interface RoastDisplayProps {
  roast: string | null;
  name: string | null;
  profile: LinkedInProfile | null;
  isLoading: boolean;
  isParsingPDF: boolean;
  error: string | null;
  onRoastAgain: () => void;
}

const LOADING_MESSAGES = [
  "Scanning for buzzwords...",
  "Calibrating savagery levels...",
  "Analyzing corporate cringe...",
  "Warming up the roast pit...",
  "Finding inflated job titles...",
];

const PARSING_MESSAGES = [
  "Reading your profile...",
  "Extracting roast material...",
  "Analyzing your humble brags...",
];

export function RoastDisplay({ roast, name, profile, isLoading, isParsingPDF, error, onRoastAgain }: RoastDisplayProps) {
  if (isLoading) {
    const messages = isParsingPDF ? PARSING_MESSAGES : LOADING_MESSAGES;
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    return (
      <div className="w-full max-w-2xl mx-auto mt-8">
        <div className="bg-gray-900 border-2 border-gray-700 rounded-xl p-8 text-center">
          <div className="animate-pulse">
            <div className="text-6xl mb-4">🔥</div>
            <p className="text-xl text-flame-orange">{randomMessage}</p>
            {!isParsingPDF && profile && (
              <p className="mt-2 text-gray-400">Found: {profile.name}</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-2xl mx-auto mt-8">
        <div className="bg-red-950/50 border-2 border-red-800 rounded-xl p-8 text-center">
          <div className="text-4xl mb-4">😬</div>
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={onRoastAgain}
            className="px-6 py-2 bg-red-800 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!roast) {
    return null;
  }

  return (
    <div className="w-full max-w-2xl mx-auto mt-8">
      <div className="bg-gray-900 border-2 border-flame-orange rounded-xl p-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-flame-orange via-flame-red to-flame-yellow" />

        {/* Profile Info */}
        {name && (
          <div className="flex items-center gap-4 mb-6 pb-4 border-b border-gray-800">
            <div className="w-16 h-16 rounded-full border-2 border-flame-orange bg-gray-800 flex items-center justify-center text-2xl">
              🔥
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">{name}</h3>
              {profile?.headline && (
                <p className="text-sm text-gray-400 line-clamp-1">{profile.headline}</p>
              )}
            </div>
            <span className="ml-auto text-3xl">🔥</span>
          </div>
        )}

        {/* Roast Content */}
        <div className="flex items-start gap-4">
          {!name && <div className="text-4xl flex-shrink-0">🔥</div>}
          <div className="flex-1">
            <p className="text-xl text-white leading-relaxed italic">"{roast}"</p>
          </div>
        </div>

        <ShareButtons roastText={roast} name={name} linkedinUrl={profile?.linkedinUrl} onRoastAgain={onRoastAgain} />
      </div>
    </div>
  );
}
