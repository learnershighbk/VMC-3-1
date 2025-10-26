# 공통 모듈 작업 계획

## 문서 정보

- **작성일**: 2025-10-22
- **버전**: 1.0
- **프로젝트명**: 맛집 리뷰 플랫폼
- **목적**: 페이지 단위 개발 전 공통 모듈 및 인프라 구축

---

## 1. 개요

### 1.1 문서 목적

본 문서는 맛집 리뷰 플랫폼의 **페이지 단위 개발을 시작하기 전에 완료해야 할 공통 모듈 및 설정 작업**을 정의합니다.

**핵심 원칙**:
- ✅ PRD/UserFlow/Database 문서에 명시된 기능만 구현
- ✅ 모든 페이지에서 공통으로 사용될 로직만 사전 구축
- ✅ 페이지별 병렬 개발 시 코드 충돌이 발생하지 않도록 경계 명확히 정의
- ❌ 오버엔지니어링 철저히 배제

### 1.2 범위

**포함**:
- 네이버 API 프록시 설정
- 데이터베이스 마이그레이션
- 공통 타입 정의 및 스키마
- 환경 변수 설정
- 공통 UI 컴포넌트 (shadcn-ui 추가 설치)
- 유틸리티 함수

**제외** (각 페이지 구현 시 작업):
- 메인 페이지 컴포넌트
- 리뷰 작성 페이지 컴포넌트
- 리뷰 조회 페이지 컴포넌트
- 지도 연동 로직 (페이지별 구현)

---

## 2. 데이터베이스 마이그레이션

### 2.1 마이그레이션 파일 목록

| 순서 | 파일명 | 설명 | 상태 |
|-----|--------|------|------|
| 1 | `0002_create_places_table.sql` | places 테이블 생성 | 필요 |
| 2 | `0003_create_reviews_table.sql` | reviews 테이블 생성 | 필요 |
| 3 | `0004_create_updated_at_trigger.sql` | updated_at 자동 갱신 트리거 | 필요 |
| 4 | `0005_insert_sample_data.sql` | 개발용 샘플 데이터 | 선택 |

### 2.2 작업 내용

**places 테이블** (`0002_create_places_table.sql`):
```sql
CREATE TABLE IF NOT EXISTS places (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  naver_place_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  latitude NUMERIC(9, 6) NOT NULL CHECK (latitude BETWEEN 33 AND 43),
  longitude NUMERIC(9, 6) NOT NULL CHECK (longitude BETWEEN 124 AND 132),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_places_naver_id ON places(naver_place_id);
CREATE INDEX idx_places_location ON places(latitude, longitude);
```

**reviews 테이블** (`0003_create_reviews_table.sql`):
```sql
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  place_id UUID NOT NULL REFERENCES places(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (char_length(title) BETWEEN 1 AND 50),
  content TEXT NOT NULL CHECK (char_length(content) BETWEEN 1 AND 500),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_reviews_place_id ON reviews(place_id);
CREATE INDEX idx_reviews_created_at ON reviews(created_at DESC);
```

**updated_at 트리거** (`0004_create_updated_at_trigger.sql`):
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_places_updated_at
BEFORE UPDATE ON places
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at
BEFORE UPDATE ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
```

### 2.3 수행 방법

1. 위 SQL 파일들을 `supabase/migrations/` 디렉토리에 생성
2. 사용자가 Supabase 대시보드 또는 CLI를 통해 마이그레이션 적용
3. 마이그레이션 완료 확인

---

## 3. 환경 변수 설정

### 3.1 필요한 환경 변수

**서버 전용** (`.env` 또는 `.env.local`):
```env
# Supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=xxx

# 네이버 검색 API (서버 프록시용)
NAVER_SEARCH_CLIENT_ID=xxx
NAVER_SEARCH_CLIENT_SECRET=xxx

# 네이버 클라우드 플랫폼 (Geocoding, Static Map용)
NCP_CLIENT_ID=xxx
NCP_CLIENT_SECRET=xxx
```

**클라이언트 공개** (`.env` 또는 `.env.local`):
```env
# 네이버 지도 SDK용 (도메인 검증)
NEXT_PUBLIC_NCP_CLIENT_ID=xxx

