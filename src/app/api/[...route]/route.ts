import { createHonoApp } from '@/backend/hono/app';

const app = createHonoApp();

export const runtime = 'nodejs';

const handler = async (req: Request) => {
  console.log('[Route Handler] Received request:', req.method, req.url);
  const response = await app.fetch(req);
  console.log('[Route Handler] Response status:', response.status);
  return response;
};

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
export const OPTIONS = handler;
