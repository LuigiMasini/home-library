'use server';

import { getBook, getCollections, getTags } from '@/app/lib/data';
import AddBookForm from '@/app/ui/add-book-form';

export default async function Page ({params}: {params: Promise<{book_id: string}>}) {

  const book_id = parseInt((await params).book_id);

  const [book, collections, tags] = await Promise.all([
    getBook(book_id),
    getCollections(),
    getTags(),
  ]);

  return (
    <main>
      <h2>Edit book</h2>
      <AddBookForm tags={tags} collections={collections} book={book}/>
    </main>
  );
}
