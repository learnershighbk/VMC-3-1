'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardHeader, CardContent } from '@/components/ui/card';

export default function ReviewSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* 헤더 스켈레톤 */}
      <div className="mb-6">
        <Skeleton className="h-10 w-64 mb-2" />
        <Skeleton className="h-4 w-96 mb-2" />
        <Skeleton className="h-6 w-20" />
      </div>

      {/* 지도 스켈레톤 */}
      <Skeleton className="w-full h-[300px] md:h-[400px] rounded-lg mb-8" />

      {/* 리뷰 카드 스켈레톤 */}
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-3 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-5/6" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
