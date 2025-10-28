'use server';

import { notFound } from 'next/navigation';
import { getBook, getCollections, getTags } from '@/app/lib/data';
import Book from '@/app/ui/book';
import BookButtons from '@/app/ui/book-buttons';

export default async function Page ({params}: {params: Promise<{book_id: string}>}) {

  const book_id = parseInt((await params).book_id);
  if (!isFinite(book_id)) notFound();

  const [book, collections, tags] = await Promise.all([
    getBook(book_id),
    getCollections(),
    getTags(),
  ]);

  if (!book) notFound();

  return (
    <main>
      <Book book={book} tags={tags} collections={collections} detailed/>
      <BookButtons book={book}/>
    </main>
  );
}
