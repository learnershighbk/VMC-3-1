import { z } from 'zod';

// 데이터베이스 Row
export const ReviewRowSchema = z.object({
  id: z.string().uuid(),
  place_id: z.string().uuid(),
  author_name: z.string(),
  rating: z.number(),
  content: z.string(),
  password: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

// 클라이언트 응답
export const ReviewResponseSchema = z.object({
  id: z.string().uuid(),
  placeId: z.string().uuid(),
  authorName: z.string(),
  rating: z.number(),
  content: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// 리뷰 생성 요청
export const CreateReviewRequestSchema = z.object({
  naverPlaceId: z.string().min(1),
  placeName: z.string().min(1),
  address: z.string().min(1),
  latitude: z.number().min(33).max(43),
  longitude: z.number().min(124).max(132),
  authorName: z.string().min(1).max(20),
  rating: z.number().min(1).max(5),
  content: z.string().min(10).max(500),
  password: z.string().regex(/^\d{4}$/),
});

// 리뷰 목록 조회 쿼리
export const GetReviewsQuerySchema = z.object({
  placeId: z.string().uuid().optional(),
  naverPlaceId: z.string().optional(),
});

// 특정 맛집의 리뷰 목록 + 맛집 정보 응답
export const PlaceWithReviewsResponseSchema = z.object({
  place: z.object({
    id: z.string().uuid(),
    naverPlaceId: z.string(),
    name: z.string(),
    address: z.string(),
    category: z.string().nullable(),
    latitude: z.number(),
    longitude: z.number(),
  }),
  reviews: z.array(ReviewResponseSchema),
});

export type ReviewRow = z.infer<typeof ReviewRowSchema>;
export type ReviewResponse = z.infer<typeof ReviewResponseSchema>;
export type CreateReviewRequest = z.infer<typeof CreateReviewRequestSchema>;
export type GetReviewsQuery = z.infer<typeof GetReviewsQuerySchema>;
export type PlaceWithReviewsResponse = z.infer<typeof PlaceWithReviewsResponseSchema>;
