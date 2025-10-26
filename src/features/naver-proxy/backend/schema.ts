import { z } from 'zod';
import { NaverSearchResponseSchema } from '@/lib/schemas/common';

// 검색 쿼리
export const SearchQuerySchema = z.object({
  query: z.string().min(1).max(100),
  display: z.coerce.number().int().positive().max(5).default(5),
});

export const SearchResponseSchema = NaverSearchResponseSchema;

export type SearchQuery = z.infer<typeof SearchQuerySchema>;
export type SearchResponse = z.infer<typeof SearchResponseSchema>;
