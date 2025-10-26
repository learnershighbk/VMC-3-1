import { z } from 'zod';

export const ReviewFormSchema = z.object({
  authorName: z
    .string()
    .min(1, { message: '작성자명을 입력해주세요' })
    .max(20, { message: '작성자명은 최대 20자까지 입력 가능합니다' }),
  rating: z
    .number()
    .min(1, { message: '별점을 선택해주세요' })
    .max(5, { message: '별점은 최대 5점입니다' }),
  content: z
    .string()
    .min(10, { message: '리뷰 내용은 최소 10자 이상 입력해주세요' })
    .max(500, { message: '리뷰 내용은 최대 500자까지 입력 가능합니다' }),
  password: z
    .string()
    .regex(/^\d{4}$/, { message: '비밀번호는 숫자 4자리로 입력해주세요' }),
});

export type ReviewFormValues = z.infer<typeof ReviewFormSchema>;
