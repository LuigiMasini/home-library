'use client';

import Link from './link';
import { usePathname } from 'next/navigation';
import type { Collection } from '@/app/lib/types';


export default function NavLinks({ collections }: { collections: Collection[]}) {
  const pathname = usePathname();

  return (
    <>
      <Link href='/collections' currentPathname={pathname}>Collections</Link>
			{collections.map(({ id, name }) =>
				<Link key={id} href={'/collections/'+id} currentPathname={pathname} sub>{name}</Link>
			)}
			<Link href='/collections/create' currentPathname={pathname}>Add items</Link>
    </>
  );
}
