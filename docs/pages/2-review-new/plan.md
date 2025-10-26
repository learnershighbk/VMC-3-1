# 리뷰 작성 페이지 구현 계획

## 문서 정보

- **페이지명**: 리뷰 작성 페이지
- **경로**: `/review/new`
- **Query Parameters**: `placeId`, `placeName`, `address`, `lat`, `lng`
- **관련 유스케이스**: UC-002 (맛집 검색 및 리뷰 작성)
- **작성일**: 2025-10-23
- **버전**: 1.0

---

## 1. 개요

### 1.1 페이지 목적

사용자가 메인 페이지에서 검색한 음식점에 대한 리뷰를 작성할 수 있는 페이지입니다.

### 1.2 주요 기능

1. **음식점 정보 표시**: URL 쿼리 파라미터로 전달받은 음식점 정보 렌더링
2. **Static Map 썸네일**: 네이버 Static Map API를 활용한 위치 표시
3. **리뷰 작성 폼**: 제목(1-50자), 내용(1-500자) 입력
4. **유효성 검증**: react-hook-form + zod를 활용한 클라이언트 측 검증
5. **리뷰 제출**: POST `/api/reviews` 호출 후 리뷰 조회 페이지로 리다이렉트

### 1.3 설계 원칙

- ✅ PRD와 UC-002 유스케이스에 명시된 기능만 구현
- ✅ 공통 모듈(`/docs/common-modules.md`)에 구현된 API 활용
- ✅ DRY 원칙 준수 (기존 코드 재사용)
- ✅ 모든 컴포넌트는 Client Component (`"use client"`)
- ❌ 오버엔지니어링 배제 (평점, 이미지 업로드 등 제외)

---

## 2. 프로젝트 상태 분석

### 2.1 이미 구현된 공통 모듈

#### 2.1.1 백엔드 API (완료)

| API | 경로 | 메서드 | 파일 위치 |
|-----|------|--------|----------|
| 리뷰 생성 | `/api/reviews` | POST | `src/features/reviews/backend/route.ts` |
| 네이버 검색 프록시 | `/api/naver/search/local` | GET | `src/features/naver-proxy/backend/route.ts` |

#### 2.1.2 공통 타입 및 스키마 (완료)

| 파일 | 용도 |
|------|------|
| `src/features/reviews/lib/dto.ts` | `CreateReviewRequest`, `ReviewResponse` 타입 |
| `src/features/naver-proxy/lib/dto.ts` | `SearchResponse` 타입 |
| `src/lib/schemas/common.ts` | `NaverSearchItemSchema`, `CoordinateSchema` |

#### 2.1.3 유틸리티 함수 (완료)

| 파일 | 함수 |
|------|------|
| `src/lib/utils/naver.ts` | `convertNaverCoordinates()`, `stripHtmlTags()` |
| `src/lib/utils/date.ts` | `formatRelativeTime()`, `formatAbsoluteTime()` |
| `src/lib/utils/text.ts` | `truncateText()` |

#### 2.1.4 shadcn-ui 컴포넌트 (확인 필요)

리뷰 작성 페이지에 필요한 컴포넌트:
- ✅ `button` (기존 설치됨)
- ✅ `card` (기존 설치됨)
- ✅ `input` (기존 설치됨)
- ✅ `textarea` (기존 설치됨)
- ✅ `form` (기존 설치됨)
- ✅ `label` (기존 설치됨)
- ✅ `toast` (기존 설치됨)

### 2.2 구현 필요 항목

#### 2.2.1 페이지 컴포넌트
- `src/app/review/new/page.tsx` (메인 페이지)

#### 2.2.2 Feature-specific 컴포넌트
- `src/features/reviews/components/PlaceInfoCard.tsx` (음식점 정보 카드)
- `src/features/reviews/components/ReviewForm.tsx` (리뷰 작성 폼)

#### 2.2.3 Feature-specific Hooks
- `src/features/reviews/hooks/useCreateReview.ts` (리뷰 생성 React Query hook)

---

## 3. 페이지 구조 설계

### 3.1 URL 구조

```
/review/new?placeId={naverPlaceId}&placeName={name}&address={address}&lat={latitude}&lng={longitude}
```

