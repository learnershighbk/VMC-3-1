"use client";

import { useRouter } from 'next/navigation';
import { convertNaverCoordinates, stripHtmlTags } from '@/lib/utils/naver';
import type { NaverSearchItem } from '@/lib/schemas/common';

type SearchResultDropdownProps = {
  results: NaverSearchItem[];
  isLoading: boolean;
  onClose: () => void;
};

export const SearchResultDropdown = ({
  results,
  isLoading,
  onClose,
}: SearchResultDropdownProps) => {
  const router = useRouter();

  const handleSelectPlace = (item: NaverSearchItem) => {
    const { latitude, longitude } = convertNaverCoordinates(item.mapx, item.mapy);
    const cleanTitle = stripHtmlTags(item.title);

    // 네이버 place ID는 검색 결과에 없으므로 cleanTitle을 임시 ID로 사용
    const queryParams = new URLSearchParams({
      placeId: cleanTitle,
      placeName: cleanTitle,
      address: item.address || item.roadAddress,
      lat: latitude.toString(),
      lng: longitude.toString(),
    });

    router.push(`/review/new?${queryParams.toString()}`);
    onClose();
  };

  if (isLoading) {
    return (
      <div className="absolute top-full left-0 right-0 mt-2 bg-white border rounded-md shadow-lg max-h-80 overflow-y-auto z-10">
        <div className="px-4 py-3 text-sm text-gray-500">검색 중...</div>
      </div>
    );
  }

  if (results.length === 0) {
    return null;
  }

  return (
    <div className="absolute top-full left-0 right-0 mt-2 bg-white border rounded-md shadow-lg max-h-80 overflow-y-auto z-10">
      {results.map((item, index) => (
        <button
          key={index}
          type="button"
          onClick={() => handleSelectPlace(item)}
          className="w-full text-left px-4 py-3 hover:bg-gray-100 border-b last:border-0 transition-colors"
        >
          <p
            className="font-medium text-gray-900"
            dangerouslySetInnerHTML={{ __html: item.title }}
          />
          <p className="text-sm text-gray-500 mt-1">{item.address}</p>
          {item.category && (
            <p className="text-xs text-gray-400 mt-1">{item.category}</p>
          )}
        </button>
      ))}
    </div>
  );
};
