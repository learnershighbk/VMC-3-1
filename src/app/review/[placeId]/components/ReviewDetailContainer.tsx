'use client';

import { useState } from 'react';
import { useReviewDetail } from '@/features/review-detail/hooks/useReviewDetail';
import { useDeleteReview } from '@/features/review-detail/hooks/useDeleteReview';
import ReviewDetailHeader from './ReviewDetailHeader';
import ReviewMap from './ReviewMap';
import ReviewList from './ReviewList';
import DeleteReviewDialog from './DeleteReviewDialog';
import ReviewSkeleton from './ReviewSkeleton';

type ReviewDetailContainerProps = {
  placeId: string;
};

export default function ReviewDetailContainer({ placeId }: ReviewDetailContainerProps) {
  const { data, isLoading, error } = useReviewDetail(placeId);
  const deleteMutation = useDeleteReview(placeId);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedReviewId, setSelectedReviewId] = useState<string | null>(null);

  const handleDeleteClick = (reviewId: string) => {
    setSelectedReviewId(reviewId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedReviewId) {
      deleteMutation.mutate(selectedReviewId, {
        onSuccess: () => {
          setDeleteDialogOpen(false);
          setSelectedReviewId(null);
        },
      });
    }
  };

  if (isLoading) {
    return <ReviewSkeleton />;
  }

  if (error || !data) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-destructive">맛집 정보를 불러올 수 없습니다.</p>
      </div>
    );
  }

  const { place, reviews } = data;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <ReviewDetailHeader
        placeName={place.name}
        address={place.address}
        category={place.category}
        reviewCount={reviews.length}
      />

      <div className="mb-8">
        <ReviewMap
          placeName={place.name}
          latitude={place.latitude}
          longitude={place.longitude}
        />
      </div>

      <ReviewList reviews={reviews} onDeleteReview={handleDeleteClick} place={place} />

      <DeleteReviewDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        isDeleting={deleteMutation.isPending}
      />
    </div>
  );
}