**Query Parameters**:
| 파라미터 | 타입 | 필수 | 설명 |
|---------|------|------|------|
| `placeId` | string | ✅ | 네이버 장소 고유 ID |
| `placeName` | string | ✅ | 음식점 이름 |
| `address` | string | ✅ | 주소 |
| `lat` | number | ✅ | 위도 (33-43) |
| `lng` | number | ✅ | 경도 (124-132) |

### 3.2 컴포넌트 계층 구조

```
/review/new/page.tsx (Client Component)
├── PlaceInfoCard (음식점 정보 + Static Map)
│   ├── Card (shadcn-ui)
│   ├── CardHeader
│   ├── CardContent
│   │   ├── 음식점 이름 (h2)
│   │   ├── 주소 (p)
│   │   └── StaticMapImage (img)
│   └── CardFooter (선택)
└── ReviewForm (리뷰 작성 폼)
    ├── Form (shadcn-ui + react-hook-form)
    ├── FormField (제목)
    │   ├── FormLabel
    │   ├── FormControl (Input)
    │   └── FormMessage (에러 메시지)
    ├── FormField (내용)
    │   ├── FormLabel
    │   ├── FormControl (Textarea)
    │   └── FormMessage (에러 메시지)
    └── Button (제출 버튼)
```

---

## 4. 단계별 구현 계획

### 4.1 Phase 1: 페이지 기본 구조 및 Query Parameter 처리

#### 4.1.1 파일 생성

**`src/app/review/new/page.tsx`**

**구현 내용**:
1. `"use client"` 지시어 추가
2. `useSearchParams`로 쿼리 파라미터 추출
3. 쿼리 파라미터 유효성 검증 (zod)
4. 필수 파라미터 누락 시 메인 페이지로 리다이렉트
5. 레이아웃 구조 (Responsive Grid)

**주요 로직**:
```typescript
"use client";

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { z } from 'zod';

// 쿼리 파라미터 스키마
const QueryParamsSchema = z.object({
  placeId: z.string().min(1),
  placeName: z.string().min(1),
  address: z.string().min(1),
  lat: z.coerce.number().min(33).max(43),
  lng: z.coerce.number().min(124).max(132),
});

type QueryParams = z.infer<typeof QueryParamsSchema>;

export default function ReviewNewPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [placeInfo, setPlaceInfo] = useState<QueryParams | null>(null);

  useEffect(() => {
    const params = {
      placeId: searchParams.get('placeId'),
      placeName: searchParams.get('placeName'),
      address: searchParams.get('address'),
      lat: searchParams.get('lat'),
      lng: searchParams.get('lng'),
    };

    const parsed = QueryParamsSchema.safeParse(params);

    if (!parsed.success) {
      // 필수 파라미터 누락 시 메인 페이지로 리다이렉트
      router.replace('/');
      return;
    }

    setPlaceInfo(parsed.data);
  }, [searchParams, router]);

  if (!placeInfo) {
    return <div>Loading...</div>; // 또는 Skeleton UI
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">리뷰 작성</h1>
      {/* PlaceInfoCard 컴포넌트 */}
      {/* ReviewForm 컴포넌트 */}
    </div>
  );
}
```

**참조**:
- `useSearchParams`: Next.js 16 App Router
- `z.coerce.number()`: 쿼리 파라미터는 문자열이므로 숫자로 변환

---

### 4.2 Phase 2: 음식점 정보 카드 컴포넌트 (PlaceInfoCard)

#### 4.2.1 파일 생성

**`src/features/reviews/components/PlaceInfoCard.tsx`**

**구현 내용**:
1. 음식점 이름, 주소 표시
2. 네이버 Static Map API 이미지 렌더링
3. 반응형 디자인 (모바일 우선)

**Static Map API URL 생성**:
```typescript
const buildStaticMapUrl = (lat: number, lng: number): string => {
  const clientId = process.env.NEXT_PUBLIC_NCP_CLIENT_ID;
  const baseUrl = 'https://naveropenapi.apigw.ntruss.com/map-static/v2/raster';
  const params = new URLSearchParams({
    w: '600',
    h: '300',
    scale: '2',
    markers: `type:d|size:mid|pos:${lng}%20${lat}`,
    center: `${lng},${lat}`,
    level: '16',
  });

  // Referer 검증 방식 사용
  // NCP 콘솔에서 Web service URL 등록 필수
  return `${baseUrl}?${params.toString()}&X-NCP-APIGW-API-KEY-ID=${clientId}`;
};
```

