import { $ } from 'bun'

const AKASH_API_BASE = 'https://chatapi.akash.network/api/v1'
const apiKey = process.env.VITE_AKASHML_API_KEY

// Build the frontend first
console.log('Building frontend...')
await $`bun run build`

console.log('Starting server...')

const server = Bun.serve({
  port: process.env.PORT || 3000,
  async fetch(req) {
    const url = new URL(req.url)

    // Handle API routes
    if (url.pathname === '/api/roast' && req.method === 'POST') {
      try {
        const { bioText } = await req.json()

        if (!bioText) {
          return Response.json({ error: 'bioText is required' }, { status: 400 })
        }

        if (!apiKey) {
          return Response.json({ error: 'API key not configured' }, { status: 500 })
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
                content: `You are a professional comedy roast writer specializing in LinkedIn profiles. Create brutally funny roasts under 280 characters. Be savage but clever - mock corporate jargon, not the person. Jump straight into the roast with no intro.`,
              },
              {
                role: 'user',
                content: `Roast this LinkedIn bio:\n\n${bioText}`,
              },
            ],
            temperature: 0.9,
            max_tokens: 300,
          }),
        })

        if (!response.ok) {
          const errorText = await response.text()
          return Response.json({ error: `API Error: ${errorText}` }, { status: response.status })
        }

        const data = await response.json() as { choices?: { message?: { content?: string } }[] }
        const roast = data.choices?.[0]?.message?.content?.trim()

        return Response.json({ roast })
      } catch (error) {
        console.error('Error:', error)
        return Response.json(
          { error: error instanceof Error ? error.message : 'Unknown error' },
          { status: 500 }
        )
      }
    }

    // Serve static files from dist
    let filePath = url.pathname === '/' ? '/index.html' : url.pathname
    const file = Bun.file(`./dist${filePath}`)

    if (await file.exists()) {
      return new Response(file)
    }

    // SPA fallback - serve index.html for all other routes
    const indexFile = Bun.file('./dist/index.html')
    if (await indexFile.exists()) {
      return new Response(indexFile)
    }

    return new Response('Not Found', { status: 404 })
  },
})

console.log(`🔥 Server running at http://localhost:${server.port}`)
