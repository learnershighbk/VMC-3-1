'use client';

import { useQuery } from '@tanstack/react-query';
import type { PlaceWithReviewsResponse } from '@/features/reviews/lib/dto';
import { apiClient } from '@/lib/remote/api-client';

export const useReviewDetail = (naverPlaceId: string) => {
  return useQuery<PlaceWithReviewsResponse>({
    queryKey: ['reviews', naverPlaceId],
    queryFn: async () => {
      const response = await apiClient.get<PlaceWithReviewsResponse>(`/reviews`, {
        params: { naverPlaceId },
      });

      return response.data;
    },
    staleTime: 30 * 1000, // 30초
    gcTime: 5 * 60 * 1000, // 5분 (cacheTime -> gcTime in v5)
    retry: 3,
  });
};
