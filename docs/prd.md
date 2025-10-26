# Product Requirements Document (PRD)
## 맛집 리뷰 플랫폼

---

## 문서 정보

- **작성일**: 2025-10-22
- **버전**: 1.0
- **프로젝트명**: 맛집 리뷰 플랫폼
- **타겟 런칭**: MVP (Minimum Viable Product)

---

## 1. 제품 개요

### 1.1 프로젝트 목표

간단하고 직관적인 위치 기반 맛집 리뷰 플랫폼을 구축하여, 사용자가 네이버 지도 기반으로 음식점을 검색하고 리뷰를 작성/조회/삭제할 수 있도록 한다.

### 1.2 핵심 가치 제안

- **접근성**: 비로그인 상태에서 모든 기능 이용 가능 (진입 장벽 제거)
- **직관성**: 지도 중심의 시각적 UI로 위치 기반 맛집 탐색 용이
- **간결성**: 핵심 기능(검색, 작성, 조회, 삭제)에만 집중한 미니멀한 UX

### 1.3 제품 범위

**포함 범위**:
- 네이버 지도 API 기반 지도 뷰 및 마커 표시
- 네이버 Search API를 통한 음식점 검색
- 리뷰 CRUD (생성, 조회, 삭제)
- 위치 기반 맛집 카드 리스트

**제외 범위** (향후 고려):
- 사용자 인증 및 회원 관리
- 리뷰 수정 기능
- 좋아요/북마크 기능
- 사진 업로드
- 평점 시스템

---

## 2. Stakeholders

### 2.1 내부 이해관계자

| 역할 | 책임 | 주요 관심사 |
|------|------|------------|
| Product Owner | 제품 방향 결정, 우선순위 설정 | 사용자 가치, MVP 범위 |
| Tech Lead | 기술 스택 결정, 아키텍처 설계 | 확장성, 유지보수성 |
| Frontend Developer | UI/UX 구현 | 컴포넌트 재사용성, 성능 |
| Backend Developer | API 설계 및 구현 | 데이터 일관성, 보안 |

### 2.2 외부 이해관계자

| 역할 | 관심사 |
|------|--------|
| 일반 사용자 | 빠른 음식점 검색, 간편한 리뷰 작성 |
| 음식점 운영자 | 리뷰 신뢰성 (향후 고려사항) |

---

## 3. 타겟 사용자

### 3.1 Primary Persona

**김미식 (27세, 직장인)**
- 새로운 동네에 이사와서 주변 맛집 탐색 중
- 복잡한 회원가입 없이 빠르게 정보를 얻고 싶어함
- 모바일 웹에서 지도 보면서 주변 음식점 검색 선호

**Pain Points**:
- 기존 플랫폼은 회원가입이 필수라 진입 장벽이 높음
- 너무 많은 기능 때문에 원하는 정보를 빠르게 찾기 어려움

**Gain**:
- 지도로 시각적으로 위치 파악 가능
- 회원가입 없이 즉시 이용 가능
- 간결한 UI로 원하는 정보에 빠르게 접근

### 3.2 Secondary Persona

**이탐험 (32세, 맛집 탐방 취미)**
- 주말마다 새로운 음식점 발굴
- 간단한 메모 형식으로 기록 남기기 선호
- 나중에 다시 방문하기 위해 리뷰 확인

---

## 4. 주요 기능 명세

### 4.1 기능 우선순위

| 우선순위 | 기능 | 설명 | 구현 필수도 |
|---------|------|------|-----------|
| P0 | 지도 표시 | 네이버 지도 API 연동, 초기 위치 설정 | 필수 |
| P0 | 음식점 검색 | 네이버 Search API(Local) 연동 | 필수 |
| P0 | 리뷰 조회 | 맛집별 리뷰 목록 표시 | 필수 |
| P0 | 리뷰 작성 | 음식점 검색 후 리뷰 생성 | 필수 |
| P1 | 리뷰 삭제 | 작성한 리뷰 삭제 | 필수 |
| P1 | 맛집 카드 리스트 | 리뷰가 있는 맛집 카드 형식 표시 | 필수 |
| P2 | 반응형 디자인 | 모바일/태블릿/데스크톱 대응 | 권장 |

### 4.2 페이지별 상세 기능

#### 4.2.1 메인 페이지 (`/`)

**레이아웃 구성** (상단 → 하단):

