"use client";

export const HeroSection = () => {
  return (
    <section className="bg-gradient-to-br from-blue-500 to-purple-600 text-white py-12 px-6">
      <div className="max-w-4xl mx-auto text-center space-y-4">
        <h1 className="text-4xl font-bold">맛집 리뷰 플랫폼</h1>
        <p className="text-lg">지도로 찾고, 리뷰로 공유하는 우리 동네 맛집</p>
        <p className="text-sm opacity-90">
          로그인 없이 바로 시작하세요. 검색 → 리뷰 작성 → 공유
        </p>
      </div>
    </section>
  );
};
