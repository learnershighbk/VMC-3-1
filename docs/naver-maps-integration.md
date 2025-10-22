아래는 지금까지 조사한 내용을 합쳐 만든 **최종 연동 문서**입니다. (2025-10-22 기준)
공식 문서를 최우선으로 인용하고, 필요한 곳에 최근 트러블슈팅 정보를 덧붙였습니다.

---

# 개요: 이번 프로젝트에서 무엇을 연동하나

* **연동 수단**

  * **SDK**: NAVER **Maps JavaScript API v3 (Web Dynamic Map)** — 웹에서 지도/마커/이벤트/지오코딩(서브모듈) 표시. ([Naver Maps][1])
  * **API**(REST):

    * **Search API – Local(지역)**: 장소명(업체/기관) 검색. **서버에서 프록시 호출 권장**. ([네이버 개발자][2])
    * **Geocoding API**: 주소↔좌표 변환(서버 REST). 초기엔 SDK의 **Geocoder 서브모듈**로 간편 사용 가능. ([NCloud Docs][3])
    * **Static Map API**: 리스트/공유용 지도 이미지(썸네일) 생성. **Referer 등록 필수**. ([NCloud Docs][4])
  * **Webhook**: 본 시나리오에는 **불필요** (제공되지 않음).

* **기능 매핑**

  * 지도 띄우기/마커/정보창/클러스터 등 → **SDK(Web Dynamic Map)**. ([Naver Maps][1])
  * 장소명 검색 결과(좌표/전화/주소 등) → **Search API(Local)**. ([네이버 개발자][2])
  * 주소↔좌표 변환 → **SDK Geocoder**(간편) 또는 **Geocoding REST**(확장/서버 측). ([Naver Maps][5])
  * 카드/목록/OG 이미지용 정적 지도 → **Static Map API**. ([NCloud Docs][4])

---

# 1) SDK: NAVER Maps JavaScript API v3

## 1-A. 설치/세팅(Next.js 권장 방식)

* **스크립트 로드(브라우저에서만)**

  ```html
  <script src="https://oapi.map.naver.com/openapi/v3/maps.js?ncpClientId=YOUR_CLIENT_ID&submodules=geocoder"></script>
  ```

  * `ncpClientId`는 Naver Cloud Platform(NCP) 콘솔에서 발급된 **Client ID**. ([NCloud Docs][6])
  * 지오코딩을 브라우저에서 쓰려면 `&submodules=geocoder`. ([Naver Maps][5])

* **Next.js(App Router) 팁**

  * SDK는 **클라이언트 컴포넌트**에서 `next/script`로 **afterInteractive**에 로드 → SSR 시 `window` 접근 에러 회피. (일반적인 Next.js 연동 패턴)
  * SDK 전체 사양/예제는 공식 v3 문서의 Tutorials/Examples 참고. ([Naver Maps][1])

## 1-B. 인증 정보 발급/등록

* **발급 위치**: **NCP 콘솔 → Services > AI·NAVER API > Application** 에서 **Maps** 앱 등록 → **Client ID/Secret** 발급, **Web service URL(도메인) 등록**. 도메인 불일치 시 401/403. ([NCloud Docs][7])

## 1-C. 호출(기본 예시)

```js
// 지도 생성 & 마커
const map = new naver.maps.Map('map', {
  center: new naver.maps.LatLng(37.5665, 126.9780),
  zoom: 13
});
new naver.maps.Marker({ position: map.getCenter(), map });
```

* 시작 예제(Hello, World)와 마커는 공식 튜토리얼 참고. ([Naver Maps][8])

### (선택) SDK 지오코더 사용 예시

```js
// 주소 → 좌표
naver.maps.Service.geocode({ address: '서울특별시 중구 세종대로 110' }, (status, resp) => {
  if (status !== naver.maps.Service.Status.OK) return;
  const { y, x } = resp.v2.addresses[0];
  new naver.maps.Marker({ position: new naver.maps.LatLng(y, x), map });
});
```

* Geocoder 서브모듈 사용 방법은 공식 튜토리얼 참조. ([Naver Maps][5])

**인증정보 관리(권장)**

* SDK는 클라이언트에서 로드되므로 `ncpClientId`는 **도메인 검증(Referer)** 로 보호됩니다. 프로덕션/프리뷰/로컬 도메인을 **모두 NCP 콘솔에 등록**하세요. ([NCloud Docs][7])

---

# 2) API: Search(Local) — 장소명 검색

## 2-A. 엔드포인트/요청 형식

