import { $ } from 'bun';
import { config, validateConfig } from './config';
import { matchRoute } from './routes';

async function serveStaticFile(pathname: string): Promise<Response | null> {
  const filePath = pathname === '/' ? '/index.html' : pathname;
  const file = Bun.file(`./dist${filePath}`);

  if (await file.exists()) {
    return new Response(file);
  }

  return null;
}

async function serveSPAFallback(): Promise<Response> {
  const indexFile = Bun.file('./dist/index.html');

  if (await indexFile.exists()) {
    return new Response(indexFile);
  }

  return new Response('Not Found', { status: 404 });
}

async function startServer(): Promise<void> {
  validateConfig();

  // Build frontend in production mode
  if (!config.isDevelopment) {
    console.log('Building frontend...');
    await $`bun run build`;
  }

  console.log('Starting server...');
  console.log('AkashML API Key present:', !!config.akashML.apiKey);

  const server = Bun.serve({
    port: config.port,
    hostname: '0.0.0.0',
    async fetch(req) {
      const url = new URL(req.url);

      // Try API routes first
      const handler = matchRoute(url.pathname, req.method);
      if (handler) {
        return handler(req);
      }

      // Serve static files from dist
      const staticResponse = await serveStaticFile(url.pathname);
      if (staticResponse) {
        return staticResponse;
      }

      // SPA fallback
      return serveSPAFallback();
    },
  });

  console.log(`🔥 Server running at http://localhost:${server.port}`);
}

startServer().catch(console.error);
