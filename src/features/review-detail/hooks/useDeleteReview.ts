'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/remote/api-client';
import { useToast } from '@/hooks/use-toast';

export const useDeleteReview = (naverPlaceId: string) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (reviewId: string) => {
      const response = await apiClient.delete(`/reviews/${reviewId}`);

      if (!response.data.success) {
        throw new Error(response.data.error?.message || '삭제에 실패했습니다');
      }

      return response.data;
    },
    onSuccess: () => {
      // 캐시 무효화 및 재조회
      queryClient.invalidateQueries({ queryKey: ['reviews', naverPlaceId] });
      queryClient.invalidateQueries({ queryKey: ['places', 'with-reviews'] }); // 메인 페이지 캐시도 무효화

      toast({
        title: '리뷰가 삭제되었습니다',
      });
    },
    onError: (error: Error) => {
      toast({
        title: '삭제 실패',
        description: error.message || '리뷰 삭제 중 오류가 발생했습니다',
        variant: 'destructive',
      });
    },
  });
};