```
┌─────────────────────────────────────┐
│  1. 서비스 소개 섹션 (Hero)          │
├─────────────────────────────────────┤
│  2. 네이버 지도 (Interactive Map)    │
├─────────────────────────────────────┤
│  3. 맛집 카드 리스트 (Grid/List)     │
├─────────────────────────────────────┤
│  4. 음식점 검색 입력창 (Search Bar)  │
└─────────────────────────────────────┘
```

**기능 명세**:

1. **서비스 소개 섹션**
   - 서비스명 및 캐치프레이즈
   - 간단한 사용 가이드 (1-2줄)

2. **지도 뷰**
   - 네이버 Maps JavaScript API v3 사용
   - 초기 중심 좌표: 서울 시청 (lat: 37.5665, lng: 126.9780)
   - 줌 레벨: 13
   - 리뷰가 있는 음식점에 마커 표시
   - 마커 클릭 시 해당 음식점 리뷰 페이지로 이동

3. **맛집 카드 리스트**
   - 리뷰가 1개 이상 있는 음식점만 표시
   - 카드당 정보:
     - 음식점명
     - 주소
     - 리뷰 개수
     - 최근 리뷰 미리보기 (1줄, 말줄임)
   - 카드 클릭 시 해당 음식점 리뷰 페이지로 이동
   - 기본 정렬: 리뷰 개수 내림차순

4. **검색창**
   - 음식점명 입력
   - 디바운스 적용 (500ms)
   - 검색 결과 드롭다운 표시 (네이버 Search API 응답)
   - 검색 결과 항목 클릭 시 리뷰 작성 페이지로 이동

#### 4.2.2 리뷰 작성 페이지 (`/review/new?placeId=xxx&placeName=xxx&address=xxx&lat=xxx&lng=xxx`)

**URL 쿼리 파라미터**:
- `placeId`: 네이버 검색 API의 고유 ID
- `placeName`: 음식점명
- `address`: 주소
- `lat`: 위도
- `lng`: 경도

**UI 구성**:

```
┌─────────────────────────────────────┐
│  음식점 정보 카드                    │
│  - 음식점명                         │
│  - 주소                             │
│  - 작은 지도 (Static Map)           │
├─────────────────────────────────────┤
│  리뷰 작성 폼                       │
│  - 제목 (필수, max 50자)            │
│  - 내용 (필수, max 500자)           │
│  - 제출 버튼                        │
└─────────────────────────────────────┘
```

**동작**:
1. 쿼리 파라미터로 받은 음식점 정보 표시
2. Static Map API로 작은 지도 이미지 생성
3. 유효성 검사:
   - 제목: 1-50자
   - 내용: 1-500자
4. 제출 성공 시 해당 음식점 리뷰 조회 페이지로 리다이렉트

#### 4.2.3 리뷰 조회 페이지 (`/review/[placeId]`)

**URL 파라미터**:
- `placeId`: 음식점 고유 ID

**UI 구성**:

```
┌─────────────────────────────────────┐
│  음식점 정보 헤더                    │
│  - 음식점명                         │
│  - 주소                             │
│  - 지도 (네이버 Maps SDK, 마커)     │
├─────────────────────────────────────┤
│  리뷰 목록 (리스트)                  │
│  ┌───────────────────────────────┐  │
│  │ 리뷰 카드 1                   │  │
│  │ - 제목                        │  │
│  │ - 내용                        │  │
│  │ - 작성일                      │  │
│  │ - 삭제 버튼                   │  │
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │ 리뷰 카드 2                   │  │
│  └───────────────────────────────┘  │
├─────────────────────────────────────┤
│  리뷰 작성 버튼 (Floating)          │
└─────────────────────────────────────┘
```

**동작**:
1. `placeId`로 해당 음식점의 모든 리뷰 조회
2. 리뷰 정렬: 최신순 (작성일 내림차순)
3. 리뷰가 없는 경우: "아직 리뷰가 없습니다" 메시지 + 작성 유도 버튼
4. 삭제 버튼 클릭 시:
   - 확인 다이얼로그 표시
   - 삭제 성공 시 리스트 갱신

#### 4.2.4 리뷰 삭제 (기능)

**트리거**: 리뷰 조회 페이지의 각 리뷰 카드 내 삭제 버튼

