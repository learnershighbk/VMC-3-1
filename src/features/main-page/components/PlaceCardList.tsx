"use client";

import { PlaceCard } from './PlaceCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import type { PlaceWithReviews } from '@/features/places/lib/dto';

type PlaceCardListProps = {
  places: PlaceWithReviews[];
  isLoading: boolean;
};

export const PlaceCardList = ({ places, isLoading }: PlaceCardListProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-1/2 mb-2" />
              <Skeleton className="h-4 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (places.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <p className="text-gray-500 text-lg mb-4">아직 등록된 리뷰가 없습니다</p>
        <p className="text-sm text-gray-400 mb-6">첫 번째 리뷰를 작성해보세요!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {places.map((place) => (
        <PlaceCard key={place.id} place={place} />
      ))}
    </div>
  );
};
