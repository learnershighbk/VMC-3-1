// 네이버 검색 API의 mapx, mapy를 실제 좌표로 변환
export const convertNaverCoordinates = (mapx: string, mapy: string) => {
  return {
    longitude: Number(mapx) / 10_000_000,
    latitude: Number(mapy) / 10_000_000,
  };
};

// HTML 태그 제거 (네이버 API는 <b> 태그 포함)
export const stripHtmlTags = (html: string): string => {
  return html.replace(/<[^>]*>/g, '');
};
