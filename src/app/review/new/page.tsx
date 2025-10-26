'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { z } from 'zod';
import { PlaceInfoCard } from '@/features/reviews/components/PlaceInfoCard';
import { ReviewForm } from '@/features/reviews/components/ReviewForm';
import { Skeleton } from '@/components/ui/skeleton';

const QueryParamsSchema = z.object({
  placeId: z.string().min(1),
  placeName: z.string().min(1),
  address: z.string().min(1),
  lat: z.coerce.number().min(33).max(43),
  lng: z.coerce.number().min(124).max(132),
});

type QueryParams = z.infer<typeof QueryParamsSchema>;

export default function ReviewNewPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [placeInfo, setPlaceInfo] = useState<QueryParams | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const params = {
      placeId: searchParams.get('placeId'),
      placeName: searchParams.get('placeName'),
      address: searchParams.get('address'),
      lat: searchParams.get('lat'),
      lng: searchParams.get('lng'),
    };

    const parsed = QueryParamsSchema.safeParse(params);

    if (!parsed.success) {
      console.error('Invalid query parameters:', parsed.error.format());
      router.replace('/');
      return;
    }

    setPlaceInfo(parsed.data);
    setIsLoading(false);
  }, [searchParams, router]);

  if (isLoading || !placeInfo) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Skeleton className="h-8 w-48 mb-6" />
        <Skeleton className="h-64 w-full mb-6" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">리뷰 작성</h1>

      <PlaceInfoCard
        name={placeInfo.placeName}
        address={placeInfo.address}
        lat={placeInfo.lat}
        lng={placeInfo.lng}
      />

      <ReviewForm
        naverPlaceId={placeInfo.placeId}
        placeName={placeInfo.placeName}
        address={placeInfo.address}
        latitude={placeInfo.lat}
        longitude={placeInfo.lng}
      />
    </div>
  );
}
