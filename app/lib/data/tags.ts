import pool from '@/app/lib/database';
import { type Tag } from '@/app/lib/types';

export async function getTags(): Promise<Tag[]> {
  const [tags] = await pool.query('SELECT * FROM tags ORDER BY id');
  return tags as Tag[];
}
