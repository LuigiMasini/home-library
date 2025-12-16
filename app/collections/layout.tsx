import SideNav from '@/app/ui/sidenav';

export default async function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <SideNav/>
      <div style={{ flexGrow: 1, padding: '30px 60px', overflow: 'scroll' }}>{children}</div>
    </div>
  );
}
