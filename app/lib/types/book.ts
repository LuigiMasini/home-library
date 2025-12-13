import z from 'zod';
import { longTextLength, shortTextLength, year_max, year_min } from '@/app/lib/constants';
import { audit, asIsbn13, hyphenate } from 'isbn3';

/*export type Book = {
  id: number;
  title?: string;
  authors?: string;
  publisher?: string;
  publish_year?: number;
  publish_month?: number;
  publish_day?: number;
  pages?: number;
  description?: string;
  notes?: string;
  collection_id: number;
  tags_ids?: number[];
  group_name?: string;
  isbn?: string;
  language?: string;
}*/

export type Book = z.infer<typeof BookSchema>;


export const BookSchema = z.object({
  id: z.coerce.number().int().nonnegative(),
  title: z.string().max(shortTextLength).optional(),
  authors: z.string().max(longTextLength).optional(),
  publisher: z.string().max(shortTextLength).optional(),
  publish_year: z.coerce.number().int().max(year_max).min(year_min).optional(),
  publish_month: z.coerce.number().int().min(1).max(12).optional(),
  publish_day: z.coerce.number().int().min(1).max(31).optional(),
  pages: z.coerce.number().int().nonnegative().optional(),
  description: z.string().max(longTextLength).optional(),
  notes: z.string().max(longTextLength).optional(),
  collection_id: z.coerce.number().int().nonnegative(),
  tags_ids: z
    .string()
    .transform((val, ctx) => {
      try {
        return JSON.parse(val);
      } catch (error) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'invalid json',
        });
        return z.never;
      }
    })
    .pipe(z.array(z.number().int().nonnegative()))
    .transform(val => JSON.stringify(val)).optional(),
  group_name: z.string().max(shortTextLength).optional(),
  isbn: z.string().refine(val => audit(val).validIsbn).transform(val => hyphenate(asIsbn13(val) as string)).optional(),
  language: z.string().max(shortTextLength).optional(),
  cover: z.string().max(shortTextLength).optional(),
})
