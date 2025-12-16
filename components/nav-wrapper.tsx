import { auth, signOut } from '@/auth';
import { Nav } from './nav';

export async function NavWrapper() {
  const session = await auth();

  const handleSignOut = async () => {
    'use server';
    await signOut({ redirectTo: '/login' });
  };

  return <Nav user={session?.user} onSignOut={handleSignOut} />;
}

