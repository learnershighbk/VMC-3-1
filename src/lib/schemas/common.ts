import { z } from 'zod';

// 네이버 검색 API 응답 (Local)
export const NaverSearchItemSchema = z.object({
  title: z.string(),
  link: z.string().optional(),
  category: z.string().optional(),
  address: z.string(),
  roadAddress: z.string(),
  mapx: z.string(), // 경도 * 10^7
  mapy: z.string(), // 위도 * 10^7
});

export const NaverSearchResponseSchema = z.object({
  items: z.array(NaverSearchItemSchema),
  total: z.number().optional(),
  start: z.number().optional(),
  display: z.number().optional(),
});

// 좌표 검증
export const CoordinateSchema = z.object({
  latitude: z.number().min(33).max(43),
  longitude: z.number().min(124).max(132),
});

// 페이지네이션 (향후 확장용)
export const PaginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export type NaverSearchItem = z.infer<typeof NaverSearchItemSchema>;
export type NaverSearchResponse = z.infer<typeof NaverSearchResponseSchema>;
export type Coordinate = z.infer<typeof CoordinateSchema>;
export type PaginationQuery = z.infer<typeof PaginationQuerySchema>;
