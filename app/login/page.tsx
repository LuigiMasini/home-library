'use client';

import { Suspense } from 'react';
import LoginForm from '@/app/ui/login-form';

export default function Login () {
  return (
    <main>
      <h1>Please log in to continue.</h1>
      <Suspense>
        <LoginForm/>
      </Suspense>
    </main>
  );
}
