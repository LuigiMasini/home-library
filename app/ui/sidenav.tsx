'use client';

import Link from './link';
import Button from './button';
import { usePathname } from 'next/navigation';
import { signOut } from '@/auth';
import type { Collection } from '@/app/lib/types';

export default function SideNav({ collections }: { collections: Collection[] }) {
  const pathname = usePathname();

  return (
    <div style={{ height: '100%', padding: '60px 30px', background: 'darkslategrey' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, color: 'white' }}>

        <Link href='/collections' currentPathname={pathname}>Collections</Link>
        {collections.map(({ id, name }) =>
          <Link key={id} href={'/collections/'+id} currentPathname={pathname} sub>{name}</Link>
        )}
        <Link href='/collections/create' currentPathname={pathname}>Add items</Link>

        <Button style={{ marginTop: 30 }} onClick={() => signOut()}>Sign out</Button>

      </div>
    </div>
  );
}
