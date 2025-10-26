import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/remote/api-client';
import type { PlaceWithReviews } from '@/features/places/lib/dto';

export const usePlacesWithReviews = () => {
  return useQuery({
    queryKey: ['places', 'with-reviews'],
    queryFn: async () => {
      const response = await apiClient.get<PlaceWithReviews[]>(
        '/places/with-reviews'
      );
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5분
    retry: 3,
  });
};