# API 베이스 URL (선택, 기본값 사용 가능)
NEXT_PUBLIC_API_BASE_URL=/api
```

### 3.2 작업 내용

**파일 생성**: `src/backend/config/index.ts` 확장

현재 config는 Supabase만 포함하고 있으므로 네이버 API 키를 추가해야 합니다.

```typescript
// src/backend/config/index.ts (확장)
import { z } from 'zod';
import type { AppConfig } from '@/backend/hono/context';

const envSchema = z.object({
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  // 네이버 검색 API
  NAVER_SEARCH_CLIENT_ID: z.string().min(1),
  NAVER_SEARCH_CLIENT_SECRET: z.string().min(1),
  // 네이버 클라우드 플랫폼 (Geocoding, Static Map)
  NCP_CLIENT_ID: z.string().min(1),
  NCP_CLIENT_SECRET: z.string().min(1),
});

let cachedConfig: AppConfig | null = null;

export const getAppConfig = (): AppConfig => {
  if (cachedConfig) {
    return cachedConfig;
  }

  const parsed = envSchema.safeParse({
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    NAVER_SEARCH_CLIENT_ID: process.env.NAVER_SEARCH_CLIENT_ID,
    NAVER_SEARCH_CLIENT_SECRET: process.env.NAVER_SEARCH_CLIENT_SECRET,
    NCP_CLIENT_ID: process.env.NCP_CLIENT_ID,
    NCP_CLIENT_SECRET: process.env.NCP_CLIENT_SECRET,
  });

  if (!parsed.success) {
    const messages = parsed.error.issues
      .map((issue) => `${issue.path.join('.') || 'config'}: ${issue.message}`)
      .join('; ');
    throw new Error(`Invalid backend configuration: ${messages}`);
  }

  cachedConfig = {
    supabase: {
      url: parsed.data.SUPABASE_URL,
      serviceRoleKey: parsed.data.SUPABASE_SERVICE_ROLE_KEY,
    },
    naver: {
      search: {
        clientId: parsed.data.NAVER_SEARCH_CLIENT_ID,
        clientSecret: parsed.data.NAVER_SEARCH_CLIENT_SECRET,
      },
      cloud: {
        clientId: parsed.data.NCP_CLIENT_ID,
        clientSecret: parsed.data.NCP_CLIENT_SECRET,
      },
    },
  } satisfies AppConfig;

  return cachedConfig;
};
```

**타입 정의 확장**: `src/backend/hono/context.ts`

```typescript
// src/backend/hono/context.ts (AppConfig 타입 확장)
export type AppConfig = {
  supabase: {
    url: string;
    serviceRoleKey: string;
  };
  naver: {
    search: {
      clientId: string;
      clientSecret: string;
    };
    cloud: {
      clientId: string;
      clientSecret: string;
    };
  };
};
```

---

## 4. 공통 타입 및 스키마

### 4.1 데이터베이스 타입

**파일 위치**: `src/lib/supabase/types.ts`

기존 파일을 확장하여 `places`, `reviews` 테이블 타입 추가:

```typescript
// src/lib/supabase/types.ts (확장)
export type Database = {
  public: {
    Tables: {
      places: {
        Row: {
          id: string;
          naver_place_id: string;
          name: string;
          address: string;
          latitude: number;
          longitude: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['places']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['places']['Insert']>;
      };
      reviews: {
        Row: {
          id: string;
          place_id: string;
          title: string;
          content: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['reviews']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['reviews']['Insert']>;
      };
      // 기존 example 테이블 유지
      example: {
        // ...
      };
    };
  };
};
```

### 4.2 공통 Zod 스키마

**파일 위치**: `src/lib/schemas/common.ts` (신규 생성)

네이버 API 응답 및 공통 검증 스키마:

```typescript
// src/lib/schemas/common.ts
import { z } from 'zod';

// 네이버 검색 API 응답 (Local)
export const NaverSearchItemSchema = z.object({
  title: z.string(),
  link: z.string().optional(),
  category: z.string().optional(),
  address: z.string(),
  roadAddress: z.string(),
  mapx: z.string(), // 경도 * 10^7
  mapy: z.string(), // 위도 * 10^7
});

export const NaverSearchResponseSchema = z.object({
  items: z.array(NaverSearchItemSchema),
  total: z.number().optional(),
  start: z.number().optional(),
  display: z.number().optional(),
});

// 좌표 검증
export const CoordinateSchema = z.object({
  latitude: z.number().min(33).max(43),
  longitude: z.number().min(124).max(132),
});

// 페이지네이션 (향후 확장용)
export const PaginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export type NaverSearchItem = z.infer<typeof NaverSearchItemSchema>;
export type NaverSearchResponse = z.infer<typeof NaverSearchResponseSchema>;
export type Coordinate = z.infer<typeof CoordinateSchema>;
export type PaginationQuery = z.infer<typeof PaginationQuerySchema>;
```

---

## 5. 네이버 API 프록시 구현

### 5.1 개요

네이버 검색 API 및 Geocoding API는 서버에서만 호출 가능하므로 Hono 프록시를 구현합니다.

### 5.2 파일 구조

```
src/features/naver-proxy/
├── backend/
│   ├── route.ts        # Hono 라우터 등록
│   ├── service.ts      # 네이버 API 호출 로직
│   ├── schema.ts       # 요청/응답 스키마
│   └── error.ts        # 에러 코드 정의
└── lib/
    └── dto.ts          # 클라이언트용 DTO 재노출
```

### 5.3 구현 내용

**`src/features/naver-proxy/backend/schema.ts`**:

```typescript
import { z } from 'zod';
import { NaverSearchResponseSchema } from '@/lib/schemas/common';

// 검색 쿼리
export const SearchQuerySchema = z.object({
  query: z.string().min(1).max(100),
  display: z.coerce.number().int().positive().max(5).default(5),
});

export const SearchResponseSchema = NaverSearchResponseSchema;

export type SearchQuery = z.infer<typeof SearchQuerySchema>;
export type SearchResponse = z.infer<typeof SearchResponseSchema>;
```

**`src/features/naver-proxy/backend/error.ts`**:

```typescript
export const naverProxyErrorCodes = {
  searchFailed: 'NAVER_SEARCH_FAILED',
  invalidQuery: 'INVALID_SEARCH_QUERY',
  apiError: 'NAVER_API_ERROR',
} as const;

export type NaverProxyErrorCode =
  (typeof naverProxyErrorCodes)[keyof typeof naverProxyErrorCodes];
```

**`src/features/naver-proxy/backend/service.ts`**:

```typescript
import axios from 'axios';
import { failure, success, type HandlerResult } from '@/backend/http/response';
import type { AppConfig } from '@/backend/hono/context';
import { naverProxyErrorCodes, type NaverProxyErrorCode } from './error';
import type { SearchResponse } from './schema';

const NAVER_SEARCH_API_URL = 'https://openapi.naver.com/v1/search/local.json';

export const searchPlaces = async (
  config: AppConfig,
  query: string,
  display: number,
): Promise<HandlerResult<SearchResponse, NaverProxyErrorCode>> => {
  try {
    const response = await axios.get<SearchResponse>(NAVER_SEARCH_API_URL, {
      params: { query, display },
      headers: {
        'X-Naver-Client-Id': config.naver.search.clientId,
        'X-Naver-Client-Secret': config.naver.search.clientSecret,
      },
      timeout: 10000,
    });

    return success(response.data);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return failure(
        502,
        naverProxyErrorCodes.apiError,
        `Naver API error: ${error.response?.status || 'unknown'}`,
        error.response?.data,
      );
    }

    return failure(
      500,
      naverProxyErrorCodes.searchFailed,
      'Failed to search places',
    );
  }
};
```

**`src/features/naver-proxy/backend/route.ts`**:

```typescript
import type { Hono } from 'hono';
import { respond, failure } from '@/backend/http/response';
import { getConfig, type AppEnv } from '@/backend/hono/context';
import { SearchQuerySchema } from './schema';
import { searchPlaces } from './service';

export const registerNaverProxyRoutes = (app: Hono<AppEnv>) => {
  app.get('/naver/search/local', async (c) => {
    const queryParse = SearchQuerySchema.safeParse({
      query: c.req.query('query'),
      display: c.req.query('display'),
    });

    if (!queryParse.success) {
      return respond(
        c,
        failure(
          400,
          'INVALID_SEARCH_QUERY',
          'Invalid search query parameters',
          queryParse.error.format(),
        ),
      );
    }

    const config = getConfig(c);
    const result = await searchPlaces(
      config,
      queryParse.data.query,
      queryParse.data.display,
    );

    return respond(c, result);
  });
};
```

**`src/features/naver-proxy/lib/dto.ts`**:

```typescript
export type {
  SearchQuery,
  SearchResponse,
} from '@/features/naver-proxy/backend/schema';
```

### 5.4 라우터 등록

**`src/backend/hono/app.ts` 수정**:

```typescript
import { registerNaverProxyRoutes } from '@/features/naver-proxy/backend/route';

export const createHonoApp = () => {
  // ... 기존 코드

  registerExampleRoutes(app);
  registerNaverProxyRoutes(app); // 추가

  // ...
};
```

---

## 6. Places 및 Reviews Feature 모듈

### 6.1 개요

places 및 reviews 관련 백엔드 API를 사전 구축합니다. 프론트엔드 컴포넌트는 각 페이지 구현 시 작업합니다.

### 6.2 파일 구조

```
src/features/places/
├── backend/
│   ├── route.ts        # Hono 라우터
│   ├── service.ts      # Supabase 로직
│   ├── schema.ts       # 요청/응답 스키마
│   └── error.ts        # 에러 코드
└── lib/
    └── dto.ts          # 클라이언트용 DTO

src/features/reviews/
├── backend/
│   ├── route.ts
│   ├── service.ts
│   ├── schema.ts
│   └── error.ts
└── lib/
    └── dto.ts
```

### 6.3 Places Feature

**`src/features/places/backend/schema.ts`**:

```typescript
import { z } from 'zod';

// 데이터베이스 Row
export const PlaceRowSchema = z.object({
  id: z.string().uuid(),
  naver_place_id: z.string(),
  name: z.string(),
  address: z.string(),
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
      title: z.string(),
      content: z.string(),
      createdAt: z.string(),
    })
    .nullable(),
});

