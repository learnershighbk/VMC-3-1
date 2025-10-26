'use client';

import { Badge } from '@/components/ui/badge';

type ReviewDetailHeaderProps = {
  placeName: string;
  address: string;
  category?: string | null;
  reviewCount: number;
};

export default function ReviewDetailHeader({
  placeName,
  address,
  category,
  reviewCount,
}: ReviewDetailHeaderProps) {
  return (
    <div className="mb-6">
      <h1 className="text-3xl font-bold mb-2">{placeName}</h1>
      <p className="text-sm text-muted-foreground mb-2">{address}</p>
      {category && (
        <p className="text-sm text-muted-foreground mb-2">
          <span className="font-medium">분류:</span> {category}
        </p>
      )}
      <Badge variant="secondary">리뷰 {reviewCount}개</Badge>
    </div>
  );
}
