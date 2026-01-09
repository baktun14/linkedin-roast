import { createServer } from 'vite'

const AKASH_API_BASE = 'https://chatapi.akash.network/api/v1'
const apiKey = process.env.VITE_AKASHML_API_KEY

async function startServer() {
  const vite = await createServer({
    server: { middlewareMode: true },
    appType: 'spa',
  })

  const server = Bun.serve({
    port: 5173,
    async fetch(req) {
      const url = new URL(req.url)

      // Handle API routes first
      if (url.pathname === '/api/roast' && req.method === 'POST') {
        try {
          const { bioText } = await req.json()

          if (!bioText) {
            return Response.json({ error: 'bioText is required' }, { status: 400 })
          }

          if (!apiKey) {
            return Response.json({ error: 'API key not configured' }, { status: 500 })
          }

          console.log('Making request to AkashML...')

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

      // Pass other requests to Vite
      return new Promise((resolve) => {
        const nodeReq = {
          url: url.pathname + url.search,
          method: req.method,
          headers: Object.fromEntries(req.headers.entries()),
        }

        const chunks: Uint8Array[] = []
        const nodeRes = {
          statusCode: 200,
          headers: {} as Record<string, string>,
          setHeader(name: string, value: string) {
            this.headers[name] = value
          },
          getHeader(name: string) {
            return this.headers[name]
          },
          end(data?: string | Buffer) {
            if (data) chunks.push(typeof data === 'string' ? new TextEncoder().encode(data) : new Uint8Array(data))
            const body = chunks.length ? new Blob(chunks as BlobPart[]) : null
            resolve(new Response(body, {
              status: this.statusCode,
              headers: this.headers,
            }))
          },
          write(data: string | Buffer) {
            chunks.push(typeof data === 'string' ? new TextEncoder().encode(data) : new Uint8Array(data))
          },
        }

        vite.middlewares(nodeReq as any, nodeRes as any, () => {
          resolve(new Response('Not Found', { status: 404 }))
        })
      })
    },
  })

  console.log(`🔥 Dev server running at http://localhost:${server.port}`)
}

startServer().catch(console.error)
