"use client";

import { useNaverMap } from '../hooks/useNaverMap';
import type { PlaceWithReviews } from '@/features/places/lib/dto';

type MapSectionProps = {
  places: PlaceWithReviews[];
  isLoading: boolean;
};

export const MapSection = ({ places, isLoading }: MapSectionProps) => {
  const { isMapLoaded, mapError } = useNaverMap(places);

  if (isLoading) {
    return (
      <div className="w-full h-[400px] md:h-[500px] flex items-center justify-center bg-gray-100 rounded-md">
        <p className="text-gray-500">지도를 불러오는 중...</p>
      </div>
    );
  }

  // 지도 DOM 요소는 항상 렌더링하되, 로딩 상태나 에러 상태를 오버레이로 표시
  return (
    <div className="relative w-full h-[400px] md:h-[500px] rounded-md shadow-sm">
      {/* 지도 DOM 요소 - 항상 렌더링 */}
      <div
        id="naver-map"
        className="w-full h-full rounded-md"
      />
      
      {/* 로딩 오버레이 */}
      {!isMapLoaded && !mapError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-md">
          <p className="text-gray-500">지도를 불러오는 중...</p>
        </div>
      )}
      
      {/* 에러 오버레이 */}
      {mapError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 border rounded-md p-4">
          <p className="text-gray-600 mb-4 text-lg font-semibold">지도를 불러올 수 없습니다</p>
          <div className="max-w-2xl w-full mx-auto p-4 bg-red-50 border border-red-200 rounded-md mb-4">
            <p className="text-sm text-red-800 font-mono whitespace-pre-wrap">{mapError}</p>
          </div>
          <p className="text-sm text-gray-500">
            페이지를 새로고침하거나 목록에서 맛집을 탐색해주세요.
          </p>
        </div>
      )}
    </div>
  );
};
