"use client";

import { HeroSection } from '@/features/main-page/components/HeroSection';
import { MapSection } from '@/features/main-page/components/MapSection';
import { PlaceCardList } from '@/features/main-page/components/PlaceCardList';
import { SearchBar } from '@/features/main-page/components/SearchBar';
import { usePlacesWithReviews } from '@/features/main-page/hooks/usePlacesWithReviews';
export default function MainPage() {
  const { data: places = [], isLoading } = usePlacesWithReviews();

  return (
    <main className="min-h-screen bg-gray-50">
      <HeroSection />

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-12">
        {/* 지도 섹션 */}
        <section>
          <h2 className="text-2xl font-bold mb-4 text-gray-900">지도에서 찾기</h2>
          <MapSection places={places} isLoading={isLoading} />
        </section>

        {/* 맛집 카드 리스트 */}
        <section>
          <h2 className="text-2xl font-bold mb-4 text-gray-900">인기 맛집</h2>
          <PlaceCardList places={places} isLoading={isLoading} />
        </section>

        {/* 검색창 */}
        <section>
          <h2 className="text-2xl font-bold mb-4 text-gray-900">음식점 검색</h2>
          <SearchBar />
        </section>
      </div>
    </main>
  );
}
