"use client";

import { useEffect, useState } from "react";

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

export const NaverMapLoader = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_NCP_CLIENT_ID;
    
    if (!clientId) {
      const errorMsg = 'NEXT_PUBLIC_NCP_CLIENT_ID 환경변수가 설정되지 않았습니다.';
      console.error('[네이버 지도]', errorMsg);
      setError(errorMsg);
      setIsLoading(false);
      return;
    }

    // 이미 로드된 경우
    if (window.naverMapSdkLoaded && window.naver?.maps) {
      console.log('[네이버 지도] SDK가 이미 로드되어 있습니다.');
      setIsLoading(false);
      return;
    }

    // 이미 로딩 중인 경우
    if (window.naverMapSdkLoaded === false && !window.naverMapSdkError) {
      console.log('[네이버 지도] SDK 로딩이 이미 진행 중입니다.');
      return;
    }

    console.log('[네이버 지도] SDK 동적 로딩 시작...');
    
    // 상태 초기화
    window.naverMapSdkLoaded = false;
    window.naverMapSdkError = undefined;

    // 스크립트 동적 로드
    const script = document.createElement('script');
    script.src = `https://openapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${clientId}`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      console.log('[네이버 지도] SDK 스크립트 로드 완료');
      
      // SDK 초기화 대기
      const checkSDKReady = () => {
        if (window.naver?.maps) {
          console.log('[네이버 지도] SDK 초기화 완료');
          window.naverMapSdkLoaded = true;
          window.naverMapSdkError = undefined;
          setIsLoading(false);
        } else {
          // SDK가 아직 준비되지 않았으면 100ms 후 다시 확인
          setTimeout(checkSDKReady, 100);
        }
      };
      
      // 즉시 확인 시작
      checkSDKReady();
    };

    script.onerror = (e) => {
      const errorMsg = 'SDK 스크립트 로딩 실패';
      console.error('[네이버 지도] SDK 로드 실패:', e);
      console.error('[네이버 지도] 다음 사항을 확인하세요:');
      console.error('  1. NEXT_PUBLIC_NCP_CLIENT_ID가 올바른지 확인');
      console.error('  2. 네트워크 연결 상태 확인');
      console.error('  3. 브라우저 개발자 도구 > 네트워크 탭에서 openapi.map.naver.com 요청 확인');
      console.error('  4. CORS 또는 방화벽 차단 여부 확인');
      
      window.naverMapSdkError = errorMsg;
      window.naverMapSdkLoaded = false;
      setError(errorMsg);
      setIsLoading(false);
    };

    // 스크립트를 head에 추가
    document.head.appendChild(script);

    // 정리 함수
    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  // 로딩 상태나 에러 상태는 부모 컴포넌트에서 처리
  return null;
};