**동작 흐름**:
1. 사용자가 삭제 버튼 클릭
2. 확인 다이얼로그 표시: "정말 삭제하시겠습니까?"
3. 확인 시 DELETE API 호출
4. 성공 시:
   - Toast 알림: "리뷰가 삭제되었습니다"
   - 리뷰 목록 갱신
5. 실패 시:
   - Toast 알림: "삭제에 실패했습니다"

---

## 5. 사용자 여정 (User Journey)

### 5.1 Scenario 1: 새로운 맛집 찾기 및 리뷰 작성

**타겟 유저**: 김미식 (새로운 동네 거주자)

**여정**:

```
1. [메인 페이지 진입]
   └─> URL: /
   └─> 서비스 소개 확인
   └─> 지도로 주변 리뷰가 있는 맛집 위치 파악

2. [음식점 검색]
   └─> 하단 검색창에 "홍대 파스타" 입력
   └─> 디바운스 후 검색 결과 드롭다운 표시
   └─> "○○ 이탈리안 레스토랑" 선택

3. [리뷰 작성 페이지 이동]
   └─> URL: /review/new?placeId=xxx&placeName=xxx&...
   └─> 음식점 정보 및 작은 지도 확인
   └─> 제목: "파스타가 정말 맛있어요"
   └─> 내용: "크림 파스타 추천합니다. 양도 푸짐하고..."
   └─> 제출 버튼 클릭

4. [리뷰 조회 페이지로 리다이렉트]
   └─> URL: /review/[placeId]
   └─> 방금 작성한 리뷰 확인
   └─> 다른 사용자들의 리뷰도 함께 확인
```

**터치포인트**: 메인 페이지 → 검색 → 리뷰 작성 → 리뷰 조회

---

### 5.2 Scenario 2: 리뷰 탐색 및 삭제

**타겟 유저**: 이탐험 (맛집 탐방가)

**여정**:

```
1. [메인 페이지 진입]
   └─> URL: /
   └─> 지도에서 마커 클릭하여 관심 맛집 확인

2. [맛집 카드 리스트에서 선택]
   └─> 리뷰가 많은 맛집 카드 클릭
   └─> 리뷰 조회 페이지로 이동

3. [리뷰 조회 페이지]
   └─> URL: /review/[placeId]
   └─> 다른 사용자들의 리뷰 확인
   └─> 예전에 자신이 작성한 리뷰 발견
   └─> "이제 생각이 바뀌었네..." → 삭제 결정

4. [리뷰 삭제]
   └─> 해당 리뷰의 삭제 버튼 클릭
   └─> 확인 다이얼로그: "정말 삭제하시겠습니까?"
   └─> 확인 클릭
   └─> "리뷰가 삭제되었습니다" Toast 표시
   └─> 리뷰 목록 갱신 (삭제된 리뷰 사라짐)
```

**터치포인트**: 메인 페이지 → 리뷰 조회 → 리뷰 삭제

---

### 5.3 Scenario 3: 지도 기반 탐색

**타겟 유저**: 김미식 (주변 맛집 탐색)

**여정**:

```
1. [메인 페이지 진입]
   └─> URL: /
   └─> 지도에 리뷰가 있는 맛집 마커들 표시됨

2. [지도 마커 클릭]
   └─> 마커 클릭 시 간단한 정보창 (InfoWindow) 표시
   └─> "자세히 보기" 또는 마커 재클릭

3. [리뷰 조회 페이지 이동]
   └─> URL: /review/[placeId]
   └─> 해당 맛집의 모든 리뷰 확인
   └─> 마음에 들면 직접 방문 계획
```

**터치포인트**: 메인 페이지 → 지도 마커 → 리뷰 조회

---

## 6. 정보 아키텍처 (IA)

### 6.1 사이트맵 (Tree 구조)

```
ROOT (/)
│
├─ 메인 페이지 [/]
│  ├─ 서비스 소개 섹션
│  ├─ 네이버 지도 뷰
│  │  └─ 마커 클릭 → /review/[placeId]
│  ├─ 맛집 카드 리스트
│  │  └─ 카드 클릭 → /review/[placeId]
│  └─ 음식점 검색창
│     └─ 검색 결과 선택 → /review/new?...
│
├─ 리뷰 작성 페이지 [/review/new]
│  ├─ Query Params:
│  │  - placeId
│  │  - placeName
│  │  - address
│  │  - lat, lng
│  ├─ 음식점 정보 카드
│  └─ 리뷰 작성 폼
│     └─ 제출 성공 → /review/[placeId]
│
└─ 리뷰 조회 페이지 [/review/[placeId]]
   ├─ 음식점 정보 헤더
   ├─ 지도 (마커 포함)
   ├─ 리뷰 목록
   │  └─ 각 리뷰 카드
   │     └─ 삭제 버튼 → DELETE API → 페이지 갱신
   └─ 리뷰 작성 버튼
      └─ /review/new?...
```

