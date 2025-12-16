'use client';

import { useActionState } from 'react';
import Button from '@/app/ui/button';
import { createCollection } from '@/app/lib/actions';
import Field from './form-field';

export default function AddCollectionForm() {

  const [errorMessage, formAction, isPending] = useActionState(
    createCollection,
    undefined,
  );

  return (
    <form action={formAction}>

      <Field>
        <label htmlFor="name">Add a new collection:</label>
        <input
          id="name"
          type="text"
          name="name"
          placeholder="Collection name"
          required
        />
        <Button aria-disabled={isPending} title='Create collection'>
          +
        </Button>
      </Field>

      <div
        aria-live="polite"
        aria-atomic="true"
      >
        {errorMessage && <p>{errorMessage}</p>}
      </div>
    </form>
  );
}
