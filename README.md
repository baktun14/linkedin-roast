# 🔥 Roast My LinkedIn

**Upload your LinkedIn PDF. Get brutally roasted by AI. Share the pain.**

A fun web app that generates savage (but clever) roasts of LinkedIn profiles using AI. Upload your LinkedIn PDF or paste your profile text, and watch as AI tears apart your corporate jargon, buzzword bingo, and humble brags.

## Features

- **PDF Upload** - Download your LinkedIn profile as PDF and upload it directly
- **Text Paste** - Or just paste your profile text manually
- **AI-Powered Roasts** - Uses DeepSeek-V3 via AkashML for witty, personalized roasts
- **Smart Extraction** - AI extracts your name, headline, experience & skills from the PDF
- **One-Click Sharing** - Share your roast on X (Twitter) with your name and LinkedIn URL
- **Copy to Clipboard** - Easy copy for sharing anywhere

## Quick Start

### Prerequisites

- [Bun](https://bun.sh/) (v1.0+)
- [AkashML API Key](https://akashml.com)

### Run Locally

```bash
# Clone the repo
git clone https://github.com/akash-network/linkedin-roast.git
cd linkedin-roast

# Install dependencies
bun install

# Set up environment variables
cp .env.example .env
# Edit .env and add your AkashML API key

# Start development server (frontend only - fully client-side)
bun run dev:frontend
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

Create a `.env` file in the root directory:

```env
VITE_AKASHML_API_KEY=your-akashml-api-key-here
```

Get your API key at [akashml.com](https://akashml.com)

## Deploy on Akash

[![Deploy on Akash](https://img.shields.io/badge/Deploy%20on-Akash-red?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTIgMkwyIDdsMTAgNSAxMC01LTEwLTV6TTIgMTdsMTAgNSAxMC01TTIgMTJsMTAgNSAxMC01IiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiIGZpbGw9Im5vbmUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjwvc3ZnPg==)](https://console.akash.network)

### Option 1: Build and Deploy (Recommended)

The easiest way to deploy - works as a fully client-side static app:

1. Go to [Akash Console](https://console.akash.network)
2. Click **"Build and Deploy"**
3. Connect your GitHub repo
4. Set the environment variable: `VITE_AKASHML_API_KEY`
5. Deploy!

The app runs entirely in the browser - PDF parsing and AI calls happen client-side.

### Option 2: Docker Deployment

For more control, deploy using the Docker image:

1. Go to [Akash Console](https://console.akash.network)
2. Create a new deployment with **"Deploy with SDL"**
3. Use the SDL from `deploy.yaml` (update the image tag)
4. Set your `VITE_AKASHML_API_KEY` environment variable
5. Deploy!

## CI/CD

This project includes GitHub Actions for automated Docker builds.

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| **Build Docker Image** | Push to `master` | Builds and pushes to ghcr.io |
| **Deploy to Akash** | Manual | Creates/updates Akash deployment |

See [docs/CICD.md](docs/CICD.md) for detailed setup instructions.

## Tech Stack

- **Runtime**: [Bun](https://bun.sh/)
- **Frontend**: [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) + [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **AI**: [AkashML](https://akashml.com) (DeepSeek-V3)
- **PDF Parsing**: [pdf.js](https://mozilla.github.io/pdf.js/) (client-side)
- **Deployment**: [Akash Network](https://akash.network)

## How It Works

1. **Upload PDF**: User uploads their LinkedIn PDF (Profile → More → Save to PDF)
2. **Extract Text**: pdf.js extracts text from the PDF in the browser
3. **AI Extraction**: AkashML/DeepSeek extracts structured profile data (name, headline, experience, skills)
4. **Generate Roast**: AI creates a personalized, savage roast under 280 characters
5. **Share**: User can share on X or copy the roast

## Project Structure

```
linkedin-roast/
├── .github/
│   └── workflows/
│       ├── build-image.yml       # Docker build (auto on push to master)
│       └── deploy-akash.yml      # Akash deploy (manual)
├── docs/
│   └── CICD.md                   # CI/CD documentation
├── server/                       # Backend server (for Docker deployment)
│   ├── index.ts                  # Server entry point
│   ├── config.ts                 # Configuration
│   ├── types.ts                  # TypeScript types
│   ├── routes/                   # API route handlers
│   └── services/                 # Business logic
├── src/                          # Frontend React app
│   ├── components/               # React components
│   ├── hooks/                    # React hooks
│   ├── services/                 # API clients (client-side)
│   ├── utils/                    # Utility functions
│   ├── types/                    # TypeScript types
│   ├── App.tsx
│   └── main.tsx
├── Dockerfile                    # Multi-stage Docker build
├── deploy.yaml                   # Akash SDL deployment file
├── vite.config.ts                # Vite configuration
└── package.json
```

## Scripts

| Script | Description |
|--------|-------------|
| `bun run dev:frontend` | Start Vite dev server (client-side only) |
| `bun run dev` | Start frontend + backend for development |
| `bun run build` | Build for production |
| `bun run start` | Start production server (Docker deployment) |

## Links

- **AkashML**: [akashml.com](https://akashml.com) - Get your API key here
- **Akash Network**: [akash.network](https://akash.network) - Decentralized cloud
- **Akash Console**: [console.akash.network](https://console.akash.network) - Deploy your apps

## License

MIT

---

**Built with 🔥 on [Akash Network](https://akash.network) | Powered by [AkashML](https://akashml.com)**
