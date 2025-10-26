'use client';

import ReviewCard from './ReviewCard';
import EmptyReviewState from './EmptyReviewState';
import type { ReviewResponse, PlaceWithReviewsResponse } from '@/features/reviews/lib/dto';

type ReviewListProps = {
  reviews: ReviewResponse[];
  onDeleteReview: (reviewId: string) => void;
  place: PlaceWithReviewsResponse['place'];
};

export default function ReviewList({ reviews, onDeleteReview, place }: ReviewListProps) {
  if (reviews.length === 0) {
    return (
      <EmptyReviewState
        placeId={place.naverPlaceId}
        placeName={place.name}
        address={place.address}
        latitude={place.latitude}
        longitude={place.longitude}
      />
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <ReviewCard key={review.id} review={review} onDelete={onDeleteReview} />
      ))}
    </div>
  );
}
