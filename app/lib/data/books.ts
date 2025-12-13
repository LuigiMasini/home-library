import pool, { type Row } from '@/app/lib/database';
import { type Book } from '@/app/lib/types';
import { isValidId } from '@/app/lib/utils';


// TODO pagination, ordering, filters

export async function getCollectionBooks(collection_id: number): Promise<Book[]> {

  if (!isValidId(collection_id))
    throw new Error('getCollectionBooks expected positive integer but got '+collection_id);

  const [books] = await pool.query('SELECT * FROM books WHERE collection_id=?', collection_id);
  return books as Book[];
}

export async function getBook(book_id: number): Promise<Book> {

  if (!isValidId(book_id))
    throw new Error('getBook expected positive integer but got '+book_id);

  const [[book]] = await pool.query<Row[]>('SELECT * FROM books WHERE id=? LIMIT 1', book_id);
  return book as Book;
}

export async function getBookCover(book_id: number): Promise<string> {

  if (!isValidId(book_id))
    throw new Error('getBook expected positive integer but got '+book_id);

  const [[book]] = await pool.query<Row[]>('SELECT cover FROM books WHERE id=? LIMIT 1', book_id);
  return book.cover;
}