**컴포넌트 코드**:
```typescript
"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';

interface PlaceInfoCardProps {
  name: string;
  address: string;
  lat: number;
  lng: number;
}

export const PlaceInfoCard = ({ name, address, lat, lng }: PlaceInfoCardProps) => {
  const staticMapUrl = buildStaticMapUrl(lat, lng);

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-xl">{name}</CardTitle>
        <p className="text-sm text-muted-foreground">{address}</p>
      </CardHeader>
      <CardContent>
        <div className="relative w-full h-[200px] md:h-[300px] rounded-md overflow-hidden">
          <Image
            src={staticMapUrl}
            alt={`${name} 위치`}
            fill
            className="object-cover"
            priority
            unoptimized // Static Map API는 외부 URL이므로 최적화 비활성화
          />
        </div>
      </CardContent>
    </Card>
  );
};

const buildStaticMapUrl = (lat: number, lng: number): string => {
  const clientId = process.env.NEXT_PUBLIC_NCP_CLIENT_ID;
  if (!clientId) {
    throw new Error('NEXT_PUBLIC_NCP_CLIENT_ID is not defined');
  }

  const baseUrl = 'https://naveropenapi.apigw.ntruss.com/map-static/v2/raster';
  const params = new URLSearchParams({
    w: '600',
    h: '300',
    scale: '2',
    markers: `type:d|size:mid|pos:${lng}%20${lat}`,
    center: `${lng},${lat}`,
    level: '16',
  });

  return `${baseUrl}?${params.toString()}&X-NCP-APIGW-API-KEY-ID=${clientId}`;
};
```

**주의사항**:
- NCP 콘솔에서 **Web service URL 등록 필수** (Referer 검증)
- `NEXT_PUBLIC_NCP_CLIENT_ID`는 클라이언트에 노출되므로 Referer 검증으로 보안 보완
- `unoptimized` 플래그로 Next.js 이미지 최적화 비활성화 (외부 URL)

---

### 4.3 Phase 3: 리뷰 작성 폼 컴포넌트 (ReviewForm)

#### 4.3.1 Zod 스키마 정의

**`src/features/reviews/schemas/review-form.ts`** (신규 생성)

```typescript
import { z } from 'zod';

export const ReviewFormSchema = z.object({
  title: z
    .string()
    .min(1, { message: '제목을 입력해주세요' })
    .max(50, { message: '제목은 최대 50자까지 입력 가능합니다' }),
  content: z
    .string()
    .min(1, { message: '내용을 입력해주세요' })
    .max(500, { message: '내용은 최대 500자까지 입력 가능합니다' }),
});

export type ReviewFormValues = z.infer<typeof ReviewFormSchema>;
```

#### 4.3.2 리뷰 생성 Hook

**`src/features/reviews/hooks/useCreateReview.ts`** (신규 생성)

```typescript
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner'; // 또는 shadcn-ui toast
import { apiClient } from '@/lib/remote/api-client';
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
    onSuccess: (response, variables) => {
      toast.success('리뷰가 등록되었습니다');
      // 리뷰 조회 페이지로 리다이렉트
      router.push(`/review/${variables.naverPlaceId}`);
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || '리뷰 등록에 실패했습니다. 다시 시도해주세요';
      toast.error(message);
    },
  });
};
```

**참조**:
- `apiClient`는 `src/lib/remote/api-client.ts`에 정의되어 있음 (공통 모듈)
- `toast`는 shadcn-ui의 toast 컴포넌트 사용

#### 4.3.3 ReviewForm 컴포넌트

**`src/features/reviews/components/ReviewForm.tsx`** (신규 생성)

```typescript
"use client";

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
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
      title: '',
      content: '',
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
      title: values.title,
      content: values.content,
    };

    createReview.mutate(request);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>제목 *</FormLabel>
              <FormControl>
                <Input
                  placeholder="리뷰 제목을 입력하세요 (최대 50자)"
                  {...field}
                  maxLength={50}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>내용 *</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="리뷰 내용을 입력하세요 (최대 500자)"
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

        <div className="flex gap-4">
          <Button
            type="submit"
            disabled={createReview.isPending}
            className="flex-1"
          >
            {createReview.isPending ? '등록 중...' : '리뷰 등록'}
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
```

