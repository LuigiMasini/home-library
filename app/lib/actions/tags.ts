'use server';

import pool, { type SetResult } from '@/app/lib/database';
import { type Tag } from '@/app/lib/types';
import { isValidId } from '@/app/lib/utils';

//BEGIN queries

export async function insertTag({ name, color }: Omit<Tag, 'id'>): Promise<number> {
  const [{ insertId }] = await pool.query<SetResult>('INSERT INTO tags (name, color) VALUES (?, ?)', [name, color || 'DF6C5E']);
  return insertId;
}

async function updateTag(tag_id: number, { name, color }: Omit<Tag, 'id'>) {

  if (!isValidId(tag_id))
    throw new Error('updateTag expected positive integer but got'+tag_id);

  await pool.query('UPDATE tags SET name=?, color=? WHERE id=? LIMIT 1', [name, color, tag_id]);
}

/*
 * TODO decide what to do:
 * - leave inconsistent data (no)
 * - refuse to delete if assigned
 * - update every book with that tag on tag delete
 * - remove books(tags_ids) column, use separate table (every select from books then requires a join)
 * - no tag deletion feature, like now
 *
 * updating every book is costly but only on tag delete (rare)
 * joining tables is less costly but its on every select from books
 *
 * export async function deleteTag(tag_id: number) {
 *
 *  if (!isValidId(tag_id))
 *    throw new Error('deleteTag expected positive integer but got'+tag_id);
 *
 *  await pool.query('DELETE FROM tags WHERE id = ? LIMIT 1', tag_id);
 *
 * }
 */

//END queries
