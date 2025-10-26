import type { Hono } from 'hono';
import { respond } from '@/backend/http/response';
import { getSupabase, type AppEnv } from '@/backend/hono/context';
import { getPlacesWithReviews } from './service';

export const registerPlacesRoutes = (app: Hono<AppEnv>) => {
  // 리뷰가 있는 맛집 목록 조회
  app.get('/api/places/with-reviews', async (c) => {
    const supabase = getSupabase(c);
    const result = await getPlacesWithReviews(supabase);
    return respond(c, result);
  });
};
