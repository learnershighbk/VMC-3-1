"use client";

import Script from "next/script";
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

export const NaverMapScript = () => {
  const clientId = process.env.NEXT_PUBLIC_NCP_CLIENT_ID;
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    // SDK 로딩 전에 상태 초기화
    if (typeof window !== 'undefined') {
      window.naverMapSdkLoaded = false;
      window.naverMapSdkError = undefined;

      // 환경변수가 없을 때 에러 상태 설정
      if (!clientId) {
        window.naverMapSdkError = 'NEXT_PUBLIC_NCP_CLIENT_ID 환경변수가 설정되지 않았습니다.';
        console.error('[네이버 지도] NEXT_PUBLIC_NCP_CLIENT_ID 환경변수가 설정되지 않았습니다. 지도 기능이 작동하지 않을 수 있습니다.');
      }
    }
  }, [clientId]);

  if (!clientId) {
    return null;
  }

  return (
    <Script
      strategy="beforeInteractive"
      src={`https://openapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${clientId}`}
      onLoad={() => {
        console.log('[네이버 지도] SDK 스크립트 로드 완료');
        setScriptLoaded(true);
        
        // SDK가 완전히 로드될 때까지 대기
        const checkSDKReady = () => {
          if (typeof window !== 'undefined' && window.naver?.maps) {
            console.log('[네이버 지도] SDK 초기화 완료');
            window.naverMapSdkLoaded = true;
            window.naverMapSdkError = undefined;
          } else {
            // SDK가 아직 준비되지 않았으면 100ms 후 다시 확인
            setTimeout(checkSDKReady, 100);
          }
        };
        
        // 즉시 확인 시작
        checkSDKReady();
      }}
      onError={(e) => {
        const errorMsg = 'SDK 스크립트 로딩 실패';
        console.error('[네이버 지도] SDK 로드 실패:', e);
        console.error('[네이버 지도] 다음 사항을 확인하세요:');
        console.error('  1. NEXT_PUBLIC_NCP_CLIENT_ID가 올바른지 확인');
        console.error('  2. 네트워크 연결 상태 확인');
        console.error('  3. 브라우저 개발자 도구 > 네트워크 탭에서 openapi.map.naver.com 요청 확인');
        console.error('  4. CORS 또는 방화벽 차단 여부 확인');
        if (typeof window !== 'undefined') {
          window.naverMapSdkError = errorMsg;
          window.naverMapSdkLoaded = false;
        }
      }}
    />
  );
};
