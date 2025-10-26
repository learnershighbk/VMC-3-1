import type { Hono } from 'hono';
import { respond, failure } from '@/backend/http/response';
import { getConfig, type AppEnv } from '@/backend/hono/context';
import { SearchQuerySchema } from './schema';
import { searchPlaces } from './service';

export const registerNaverProxyRoutes = (app: Hono<AppEnv>) => {
  app.get('/api/naver/search/local', async (c) => {
    const queryParse = SearchQuerySchema.safeParse({
      query: c.req.query('query'),
      display: c.req.query('display'),
    });

    if (!queryParse.success) {
      return respond(
        c,
        failure(
          400,
          'INVALID_SEARCH_QUERY',
          'Invalid search query parameters',
          queryParse.error.format(),
        ),
      );
    }

    const config = getConfig(c);
    const result = await searchPlaces(
      config,
      queryParse.data.query,
      queryParse.data.display,
    );

    return respond(c, result);
  });
};