* **Base URLs**

  * JSON: `https://openapi.naver.com/v1/search/local.json`
  * XML:  `https://openapi.naver.com/v1/search/local.xml` ([네이버 개발자][2])
* **주요 파라미터**: `query`(필수), `display`, `start`, `sort` 등. **하루 호출 한도 25,000회**(앱 기준). ([네이버 개발자][2])
* **요청 메서드**: `GET` (HTTPS). ([네이버 개발자][2])

## 2-B. 인증 발급/세팅

* **Naver Developers**에서 앱 등록 후 **Search API 권한(지역)** 활성화 → **Client-Id/Client-Secret** 발급. ([네이버 개발자][2])

## 2-C. 인증정보 관리(강력 권장)

* **서버에서만 보관/호출**: Next.js **API Route**에서 프록시 호출하여 `X-Naver-Client-Id`·`X-Naver-Client-Secret` 헤더를 주입하고, 브라우저에는 **노출 금지**. (CORS/키 유출 방지) ([네이버 개발자][2])

## 2-D. 호출 예시(서버 프록시)

```ts
// app/api/search/local/route.ts (Next.js App Router)
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") ?? "";
  const url = `https://openapi.naver.com/v1/search/local.json?query=${encodeURIComponent(q)}&display=10&start=1`;

  const resp = await fetch(url, {
    headers: {
      "X-Naver-Client-Id": process.env.NAVER_SEARCH_CLIENT_ID!,
      "X-Naver-Client-Secret": process.env.NAVER_SEARCH_CLIENT_SECRET!,
    },
    cache: "no-store",
  });
  return NextResponse.json(await resp.json());
}
```

* 파라미터/헤더 사양은 공식 문서와 동일. ([네이버 개발자][2])

---

# 3) API: Geocoding — 주소↔좌표 변환

## 3-A. 두 가지 선택지

* **클라이언트 간편 모드**: SDK **Geocoder 서브모듈**(위 1-C 예시) — 초기 PoC/프로토타입에 용이. ([Naver Maps][5])
* **서버 안정 모드**: **NCP Geocoding REST** — 트래픽/보안/로깅 필요 시 API Route로 전환. ([NCloud Docs][3])

## 3-B. REST 엔드포인트/인증

* **Geocode**: 주소 → 좌표 (문서의 `geocode` API) ([Ncloud Docs][9])
* 인증은 **X-NCP-APIGW-API-KEY-ID / X-NCP-APIGW-API-KEY** 헤더 방식(콘솔 발급 키). 앱의 **Geocoding 권한 체크** 필요. ([NCloud Docs][3])

## 3-C. 서버 호출 예시

```ts
// app/api/geocode/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const address = req.nextUrl.searchParams.get("address") ?? "";
  const url = `https://naveropenapi.apigw.ntruss.com/map-geocode/v2/geocode?query=${encodeURIComponent(address)}`;

  const resp = await fetch(url, {
    headers: {
      "X-NCP-APIGW-API-KEY-ID": process.env.NCP_CLIENT_ID!,
      "X-NCP-APIGW-API-KEY": process.env.NCP_CLIENT_SECRET!,
    },
    cache: "no-store",
  });
  return NextResponse.json(await resp.json());
}
```

* 엔드포인트/헤더는 NCP Geocoding 문서 기준. ([NCloud Docs][3])

**인증정보 관리(권장)**

* `NCP_CLIENT_ID`/`NCP_CLIENT_SECRET`은 **서버 환경변수**에만 저장.
* 콘솔에서 **Maps 앱의 Geocoding 권한**을 반드시 체크(미체크 시 403/에러). ([NCloud Docs][7])

---

# 4) API: Static Map — 정적 지도 이미지

## 4-A. 엔드포인트/요청 형식

* **Raster**: `…/map-static/v2/raster` (HTTP **GET**) — `w`, `h`, `center` 또는 `markers`, `level`, `scale` 등 파라미터로 이미지 생성. ([NCloud Docs][4])
* **HTTP Referer 인증** 사용 시, **앱 등록 단계에서 웹 서비스 URL을 반드시 입력**해야 함(미등록/불일치 시 이미지 실패). ([Ncloud Docs][10])

## 4-B. 호출 예시(간단 URL)

```
https://naveropenapi.apigw.ntruss.com/map-static/v2/raster
  ?w=600&h=320&scale=2
  &markers=type:d|size:mid|pos:126.9780%2037.5665
