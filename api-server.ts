const pdf = require('pdf-parse')

interface LinkedInProfile {
  name: string;
  headline: string;
  about: string;
  profilePicture?: string;
  linkedinUrl?: string;
  experience: string[];
  education: string[];
  skills: string[];
}

const AKASH_API_BASE = 'https://api.akashml.com/v1'

const akashApiKey = process.env.VITE_AKASHML_API_KEY

console.log('AkashML API Key present:', !!akashApiKey)

// Use AkashML to extract profile data from PDF text
async function extractProfileWithAI(pdfText: string): Promise<LinkedInProfile> {
  const response = await fetch(`${AKASH_API_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${akashApiKey}`,
    },
    body: JSON.stringify({
      model: 'deepseek-ai/DeepSeek-V3.2',
      messages: [
        {
          role: 'system',
          content: `You are a data extraction assistant. Extract LinkedIn profile information from the provided PDF text and return it as valid JSON only, with no additional text or markdown formatting.

Return ONLY a JSON object with these fields:
{
  "name": "Full name of the person",
  "headline": "Their professional headline/title",
  "about": "Their summary/about section (first 300 chars)",
  "linkedinUrl": "Their LinkedIn URL if found (format: https://linkedin.com/in/username)",
  "experience": ["Job 1 title at Company", "Job 2 title at Company", "Job 3 title at Company"],
  "skills": ["Skill 1", "Skill 2", "Skill 3", "Skill 4", "Skill 5"]
}

Important:
- The name is usually a person's full name (like "John Smith" or "Anil Murty"), NOT a section header like "Contact" or "Summary"
- Look for the actual person's name in the document
- LinkedIn URL format should be https://linkedin.com/in/username
- Return ONLY the JSON, no markdown code blocks or explanations`,
        },
        {
          role: 'user',
          content: `Extract the LinkedIn profile data from this PDF text:\n\n${pdfText.slice(0, 8000)}`,
        },
      ],
      temperature: 0.1,
      max_tokens: 1000,
    }),
  })

  if (!response.ok) {
    throw new Error(`AI extraction failed: ${response.status}`)
  }

  const data = await response.json() as { choices?: { message?: { content?: string } }[] }
  const content = data.choices?.[0]?.message?.content?.trim()

  if (!content) {
    throw new Error('No response from AI')
  }

  // Parse the JSON response, handling potential markdown code blocks
  let jsonStr = content
  if (jsonStr.startsWith('```')) {
    jsonStr = jsonStr.replace(/```json?\n?/g, '').replace(/```\n?/g, '')
  }

  try {
    const profile = JSON.parse(jsonStr)
    return {
      name: profile.name || 'Unknown',
      headline: profile.headline || '',
      about: profile.about || '',
      linkedinUrl: profile.linkedinUrl,
      experience: Array.isArray(profile.experience) ? profile.experience.slice(0, 3) : [],
      education: Array.isArray(profile.education) ? profile.education.slice(0, 2) : [],
      skills: Array.isArray(profile.skills) ? profile.skills.slice(0, 5) : [],
    }
  } catch (e) {
    console.error('Failed to parse AI response:', content)
    throw new Error('Failed to parse profile data')
  }
}

function generateRoastPrompt(profile?: LinkedInProfile, bioText?: string): string {
  if (profile) {
    const parts = [
      `Roast ${profile.name}'s LinkedIn profile.`,
      profile.headline && `Headline: "${profile.headline}"`,
      profile.about && `About: "${profile.about}"`,
      profile.experience.length && `Experience: ${profile.experience.join('; ')}`,
      profile.skills.length && `Skills they're proud of: ${profile.skills.join(', ')}`,
    ].filter(Boolean)

    return parts.join('\n') + '\n\nCreate a brutal but clever roast under 280 characters. Start with their name for personalization. Mock the corporate jargon, not the person.'
  }

  return `Roast this LinkedIn bio:\n\n${bioText}\n\nCreate a brutal but clever roast under 280 characters. Mock the corporate jargon, not the person.`
}

const server = Bun.serve({
  port: 8787,
  async fetch(req) {
    const url = new URL(req.url)

    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }

    if (req.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders })
    }

    // PDF parsing endpoint
    if (url.pathname === '/api/parse-pdf' && req.method === 'POST') {
      try {
        const formData = await req.formData()
        const pdfFile = formData.get('pdf') as File | null

        if (!pdfFile) {
          return Response.json({ error: 'PDF file is required' }, {
            status: 400,
            headers: corsHeaders
          })
        }

        if (!akashApiKey) {
          return Response.json({ error: 'API key not configured' }, {
            status: 500,
            headers: corsHeaders
          })
        }

        console.log('Parsing PDF:', pdfFile.name, pdfFile.size, 'bytes')

        const arrayBuffer = await pdfFile.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        const pdfData = await pdf(buffer)
        console.log('PDF text extracted, length:', pdfData.text.length)

        // Use AI to extract profile data
        const profile = await extractProfileWithAI(pdfData.text)
        console.log('Profile extracted:', profile.name)

        return Response.json({ profile }, { headers: corsHeaders })
      } catch (error) {
        console.error('PDF parsing error:', error)
        return Response.json(
          { error: error instanceof Error ? error.message : 'Failed to parse PDF' },
          { status: 500, headers: corsHeaders }
        )
      }
    }

    // Roast generation endpoint
    if (url.pathname === '/api/roast' && req.method === 'POST') {
      try {
        const { profile, bioText } = await req.json() as { profile?: LinkedInProfile; bioText?: string }

        if (!profile && !bioText) {
          return Response.json({ error: 'Either profile or bioText is required' }, {
            status: 400,
            headers: corsHeaders
          })
        }

        if (!akashApiKey) {
          return Response.json({ error: 'API key not configured' }, {
            status: 500,
            headers: corsHeaders
          })
        }

        const prompt = generateRoastPrompt(profile, bioText)
        console.log('Generating roast for:', profile?.name || 'bio text')

        const response = await fetch(`${AKASH_API_BASE}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${akashApiKey}`,
          },
          body: JSON.stringify({
            model: 'deepseek-ai/DeepSeek-V3.2',
            messages: [
              {
                role: 'system',
                content: `You are a professional comedy roast writer specializing in LinkedIn profiles. Create brutally funny roasts under 280 characters. Be savage but clever - mock corporate jargon and LinkedIn culture, not the person themselves. If given a name, start the roast with their name for personalization.`,
              },
              {
                role: 'user',
                content: prompt,
              },
            ],
            temperature: 0.9,
            max_tokens: 300,
          }),
        })

        console.log('AkashML response status:', response.status)

        if (!response.ok) {
          const errorText = await response.text()
          console.log('Error response:', errorText)
          return Response.json({ error: `API Error: ${errorText}` }, {
            status: response.status,
            headers: corsHeaders
          })
        }

        const data = await response.json() as { choices?: { message?: { content?: string } }[] }
        const roast = data.choices?.[0]?.message?.content?.trim()

        console.log('Roast generated:', roast)

        return Response.json({
          roast,
          name: profile?.name
        }, { headers: corsHeaders })
      } catch (error) {
        console.error('Error:', error)
        return Response.json(
          { error: error instanceof Error ? error.message : 'Unknown error' },
          { status: 500, headers: corsHeaders }
        )
      }
    }

    return new Response('Not Found', { status: 404, headers: corsHeaders })
  },
})

console.log(`🔥 API server running at http://localhost:${server.port}`)
