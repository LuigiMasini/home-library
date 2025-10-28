'use server';

import { notFound } from 'next/navigation';
import { getCollectionBooks, getCollections, getTags } from '@/app/lib/data';
import Book from '@/app/ui/book';

export default async function Page ({params}: {params: Promise<{collection_id: string}>}) {

  const collection_id = parseInt((await params).collection_id);
  if (!isFinite(collection_id)) notFound();

  const [books, collections, tags] = await Promise.all([
    getCollectionBooks(collection_id),
    getCollections(),
    getTags(),
  ]);

  if (!collections.map(({id}) => id).includes(collection_id)) notFound();

  return (
    <main style={{ width: '100%' }}>
      <p>Collection: {collections.filter(({id}) => id === collection_id)[0].name}</p>

      <section
        style={{
          width: '100%',
          display: 'grid',
          gap: 30,
          gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
        }}
      >
        {books.map((book) => <Book book={book} tags={tags} key={book.id}/>)}
      </section>

      {/*<table>
        <thead>
          <tr>
          {Object.keys(books[0]).map((key) => <th key={key}>{key}</th>)}
          </tr>
        </thead>
        <tbody>
          {books.map((book) => <tr key={book.id}>{Object.entries(book).map(([key, value]) => <td key={key}>{value}</td>)}</tr>)}
        </tbody>
      </table>*/}


    </main>
  );
}
