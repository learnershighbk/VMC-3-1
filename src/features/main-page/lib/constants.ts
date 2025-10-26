// 네이버 지도 초기 설정 상수
export const MAP_CONFIG = {
  DEFAULT_CENTER: {
    lat: 37.5665, // 서울 시청 위도
    lng: 126.978, // 서울 시청 경도
  },
  DEFAULT_ZOOM: 13,
  MARKER_CLUSTER_THRESHOLD: 100, // 마커 클러스터링 적용 기준 (향후 확장용)
} as const;

// 검색 설정
export const SEARCH_CONFIG = {
  DEBOUNCE_MS: 500,
  MAX_RESULTS: 5,
} as const;
