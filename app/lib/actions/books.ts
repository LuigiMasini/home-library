'use server';

import path from "path";
import { writeFile, cp, rm, existsSync } from "fs/promises";
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import pool, { type SetResult } from '@/app/lib/database';
import { type Book, BookSchema, type ActionState } from '@/app/lib/types';
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

async function updateBook(book_id: number, {
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
  return book_id;
}


async function deleteBook(book_id: number) {

  if (!isValidId(book_id))
    throw new Error('deleteBook expected positive integer but got'+book_id);

  await pool.query('DELETE FROM books WHERE id = ? LIMIT 1', book_id);
}

//END queries


export async function createUpdateBook(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {

  const data = Object.fromEntries(Array.from(formData.entries()).map(([key, value]) => [key, value || undefined]))
  let redirectPath: string | null = null;

  try {
    const book = BookSchema.partial({id: true}).parse(data);

    const id = book.id ? await updateBook(book.id, book) : await insertBook(book);

    const coverPath = path.join(process.cwd(), "public/uploads/" + id + '.jpg');
    if (data.cover && typeof data.cover !== 'string') {
      await writeFile(
        coverPath,
        Buffer.from(await data.cover.arrayBuffer())
      );
    }
    else if (!data.cover && existsSync(coverPath)) {
      await rm(coverPath);
    }

    revalidatePath('/collections/'+book.collection_id);

    // if we successfully updated the book, redirect
    if (book.id) redirectPath=`/collections/${book.collection_id}/${book.id}`;

    return { message: book.id ? 'Book updated' : 'Book added to the collection' };
  }
  catch (e) {
    if (e instanceof z.ZodError)
      return {
        message: e.issues.map(({ path, message }) => path+' '+message.toLowerCase()).join('\n'),
        payload: formData,
      };
    console.error(e);
    return {
      message: 'Failed to insert the book',
      payload: formData,
    };
  }
  finally {
    // y the fuck should redirect throw
    // https://nextjs.org/docs/app/api-reference/functions/redirect#behavior
    redirectPath && redirect(redirectPath);
  }
}

export async function duplicateBook(book: Book) {
  const newid = await insertBook(book);
  await cp(
    path.join(process.cwd(), "public/uploads/" + book.id + '.jpg'),
    path.join(process.cwd(), "public/uploads/" + newid + '.jpg')
  );
}

export async function removeBook(book_id: number) {
  await deleteBook(book_id);
  await rm(
    path.join(process.cwd(), "public/uploads/" + book_id + '.jpg')
  );
}
