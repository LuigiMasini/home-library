'use server';

import { getBook, getCollections, getTags } from '@/app/lib/data';

export default async function Page ({params}: {params: Promise<{book_id: string}>}) {

  const book_id = parseInt((await params).book_id);

  const [book, collections, tags] = await Promise.all([
    getBook(book_id),
    getCollections(),
    getTags(),
  ]);

  return (
    <main>
    </main>
  );
}
