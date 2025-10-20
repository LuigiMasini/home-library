import pool from '@/app/lib/database';
import { type Collection } from '@/app/lib/types';

export async function getCollections(): Promise<Collection[]> {
  const [collections] = await pool.query('SELECT * FROM collections ORDER BY id');
  return collections as Collection[];
}