**주요 기능**:
1. `react-hook-form` + `zod`를 활용한 폼 관리
2. 실시간 글자 수 카운터 (500자 제한)
3. 제출 중 버튼 비활성화 (`isPending`)
4. 취소 버튼 (뒤로가기)

---

### 4.4 Phase 4: 페이지 통합 및 에러 처리

#### 4.4.1 page.tsx 최종 코드

**`src/app/review/new/page.tsx`**

```typescript
"use client";

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { z } from 'zod';
import { PlaceInfoCard } from '@/features/reviews/components/PlaceInfoCard';
import { ReviewForm } from '@/features/reviews/components/ReviewForm';
import { Skeleton } from '@/components/ui/skeleton';

const QueryParamsSchema = z.object({
  placeId: z.string().min(1),
  placeName: z.string().min(1),
  address: z.string().min(1),
  lat: z.coerce.number().min(33).max(43),
  lng: z.coerce.number().min(124).max(132),
});

type QueryParams = z.infer<typeof QueryParamsSchema>;

export default function ReviewNewPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [placeInfo, setPlaceInfo] = useState<QueryParams | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const params = {
      placeId: searchParams.get('placeId'),
      placeName: searchParams.get('placeName'),
      address: searchParams.get('address'),
      lat: searchParams.get('lat'),
      lng: searchParams.get('lng'),
    };

    const parsed = QueryParamsSchema.safeParse(params);

    if (!parsed.success) {
      console.error('Invalid query parameters:', parsed.error.format());
      router.replace('/');
      return;
    }

    setPlaceInfo(parsed.data);
    setIsLoading(false);
  }, [searchParams, router]);

  if (isLoading || !placeInfo) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Skeleton className="h-8 w-48 mb-6" />
        <Skeleton className="h-64 w-full mb-6" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">리뷰 작성</h1>

      <PlaceInfoCard
        name={placeInfo.placeName}
        address={placeInfo.address}
        lat={placeInfo.lat}
        lng={placeInfo.lng}
      />

      <ReviewForm
        naverPlaceId={placeInfo.placeId}
        placeName={placeInfo.placeName}
        address={placeInfo.address}
        latitude={placeInfo.lat}
        longitude={placeInfo.lng}
      />
    </div>
  );
}
```

**에러 처리**:
1. 쿼리 파라미터 누락/잘못된 형식 → 메인 페이지로 리다이렉트
2. API 호출 실패 → `useCreateReview` hook에서 toast 에러 메시지 표시
3. 네트워크 오류 → axios interceptor에서 처리 (공통 모듈)

---

## 5. 디렉토리 구조

### 5.1 생성할 파일 목록

```
src/
├── app/
│   └── review/
│       └── new/
│           └── page.tsx                          # [신규] 메인 페이지
├── features/
│   └── reviews/
│       ├── components/
│       │   ├── PlaceInfoCard.tsx                 # [신규] 음식점 정보 카드
│       │   └── ReviewForm.tsx                    # [신규] 리뷰 작성 폼
│       ├── hooks/
│       │   └── useCreateReview.ts                # [신규] 리뷰 생성 hook
│       └── schemas/
│           └── review-form.ts                    # [신규] 폼 스키마
```

### 5.2 기존 파일 (재사용)

```
src/
├── features/
│   ├── reviews/
│   │   ├── backend/
│   │   │   ├── route.ts                          # [기존] POST /api/reviews
│   │   │   ├── service.ts                        # [기존] createReview()
│   │   │   └── schema.ts                         # [기존] CreateReviewRequestSchema
│   │   └── lib/
│   │       └── dto.ts                            # [기존] CreateReviewRequest 타입
│   └── naver-proxy/
│       └── backend/
│           └── route.ts                          # [기존] GET /api/naver/search/local
├── lib/
│   ├── remote/
│   │   └── api-client.ts                         # [기존] axios 클라이언트
│   ├── utils/
│   │   ├── naver.ts                              # [기존] convertNaverCoordinates()
│   │   ├── date.ts                               # [기존] formatRelativeTime()
│   │   └── text.ts                               # [기존] truncateText()
│   └── schemas/
│       └── common.ts                             # [기존] CoordinateSchema
└── components/
    └── ui/                                       # [기존] shadcn-ui 컴포넌트들
        ├── button.tsx
        ├── card.tsx
        ├── form.tsx
        ├── input.tsx
        ├── textarea.tsx
        ├── skeleton.tsx
        └── toast.tsx (또는 sonner)
```

