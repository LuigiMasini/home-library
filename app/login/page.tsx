'use client';

import { useActionState } from 'react';
import { authenticate } from '@/app/lib/actions';
import { useSearchParams } from 'next/navigation';

import Button from '@/app/ui/button';

export default function Login () {

  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
  const [errorMessage, formAction, isPending] = useActionState(
    authenticate,
    undefined,
  );


  return (
    <main>
      <form action={formAction}>
        <div>
          <h1>Please log in to continue.</h1>
          <div>
            <div>
              <label htmlFor="username">Username</label>
              <input
                id="username"
                type="username"
                name="username"
                placeholder="Enter your username"
                required
              />
            </div>
            <div>
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                name="password"
                placeholder="Enter your password"
                required
                minLength={6}
              />
            </div>
          </div>
          <input type="hidden" name="redirectTo" value={callbackUrl} />
          <Button aria-disabled={isPending} type="submit">
            Log in
          </Button>
          <div
            aria-live="polite"
            aria-atomic="true"
          >
            {errorMessage && <p>{errorMessage}</p>}
          </div>
        </div>
      </form>

    </main>
  );
}
