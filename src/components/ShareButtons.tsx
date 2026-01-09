import { useState } from 'react';
import { openTwitterShare, copyToClipboard, formatShareText } from '../utils/shareUtils';

interface ShareButtonsProps {
  roastText: string;
  name: string | null;
  linkedinUrl?: string | null;
  onRoastAgain: () => void;
}

export function ShareButtons({ roastText, name, linkedinUrl, onRoastAgain }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const textToCopy = formatShareText(roastText, name, linkedinUrl);
    const success = await copyToClipboard(textToCopy);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShareToX = () => {
    openTwitterShare(roastText, name, linkedinUrl);
  };

  return (
    <div className="flex flex-wrap gap-3 justify-center mt-6">
      <button
        onClick={handleShareToX}
        className="flex items-center gap-2 px-5 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors border border-gray-700"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
        Share on X
      </button>

      <button
        onClick={handleCopy}
        className="flex items-center gap-2 px-5 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors border border-gray-600"
      >
        {copied ? (
          <>
            <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Copied!
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Copy
          </>
        )}
      </button>

      <button
        onClick={onRoastAgain}
        className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-flame-orange to-flame-red text-white rounded-lg hover:scale-105 transition-transform"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        Roast Again
      </button>
    </div>
  );
}
