'use client';

import { use } from 'react';
import ReviewDetailContainer from './components/ReviewDetailContainer';

type PageProps = {
  params: Promise<{ placeId: string }>;
};

export default function ReviewDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const { placeId } = resolvedParams;

  // URL 경로에서 받은 placeId는 이미 인코딩된 상태이므로 디코딩
  const decodedPlaceId = decodeURIComponent(placeId);

  return <ReviewDetailContainer placeId={decodedPlaceId} />;
}
