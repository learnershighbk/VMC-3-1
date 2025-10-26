'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Script from 'next/script';

type ReviewMapProps = {
  placeName: string;
  latitude: number;
  longitude: number;
};

export default function ReviewMap({ placeName, latitude, longitude }: ReviewMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(false);

  const initMap = useCallback(() => {
    if (!mapRef.current || !window.naver) return;

    try {
      const map = new window.naver.maps.Map(mapRef.current, {
        center: new window.naver.maps.LatLng(latitude, longitude),
        zoom: 15,
        zoomControl: true,
        mapTypeControl: false,
      });

      const marker = new window.naver.maps.Marker({
        position: new window.naver.maps.LatLng(latitude, longitude),
        map: map,
        title: placeName,
      });

      // InfoWindow 표시
      const infoWindow = new window.naver.maps.InfoWindow({
        content: `<div style="padding:10px; min-width:150px; font-size:14px;">${placeName}</div>`,
      });
      infoWindow.open(map, marker);
    } catch (error) {
      console.error('Map initialization error:', error);
      setMapError(true);
    }
  }, [placeName, latitude, longitude]);

  useEffect(() => {
    if (isMapLoaded) {
      initMap();
    }
  }, [isMapLoaded, initMap]);

  if (mapError) {
    return (
      <div className="w-full h-[300px] md:h-[400px] rounded-lg border flex items-center justify-center bg-muted">
        <p className="text-muted-foreground">지도를 표시할 수 없습니다</p>
      </div>
    );
  }

  return (
    <>
      <Script
        src={`https://openapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${process.env.NEXT_PUBLIC_NCP_CLIENT_ID}`}
        strategy="afterInteractive"
        onLoad={() => setIsMapLoaded(true)}
        onError={() => setMapError(true)}
      />
      <div
        ref={mapRef}
        className="w-full h-[300px] md:h-[400px] rounded-lg border"
        aria-label="맛집 위치 지도"
      />
    </>
  );
}
