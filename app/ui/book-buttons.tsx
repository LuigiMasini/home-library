'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { duplicateBook, removeBook } from '@/app/lib/actions';
import type { Book } from '@/app/lib/types';
import Button from  './button';
import ConfirmationButton from './confirmation-button';

export default function ({ book }: { book: Book }) {

  const [mex, setMex] = useState<string>();
  const router = useRouter();

  const _edit = () => router.push(`/collections/${book.collection_id}/${book.id}/edit`)

  const _duplicate = () => duplicateBook(book)
    .then(() => setMex('Book duplicated'))
    .catch(e => setMex(e.message))

  const _delete = () => removeBook(book.id)
    .then(() => router.push('/collections/'+book.collection_id))
    .catch(e => setMex(e.message))


  return (
    <>
      <Button onClick={_edit}>Edit</Button>
      <Button onClick={_duplicate}>Duplicate</Button>
      <ConfirmationButton onClick={_delete}>Delete</ConfirmationButton>
      <div aria-live='polite' aria-atomic='true'>
        {mex && <p style={{ whiteSpace: 'pre' }}>{mex}</p>}
      </div>
    </>
  )
}
