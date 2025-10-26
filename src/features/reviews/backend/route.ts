import type { Hono } from 'hono';
import { respond, failure } from '@/backend/http/response';
import { getSupabase, type AppEnv } from '@/backend/hono/context';
import {
  CreateReviewRequestSchema,
  GetReviewsQuerySchema,
} from './schema';
import {
  createReview,
  getReviewsByNaverPlaceId,
  deleteReview,
} from './service';

export const registerReviewsRoutes = (app: Hono<AppEnv>) => {
  // 리뷰 생성
  app.post('/api/reviews', async (c) => {
    const body = await c.req.json();
    const bodyParse = CreateReviewRequestSchema.safeParse(body);

    if (!bodyParse.success) {
      return respond(
        c,
        failure(
          400,
          'INVALID_REVIEW_REQUEST',
          'Invalid review request body',
          bodyParse.error.format(),
        ),
      );
    }

    const supabase = getSupabase(c);
    const result = await createReview(supabase, bodyParse.data);
    return respond(c, result);
  });

  // 특정 맛집의 리뷰 목록 조회
  app.get('/api/reviews', async (c) => {
    const queryParse = GetReviewsQuerySchema.safeParse({
      placeId: c.req.query('placeId'),
      naverPlaceId: c.req.query('naverPlaceId'),
    });

    if (!queryParse.success) {
      return respond(
        c,
        failure(
          400,
          'INVALID_QUERY_PARAMS',
          'Invalid query parameters',
          queryParse.error.format(),
        ),
      );
    }

    const { naverPlaceId } = queryParse.data;

    if (!naverPlaceId) {
      return respond(
        c,
        failure(
          400,
          'MISSING_NAVER_PLACE_ID',
          'naverPlaceId query parameter is required',
        ),
      );
    }

    const supabase = getSupabase(c);
    const result = await getReviewsByNaverPlaceId(supabase, naverPlaceId);
    return respond(c, result);
  });

  // 리뷰 삭제
  app.delete('/api/reviews/:id', async (c) => {
    const reviewId = c.req.param('id');

    if (!reviewId) {
      return respond(
        c,
        failure(400, 'MISSING_REVIEW_ID', 'Review ID is required'),
      );
    }

    const body = await c.req.json();
    const password = body?.password;

    if (!password || typeof password !== 'string') {
      return respond(
        c,
        failure(400, 'MISSING_PASSWORD', 'Password is required'),
      );
    }

    const supabase = getSupabase(c);
    const result = await deleteReview(supabase, reviewId, password);
    return respond(c, result);
  });
};