### 6.2 페이지 간 데이터 흐름

```
┌───────────────┐
│   메인 페이지  │
│      (/)      │
└───────┬───────┘
        │
        ├─ 검색 결과 선택 (placeId, placeName, address, lat, lng)
        │  ↓
        │  ┌─────────────────┐
        │  │ 리뷰 작성 페이지 │
        │  │  /review/new    │
        │  └────────┬────────┘
        │           │
        │           └─ 리뷰 생성 (placeId, title, content)
        │              ↓
        │              ┌─────────────────┐
        └─────────────→│ 리뷰 조회 페이지 │←─ 마커/카드 클릭 (placeId)
                       │ /review/[placeId]│
                       └────────┬────────┘
                                │
                                └─ 리뷰 삭제 (reviewId)
                                   ↓
                                   페이지 갱신
```

---

## 7. 기술 스택

### 7.1 Frontend

| 기술 | 용도 | 버전 |
|------|------|------|
| Next.js | 프레임워크 (App Router) | 16.x |
| TypeScript | 타입 안전성 | 5.x |
| React | UI 라이브러리 | 19.x |
| Tailwind CSS | 스타일링 | 3.x |
| shadcn-ui | UI 컴포넌트 | Latest |
| @tanstack/react-query | 서버 상태 관리 | 5.x |
| zustand | 클라이언트 상태 관리 | 5.x |
| react-hook-form | 폼 관리 | 7.x |
| zod | 스키마 유효성 검사 | 3.x |
| lucide-react | 아이콘 | Latest |
| date-fns | 날짜 포맷팅 | 3.x |
| es-toolkit | 유틸리티 함수 | Latest |

### 7.2 Backend

| 기술 | 용도 | 버전 |
|------|------|------|
| Hono | API 라우터 | 4.x |
| Supabase | BaaS (데이터베이스, 인증 준비) | Latest |
| Zod | API 스키마 검증 | 3.x |

### 7.3 외부 API

| API | 용도 | 인증 방식 |
|-----|------|-----------|
| Naver Maps JavaScript API v3 | 지도 표시, 마커, Geocoder | Client ID (도메인 검증) |
| Naver Search API (Local) | 음식점 검색 | Client-Id/Secret (서버 프록시) |
| Naver Geocoding API | 주소↔좌표 변환 | NCP API Key (서버 프록시) |
| Naver Static Map API | 정적 지도 이미지 | Referer 검증 |

### 7.4 인프라

| 서비스 | 용도 |
|--------|------|
| Vercel | 호스팅 및 배포 |
| Supabase | PostgreSQL 데이터베이스 |
| Naver Cloud Platform | API 키 관리 |

---

## 8. 데이터 모델

### 8.1 ERD

```
┌─────────────────────────────────┐
│          places                 │
├─────────────────────────────────┤
│ id (UUID, PK)                   │
│ naver_place_id (TEXT, UNIQUE)   │ ← 네이버 검색 API의 고유 ID
│ name (TEXT, NOT NULL)           │
│ address (TEXT, NOT NULL)        │
│ latitude (NUMERIC)              │
│ longitude (NUMERIC)             │
│ created_at (TIMESTAMPTZ)        │
│ updated_at (TIMESTAMPTZ)        │
└─────────────┬───────────────────┘
              │
              │ 1:N
              │
┌─────────────▼───────────────────┐
│          reviews                │
├─────────────────────────────────┤
│ id (UUID, PK)                   │
│ place_id (UUID, FK)             │ → places.id
│ title (TEXT, NOT NULL)          │
│ content (TEXT, NOT NULL)        │
│ created_at (TIMESTAMPTZ)        │
│ updated_at (TIMESTAMPTZ)        │
└─────────────────────────────────┘
```

### 8.2 테이블 상세

#### 8.2.1 places 테이블

```sql
CREATE TABLE IF NOT EXISTS places (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  naver_place_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  latitude NUMERIC(10, 7),
  longitude NUMERIC(10, 7),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_places_naver_id ON places(naver_place_id);
CREATE INDEX idx_places_location ON places(latitude, longitude);
```

