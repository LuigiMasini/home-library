'use server';

import path from "path";
import { writeFile } from "fs/promises";
import { revalidatePath } from 'next/cache';
import pool, { type SetResult } from '@/app/lib/database';
import { type Book, BookSchema } from '@/app/lib/types/book';
import { isValidId } from '@/app/lib/utils';
import z from 'zod';


//BEGIN queries

async function insertBook({
  title,
  authors,
  publisher,
  publish_year,
  publish_month,
  publish_day,
  pages,
  description,
  notes,
  collection_id,
  tags_ids,
  group_name,
  isbn,
  language,
}: Omit<Book, 'id'>): Promise<number> {

  const [{ insertId }] = await pool.query<SetResult>(
    `INSERT INTO books (
      title,
      authors,
      publisher,
      publish_year,
      publish_month,
      publish_day,
      pages,
      description,
      notes,
      collection_id,
      tags_ids,
      group_name,
      isbn,
      language
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [
      title,
      authors,
      publisher,
      publish_year,
      publish_month,
      publish_day,
      pages,
      description,
      notes,
      collection_id,
      tags_ids,
      group_name,
      isbn,
      language,
    ]);
  return insertId;
}


// TODO bulk edit

// TODO check if update rewrites unchanged fileds & if it is slower
// TODO check if empty string writes null

export async function updateBook(book_id: number, {
  title,
  authors,
  publisher,
  publish_year,
  publish_month,
  publish_day,
  pages,
  description,
  notes,
  collection_id,
  tags_ids,
  group_name,
  isbn,
  language,
}: Omit<Book, 'id'>) {

  if (!isValidId(book_id))
    throw new Error('updateBook expected positive integer but got'+book_id);

  await pool.query(
    `UPDATE books SET
      title=?,
      authors=?,
      publisher=?,
      publish_year=?,
      publish_month=?,
      publish_day=?,
      pages=?,
      description=?,
      notes=?,
      collection_id=?,
      tags_ids=?,
      group_name=?,
      isbn=?,
      language=?
    WHERE id=? LIMIT 1`,
    [
      title,
      authors,
      publisher,
      publish_year,
      publish_month,
      publish_day,
      pages,
      description,
      notes,
      collection_id,
      tags_ids,
      group_name,
      isbn,
      language,
      book_id,
    ]);
}


export async function deleteBook(book_id: number) {

  if (!isValidId(book_id))
    throw new Error('deleteBook expected positive integer but got'+book_id);

  await pool.query('DELETE FROM books WHERE id = ? LIMIT 1', book_id);
}

//END queries


export async function createBook(
  prevState: string | undefined,
  formData: FormData
): Promise<string | undefined> {

  const data = Object.fromEntries(Array.from(formData.entries()).map(([key, value]) => [key, value || undefined]))

  try {
    const book = BookSchema.omit({id: true}).parse(data);
    const id = await insertBook(book);

    if (data.cover && typeof data.cover !== 'string') {
      const ext = data.cover.name.split('.').pop();

      await writeFile(
        path.join(process.cwd(), "public/uploads/" + id + '.' + ext),
        Buffer.from(await data.cover.arrayBuffer())
      );
    }

    revalidatePath('/collections/'+book.collection_id);
  }
  catch (e) {
    console.error(e);
    if (e instanceof z.ZodError)
      return e.issues.map(({ path, message }) => path+' '+message.toLowerCase()).join('\n');
    return "Failed to insert the book";
  }
}
