declare global {
  interface Window {
    naver?: {
      maps: typeof naver.maps;
    };
    naverMapSdkLoaded: boolean;
    naverMapSdkError?: string;
  }
}

declare namespace naver.maps {
  class Map {
    constructor(element: HTMLElement | string, options: MapOptions);
  }

  class Marker {
    constructor(options: MarkerOptions);
    setMap(map: Map | null): void;
  }

  class InfoWindow {
    constructor(options: InfoWindowOptions);
    open(map: Map, anchor: Marker): void;
    close(): void;
  }

  class LatLng {
    constructor(lat: number, lng: number);
  }

  namespace Event {
    function addListener(
      target: Map | Marker,
      eventName: string,
      listener: (...args: any[]) => void
    ): void;
  }

  interface MapOptions {
    center: LatLng;
    zoom: number;
    zoomControl?: boolean;
    mapTypeControl?: boolean;
  }

  interface MarkerOptions {
    position: LatLng;
    map: Map;
    title?: string;
  }

  interface InfoWindowOptions {
    content: string;
    borderWidth?: number;
    disableAnchor?: boolean;
    backgroundColor?: string;
  }
}

export {};