export type PlaceRow = z.infer<typeof PlaceRowSchema>;
export type PlaceResponse = z.infer<typeof PlaceResponseSchema>;
export type PlaceWithReviews = z.infer<typeof PlaceWithReviewsSchema>;
```

**`src/features/places/backend/error.ts`**:

```typescript
export const placeErrorCodes = {
  fetchError: 'PLACE_FETCH_ERROR',
  notFound: 'PLACE_NOT_FOUND',
  validationError: 'PLACE_VALIDATION_ERROR',
  createError: 'PLACE_CREATE_ERROR',
} as const;

export type PlaceErrorCode =
  (typeof placeErrorCodes)[keyof typeof placeErrorCodes];
```

**`src/features/places/backend/service.ts`**:

```typescript
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
  // 복잡한 JOIN 쿼리이므로 RPC 또는 직접 SQL 사용 고려
  // 여기서는 간단히 places와 reviews를 따로 조회 후 조합
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
    .select('place_id, title, content, created_at')
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
        latitude: place.latitude,
        longitude: place.longitude,
        createdAt: place.created_at,
        updatedAt: place.updated_at,
        reviewCount: reviews.length,
        latestReview: latestReview
          ? {
              title: latestReview.title,
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
    latitude: inserted.latitude,
    longitude: inserted.longitude,
    createdAt: inserted.created_at,
    updatedAt: inserted.updated_at,
  };

  return success(mapped);
};
```

**`src/features/places/backend/route.ts`**:

```typescript
import type { Hono } from 'hono';
import { respond } from '@/backend/http/response';
import { getSupabase, type AppEnv } from '@/backend/hono/context';
import { getPlacesWithReviews } from './service';

