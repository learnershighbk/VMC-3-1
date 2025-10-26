'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

type EmptyReviewStateProps = {
  placeId: string;
  placeName: string;
  address: string;
  latitude: number;
  longitude: number;
};

export default function EmptyReviewState({
  placeId,
  placeName,
  address,
  latitude,
  longitude,
}: EmptyReviewStateProps) {
  const queryParams = new URLSearchParams({
    placeId,
    placeName,
    address,
    lat: latitude.toString(),
    lng: longitude.toString(),
  });

  return (
    <div className="text-center py-12">
      <p className="text-muted-foreground mb-4">
        아직 리뷰가 없습니다. 첫 리뷰를 작성해보세요!
      </p>
      <Button asChild>
        <Link href={`/review/new?${queryParams.toString()}`}>리뷰 작성하기</Link>
      </Button>
    </div>
  );
}
