import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { authConfig } from './auth.config';
import type { User } from '@/app/lib/types';
import bcrypt from 'bcrypt';
import pool, { type Row } from '@/app/lib/database';

async function getUser(username: string): Promise<User | undefined> {
  try {
    const [user] = await pool.query<Row[]>("SELECT * FROM users WHERE username=?", username);
    return user[0] as User;
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw new Error('Failed to fetch user.');
  }
}

export const { auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize({username, password}) {

        if (typeof username !== "string" || typeof password !== "string") {
          console.log('Invalid credentials');
          return null;
        }

        const user = await getUser(username);
        if (!user) return null;
        const passwordsMatch = await bcrypt.compare(password, user.password);

        if (passwordsMatch) return user;
        return null;
      },
    }),
  ],
});