---

## 6. 데이터 흐름

### 6.1 페이지 진입 시

```
1. 사용자가 /review/new?placeId=xxx&... 접근
   ↓
2. page.tsx에서 useSearchParams로 쿼리 파라미터 추출
   ↓
3. QueryParamsSchema로 유효성 검증
   ↓
4. 검증 실패 시 → 메인 페이지로 리다이렉트
   검증 성공 시 → placeInfo state에 저장
   ↓
5. PlaceInfoCard + ReviewForm 렌더링
```

### 6.2 리뷰 제출 시

```
1. 사용자가 제목, 내용 입력 후 "리뷰 등록" 클릭
   ↓
2. ReviewForm에서 react-hook-form 유효성 검증
   ↓
3. 검증 실패 시 → 필드별 에러 메시지 표시
   검증 성공 시 → useCreateReview hook 호출
   ↓
4. useMutation으로 POST /api/reviews 호출
   ↓
5. 백엔드 (src/features/reviews/backend/route.ts)
   ├─ Zod 스키마 검증
   ├─ places 테이블에 음식점 정보 저장 (중복 시 재사용)
   └─ reviews 테이블에 리뷰 저장
   ↓
6. 응답 수신
   ├─ 성공 (201 Created)
   │   ├─ Toast: "리뷰가 등록되었습니다"
   │   └─ 리다이렉트: /review/{naverPlaceId}
   └─ 실패 (4xx/5xx)
       └─ Toast: 에러 메시지 표시
```

---

## 7. API 연동

### 7.1 사용할 API

#### 7.1.1 리뷰 생성 API

**엔드포인트**: `POST /api/reviews`

**Request Body** (`CreateReviewRequest`):
```typescript
{
  naverPlaceId: string;
  placeName: string;
  address: string;
  latitude: number;
  longitude: number;
  title: string;
  content: string;
}
```

**Response** (성공 시):
```typescript
{
  success: true;
  data: {
    id: string; // UUID
    placeId: string; // UUID
    title: string;
    content: string;
    createdAt: string;
    updatedAt: string;
  }
}
```

**Response** (실패 시):
```typescript
{
  success: false;
  error: {
    code: string;
    message: string;
  }
}
```

#### 7.1.2 네이버 Static Map API

**URL 구조**:
```
https://naveropenapi.apigw.ntruss.com/map-static/v2/raster?
  w=600&
  h=300&
  scale=2&
  markers=type:d|size:mid|pos:{lng}%20{lat}&
  center={lng},{lat}&
  level=16&
  X-NCP-APIGW-API-KEY-ID={clientId}
```

**인증 방식**: Referer 검증
- NCP 콘솔에서 Web service URL 등록 필수
- `NEXT_PUBLIC_NCP_CLIENT_ID` 환경변수 사용

---

## 8. 스타일링 및 반응형 디자인

### 8.1 레이아웃

- **Container**: `max-w-3xl` (최대 너비 768px)
- **Padding**: `px-4 py-8` (모바일), `px-6 py-12` (태블릿 이상)
- **Grid**: 단일 컬럼 (음식점 정보 카드 + 리뷰 폼)

### 8.2 반응형 브레이크포인트

| 디바이스 | 브레이크포인트 | Static Map 높이 |
|---------|---------------|----------------|
| 모바일 | < 768px | 200px |
| 태블릿/데스크톱 | ≥ 768px | 300px |

### 8.3 Tailwind CSS 클래스 예시

```css
/* 컨테이너 */
.container {
  @apply mx-auto px-4 py-8 max-w-3xl;
}

/* 제목 */
.title {
  @apply text-3xl font-bold mb-6;
}

/* 음식점 정보 카드 */
.place-info-card {
  @apply mb-6;
}

/* Static Map 이미지 */
.static-map {
  @apply relative w-full h-[200px] md:h-[300px] rounded-md overflow-hidden;
}

/* 리뷰 폼 */
.review-form {
  @apply space-y-6;
}

/* 버튼 */
.submit-button {
  @apply flex-1;
}

/* 취소 버튼 */
.cancel-button {
  @apply flex-1;
}
```

