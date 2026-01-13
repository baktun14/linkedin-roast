import { handleParsePDF } from './pdf';
import { handleGenerateRoast } from './roast';

type RouteHandler = (req: Request) => Promise<Response>;

interface Route {
  method: string;
  handler: RouteHandler;
}

const routes: Record<string, Route> = {
  '/api/parse-pdf': {
    method: 'POST',
    handler: handleParsePDF,
  },
  '/api/roast': {
    method: 'POST',
    handler: handleGenerateRoast,
  },
};

export function matchRoute(pathname: string, method: string): RouteHandler | null {
  const route = routes[pathname];

  if (route && route.method === method) {
    return route.handler;
  }

  return null;
}
