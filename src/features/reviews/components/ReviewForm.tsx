'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { StarRating } from '@/components/ui/star-rating';
import { ReviewFormSchema, type ReviewFormValues } from '@/features/reviews/schemas/review-form';
import { useCreateReview } from '@/features/reviews/hooks/useCreateReview';
import type { CreateReviewRequest } from '@/features/reviews/lib/dto';

interface ReviewFormProps {
  naverPlaceId: string;
  placeName: string;
  address: string;
  latitude: number;
  longitude: number;
}

export const ReviewForm = ({
  naverPlaceId,
  placeName,
  address,
  latitude,
  longitude,
}: ReviewFormProps) => {
  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(ReviewFormSchema),
    defaultValues: {
      authorName: '',
      rating: 0,
      content: '',
      password: '',
    },
  });

  const createReview = useCreateReview();

  const onSubmit = (values: ReviewFormValues) => {
    const request: CreateReviewRequest = {
      naverPlaceId,
      placeName,
      address,
      latitude,
      longitude,
      authorName: values.authorName,
      rating: values.rating,
      content: values.content,
      password: values.password,
    };

    createReview.mutate(request);
  };

  const isFormValid = form.formState.isValid &&
    form.watch('authorName') &&
    form.watch('rating') > 0 &&
    form.watch('content').length >= 10 &&
    form.watch('password').length === 4;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="authorName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>작성자명 *</FormLabel>
              <FormControl>
                <Input
                  placeholder="작성자명을 입력하세요 (최대 20자)"
                  {...field}
                  maxLength={20}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="rating"
          render={({ field }) => (
            <FormItem>
              <FormLabel>평점 *</FormLabel>
              <FormControl>
                <div>
                  <StarRating
                    rating={field.value}
                    onRatingChange={field.onChange}
                  />
                </div>
              </FormControl>
              <FormMessage />
              <FormDescription>
                별표를 클릭하여 평점을 선택하세요
              </FormDescription>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>리뷰 내용 *</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="리뷰 내용을 입력하세요 (최소 10자, 최대 500자)"
                  {...field}
                  maxLength={500}
                  rows={8}
                  className="resize-none"
                />
              </FormControl>
              <FormMessage />
              <p className="text-sm text-muted-foreground">
                {field.value.length} / 500자
              </p>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>비밀번호 *</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="숫자 4자리"
                  {...field}
                  maxLength={4}
                  inputMode="numeric"
                  pattern="\d{4}"
                />
              </FormControl>
              <FormMessage />
              <FormDescription>
                향후 리뷰 수정 및 삭제시 사용됩니다
              </FormDescription>
            </FormItem>
          )}
        />

        <div className="flex gap-4">
          <Button
            type="submit"
            disabled={createReview.isPending || !isFormValid}
            className="flex-1"
          >
            {createReview.isPending ? '작성 중...' : '리뷰 작성하기'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => window.history.back()}
            className="flex-1"
          >
            취소
          </Button>
        </div>
      </form>
    </Form>
  );
};
