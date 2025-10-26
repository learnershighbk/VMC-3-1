'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from '@/hooks/use-toast';
import { apiClient, extractApiErrorMessage } from '@/lib/remote/api-client';
import type { CreateReviewRequest, ReviewResponse } from '@/features/reviews/lib/dto';

export const useCreateReview = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: async (data: CreateReviewRequest) => {
      const response = await apiClient.post<{ success: boolean; data: ReviewResponse }>(
        '/reviews',
        data
      );
      return response.data;
    },
    onSuccess: (_response, variables) => {
      toast({
        title: '리뷰가 등록되었습니다',
        description: '작성하신 리뷰가 성공적으로 등록되었습니다.',
      });
      router.push(`/review/${variables.naverPlaceId}`);
    },
    onError: (error: unknown) => {
      const message = extractApiErrorMessage(error, '리뷰 등록에 실패했습니다. 다시 시도해주세요');
      toast({
        title: '오류가 발생했습니다',
        description: message,
        variant: 'destructive',
      });
    },
  });
};
