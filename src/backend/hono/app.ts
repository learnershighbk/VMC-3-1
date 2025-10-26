import { Hono } from 'hono';
import { errorBoundary } from '@/backend/middleware/error';
import { withAppContext } from '@/backend/middleware/context';
import { withSupabase } from '@/backend/middleware/supabase';
import { registerExampleRoutes } from '@/features/example/backend/route';
import { registerNaverProxyRoutes } from '@/features/naver-proxy/backend/route';
import { registerPlacesRoutes } from '@/features/places/backend/route';
import { registerReviewsRoutes } from '@/features/reviews/backend/route';
import type { AppEnv } from '@/backend/hono/context';

let singletonApp: Hono<AppEnv> | null = null;

export const createHonoApp = () => {
  // 개발 환경에서는 항상 새 인스턴스 생성
  if (process.env.NODE_ENV === 'development') {
    singletonApp = null;
  }

  if (singletonApp) {
    return singletonApp;
  }

  const app = new Hono<AppEnv>();

  app.use('*', errorBoundary());
  app.use('*', withAppContext());
  app.use('*', withSupabase());

  // 디버깅: 모든 요청 로깅
  app.use('*', async (c, next) => {
    console.log('[Hono] Incoming request:', c.req.method, c.req.url, 'path:', c.req.path);
    await next();
    console.log('[Hono] Response status:', c.res.status);
  });

  registerExampleRoutes(app);
  registerNaverProxyRoutes(app);
  registerPlacesRoutes(app);
  registerReviewsRoutes(app);

  console.log('[Hono] App created with basePath: /api');
  console.log('[Hono] Routes registered');

  singletonApp = app;

  return app;
};
