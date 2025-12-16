'use server';

import SidenavLinks from './sidenav-links';
import { getCollections } from '@/app/lib/data';


export default async function NavLinks() {
  const collections = await getCollections();

  return <SidenavLinks collections={collections} />
}
