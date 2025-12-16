import SidenavContainer from './sidenav-container';
import SidenavLinksContainer from './sidenav-links-container';
import Button from './button';
import { signOut } from '@/auth';

//TODO set max width, wrap text
//TODO make collapsible, animation, burger menu?


export default function SideNav() {
  return (
    <SidenavContainer>

      <SidenavLinksContainer/>

      <form
        action={async () => {
          'use server';
          await signOut();
        }}
        >
        <Button type='submit'>Sign out</Button>
			</form>

    </SidenavContainer>
  );
}

