import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MAP_CONFIG } from '../lib/constants';
import type { PlaceWithReviews } from '@/features/places/lib/dto';

// 전역 타입 선언
declare global {
  interface Window {
    naverMapSdkLoaded: boolean;
    naverMapSdkError?: string;
    naver?: {
      maps: any;
    };
  }
}

// 네이버 지도 타입 정의
type NaverMap = InstanceType<typeof window.naver.maps.Map>;
type NaverMarker = InstanceType<typeof window.naver.maps.Marker>;
type NaverInfoWindow = InstanceType<typeof window.naver.maps.InfoWindow>;

export const useNaverMap = (places: PlaceWithReviews[]) => {
  const mapRef = useRef<NaverMap | null>(null);
  const markersRef = useRef<NaverMarker[]>([]);
  const currentInfoWindowRef = useRef<NaverInfoWindow | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const router = useRouter();

  // 네이버 지도 초기화
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const initMap = () => {
      // SDK 로딩 에러 확인
      if (window.naverMapSdkError) {
        console.error('[네이버 지도] SDK 로딩 에러 감지:', window.naverMapSdkError);
        setMapError(`네이버 지도 SDK 로딩 실패: ${window.naverMapSdkError}`);
        setIsMapLoaded(false);
        return 'error';
      }

      // SDK 로딩 완료 확인
      if (!window.naverMapSdkLoaded) {
        console.log('[네이버 지도] SDK 아직 로딩 중...');
        return false;
      }

      // 네이버 지도 SDK 로드 확인
      if (!window.naver?.maps) {
        console.log('[네이버 지도] SDK 로딩 완료되었지만 naver.maps 객체가 없습니다.');
        return false;
      }

      const mapElement = document.getElementById('naver-map');
      if (!mapElement) {
        console.log('[네이버 지도] DOM 요소를 찾을 수 없습니다. 지도가 아직 렌더링되지 않았을 수 있습니다.');
        return false;
      }

      if (mapRef.current) {
        console.log('[네이버 지도] 지도가 이미 초기화되었습니다.');
        return true;
      }

      try {
        console.log('[네이버 지도] 지도 초기화 시작...');
        const map = new window.naver.maps.Map(mapElement, {
          center: new window.naver.maps.LatLng(
            MAP_CONFIG.DEFAULT_CENTER.lat,
            MAP_CONFIG.DEFAULT_CENTER.lng
          ),
          zoom: MAP_CONFIG.DEFAULT_ZOOM,
        });

        mapRef.current = map;
        setIsMapLoaded(true);
        setMapError(null);
        console.log('[네이버 지도] 지도 초기화 완료');
        return true;
      } catch (error) {
        console.error('[네이버 지도] 지도 초기화 실패:', error);
        setMapError(`지도 초기화 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
        setIsMapLoaded(false);
        return 'error';
      }
    };

    // SDK 로딩 대기 - 최대 30초간 재시도
    let retryCount = 0;
    const maxRetries = 60; // 60 * 500ms = 30초
    let timeoutId: NodeJS.Timeout | null = null;

    const checkAndInit = () => {
      const result = initMap();

      // 성공하거나 에러가 발생하면 종료
      if (result === true || result === 'error') {
        return;
      }

      // 아직 로딩 중
      retryCount++;
      if (retryCount < maxRetries) {
        if (retryCount % 4 === 0) {
          // 2초마다 진행 상황 로그
          console.log(`[네이버 지도] SDK 로딩 대기 중... (${retryCount * 0.5}초)`);
        }
        timeoutId = setTimeout(checkAndInit, 500);
      } else {
        // 타임아웃
        const errorMessage = `네이버 지도 SDK 로딩 타임아웃 (${maxRetries * 0.5}초 초과).\n\n확인 사항:\n1. Client ID: ${process.env.NEXT_PUBLIC_NCP_CLIENT_ID ? '설정됨' : '미설정'}\n2. 브라우저 개발자 도구 > 네트워크 탭에서 openapi.map.naver.com 요청 확인\n3. 네트워크 연결 상태 확인\n4. CORS 또는 방화벽 차단 여부 확인\n\n해결 방법:\n- .env.local 파일에서 NEXT_PUBLIC_NCP_CLIENT_ID 값이 올바른지 확인\n- 개발 서버를 재시작해보세요\n- 브라우저 캐시를 삭제하고 페이지를 새로고침하세요`;
        console.error(`[네이버 지도] ${errorMessage}`);
        setMapError(errorMessage);
        setIsMapLoaded(false);
      }
    };

    // 초기 지연 후 시작 (DOM이 완전히 로드된 후)
    timeoutId = setTimeout(checkAndInit, 1000);

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, []);

  // 지도 DOM 요소가 렌더링된 후 지도 초기화 재시도
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (mapRef.current) return; // 이미 초기화됨
    if (!window.naverMapSdkLoaded || !window.naver?.maps) return; // SDK가 아직 로드되지 않음

    const mapElement = document.getElementById('naver-map');
    if (!mapElement) return; // DOM 요소가 아직 없음

    // DOM 요소가 렌더링되었으므로 지도 초기화 시도
    const initMap = () => {
      try {
        console.log('[네이버 지도] DOM 요소 감지 후 지도 초기화 시작...');
        const map = new window.naver.maps.Map(mapElement, {
          center: new window.naver.maps.LatLng(
            MAP_CONFIG.DEFAULT_CENTER.lat,
            MAP_CONFIG.DEFAULT_CENTER.lng
          ),
          zoom: MAP_CONFIG.DEFAULT_ZOOM,
        });

        mapRef.current = map;
        setIsMapLoaded(true);
        setMapError(null);
        console.log('[네이버 지도] 지도 초기화 완료');
      } catch (error) {
        console.error('[네이버 지도] 지도 초기화 실패:', error);
        setMapError(`지도 초기화 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
        setIsMapLoaded(false);
      }
    };

    // 약간의 지연 후 초기화 (DOM이 완전히 렌더링된 후)
    const timeoutId = setTimeout(initMap, 100);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [isMapLoaded]); // isMapLoaded가 변경될 때마다 실행

  // 마커 생성 및 업데이트
  useEffect(() => {
    if (!mapRef.current || !isMapLoaded || places.length === 0) return;

    // 기존 마커 제거
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    // 새 마커 생성
    places.forEach((place) => {
      if (!window.naver?.maps) return;
      
      const marker = new window.naver.maps.Marker({
        position: new window.naver.maps.LatLng(place.latitude, place.longitude),
        map: mapRef.current!,
        title: place.name,
      });

      // 마커 클릭 이벤트
      window.naver.maps.Event.addListener(marker, 'click', () => {
        // 기존 인포윈도우 닫기
        if (currentInfoWindowRef.current) {
          currentInfoWindowRef.current.close();
        }

        // 인포윈도우 생성
        const infoWindow = new window.naver.maps.InfoWindow({
          content: `
            <div style="padding: 15px; min-width: 200px;">
              <h3 style="margin: 0 0 10px 0; font-size: 16px; font-weight: 600;">${place.name}</h3>
              <p style="margin: 0 0 10px 0; color: #666; font-size: 14px;">리뷰 ${place.reviewCount}개</p>
              <a
                href="/review/${place.naverPlaceId}"
                style="display: inline-block; padding: 8px 16px; background: #4285f4; color: white; text-decoration: none; border-radius: 4px; font-size: 14px;"
                onclick="event.stopPropagation();"
              >
                자세히 보기
              </a>
            </div>
          `,
          borderWidth: 0,
          disableAnchor: true,
          backgroundColor: 'transparent',
        });

        infoWindow.open(mapRef.current!, marker);
        currentInfoWindowRef.current = infoWindow;
      });

      markersRef.current.push(marker);
    });

    // 지도 클릭 시 인포윈도우 닫기
    if (window.naver?.maps) {
      window.naver.maps.Event.addListener(mapRef.current, 'click', () => {
        if (currentInfoWindowRef.current) {
          currentInfoWindowRef.current.close();
          currentInfoWindowRef.current = null;
        }
      });
    }
  }, [places, isMapLoaded, router]);

  return { isMapLoaded, mapError };
};