**컬럼 설명**:
- `naver_place_id`: 네이버 Search API 응답의 고유 ID (중복 방지)
- `latitude`, `longitude`: 지도 마커 표시용 좌표

#### 8.2.2 reviews 테이블

```sql
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  place_id UUID NOT NULL REFERENCES places(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (char_length(title) <= 50),
  content TEXT NOT NULL CHECK (char_length(content) <= 500),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_reviews_place_id ON reviews(place_id);
CREATE INDEX idx_reviews_created_at ON reviews(created_at DESC);
```

**컬럼 설명**:
- `place_id`: 외래 키 (CASCADE 삭제)
- `title`: 최대 50자 제약
- `content`: 최대 500자 제약

---

## 9. API 명세

### 9.1 Backend API (Hono)

#### 9.1.1 리뷰 조회 (특정 음식점)

```
GET /api/reviews?placeId={naver_place_id}
```

**Query Parameters**:
- `placeId` (string, required): 네이버 장소 고유 ID

**Response 200**:
```json
{
  "success": true,
  "data": {
    "place": {
      "id": "uuid",
      "naverPlaceId": "xxx",
      "name": "맛있는 식당",
      "address": "서울특별시...",
      "latitude": 37.5665,
      "longitude": 126.9780
    },
    "reviews": [
      {
        "id": "uuid",
        "title": "정말 맛있어요",
        "content": "파스타가...",
        "createdAt": "2025-10-22T12:00:00Z"
      }
    ]
  }
}
```

#### 9.1.2 리뷰 생성

```
POST /api/reviews
```

**Request Body**:
```json
{
  "naverPlaceId": "xxx",
  "placeName": "맛있는 식당",
  "address": "서울특별시...",
  "latitude": 37.5665,
  "longitude": 126.9780,
  "title": "정말 맛있어요",
  "content": "파스타가 정말 맛있습니다..."
}
```

**Validation (Zod)**:
- `title`: 1-50자
- `content`: 1-500자
- `naverPlaceId`, `placeName`, `address`: required

**Response 201**:
```json
{
  "success": true,
  "data": {
    "reviewId": "uuid",
    "placeId": "uuid"
  }
}
```

#### 9.1.3 리뷰 삭제

```
DELETE /api/reviews/:id
```

**Path Parameters**:
- `id` (UUID): 리뷰 ID

**Response 200**:
```json
{
  "success": true,
  "message": "리뷰가 삭제되었습니다"
}
```

#### 9.1.4 모든 리뷰가 있는 맛집 조회

```
GET /api/places/with-reviews
```

