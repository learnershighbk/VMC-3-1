import { z } from 'zod';

// 데이터베이스 Row
export const PlaceRowSchema = z.object({
  id: z.string().uuid(),
  naver_place_id: z.string(),
  name: z.string(),
  address: z.string(),
  category: z.string().nullable(),
  latitude: z.number(),
  longitude: z.number(),
  created_at: z.string(),
  updated_at: z.string(),
});

// 클라이언트 응답
export const PlaceResponseSchema = z.object({
  id: z.string().uuid(),
  naverPlaceId: z.string(),
  name: z.string(),
  address: z.string(),
  category: z.string().nullable(),
  latitude: z.number(),
  longitude: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// 리뷰가 있는 맛집 응답
export const PlaceWithReviewsSchema = PlaceResponseSchema.extend({
  reviewCount: z.number().int().nonnegative(),
  latestReview: z
    .object({
      authorName: z.string(),
      rating: z.number(),
      content: z.string(),
      createdAt: z.string(),
    })
    .nullable(),
});

export type PlaceRow = z.infer<typeof PlaceRowSchema>;
export type PlaceResponse = z.infer<typeof PlaceResponseSchema>;
export type PlaceWithReviews = z.infer<typeof PlaceWithReviewsSchema>;
