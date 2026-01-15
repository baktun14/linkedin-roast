# 🔥 Roast My LinkedIn

**Upload your LinkedIn PDF. Get brutally roasted by AI. Share the pain.**

A web app that generates savage (but clever) roasts of LinkedIn profiles using AI. Upload your LinkedIn PDF or paste your profile text, and watch as AI tears apart your corporate jargon, buzzword bingo, and humble brags.

## Features

- **PDF Upload** - Download your LinkedIn profile as PDF and upload it directly
- **Text Paste** - Or just paste your profile text manually
- **AI-Powered Roasts** - Uses DeepSeek-V3 via AkashML for witty, personalized roasts
- **Smart Extraction** - AI extracts your name, headline, experience & skills from the PDF
- **One-Click Sharing** - Share your roast on X (Twitter)
- **Copy to Clipboard** - Easy copy for sharing anywhere

## Deploy on Akash

[![Deploy on Akash](https://raw.githubusercontent.com/akash-network/console/refs/heads/main/apps/deploy-web/public/images/deploy-with-akash-btn.svg)](https://console.akash.network/new-deployment?repoUrl=https%3A%2F%2Fgithub.com%2Fbaktun14%2Flinkedin-roast&branch=master)

1. Go to [Akash Console](https://console.akash.network)
2. Click **"Build and Deploy"**
3. Connect your GitHub repo
4. Set environment variable: `VITE_AKASHML_API_KEY`
5. Deploy!

The app runs entirely in the browser - no backend server required.

## Run Locally

```bash
# Clone and install
git clone https://github.com/baktun14/linkedin-roast.git
cd linkedin-roast
bun install

# Set up environment
cp .env.example .env
# Add your AkashML API key to .env

# Start dev server
bun run dev:frontend
```

Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

```env
VITE_AKASHML_API_KEY=your-api-key-here
```

Get your API key at [akashml.com](https://akashml.com)

> **⚠️ Security Notice**: The `VITE_` prefix means the API key is bundled into the frontend JavaScript and visible to users. This is fine for demos or if your key has usage limits, but for production apps with sensitive keys, consider using the Docker deployment option which keeps the key server-side.

## Tech Stack

- [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) + [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [AkashML](https://akashml.com) (DeepSeek-V3)
- [pdf.js](https://mozilla.github.io/pdf.js/) for client-side PDF parsing
- [Akash Network](https://akash.network) for deployment

## How It Works

1. Upload your LinkedIn PDF (Profile → More → Save to PDF)
2. pdf.js extracts text from the PDF in your browser
3. AkashML extracts structured profile data (name, headline, experience, skills)
4. AI generates a personalized roast under 280 characters
5. Share on X or copy to clipboard

## Project Structure

```
├── src/
│   ├── components/       # React components
│   ├── services/         # API clients (AkashML, PDF parsing)
│   ├── hooks/            # React hooks
│   └── types/            # TypeScript types
├── server/               # Optional backend (for Docker deployment)
├── Dockerfile            # Docker build
└── deploy.yaml           # Akash SDL
```

## License

MIT

---

**Built with 🔥 on [Akash Network](https://akash.network) | Powered by [AkashML](https://akashml.com)**
