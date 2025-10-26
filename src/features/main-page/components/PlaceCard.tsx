"use client";

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StarRating } from '@/components/ui/star-rating';
import type { PlaceWithReviews } from '@/features/places/lib/dto';

type PlaceCardProps = {
  place: PlaceWithReviews;
};

export const PlaceCard = ({ place }: PlaceCardProps) => {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/review/${place.naverPlaceId}`);
  };

  return (
    <Card
      className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
      onClick={handleClick}
    >
      <CardHeader>
        <CardTitle className="text-lg">{place.name}</CardTitle>
        <CardDescription className="text-sm">{place.address}</CardDescription>
        {place.category && (
          <CardDescription className="text-xs text-muted-foreground">
            {place.category}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 mb-2">
          <p className="text-sm text-gray-500">
            리뷰 {place.reviewCount}개
          </p>
          {place.latestReview && (
            <>
              <span className="text-gray-300">|</span>
              <StarRating rating={place.latestReview.rating} readonly size="sm" />
            </>
          )}
        </div>
        {place.latestReview && (
          <div>
            <p className="text-xs text-gray-500 mb-1">
              {place.latestReview.authorName}
            </p>
            <p className="text-sm text-gray-700 line-clamp-2">
              {place.latestReview.content}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
