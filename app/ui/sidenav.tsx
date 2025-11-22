'use client';

import Styled from 'styled-components';
import Link from './link';
import Button from './button';
import { usePathname } from 'next/navigation';
import { signOut } from '@/auth';
import type { Collection } from '@/app/lib/types';

//TODO set max width, wrap text
//TODO make collapsible, animation, burger menu?


export default function SideNav({ collections }: { collections: Collection[] }) {
  const pathname = usePathname();

  return (
    <Container>

			<Link href='/collections' currentPathname={pathname}>Collections</Link>
			{collections.map(({ id, name }) =>
				<Link key={id} href={'/collections/'+id} currentPathname={pathname} sub>{name}</Link>
			)}
			<Link href='/collections/create' currentPathname={pathname}>Add items</Link>

			<Button onClick={() => signOut()}>Sign out</Button>

    </Container>
  );
}

const Container = Styled.div`
height: 100%;
padding: 60px 30px;
background: darkslategrey;
box-sizing: border-box;

color: white;
position: relative;

a {
	display: block;
	margin-bottom: 5px;
}

button {
	position: absolute;
	bottom: 60px;
	width: calc(100% - 30px*2);
}

`;
