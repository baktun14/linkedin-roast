const AKASH_API_BASE = 'https://chatapi.akash.network/api/v1';

const server = Bun.serve({
  port: 4321,
  async fetch(req) {
    const url = new URL(req.url);

    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    // API endpoint for generating roasts
    if (url.pathname === '/api/roast' && req.method === 'POST') {
      try {
        const body = await req.json();
        const { bioText } = body;

        if (!bioText || typeof bioText !== 'string') {
          return Response.json(
            { error: 'bioText is required' },
            { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } }
          );
        }

        const apiKey = process.env.VITE_AKASHML_API_KEY;
        if (!apiKey) {
          return Response.json(
            { error: 'API key not configured' },
            { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } }
          );
        }

        const response = await fetch(`${AKASH_API_BASE}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: 'Meta-Llama-3-1-8B-Instruct-FP8',
            messages: [
              {
                role: 'system',
                content: `You are a professional comedy roast writer specializing in LinkedIn profiles. Your job is to create brutally funny, clever roasts that poke fun at corporate jargon, inflated titles, buzzword-heavy descriptions, and the general absurdity of professional self-promotion on LinkedIn.

STYLE GUIDELINES:
- Be savage but not mean-spirited (punch up at corporate culture, not down at the person)
- Reference specific details from their bio to make it personal
- Mock buzzwords like "synergy," "thought leader," "passionate," "ninja," "rockstar"
- Call out humble-brags and virtue signaling
- Poke fun at vague accomplishments and inflated job titles
- Keep it under 280 characters so it fits in a tweet (this is CRITICAL!)
- Use witty observations, not crude insults
- Channel the energy of a Comedy Central Roast

TONE:
- Playfully brutal, like a roast between friends
- Self-aware about LinkedIn culture
- Clever wordplay over cheap shots
- The person should laugh at themselves, not feel attacked

FORMAT:
- One punchy paragraph
- No introduction or explanation
- Jump straight into the roast
- End with a mic-drop line if possible
- MUST be under 280 characters

Remember: The goal is to make them laugh while cringing at their own LinkedIn presence.`,
              },
              {
                role: 'user',
                content: `Here's the LinkedIn bio to roast:\n\n${bioText}`,
              },
            ],
            temperature: 0.9,
            max_tokens: 300,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          return Response.json(
            { error: `API Error: ${response.status} - ${errorText}` },
            { status: response.status, headers: { 'Access-Control-Allow-Origin': '*' } }
          );
        }

        const data = await response.json();
        const roast = data.choices?.[0]?.message?.content?.trim();

        if (!roast) {
          return Response.json(
            { error: 'No response generated' },
            { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } }
          );
        }

        return Response.json(
          { roast },
          { headers: { 'Access-Control-Allow-Origin': '*' } }
        );
      } catch (error) {
        console.error('Error:', error);
        return Response.json(
          { error: error instanceof Error ? error.message : 'Unknown error' },
          { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } }
        );
      }
    }

    // 404 for other routes
    return new Response('Not Found', { status: 404 });
  },
});

console.log(`🔥 Roast API server running at http://localhost:${server.port}`);
