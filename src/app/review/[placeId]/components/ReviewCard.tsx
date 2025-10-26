'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StarRating } from '@/components/ui/star-rating';
import { Trash2 } from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils/date';
import type { ReviewResponse } from '@/features/reviews/lib/dto';

type ReviewCardProps = {
  review: ReviewResponse;
  onDelete: (reviewId: string) => void;
};

export default function ReviewCard({ review, onDelete }: ReviewCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <CardTitle className="text-lg">{review.authorName}</CardTitle>
            <StarRating rating={review.rating} readonly size="sm" />
          </div>
          <CardDescription className="text-xs">
            {formatRelativeTime(review.createdAt)}
          </CardDescription>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(review.id)}
          aria-label="리뷰 삭제"
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </CardHeader>
      <CardContent>
        <p className="text-sm whitespace-pre-wrap">{review.content}</p>
      </CardContent>
    </Card>
  );
}
