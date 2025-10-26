import type { SupabaseClient } from '@supabase/supabase-js';
import { failure, success, type HandlerResult } from '@/backend/http/response';
import {
  PlaceRowSchema,
  PlaceResponseSchema,
  PlaceWithReviewsSchema,
  type PlaceResponse,
  type PlaceWithReviews,
  type PlaceRow,
} from './schema';
import { placeErrorCodes, type PlaceErrorCode } from './error';

const PLACES_TABLE = 'places';
const REVIEWS_TABLE = 'reviews';

// 네이버 place_id로 조회
export const getPlaceByNaverId = async (
  client: SupabaseClient,
  naverPlaceId: string,
): Promise<HandlerResult<PlaceResponse | null, PlaceErrorCode>> => {
  const { data, error } = await client
    .from(PLACES_TABLE)
    .select('*')
    .eq('naver_place_id', naverPlaceId)
    .maybeSingle<PlaceRow>();

  if (error) {
    return failure(500, placeErrorCodes.fetchError, error.message);
  }

  if (!data) {
    return success(null);
  }

  const rowParse = PlaceRowSchema.safeParse(data);
  if (!rowParse.success) {
    return failure(
      500,
      placeErrorCodes.validationError,
      'Place row validation failed',
      rowParse.error.format(),
    );
  }

  const mapped: PlaceResponse = {
    id: rowParse.data.id,
    naverPlaceId: rowParse.data.naver_place_id,
    name: rowParse.data.name,
    address: rowParse.data.address,
    category: rowParse.data.category,
    latitude: rowParse.data.latitude,
    longitude: rowParse.data.longitude,
    createdAt: rowParse.data.created_at,
    updatedAt: rowParse.data.updated_at,
  };

  const parsed = PlaceResponseSchema.safeParse(mapped);
  if (!parsed.success) {
    return failure(
      500,
      placeErrorCodes.validationError,
      'Place response validation failed',
      parsed.error.format(),
    );
  }

  return success(parsed.data);
};

// 리뷰가 있는 맛집 목록 조회
export const getPlacesWithReviews = async (
  client: SupabaseClient,
): Promise<HandlerResult<PlaceWithReviews[], PlaceErrorCode>> => {
  // places와 reviews를 따로 조회 후 조합
  const { data: placesData, error: placesError } = await client
    .from(PLACES_TABLE)
    .select('*');

  if (placesError) {
    return failure(500, placeErrorCodes.fetchError, placesError.message);
  }

  if (!placesData || placesData.length === 0) {
    return success([]);
  }

  const placeIds = placesData.map((p) => p.id);

  const { data: reviewsData, error: reviewsError } = await client
    .from(REVIEWS_TABLE)
    .select('place_id, author_name, rating, content, created_at')
    .in('place_id', placeIds)
    .order('created_at', { ascending: false });

  if (reviewsError) {
    return failure(500, placeErrorCodes.fetchError, reviewsError.message);
  }

  const reviewsByPlace = new Map<string, typeof reviewsData>();
  reviewsData?.forEach((review) => {
    if (!reviewsByPlace.has(review.place_id)) {
      reviewsByPlace.set(review.place_id, []);
    }
    reviewsByPlace.get(review.place_id)!.push(review);
  });

  const result: PlaceWithReviews[] = placesData
    .filter((place) => reviewsByPlace.has(place.id))
    .map((place) => {
      const reviews = reviewsByPlace.get(place.id) || [];
      const latestReview = reviews[0] || null;

      return {
        id: place.id,
        naverPlaceId: place.naver_place_id,
        name: place.name,
        address: place.address,
        category: place.category,
        latitude: place.latitude,
        longitude: place.longitude,
        createdAt: place.created_at,
        updatedAt: place.updated_at,
        reviewCount: reviews.length,
        latestReview: latestReview
          ? {
              authorName: latestReview.author_name,
              rating: latestReview.rating,
              content: latestReview.content,
              createdAt: latestReview.created_at,
            }
          : null,
      };
    });

  return success(result);
};

// Place 생성 (중복 방지)
export const createPlaceIfNotExists = async (
  client: SupabaseClient,
  data: {
    naverPlaceId: string;
    name: string;
    address: string;
    category?: string;
    latitude: number;
    longitude: number;
  },
): Promise<HandlerResult<PlaceResponse, PlaceErrorCode>> => {
  const { data: inserted, error } = await client
    .from(PLACES_TABLE)
    .insert({
      naver_place_id: data.naverPlaceId,
      name: data.name,
      address: data.address,
      category: data.category || null,
      latitude: data.latitude,
      longitude: data.longitude,
    })
    .select()
    .single<PlaceRow>();

  if (error) {
    // 중복 에러인 경우 기존 데이터 반환
    if (error.code === '23505') {
      // unique_violation
      const existing = await getPlaceByNaverId(client, data.naverPlaceId);
      if (existing.ok && existing.data) {
        return success(existing.data);
      }
    }
    return failure(500, placeErrorCodes.createError, error.message);
  }

  const mapped: PlaceResponse = {
    id: inserted.id,
    naverPlaceId: inserted.naver_place_id,
    name: inserted.name,
    address: inserted.address,
    category: inserted.category,
    latitude: inserted.latitude,
    longitude: inserted.longitude,
    createdAt: inserted.created_at,
    updatedAt: inserted.updated_at,
  };

  return success(mapped);
};
