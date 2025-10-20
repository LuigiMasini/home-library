'use server';

import { revalidatePath } from 'next/cache';
import pool, { type Row, type SetResult } from '@/app/lib/database';
import { type Collection } from '@/app/lib/types';
import { isValidId } from '@/app/lib/utils';

//BEGIN queries

async function insertCollection({ name }: Omit<Collection, 'id'>): Promise<number> {
  const [{ insertId }] = await pool.query<SetResult>('INSERT INTO collections (name) VALUES (?)', name);
  return insertId;
}


export async function updateCollection(collection_id: number, { name }: Omit<Collection, 'id'>) {

  if (!isValidId(collection_id))
    throw new Error('updateCollection expected positive integer but got '+collection_id);

  await pool.query('UPDATE collections SET name=? WHERE id=? LIMIT 1', [name, collection_id]);

  revalidatePath('/collections');
}


export async function deleteCollection(collection_id: number) {

  if (!isValidId(collection_id))
    throw new Error('deleteCollection expected positive integer but got '+collection_id);

  const [[count]] = await pool.query<Row[]>('SELECT count(id) FROM books WHERE collection_id=?', collection_id);

  if (!count)
    throw new Error ('The collection is not empty');

  await pool.query('DELETE FROM collections WHERE id = ? LIMIT 1', collection_id);

  revalidatePath('/collections');
}

//END queries


export async function createCollection(
  prevState: string | undefined,
  formData: FormData
): Promise<string | undefined> {

  const name = (formData.get('name') as string).trim();

  if (!name.length)
    return 'A name for the collection is needed';
  if (name.length >= 255)
    return 'Name too long';

  await insertCollection({ name });

  revalidatePath('/collections');
}
