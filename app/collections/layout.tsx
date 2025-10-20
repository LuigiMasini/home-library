import SideNav from '@/app/ui/sidenav';
import { getCollections } from '@/app/lib/data';

export default async function Layout({ children }: { children: React.ReactNode }) {
  const collections = await getCollections();

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <SideNav collections={collections}/>
      <div style={{ flexGrow: 1, padding: '30px 60px', overflow: 'scroll' }}>{children}</div>
    </div>
  );
}