---

## 9. 에러 처리 및 예외 상황

### 9.1 클라이언트 측 에러 처리

| 에러 상황 | 처리 방법 | UI 표시 |
|----------|----------|---------|
| 쿼리 파라미터 누락 | 메인 페이지로 리다이렉트 | (없음) |
| 쿼리 파라미터 형식 오류 | 메인 페이지로 리다이렉트 | (없음) |
| 제목 빈값 | react-hook-form 에러 | "제목을 입력해주세요" |
| 제목 50자 초과 | react-hook-form 에러 | "제목은 최대 50자까지 입력 가능합니다" |
| 내용 빈값 | react-hook-form 에러 | "내용을 입력해주세요" |
| 내용 500자 초과 | react-hook-form 에러 | "내용은 최대 500자까지 입력 가능합니다" |

### 9.2 서버 측 에러 처리

| 에러 코드 | 상황 | 처리 방법 | Toast 메시지 |
|----------|------|----------|-------------|
| 400 Bad Request | 요청 스키마 검증 실패 | Toast 에러 표시 | "입력값을 확인해주세요" |
| 500 Internal Server Error | 데이터베이스 저장 실패 | Toast 에러 표시, 작성 내용 유지 | "리뷰 등록에 실패했습니다. 다시 시도해주세요" |
| Network Error | 네트워크 연결 끊김 | Toast 에러 표시, 재시도 버튼 | "네트워크 연결을 확인해주세요" |

### 9.3 Static Map API 에러 처리

| 에러 상황 | 처리 방법 |
|----------|----------|
| 이미지 로딩 실패 | `onError` 이벤트로 대체 이미지 표시 |
| 환경변수 누락 | console.error 로그, 빈 영역 표시 |

**대체 이미지 구현 예시**:
```typescript
<Image
  src={staticMapUrl}
  alt={`${name} 위치`}
  fill
  className="object-cover"
  priority
  unoptimized
  onError={(e) => {
    // 대체 이미지 또는 placeholder
    e.currentTarget.src = 'https://via.placeholder.com/600x300?text=지도를+불러올+수+없습니다';
  }}
/>
```

---

## 10. 테스트 시나리오

### 10.1 수동 테스트 체크리스트

#### 10.1.1 정상 플로우
- [ ] 메인 페이지에서 음식점 검색 후 선택 시 `/review/new?...` 로 이동
- [ ] 음식점 정보 카드가 정상 렌더링 (이름, 주소, Static Map)
- [ ] 제목 입력란에 1-50자 입력 가능
- [ ] 내용 입력란에 1-500자 입력 가능
- [ ] 글자 수 카운터 실시간 업데이트
- [ ] "리뷰 등록" 버튼 클릭 시 API 호출
- [ ] 성공 시 "리뷰가 등록되었습니다" Toast 표시
- [ ] 리뷰 조회 페이지로 리다이렉트

#### 10.1.2 에러 플로우
- [ ] 쿼리 파라미터 없이 직접 `/review/new` 접근 시 메인 페이지로 리다이렉트
- [ ] 제목 빈값으로 제출 시 "제목을 입력해주세요" 에러 표시
- [ ] 제목 51자 입력 시 maxLength로 입력 차단
- [ ] 내용 빈값으로 제출 시 "내용을 입력해주세요" 에러 표시
- [ ] 내용 501자 입력 시 maxLength로 입력 차단
- [ ] 네트워크 오류 시 "네트워크 연결을 확인해주세요" Toast 표시
- [ ] 제출 중 버튼 비활성화 및 "등록 중..." 텍스트 표시

#### 10.1.3 반응형 디자인
- [ ] 모바일 (< 768px) 에서 레이아웃 정상 표시
- [ ] 태블릿 (768px-1024px) 에서 레이아웃 정상 표시
- [ ] 데스크톱 (> 1024px) 에서 레이아웃 정상 표시
- [ ] Static Map 이미지 비율 유지

### 10.2 단위 테스트 (선택)

리뷰 작성 페이지는 비교적 단순한 CRUD 기능이므로 MVP에서는 수동 테스트로 충분합니다. 향후 필요 시 다음 테스트 추가 고려:

- `ReviewFormSchema` Zod 스키마 단위 테스트
- `useCreateReview` hook 모킹 테스트
- `PlaceInfoCard` 컴포넌트 렌더링 테스트

