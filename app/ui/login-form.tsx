'use client';

import { useActionState } from 'react';
import { useSearchParams } from 'next/navigation';
import { authenticate } from '@/app/lib/actions';

import Button from '@/app/ui/button';
import Field from '@/app/ui/form-field';

export default function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/collections';
  const [errorMessage, formAction, isPending] = useActionState(
    authenticate,
    undefined,
  );

  return (
    <form action={formAction}>
      <Field>
        <label htmlFor="username">Username</label>
        <input
          id="username"
          type="username"
          name="username"
          placeholder="Enter your username"
          required
        />
      </Field>
      <Field>
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          name="password"
          placeholder="Enter your password"
          required
          minLength={6}
        />
      </Field>

      <input type="hidden" name="redirectTo" value={callbackUrl} />

      <Button aria-disabled={isPending} type="submit">
        Log in
      </Button>

      <div aria-live="polite" aria-atomic="true">
        {errorMessage && <p>{errorMessage}</p>}
      </div>
    </form>
  );
}
