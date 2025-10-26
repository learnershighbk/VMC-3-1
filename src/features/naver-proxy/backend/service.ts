import axios from 'axios';
import { failure, success, type HandlerResult } from '@/backend/http/response';
import type { AppConfig } from '@/backend/hono/context';
import { naverProxyErrorCodes, type NaverProxyErrorCode } from './error';
import type { SearchResponse } from './schema';

const NAVER_SEARCH_API_URL = 'https://openapi.naver.com/v1/search/local.json';

export const searchPlaces = async (
  config: AppConfig,
  query: string,
  display: number,
): Promise<HandlerResult<SearchResponse, NaverProxyErrorCode>> => {
  try {
    const response = await axios.get<SearchResponse>(NAVER_SEARCH_API_URL, {
      params: { query, display },
      headers: {
        'X-Naver-Client-Id': config.naver.search.clientId,
        'X-Naver-Client-Secret': config.naver.search.clientSecret,
      },
      timeout: 10000,
    });

    return success(response.data);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return failure(
        502,
        naverProxyErrorCodes.apiError,
        `Naver API error: ${error.response?.status || 'unknown'}`,
        error.response?.data,
      );
    }

    return failure(
      500,
      naverProxyErrorCodes.searchFailed,
      'Failed to search places',
    );
  }
};