---

## 11. 성능 최적화

### 11.1 이미지 최적화

- **Static Map API**: `scale=2`로 고해상도 이미지 제공 (Retina 디스플레이 대응)
- **Next.js Image**: `priority` 플래그로 LCP 개선
- **unoptimized**: 외부 URL이므로 Next.js 이미지 최적화 비활성화

### 11.2 폼 성능

- **Debounce**: 글자 수 카운터는 실시간 업데이트하지만 API 호출은 제출 시에만 발생
- **useForm**: react-hook-form의 uncontrolled 컴포넌트 패턴으로 리렌더링 최소화

### 11.3 번들 크기

- **Tree Shaking**: react-hook-form, zod는 필요한 모듈만 import
- **Code Splitting**: Next.js App Router의 자동 코드 스플리팅 활용

---

## 12. 보안 고려사항

### 12.1 네이버 API 키 관리

| 환경변수 | 노출 범위 | 보안 방식 |
|---------|----------|---------|
| `NEXT_PUBLIC_NCP_CLIENT_ID` | 클라이언트 | Referer 검증 (NCP 콘솔에서 도메인 등록) |
| `NAVER_SEARCH_CLIENT_ID` | 서버 전용 | 클라이언트 노출 금지 |
| `NAVER_SEARCH_CLIENT_SECRET` | 서버 전용 | 클라이언트 노출 금지 |

### 12.2 입력 데이터 검증

- **클라이언트 측**: react-hook-form + zod (1차 검증)
- **서버 측**: Zod 스키마 재검증 (2차 검증)
- **SQL Injection 방지**: Supabase 파라미터 바인딩 사용

### 12.3 XSS 방지

- React의 기본 HTML 이스케이프 활용
- 사용자 입력은 텍스트로만 렌더링 (dangerouslySetInnerHTML 사용 안 함)

---

## 13. 기존 코드베이스와의 충돌 방지

### 13.1 충돌 가능성 분석

| 파일 | 상태 | 충돌 위험 |
|------|------|---------|
| `src/features/reviews/backend/*` | 이미 구현됨 (공통 모듈) | ❌ 없음 (읽기 전용) |
| `src/features/naver-proxy/backend/*` | 이미 구현됨 (공통 모듈) | ❌ 없음 (읽기 전용) |
| `src/lib/remote/api-client.ts` | 이미 구현됨 (공통 모듈) | ❌ 없음 (읽기 전용) |
| `src/components/ui/*` | shadcn-ui 컴포넌트 | ❌ 없음 (읽기 전용) |

### 13.2 네임스페이스 격리

- **페이지 컴포넌트**: `src/app/review/new/page.tsx` (다른 페이지와 독립)
- **Feature 컴포넌트**: `src/features/reviews/components/*` (reviews feature 내부)
- **Feature Hooks**: `src/features/reviews/hooks/*` (reviews feature 내부)
- **Feature Schemas**: `src/features/reviews/schemas/*` (reviews feature 내부)

### 13.3 공통 모듈 사용 규칙

1. ✅ 공통 모듈 파일은 **절대 수정 금지** (읽기 전용)
2. ✅ 공통 타입은 `lib/dto.ts`에서 import
3. ✅ 공통 유틸리티는 `src/lib/utils/*`에서 import
4. ✅ 백엔드 API는 `apiClient`를 통해 호출만

---

## 14. 구현 우선순위

### 14.1 P0 (필수)

- [x] Phase 1: 페이지 기본 구조 및 Query Parameter 처리
- [x] Phase 2: 음식점 정보 카드 컴포넌트 (PlaceInfoCard)
- [x] Phase 3: 리뷰 작성 폼 컴포넌트 (ReviewForm)
- [x] Phase 4: 페이지 통합 및 에러 처리

### 14.2 P1 (권장)

- [ ] Skeleton UI 로딩 상태 추가
- [ ] Static Map API 에러 처리 (대체 이미지)
- [ ] Toast 메시지 스타일링

### 14.3 P2 (선택)

- [ ] 작성 중 내용 자동 저장 (localStorage)
- [ ] 리뷰 미리보기 기능
- [ ] 다크 모드 지원

---

## 15. 구현 체크리스트

