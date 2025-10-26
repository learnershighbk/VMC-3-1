export const naverProxyErrorCodes = {
  searchFailed: 'NAVER_SEARCH_FAILED',
  invalidQuery: 'INVALID_SEARCH_QUERY',
  apiError: 'NAVER_API_ERROR',
} as const;

export type NaverProxyErrorCode =
  (typeof naverProxyErrorCodes)[keyof typeof naverProxyErrorCodes];
