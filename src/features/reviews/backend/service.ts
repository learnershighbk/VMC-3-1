import type { SupabaseClient } from '@supabase/supabase-js';
import { failure, success, type HandlerResult } from '@/backend/http/response';
import {
  ReviewRowSchema,
  ReviewResponseSchema,
  PlaceWithReviewsResponseSchema,
  type ReviewResponse,
  type CreateReviewRequest,
  type PlaceWithReviewsResponse,
  type ReviewRow,
} from './schema';
import { reviewErrorCodes, type ReviewErrorCode } from './error';
import { createPlaceIfNotExists } from '@/features/places/backend/service';

const REVIEWS_TABLE = 'reviews';

// 리뷰 생성
export const createReview = async (
  client: SupabaseClient,
  data: CreateReviewRequest,
): Promise<HandlerResult<ReviewResponse, ReviewErrorCode>> => {
  // 1. Place 생성/조회
  const placeResult = await createPlaceIfNotExists(client, {
    naverPlaceId: data.naverPlaceId,
    name: data.placeName,
    address: data.address,
    latitude: data.latitude,
    longitude: data.longitude,
  });

  if (!placeResult.ok) {
    return failure(
      500,
      reviewErrorCodes.createError,
      'Failed to create or fetch place',
    );
  }

  const place = placeResult.data;

  // 2. 리뷰 생성
  const { data: inserted, error } = await client
    .from(REVIEWS_TABLE)
    .insert({
      place_id: place.id,
      author_name: data.authorName,
      rating: data.rating,
      content: data.content,
      password: data.password,
    })
    .select()
    .single<ReviewRow>();

  if (error) {
    return failure(500, reviewErrorCodes.createError, error.message);
  }

  const mapped: ReviewResponse = {
    id: inserted.id,
    placeId: inserted.place_id,
    authorName: inserted.author_name,
    rating: inserted.rating,
    content: inserted.content,
    createdAt: inserted.created_at,
    updatedAt: inserted.updated_at,
  };

  return success(mapped, 201);
};

// 특정 맛집의 리뷰 목록 조회 (naverPlaceId 기준)
export const getReviewsByNaverPlaceId = async (
  client: SupabaseClient,
  naverPlaceId: string,
): Promise<HandlerResult<PlaceWithReviewsResponse, ReviewErrorCode>> => {
  // 1. Place 조회
  const { data: place, error: placeError } = await client
    .from('places')
    .select('id, naver_place_id, name, address, category, latitude, longitude')
    .eq('naver_place_id', naverPlaceId)
    .maybeSingle();

  if (placeError) {
    return failure(500, reviewErrorCodes.fetchError, placeError.message);
  }

  if (!place) {
    return failure(404, reviewErrorCodes.placeNotFound, 'Place not found');
  }

  // 2. 리뷰 목록 조회
  const { data: reviewsData, error: reviewsError } = await client
    .from(REVIEWS_TABLE)
    .select('*')
    .eq('place_id', place.id)
    .order('created_at', { ascending: false });

  if (reviewsError) {
    return failure(500, reviewErrorCodes.fetchError, reviewsError.message);
  }

  const reviews: ReviewResponse[] = (reviewsData || []).map((r) => ({
    id: r.id,
    placeId: r.place_id,
    authorName: r.author_name,
    rating: r.rating,
    content: r.content,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }));

  const result: PlaceWithReviewsResponse = {
    place: {
      id: place.id,
      naverPlaceId: place.naver_place_id,
      name: place.name,
      address: place.address,
      category: place.category,
      latitude: place.latitude,
      longitude: place.longitude,
    },
    reviews,
  };

  return success(result);
};

// 리뷰 삭제
export const deleteReview = async (
  client: SupabaseClient,
  reviewId: string,
  password: string,
): Promise<HandlerResult<{ message: string }, ReviewErrorCode>> => {
  // 1. 비밀번호 확인
  const { data: review, error: fetchError } = await client
    .from(REVIEWS_TABLE)
    .select('password')
    .eq('id', reviewId)
    .maybeSingle();

  if (fetchError) {
    return failure(500, reviewErrorCodes.deleteError, fetchError.message);
  }

  if (!review) {
    return failure(404, reviewErrorCodes.reviewNotFound, '리뷰를 찾을 수 없습니다');
  }

  if (review.password !== password) {
    return failure(403, reviewErrorCodes.invalidPassword, '비밀번호가 일치하지 않습니다');
  }

  // 2. 리뷰 삭제
  const { error } = await client
    .from(REVIEWS_TABLE)
    .delete()
    .eq('id', reviewId);

  if (error) {
    return failure(500, reviewErrorCodes.deleteError, error.message);
  }

  return success({ message: '리뷰가 삭제되었습니다' });
};