### 15.1 파일 생성
- [ ] `src/app/review/new/page.tsx`
- [ ] `src/features/reviews/components/PlaceInfoCard.tsx`
- [ ] `src/features/reviews/components/ReviewForm.tsx`
- [ ] `src/features/reviews/hooks/useCreateReview.ts`
- [ ] `src/features/reviews/schemas/review-form.ts`

### 15.2 환경변수 확인
- [ ] `NEXT_PUBLIC_NCP_CLIENT_ID` 설정 확인
- [ ] NCP 콘솔에서 Web service URL 등록 확인

### 15.3 의존성 확인
- [ ] `@tanstack/react-query` 설치 확인
- [ ] `react-hook-form` 설치 확인
- [ ] `@hookform/resolvers` 설치 확인
- [ ] `zod` 설치 확인
- [ ] shadcn-ui 컴포넌트 설치 확인

### 15.4 테스트
- [ ] 정상 플로우 테스트 (10.1.1)
- [ ] 에러 플로우 테스트 (10.1.2)
- [ ] 반응형 디자인 테스트 (10.1.3)

---

## 16. 예상 문제 및 해결 방안

### 16.1 Static Map API 인증 실패

**문제**: "인증 오류" 또는 빈 이미지 표시

**해결 방안**:
1. NCP 콘솔에서 Web service URL 등록 확인 (`http://localhost:3000`, 프로덕션 도메인)
2. `NEXT_PUBLIC_NCP_CLIENT_ID` 환경변수 확인
3. 브라우저 개발자 도구 Network 탭에서 응답 코드 확인
4. Referer 헤더가 올바르게 전송되는지 확인

### 16.2 리뷰 생성 API 호출 실패

**문제**: 400 Bad Request 또는 500 Internal Server Error

**해결 방안**:
1. Network 탭에서 Request Body 확인
2. 백엔드 로그에서 Zod 스키마 검증 오류 확인
3. 데이터베이스 연결 상태 확인 (Supabase Dashboard)
4. `CreateReviewRequest` 타입과 백엔드 스키마 일치 여부 확인

### 16.3 쿼리 파라미터 누락

**문제**: 메인 페이지로 계속 리다이렉트

**해결 방안**:
1. 메인 페이지에서 검색 결과 클릭 시 올바른 URL 생성 확인
2. 브라우저 주소창에서 쿼리 파라미터 확인
3. `QueryParamsSchema` 검증 로직 확인

---

## 17. 다음 단계

### 17.1 이 페이지 완료 후

1. **리뷰 조회 페이지 구현** (`/review/[placeId]`)
   - 리뷰 목록 렌더링
   - 리뷰 삭제 기능
   - 네이버 지도 마커 표시

2. **메인 페이지 통합**
   - 검색 결과에서 `/review/new?...` 링크 생성
   - 맛집 카드 리스트에 리뷰 작성 버튼 추가

### 17.2 통합 테스트

1. 메인 페이지 → 리뷰 작성 페이지 → 리뷰 조회 페이지 플로우 테스트
2. E2E 테스트 (Playwright 또는 Cypress)
3. 성능 테스트 (Lighthouse)

---

## 18. 참고 문서

- [PRD 문서](../../prd.md)
- [User Flow 문서](../../userflow.md) - 플로우 2
- [Database 설계 문서](../../database.md)
- [공통 모듈 작업 계획](../../common-modules.md)
- [유스케이스 UC-002](../../usecases/2-review-create/spec.md)
- [네이버 Static Map API 공식 문서](https://api.ncloud-docs.com/docs/ai-naver-mapsstaticmap-raster)
- [react-hook-form 공식 문서](https://react-hook-form.com/)
- [shadcn-ui 공식 문서](https://ui.shadcn.com/)

---

## 19. 변경 이력

| 버전 | 날짜 | 작성자 | 변경 내용 |
|-----|------|--------|----------|
| 1.0 | 2025-10-23 | Claude | 초기 구현 계획 작성 |

---

**승인**:
- [ ] Tech Lead
- [ ] Frontend Developer
- [ ] Backend Developer

---

**다음 실행 단계**:
1. 이 문서를 팀원들과 리뷰
2. 환경변수 및 NCP 콘솔 설정 확인
3. Phase 1부터 순차적으로 구현 시작
4. 각 Phase 완료 후 체크리스트 업데이트
