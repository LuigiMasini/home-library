'use client';

import { useActionState } from 'react';
import Button from '@/app/ui/button';
import { createCollection } from '@/app/lib/actions';

export default function AddCollectionForm() {

  const [errorMessage, formAction, isPending] = useActionState(
    createCollection,
    undefined,
  );

  return (
    <form action={formAction}>

      <p>Add a new collection:</p>

      <label htmlFor="name">Name</label>
      <input
        id="name"
        type="text"
        name="name"
        placeholder="Collection name"
        required
      />

      <Button aria-disabled={isPending}>
        +
      </Button>
      <div
        aria-live="polite"
        aria-atomic="true"
      >
        {errorMessage && <p>{errorMessage}</p>}
      </div>
    </form>
  );
}