export const registerPlacesRoutes = (app: Hono<AppEnv>) => {
  // 리뷰가 있는 맛집 목록 조회
  app.get('/places/with-reviews', async (c) => {
    const supabase = getSupabase(c);
    const result = await getPlacesWithReviews(supabase);
    return respond(c, result);
  });
};
```

**`src/features/places/lib/dto.ts`**:

```typescript
export type {
  PlaceResponse,
  PlaceWithReviews,
} from '@/features/places/backend/schema';
```

### 6.4 Reviews Feature

**`src/features/reviews/backend/schema.ts`**:

```typescript
import { z } from 'zod';

// 데이터베이스 Row
export const ReviewRowSchema = z.object({
  id: z.string().uuid(),
  place_id: z.string().uuid(),
  title: z.string(),
  content: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

// 클라이언트 응답
export const ReviewResponseSchema = z.object({
  id: z.string().uuid(),
  placeId: z.string().uuid(),
  title: z.string(),
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
  title: z.string().min(1).max(50),
  content: z.string().min(1).max(500),
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
```

**`src/features/reviews/backend/error.ts`**:

```typescript
export const reviewErrorCodes = {
  fetchError: 'REVIEW_FETCH_ERROR',
  notFound: 'REVIEW_NOT_FOUND',
  validationError: 'REVIEW_VALIDATION_ERROR',
  createError: 'REVIEW_CREATE_ERROR',
  deleteError: 'REVIEW_DELETE_ERROR',
  placeNotFound: 'PLACE_NOT_FOUND',
} as const;

export type ReviewErrorCode =
  (typeof reviewErrorCodes)[keyof typeof reviewErrorCodes];
```

**`src/features/reviews/backend/service.ts`**:

```typescript
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
      title: data.title,
      content: data.content,
    })
    .select()
    .single<ReviewRow>();

  if (error) {
    return failure(500, reviewErrorCodes.createError, error.message);
  }

  const mapped: ReviewResponse = {
    id: inserted.id,
    placeId: inserted.place_id,
    title: inserted.title,
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
    .select('id, naver_place_id, name, address, latitude, longitude')
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
    title: r.title,
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
): Promise<HandlerResult<{ message: string }, ReviewErrorCode>> => {
  const { error } = await client
    .from(REVIEWS_TABLE)
    .delete()
    .eq('id', reviewId);

  if (error) {
    return failure(500, reviewErrorCodes.deleteError, error.message);
  }

  return success({ message: '리뷰가 삭제되었습니다' });
};
```

**`src/features/reviews/backend/route.ts`**:

```typescript
import type { Hono } from 'hono';
import { respond, failure } from '@/backend/http/response';
import { getSupabase, type AppEnv } from '@/backend/hono/context';
import {
  CreateReviewRequestSchema,
  GetReviewsQuerySchema,
} from './schema';
import {
  createReview,
  getReviewsByNaverPlaceId,
  deleteReview,
} from './service';

export const registerReviewsRoutes = (app: Hono<AppEnv>) => {
  // 리뷰 생성
  app.post('/reviews', async (c) => {
    const body = await c.req.json();
    const bodyParse = CreateReviewRequestSchema.safeParse(body);

    if (!bodyParse.success) {
      return respond(
        c,
        failure(
          400,
          'INVALID_REVIEW_REQUEST',
          'Invalid review request body',
          bodyParse.error.format(),
        ),
      );
    }

    const supabase = getSupabase(c);
    const result = await createReview(supabase, bodyParse.data);
    return respond(c, result);
  });

  // 특정 맛집의 리뷰 목록 조회
  app.get('/reviews', async (c) => {
    const queryParse = GetReviewsQuerySchema.safeParse({
      placeId: c.req.query('placeId'),
      naverPlaceId: c.req.query('naverPlaceId'),
    });

    if (!queryParse.success) {
      return respond(
        c,
        failure(
          400,
          'INVALID_QUERY_PARAMS',
          'Invalid query parameters',
          queryParse.error.format(),
        ),
      );
    }

    const { naverPlaceId } = queryParse.data;

    if (!naverPlaceId) {
      return respond(
        c,
        failure(
          400,
          'MISSING_NAVER_PLACE_ID',
          'naverPlaceId query parameter is required',
        ),
      );
    }

    const supabase = getSupabase(c);
    const result = await getReviewsByNaverPlaceId(supabase, naverPlaceId);
    return respond(c, result);
  });

  // 리뷰 삭제
  app.delete('/reviews/:id', async (c) => {
    const reviewId = c.req.param('id');

    if (!reviewId) {
      return respond(
        c,
        failure(400, 'MISSING_REVIEW_ID', 'Review ID is required'),
      );
    }

    const supabase = getSupabase(c);
    const result = await deleteReview(supabase, reviewId);
    return respond(c, result);
  });
};
```

**`src/features/reviews/lib/dto.ts`**:

```typescript
export type {
  ReviewResponse,
  CreateReviewRequest,
  PlaceWithReviewsResponse,
} from '@/features/reviews/backend/schema';
```

### 6.5 라우터 등록

**`src/backend/hono/app.ts` 수정**:

```typescript
import { registerPlacesRoutes } from '@/features/places/backend/route';
import { registerReviewsRoutes } from '@/features/reviews/backend/route';

export const createHonoApp = () => {
  // ... 기존 코드

  registerExampleRoutes(app);
  registerNaverProxyRoutes(app);
  registerPlacesRoutes(app);
  registerReviewsRoutes(app);

  // ...
};
```

---

## 7. 공통 UI 컴포넌트 (shadcn-ui)

### 7.1 필요한 컴포넌트

PRD 및 UserFlow 분석 결과, 다음 shadcn-ui 컴포넌트가 추가로 필요합니다:

| 컴포넌트 | 용도 | 설치 명령 |
|---------|------|----------|
| `dialog` | 리뷰 삭제 확인 다이얼로그 | `npx shadcn@latest add dialog` |
| `skeleton` | 로딩 상태 (맛집 카드, 리뷰 목록) | `npx shadcn@latest add skeleton` |
| `command` | 검색 결과 드롭다운 (선택) | `npx shadcn@latest add command` |

**기존 설치된 컴포넌트** (확인됨):
- button
- card
- input
- textarea
- form
- label
- toast
- separator
- dropdown-menu
- select
- checkbox
- accordion
- avatar
- badge
- sheet

### 7.2 설치 스크립트

사용자가 다음 명령어를 실행:

```bash
npx shadcn@latest add dialog
npx shadcn@latest add skeleton
```

---

## 8. 유틸리티 함수

### 8.1 네이버 좌표 변환

**파일 위치**: `src/lib/utils/naver.ts` (신규 생성)

```typescript
// 네이버 검색 API의 mapx, mapy를 실제 좌표로 변환
export const convertNaverCoordinates = (mapx: string, mapy: string) => {
  return {
    longitude: Number(mapx) / 10_000_000,
    latitude: Number(mapy) / 10_000_000,
  };
};

// HTML 태그 제거 (네이버 API는 <b> 태그 포함)
export const stripHtmlTags = (html: string): string => {
  return html.replace(/<[^>]*>/g, '');
};
```

### 8.2 날짜 포맷팅

**파일 위치**: `src/lib/utils/date.ts` (신규 생성)

```typescript
import { format, formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

// 상대 시간 (예: "3시간 전")
export const formatRelativeTime = (dateString: string): string => {
  return formatDistanceToNow(new Date(dateString), {
    addSuffix: true,
    locale: ko,
  });
};

// 절대 시간 (예: "2025-10-22 14:30")
export const formatAbsoluteTime = (
  dateString: string,
  formatStr = 'yyyy-MM-dd HH:mm',
): string => {
  return format(new Date(dateString), formatStr, { locale: ko });
};
```

### 8.3 텍스트 말줄임

**파일 위치**: `src/lib/utils/text.ts` (신규 생성)

```typescript
// 텍스트 말줄임 (최대 길이 제한)
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
};
```

---

## 9. 환경 변수 예시 파일

**파일 생성**: `.env.example`

```env
# Supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# 네이버 검색 API (서버 프록시용)
NAVER_SEARCH_CLIENT_ID=your-search-client-id
NAVER_SEARCH_CLIENT_SECRET=your-search-client-secret

# 네이버 클라우드 플랫폼 (Geocoding, Static Map용)
NCP_CLIENT_ID=your-ncp-client-id
NCP_CLIENT_SECRET=your-ncp-client-secret

# 네이버 지도 SDK용 (클라이언트 공개)
NEXT_PUBLIC_NCP_CLIENT_ID=your-public-ncp-client-id

# API 베이스 URL (선택)
NEXT_PUBLIC_API_BASE_URL=/api
```

---

## 10. 작업 체크리스트

### 10.1 데이터베이스 마이그레이션

- [ ] `supabase/migrations/0002_create_places_table.sql` 작성
- [ ] `supabase/migrations/0003_create_reviews_table.sql` 작성
- [ ] `supabase/migrations/0004_create_updated_at_trigger.sql` 작성
- [ ] Supabase에 마이그레이션 적용
- [ ] 테이블 생성 확인 (Supabase Dashboard)

### 10.2 환경 변수 설정

- [ ] `.env.example` 파일 생성
- [ ] `.env.local` 파일 생성 (사용자가 실제 키 입력)
- [ ] 네이버 API 키 발급 확인
- [ ] `src/backend/config/index.ts` 확장
- [ ] `src/backend/hono/context.ts` 타입 확장

### 10.3 공통 타입 및 스키마

- [ ] `src/lib/supabase/types.ts` 확장 (places, reviews)
- [ ] `src/lib/schemas/common.ts` 생성

### 10.4 네이버 API 프록시

- [ ] `src/features/naver-proxy/backend/schema.ts` 작성
- [ ] `src/features/naver-proxy/backend/error.ts` 작성
- [ ] `src/features/naver-proxy/backend/service.ts` 작성
- [ ] `src/features/naver-proxy/backend/route.ts` 작성
- [ ] `src/features/naver-proxy/lib/dto.ts` 작성
- [ ] `src/backend/hono/app.ts`에 라우터 등록

### 10.5 Places Feature

- [ ] `src/features/places/backend/schema.ts` 작성
- [ ] `src/features/places/backend/error.ts` 작성
- [ ] `src/features/places/backend/service.ts` 작성
- [ ] `src/features/places/backend/route.ts` 작성
- [ ] `src/features/places/lib/dto.ts` 작성
- [ ] `src/backend/hono/app.ts`에 라우터 등록

### 10.6 Reviews Feature

- [ ] `src/features/reviews/backend/schema.ts` 작성
- [ ] `src/features/reviews/backend/error.ts` 작성
- [ ] `src/features/reviews/backend/service.ts` 작성
- [ ] `src/features/reviews/backend/route.ts` 작성
- [ ] `src/features/reviews/lib/dto.ts` 작성
- [ ] `src/backend/hono/app.ts`에 라우터 등록

### 10.7 공통 UI 컴포넌트

- [ ] `npx shadcn@latest add dialog` 실행
- [ ] `npx shadcn@latest add skeleton` 실행

### 10.8 유틸리티 함수

- [ ] `src/lib/utils/naver.ts` 생성
- [ ] `src/lib/utils/date.ts` 생성
- [ ] `src/lib/utils/text.ts` 생성

### 10.9 검증 및 테스트

- [ ] 백엔드 API 수동 테스트 (Postman/Thunder Client)
  - `GET /api/naver/search/local?query=홍대+파스타`
  - `POST /api/reviews` (리뷰 생성)
  - `GET /api/reviews?naverPlaceId=xxx`
  - `DELETE /api/reviews/:id`
  - `GET /api/places/with-reviews`
- [ ] 환경 변수 로딩 확인
- [ ] Supabase 연결 확인

---

## 11. 페이지별 병렬 개발 시 충돌 방지

### 11.1 페이지별 작업 범위

**메인 페이지 (`src/app/page.tsx`)**:
- `src/app/page.tsx` 및 하위 컴포넌트
- 지도 연동 로직 (클라이언트)
- 맛집 카드 리스트 렌더링
- 검색창 UI

**리뷰 작성 페이지 (`src/app/review/new/page.tsx`)**:
- `src/app/review/new/page.tsx` 및 하위 컴포넌트
- 리뷰 작성 폼
- 네이버 검색 API 호출 (클라이언트 → 프록시)

**리뷰 조회 페이지 (`src/app/review/[placeId]/page.tsx`)**:
- `src/app/review/[placeId]/page.tsx` 및 하위 컴포넌트
- 리뷰 목록 렌더링
- 리뷰 삭제 기능

### 11.2 공통 모듈 사용 규칙

| 모듈 | 접근 방식 | 수정 금지 |
|-----|----------|---------|
| `/api/*` (Hono 백엔드) | API 호출만 (읽기 전용) | ✅ |
| `src/lib/utils/*` | Import 후 사용 | ✅ |
| `src/lib/schemas/common.ts` | Import 후 사용 | ✅ |
| `src/features/*/lib/dto.ts` | Import 후 사용 | ✅ |
| `src/components/ui/*` | Import 후 사용 | ✅ |

**규칙**:
1. 공통 모듈 파일은 절대 수정하지 않음
2. 페이지별 컴포넌트는 `src/app/` 또는 `src/features/*/components/` 에만 작성
3. 페이지별 hooks는 `src/features/*/hooks/` 에만 작성
4. 백엔드 API는 공통 모듈 작업 완료 후 변경 불가

### 11.3 충돌 발생 가능 영역

**없음**: 위 규칙을 준수하면 파일 레벨 충돌 없음

---

## 12. 검증 기준

### 12.1 완료 조건

다음 모든 항목이 완료되어야 페이지 단위 개발을 시작할 수 있습니다:

1. ✅ 데이터베이스 마이그레이션 적용 완료
2. ✅ 환경 변수 설정 완료
3. ✅ 백엔드 API 수동 테스트 성공
4. ✅ shadcn-ui 컴포넌트 설치 완료
5. ✅ 공통 유틸리티 함수 작성 완료

### 12.2 수동 테스트 시나리오

**1. 네이버 검색 API 프록시**:
```bash
curl "http://localhost:3000/api/naver/search/local?query=홍대+파스타&display=5"
```
**예상 응답**: 네이버 API 응답 JSON

**2. 리뷰 생성**:
```bash
curl -X POST http://localhost:3000/api/reviews \
  -H "Content-Type: application/json" \
  -d '{
    "naverPlaceId": "test123",
    "placeName": "테스트 식당",
    "address": "서울특별시 마포구",
    "latitude": 37.551169,
    "longitude": 126.923979,
    "title": "맛있어요",
    "content": "정말 맛있습니다"
  }'
```
**예상 응답**: 201 Created + reviewId

**3. 리뷰 조회**:
```bash
curl "http://localhost:3000/api/reviews?naverPlaceId=test123"
```
**예상 응답**: place 정보 + reviews 배열

**4. 리뷰 삭제**:
```bash
curl -X DELETE http://localhost:3000/api/reviews/{reviewId}
```
**예상 응답**: 200 OK + 성공 메시지

**5. 맛집 목록 조회**:
```bash
curl http://localhost:3000/api/places/with-reviews
```
**예상 응답**: 리뷰가 있는 맛집 배열

---

## 13. 다음 단계

### 13.1 공통 모듈 완료 후

페이지별 병렬 개발 시작:

1. **메인 페이지 팀**:
   - 지도 연동
   - 맛집 카드 리스트
   - 검색창

2. **리뷰 작성 페이지 팀**:
   - 리뷰 작성 폼
   - 음식점 정보 표시

3. **리뷰 조회 페이지 팀**:
   - 리뷰 목록
   - 삭제 기능

### 13.2 통합 단계

1. 각 페이지 PR 리뷰
2. 통합 테스트
3. E2E 테스트
4. 배포

---

## 14. 부록

### 14.1 참고 문서

- [PRD 문서](./prd.md)
- [User Flow 문서](./userflow.md)
- [Database 설계 문서](./database.md)
- [네이버 검색 API 가이드](https://developers.naver.com/docs/serviceapi/search/local/local.md)
- [네이버 지도 API 가이드](https://navermaps.github.io/maps.js.ncp/)

### 14.2 네이버 API 발급 가이드

**네이버 검색 API**:
1. [네이버 개발자 센터](https://developers.naver.com/)
2. "애플리케이션 등록"
3. "검색" API 선택
4. Client ID, Client Secret 발급

**네이버 클라우드 플랫폼**:
1. [NCP 콘솔](https://console.ncloud.com/)
2. "AI·NAVER API" → "Geolocation" 신청
3. "Maps" → "Static Map" 신청
4. Client ID, Client Secret 발급
5. 도메인 등록 (localhost:3000 포함)

---

## 15. 변경 이력

| 버전 | 날짜 | 작성자 | 변경 내용 |
|-----|------|--------|----------|
| 1.0 | 2025-10-22 | - | 초기 공통 모듈 작업 계획 작성 |

---

**승인**:
- [ ] Tech Lead
- [ ] Backend Developer
- [ ] Frontend Developer

---

**문의**: 프로젝트 관련 문의는 GitHub Issues 또는 팀 채널 활용
