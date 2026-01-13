# CI/CD with GitHub Actions and Akash Network

This project includes GitHub Actions workflows for automated Docker builds and optional Akash Network deployments.

## Overview

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| **Build Docker Image** | Push to `master`, PRs | Builds and pushes Docker image to ghcr.io |
| **Deploy to Akash** | Manual only | Creates or updates Akash deployment |

> **Note**: Akash Console's "Build and Deploy" feature already auto-deploys React apps on code changes. The manual deploy workflow is provided as an example for teams that want explicit CI/CD control.

---

## Quick Start

### 1. Fork or Clone the Repository

```bash
git clone https://github.com/akash-network/linkedin-roast.git
cd linkedin-roast
```

### 2. Set Up GitHub Secrets

Go to your repository → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

| Secret | Required | Description |
|--------|----------|-------------|
| `AKASH_CONSOLE_API_KEY` | For deploy | Get from [console.akash.network](https://console.akash.network) → Settings → API Keys |
| `VITE_AKASHML_API_KEY` | For deploy | Get from [akashml.com](https://akashml.com) |
| `AKASH_DSEQ` | After first deploy | Deployment sequence ID (output by workflow) |

### 3. Push to Main

The Docker build runs automatically on every push to `master`:

```bash
git push origin master
```

Check the **Actions** tab to see the build progress.

### 4. (Optional) Manual Akash Deployment

1. Go to **Actions** → **Deploy to Akash**
2. Click **Run workflow**
3. The workflow will:
   - Build the Docker image
   - Create a new Akash deployment (or update existing)
   - Wait for provider bids
   - Accept the best bid and create a lease

---

## Workflows in Detail

### Build Docker Image (`.github/workflows/build-image.yml`)

**Triggers:**
- Push to `master` branch
- Pull requests to `master`
- Called by other workflows

**What it does:**
1. Checks out the code
2. Sets up Docker Buildx
3. Logs in to GitHub Container Registry
4. Builds the Docker image using multi-stage build
5. Pushes to `ghcr.io/<owner>/linkedin-roast`

**Image tags:**
- `sha-<commit>` - Every build (7-character SHA prefix)

**Example output:**
```
ghcr.io/akash-network/linkedin-roast:sha-abc1234
```

> **Note**: We don't use `latest` tag because Akash SDL requires explicit version tags for reliable deployments.

---

### Deploy to Akash (`.github/workflows/deploy-akash.yml`)

**Triggers:**
- Manual only (workflow_dispatch)

**Options:**
- `force_new_deployment` - Create new deployment even if DSEQ exists

**What it does:**

1. **Builds the Docker image** (calls build-image.yml)
2. **Prepares the SDL** - Updates `deploy.yaml` with the new image tag
3. **Checks for existing deployment** - Looks for `AKASH_DSEQ` secret
4. **Updates or creates deployment:**
   - If DSEQ exists → Updates existing deployment
   - If no DSEQ → Creates new deployment, waits for bids, creates lease
5. **Outputs DSEQ** - For first deployment, outputs the DSEQ to add as a secret

---

## Akash Console API

The deploy workflow uses the [Akash Console Managed Wallet API](https://akash.network/docs/api-documentation/console-api/).

**Base URL:** `https://console-api.akash.network`

**Endpoints used:**

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/v1/deployments` | Create new deployment |
| PUT | `/v1/deployments/{dseq}` | Update existing deployment |
| GET | `/v1/bids?dseq={dseq}` | Get provider bids |
| POST | `/v1/leases` | Accept bid and create lease |

---

## Files

| File | Purpose |
|------|---------|
| `Dockerfile` | Multi-stage build for Bun + React app |
| `.dockerignore` | Excludes dev files from Docker build |
| `.github/workflows/build-image.yml` | Docker build workflow |
| `.github/workflows/deploy-akash.yml` | Akash deploy workflow |
| `deploy.yaml` | Akash SDL (deployment specification) |

---

## Local Testing

### Build Docker Image Locally

```bash
docker build -t linkedin-roast .
```

### Run Docker Container

```bash
docker run -p 3000:3000 -e VITE_AKASHML_API_KEY=your-key linkedin-roast
```

Open [http://localhost:3000](http://localhost:3000)

---

## Troubleshooting

### Docker build fails

1. Check that `bun.lock` exists (run `bun install` locally first)
2. Ensure all required files are not in `.dockerignore`

### No bids received

1. Check that your API key is valid
2. Ensure you have sufficient credits in your Akash Console account
3. Try increasing the pricing in `deploy.yaml`

### Deployment update fails

1. Verify `AKASH_DSEQ` secret is set correctly
2. Check that the deployment is still active in Akash Console
3. Try forcing a new deployment with the `force_new_deployment` option

### Image pull fails

1. Ensure the repository is public (or configure image pull secrets)
2. Check that the image tag exists in ghcr.io

---

## Cost Considerations

- **Docker builds**: Free for public repositories on GitHub Actions
- **Container registry**: Free for public packages on ghcr.io
- **Akash deployment**: Requires AKT tokens for compute costs

Minimum deposit for new deployments: $5 USD

---

## Resources

- [Akash Console API Documentation](https://akash.network/docs/api-documentation/console-api/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Docker Build Push Action](https://github.com/docker/build-push-action)
- [Akash SDL Reference](https://akash.network/docs/getting-started/stack-definition-language/)
