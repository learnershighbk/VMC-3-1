import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/remote/api-client';
import type { SearchResponse } from '@/features/naver-proxy/lib/dto';

export const useNaverSearch = (query: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['naver', 'search', query],
    queryFn: async () => {
      if (!query.trim()) {
        return { items: [], total: 0, start: 1, display: 0 };
      }

      const response = await apiClient.get<SearchResponse>(
        `/naver/search/local?query=${encodeURIComponent(query)}&display=5`
      );
      return response.data;
    },
    enabled: enabled && query.trim().length > 0,
    staleTime: 1000 * 60, // 1분
    retry: 1,
  });
};
