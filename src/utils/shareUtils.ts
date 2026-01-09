interface ShareConfig {
  text: string;
  url?: string;
  hashtags?: string[];
}

export function generateTwitterShareUrl(config: ShareConfig): string {
  const baseUrl = 'https://twitter.com/intent/tweet';
  const params = new URLSearchParams();

  const maxTextLength = config.url ? 230 : 280;
  const truncatedText = config.text.length > maxTextLength
    ? config.text.slice(0, maxTextLength - 3) + '...'
    : config.text;

  params.set('text', truncatedText);

  if (config.url) {
    params.set('url', config.url);
  }

  if (config.hashtags?.length) {
    params.set('hashtags', config.hashtags.join(','));
  }

  return `${baseUrl}?${params.toString()}`;
}

export function openTwitterShare(
  roastText: string,
  name?: string | null,
  linkedinUrl?: string | null,
  appUrl?: string
): void {
  // Build share text with name at top and LinkedIn URL
  let shareText = '';

  if (name) {
    shareText += `🔥 ${name} 🔥\n`;
    if (linkedinUrl) {
      shareText += `${linkedinUrl}\n`;
    }
    shareText += `\n"${roastText}"`;
  } else {
    shareText = `Just got roasted by AI:\n\n"${roastText}"`;
  }

  const shareUrl = generateTwitterShareUrl({
    text: shareText,
    hashtags: ['RoastMyLinkedIn'],
    url: appUrl,
  });

  window.open(
    shareUrl,
    'twitter-share',
    'width=550,height=450,menubar=no,toolbar=no'
  );
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export function formatShareText(roastText: string, name?: string | null, linkedinUrl?: string | null): string {
  let text = '';

  if (name) {
    text += `🔥 ${name} 🔥\n`;
    if (linkedinUrl) {
      text += `${linkedinUrl}\n`;
    }
    text += `\n"${roastText}"\n\n#RoastMyLinkedIn`;
  } else {
    text = `Just got roasted by AI:\n\n"${roastText}"\n\n#RoastMyLinkedIn`;
  }

  return text;
}