**Response 200**:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "naverPlaceId": "xxx",
      "name": "맛있는 식당",
      "address": "서울특별시...",
      "latitude": 37.5665,
      "longitude": 126.9780,
      "reviewCount": 5,
      "latestReview": {
        "title": "최근 리뷰",
        "content": "내용 미리보기...",
        "createdAt": "2025-10-22T12:00:00Z"
      }
    }
  ]
}
```

### 9.2 외부 API 프록시

#### 9.2.1 네이버 장소 검색

```
GET /api/search/local?q={query}
```

**Query Parameters**:
- `q` (string, required): 검색어

**Response 200** (네이버 API 응답 그대로 전달):
```json
{
  "items": [
    {
      "title": "<b>맛있는</b> 식당",
      "link": "...",
      "category": "음식점>한식",
      "address": "서울특별시...",
      "roadAddress": "서울특별시...",
      "mapx": "1269780",
      "mapy": "375665"
    }
  ]
}
```

**서버 구현**:
- `X-Naver-Client-Id`, `X-Naver-Client-Secret` 헤더 주입
- 환경변수에서 키 로드

#### 9.2.2 지오코딩 (선택)

```
GET /api/geocode?address={address}
```

**Response 200**:
```json
{
  "addresses": [
    {
      "x": "126.9780",
      "y": "37.5665"
    }
  ]
}
```

---

## 10. 비기능 요구사항

### 10.1 성능

| 지표 | 목표 | 측정 방법 |
|------|------|-----------|
| 초기 로딩 시간 (FCP) | < 2초 | Lighthouse |
| 지도 렌더링 시간 | < 1초 | 개발자 도구 Performance |
| API 응답 시간 | < 500ms | 서버 로그 |
| 검색 디바운스 | 500ms | 사용자 입력 후 대기 |

**최적화 전략**:
- Next.js 이미지 최적화 (`next/image`)
- React Query 캐싱 (staleTime: 5분)
- 지도 마커 클러스터링 (리뷰 맛집 100개 이상 시)

### 10.2 보안

| 항목 | 요구사항 | 구현 방법 |
|------|----------|-----------|
| API 키 보호 | 클라이언트 노출 금지 | 서버 프록시 (API Route) |
| 도메인 검증 | SDK 무단 사용 방지 | NCP 콘솔에 도메인 등록 |
| SQL Injection | 방지 | Supabase 쿼리 파라미터 바인딩 |
| XSS | HTML 이스케이프 | React 기본 보호 + DOMPurify (필요 시) |
| HTTPS | 전송 암호화 | Vercel 자동 SSL |

**네이버 API 키 관리**:
- `NEXT_PUBLIC_NCP_CLIENT_ID`: 클라이언트 SDK용 (도메인 검증)
- `NCP_CLIENT_ID`, `NCP_CLIENT_SECRET`: 서버 전용 (Geocoding, Static Map)
- `NAVER_SEARCH_CLIENT_ID`, `NAVER_SEARCH_CLIENT_SECRET`: 서버 전용 (Search API)

### 10.3 사용성 (UX)

| 항목 | 요구사항 |
|------|----------|
| 반응형 디자인 | 모바일 우선 (Mobile-first) |
| 접근성 | WCAG 2.1 Level AA (기본) |
| 로딩 상태 | 스켈레톤 UI 또는 스피너 표시 |
| 에러 처리 | 사용자 친화적 에러 메시지 (Toast) |
| 빈 상태 | "아직 리뷰가 없습니다" 안내 |

### 10.4 확장성

| 항목 | 고려사항 |
|------|----------|
| 데이터베이스 | Supabase PostgreSQL (수평 확장 가능) |
| API 트래픽 | Vercel Serverless (자동 스케일링) |
| 네이버 API 한도 | Search API 하루 25,000회 (초기 충분) |
| 지도 마커 | 100개 이상 시 클러스터링 적용 |

### 10.5 호환성

| 브라우저 | 버전 |
|---------|------|
| Chrome | 최신 2개 버전 |
| Safari | 최신 2개 버전 |
| Firefox | 최신 2개 버전 |
| Edge | 최신 2개 버전 |

**모바일 OS**:
- iOS 14+
- Android 10+

---

## 11. 제약사항 및 가정

### 11.1 제약사항

1. **비로그인 시스템**:
   - 리뷰 작성자를 특정할 수 없음 (IP 기반 제한 불가)
   - 악의적 리뷰 삭제/수정 방지 어려움
   - **대응**: MVP에서는 제약 수용, 향후 간단한 인증(이메일/전화번호) 추가 고려

2. **네이버 API 할당량**:
   - Search API: 하루 25,000회
   - Geocoding API: 하루 100,000회
   - **대응**: MVP 트래픽은 충분, 초과 시 캐싱 강화 또는 유료 플랜 전환

3. **리뷰 수정 기능 없음**:
   - 삭제 후 재작성만 가능
   - **대응**: 사용자 편의성 저하 수용 (MVP 범위 축소)

4. **Supabase RLS 미사용**:
   - Row-Level Security 비활성화
   - **대응**: 비로그인 시스템이므로 모든 데이터 공개 (개인정보 없음)

### 11.2 가정

1. **타겟 사용자는 모바일 웹 중심**으로 이용 (앱 개발 불필요)
2. **초기 사용자는 50명 이하**로 가정 (트래픽 부하 낮음)
3. **음식점 정보는 네이버 검색 API 결과를 신뢰**하며 별도 검증 불필요
4. **리뷰는 텍스트만 작성** (사진 업로드, 평점 등 추가 기능 제외)
5. **로컬 개발 환경은 localhost:3000**으로 통일

---

## 12. 출시 계획 및 마일스톤

### 12.1 Phase 1: MVP 개발 (2주)

**Week 1**:
- [ ] 프로젝트 세팅 (Next.js 16, Supabase, 환경변수)
- [ ] 네이버 API 키 발급 및 도메인 등록
- [ ] Supabase 마이그레이션 파일 작성 (`places`, `reviews` 테이블)
- [ ] 메인 페이지 UI 구현 (서비스 소개, 지도, 검색창)
- [ ] 네이버 Maps SDK 연동 및 마커 표시

**Week 2**:
- [ ] 검색 API 프록시 구현 (`/api/search/local`)
- [ ] 리뷰 작성 페이지 구현 및 API 연동 (`POST /api/reviews`)
- [ ] 리뷰 조회 페이지 구현 및 API 연동 (`GET /api/reviews`)
- [ ] 리뷰 삭제 기능 구현 (`DELETE /api/reviews/:id`)
- [ ] 맛집 카드 리스트 구현 (`GET /api/places/with-reviews`)

### 12.2 Phase 2: 테스트 및 최적화 (1주)

**Week 3**:
- [ ] E2E 테스트 (Playwright 또는 수동 테스트)
- [ ] 반응형 디자인 검증 (모바일/태블릿/데스크톱)
- [ ] 성능 최적화 (Lighthouse 점수 90 이상 목표)
- [ ] 에러 핸들링 강화 (Toast 알림, 재시도 로직)
- [ ] 배포 환경 세팅 (Vercel)

### 12.3 Phase 3: 런칭 및 모니터링 (진행 중)

**Week 4**:
- [ ] 프로덕션 배포 (Vercel)
- [ ] 도메인 등록 (NCP 콘솔에 프로덕션 URL 추가)
- [ ] 모니터링 세팅 (Vercel Analytics, Sentry)
- [ ] 사용자 피드백 수집 (Google Forms 또는 간단한 설문)

### 12.4 성공 지표 (KPI)

**정량적 지표**:
- 주간 활성 사용자(WAU): 10명 이상
- 총 리뷰 작성 수: 50개 이상
- 평균 세션 시간: 2분 이상
- 페이지 로딩 시간: 2초 이하

**정성적 지표**:
- 사용자 피드백 긍정 비율: 70% 이상
- 핵심 기능(검색, 작성, 조회) 오류율: 5% 이하

---

## 13. 향후 개선 계획 (Out of Scope)

### 13.1 Phase 4: 사용자 인증 도입

- 간단한 이메일 또는 전화번호 인증
- Supabase Auth 활용
- 리뷰 작성자별 삭제 권한 부여

### 13.2 Phase 5: 추가 기능

- [ ] 리뷰 수정 기능
- [ ] 사진 업로드 (Supabase Storage)
- [ ] 평점 시스템 (1-5점)
- [ ] 좋아요/북마크 기능
- [ ] 댓글 기능
- [ ] 음식점 카테고리 필터 (한식, 양식, 일식 등)

### 13.3 Phase 6: 고도화

- [ ] PWA 전환 (앱 설치 가능)
- [ ] 푸시 알림 (새 리뷰 알림)
- [ ] 관리자 페이지 (부적절한 리뷰 관리)
- [ ] SEO 최적화 (Open Graph, 메타 태그)

---

## 14. 부록

### 14.1 참고 문서

- [Naver Maps JavaScript API v3 공식 문서](https://navermaps.github.io/maps.js.ncp/)
- [Naver Search API (Local) 가이드](https://developers.naver.com/docs/serviceapi/search/local/local.md)
- [NCloud Geocoding API 문서](https://api.ncloud-docs.com/docs/ai-naver-mapsgeocoding)
- [Next.js 16 문서](https://nextjs.org/docs)
- [Supabase 문서](https://supabase.com/docs)

### 14.2 용어 정의

| 용어 | 정의 |
|------|------|
| MVP | Minimum Viable Product (최소 기능 제품) |
| BaaS | Backend-as-a-Service |
| SSR | Server-Side Rendering |
| CSR | Client-Side Rendering |
| RLS | Row-Level Security (Supabase 보안 정책) |
| OG | Open Graph (소셜 미디어 미리보기) |

---

## 15. 변경 이력

| 버전 | 날짜 | 작성자 | 변경 내용 |
|------|------|--------|-----------|
| 1.0 | 2025-10-22 | Claude | 초기 PRD 작성 |

---

**문서 승인**:
- Product Owner: [ ]
- Tech Lead: [ ]
- Stakeholders: [ ]

---

**다음 단계**:
1. Stakeholders 검토 및 피드백
2. 기술 스택 최종 확정
3. Supabase 마이그레이션 파일 작성
4. 개발 착수

---

**문의**:
- 프로젝트 관련 문의는 GitHub Issues 또는 Slack 채널 활용
