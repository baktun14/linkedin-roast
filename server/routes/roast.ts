import { config } from '../config';
import { generateRoast } from '../services/ai';
import type { RoastRequest } from '../types';

export async function handleGenerateRoast(req: Request): Promise<Response> {
  try {
    const { profile, bioText } = (await req.json()) as RoastRequest;

    if (!profile && !bioText) {
      return Response.json({ error: 'Either profile or bioText is required' }, { status: 400 });
    }

    if (!config.akashML.apiKey) {
      return Response.json({ error: 'API key not configured' }, { status: 500 });
    }

    console.log('Generating roast for:', profile?.name || 'bio text');

    const roast = await generateRoast(profile, bioText);

    console.log('Roast generated:', roast);

    return Response.json({
      roast,
      name: profile?.name,
    });
  } catch (error) {
    console.error('Roast generation error:', error);
    return Response.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
