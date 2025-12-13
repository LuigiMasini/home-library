'use server';

import path from "path";
import { writeFile, cp, rm } from "fs/promises";
import { existsSync } from 'fs';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import pool, { type SetResult } from '@/app/lib/database';
import { getBookCover } from '@/app/lib/data/books';
import { type Book, BookSchema, type ActionState } from '@/app/lib/types';
import { isValidId, getFileExtension } from '@/app/lib/utils';
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
}: Omit<Book, 'id' | 'cover'>): Promise<number> {

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
}: Omit<Book, 'id' | 'cover'>): Promise<number> {

  if (!isValidId(book_id))
    throw new Error('updateBook expected positive integer but got '+book_id);

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
    throw new Error('deleteBook expected positive integer but got '+book_id);

  await pool.query('DELETE FROM books WHERE id = ? LIMIT 1', book_id);
}


async function updateBookCover(book_id: number, cover: string | null) {

  if (!isValidId(book_id))
    throw new Error('updateBookCover expected positive integer but got '+book_id);

  await pool.query(`UPDATE books SET cover=? WHERE id=? LIMIT 1`, [cover, book_id]);
}

//END queries

/**
 * Save cover file and update the db.
 * Returns the new cover path.
 */
async function writeCover(book_id: number, file: File) {
  if (!isValidId(book_id))
    throw new Error('writeCover expected positive integer but got '+book_id);

  const ext = getFileExtension(file.name, file.type);
  const coverPath = '/uploads/'+book_id+ext;

  await writeFile(
    path.join(process.cwd(), 'public', coverPath),
    Buffer.from(await file.arrayBuffer())
  );

  await updateBookCover(book_id, coverPath);
  return coverPath;
}

/**
 * Delete cover file, without updating the db
 */
async function deleteCover(book_id: number) {
  if (!isValidId(book_id))
    throw new Error('deleteCover expected positive integer but got '+book_id);

  const bookCover = await getBookCover(book_id);
  if (!bookCover) return;

  const coverPath = path.join(process.cwd(), 'public', bookCover);
  existsSync(coverPath) && await rm(coverPath);
}


export async function createUpdateBook(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  let redirectPath: string | null = null;

  try {
    // remove empty strings and files
    const data = Object.fromEntries(
      Array
      .from(formData.entries())
      .map(([key, value]) => [key, value.length || value.size ? value : undefined])
    )
    const book = BookSchema.partial({ id: true }).omit({ cover: true }).parse(data);


    if (!book.id) {
      // create book
      const id = await insertBook(book);

      if (data.cover_file instanceof File) {
        await writeCover(id, data.cover_file);
      }
    }
    else {
      // update book
      await updateBook(book.id, book);

      if (data.delete_cover === 'true') {
        // delete cover
        await deleteCover(book.id);
        await updateBookCover(book.id, null);
      }
      else if (data.cover_file instanceof File) {
        // create new cover or update existing cover
        await deleteCover(book.id);
        await writeCover(book.id, data.cover_file);
      }
      else {
        // fix artefacts of 20251212171406_save_book_cover_file migration
        // check if book.cover actually exists or correct the field
        //WARNING to be removed in the future
        const bookCover = await getBookCover(book.id);
        if (bookCover) {
          const coverPath = path.join(process.cwd(), 'public', bookCover);
          !existsSync(coverPath) && updateBookCover(book.id, null);
        }
      }

      // if we successfully updated the book, redirect (inside finally)
      redirectPath=`/collections/${book.collection_id}/${book.id}`;
    }

    //NOTE should we revalidate also/only the single book page?
    revalidatePath('/collections/'+book.collection_id);

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

  if (!book.cover) return;

  const newCover = book.cover.replace(book.id+'', newid+'');
  await cp(
    path.join(process.cwd(), 'public', book.cover),
    path.join(process.cwd(), 'public', newCover)
  );
  await updateBookCover(newid, newCover);
}

export async function removeBook(book_id: number) {
  await deleteCover(book_id);
  await deleteBook(book_id);
}