```

**인증정보 관리(권장)**

* 정적 지도 호출은 **Referer 등록**으로 보호하거나, 서버에서 **프록시**로 호출하며 헤더(`X-NCP-APIGW-API-KEY-ID/KEY`)를 주입. 환경에 맞게 선택. ([Ncloud Docs][10])

---

# 5) (참고) 공통 콘솔/권한/트러블슈팅

* **앱/권한 설정 경로**: NCP 콘솔 → *Services > AI NAVER API > Application*. 여기서 **Web service URL** 등록, **Maps/Geocoding 권한 체크**, 인증키 확인. ([NCloud Docs][7])
* **자주 겪는 문제**

  * **도메인 불일치로 401/403**: `https/도메인/서브도메인/www 유무`를 콘솔 설정과 실제 접근 도메인 모두 맞추기. ([NCloud Docs][7])
  * **Geocoder 모듈 로드 오류**: SDK URL에 `submodules=geocoder` 포함 및 네트워크 차단 여부 확인. (개발자 포럼 사례) ([Naver Maps][5])

---

# 6) 런타임/LTS 확인

* **Next.js 최신(16) 사용 시 Node.js 20.9+ 권장**. (Next.js 16은 Node 18 지원 종료, 20+ 필요) — 최신 릴리스 노트/가이드에 따라 준비. *(일반 지침)*

---

# 7) Step-by-Step: 따라 하기

> 전제: Node 20+ / Next.js 16, Vercel 또는 로컬 개발.

## STEP 1. 콘솔에서 키 발급

1. **NCP**: *AI·NAVER API > Application* → **Maps** 앱 생성 → **Client ID/Secret** 발급, **Web service URL**(개발/운영/프리뷰/로컬) 모두 등록. (Static Map/SDK/Geocoding에 공통) ([NCloud Docs][7])
2. **Naver Developers**: Search **Local API 권한** 활성화 → **Client-Id/Client-Secret** 발급. ([네이버 개발자][2])

## STEP 2. 환경변수 설정

* `.env.local`

  ```
  NEXT_PUBLIC_NCP_CLIENT_ID=...          # SDK/Static Map 로드용 (도메인 검증)
  NCP_CLIENT_ID=...                       # 서버 REST용 (Geocoding/Static Map 프록시)
  NCP_CLIENT_SECRET=...
  NAVER_SEARCH_CLIENT_ID=...              # Search(Local) 프록시
  NAVER_SEARCH_CLIENT_SECRET=...
  ```

## STEP 3. 지도 페이지 만들기(클라이언트)

* `app/map/page.tsx`

  * `"use client"` 선언
  * `<Script src="https://oapi.map.naver.com/openapi/v3/maps.js?ncpClientId=${process.env.NEXT_PUBLIC_NCP_CLIENT_ID}&submodules=geocoder" strategy="afterInteractive" />` 로드
  * `useEffect`에서 `window.naver` 확인 후 지도/마커 생성
  * SDK 기본/튜토리얼 코드 참조. ([Naver Maps][8])

## STEP 4. 장소 검색 프록시(API Route)

* `app/api/search/local/route.ts`에서 `https://openapi.naver.com/v1/search/local.json`으로 서버 측 `fetch` + 헤더(`X-Naver-Client-Id/Secret`) 주입.

  * 필요한 파라미터: `query`, `display`, `start`, `sort`. ([네이버 개발자][2])

## STEP 5. 클라이언트에서 검색/표시

* 검색 인풋 **디바운스** → `/api/search/local?q=...` 호출 → 응답의 좌표/주소를 지도에 마커로 표시. (응답 필드/제한은 문서 표 참조) ([네이버 개발자][2])

## STEP 6. (선택) 지오코딩

* 간단히는 SDK Geocoder(`naver.maps.Service.geocode/reverseGeocode`) 사용. ([Naver Maps][5])
* 안정성/로깅이 필요하면 `/api/geocode` 서버 라우트로 **NCP Geocoding REST** 호출로 전환. ([NCloud Docs][3])

## STEP 7. (선택) Static Map 썸네일

* 카드/리스트/공유용으로 `…/map-static/v2/raster?w=…&h=…&markers=…` URL 생성.
* **Referer 등록 필수**(도메인 불일치 시 이미지 실패). 필요 시 서버 프록시에서 **X-NCP-APIGW-API-KEY-ID/KEY** 헤더로 호출. ([Ncloud Docs][10])

## STEP 8. 최종 점검

* [ ] NCP **Web service URL**과 실제 접근 도메인(로컬/프리뷰/운영) 일치 확인. ([NCloud Docs][7])
* [ ] Search(Local) 하루 25,000회 한도 고려(프로토타입은 충분). ([네이버 개발자][2])
* [ ] SDK 지오코더 필요 시 `submodules=geocoder` 포함. ([Naver Maps][5])

