'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { useState } from 'react';

interface PlaceInfoCardProps {
  name: string;
  address: string;
  category?: string;
  lat: number;
  lng: number;
}

const buildStaticMapUrl = (lat: number, lng: number): string => {
  const clientId = process.env.NEXT_PUBLIC_NCP_CLIENT_ID;
  if (!clientId) {
    console.error('NEXT_PUBLIC_NCP_CLIENT_ID is not defined');
    return '';
  }

  const baseUrl = 'https://naveropenapi.apigw.ntruss.com/map-static/v2/raster';
  const params = new URLSearchParams({
    w: '600',
    h: '300',
    scale: '2',
    markers: `type:d|size:mid|pos:${lng}%20${lat}`,
    center: `${lng},${lat}`,
    level: '16',
  });

  return `${baseUrl}?${params.toString()}&X-NCP-APIGW-API-KEY-ID=${clientId}`;
};

export const PlaceInfoCard = ({ name, address, category, lat, lng }: PlaceInfoCardProps) => {
  const [imageError, setImageError] = useState(false);
  const staticMapUrl = buildStaticMapUrl(lat, lng);

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-xl">{name}</CardTitle>
        <p className="text-sm text-muted-foreground">{address}</p>
        {category && (
          <p className="text-sm text-muted-foreground mt-1">
            <span className="font-medium">분류:</span> {category}
          </p>
        )}
      </CardHeader>
      <CardContent>
        <div className="relative w-full h-[200px] md:h-[300px] rounded-md overflow-hidden bg-muted">
          {staticMapUrl && !imageError ? (
            <Image
              src={staticMapUrl}
              alt={`${name} 위치`}
              fill
              className="object-cover"
              priority
              unoptimized
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <p>지도를 불러올 수 없습니다</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
