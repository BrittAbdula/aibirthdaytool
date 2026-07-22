'use client';

import { signIn } from 'next-auth/react';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function CreatorSignInButton() {
  return (
    <Button
      className="h-12 bg-primary px-6 text-white hover:bg-primary/90"
      onClick={() => signIn('google', { callbackUrl: '/creator' })}
    >
      Sign in to start
      <ArrowRight className="ml-2 h-4 w-4" />
    </Button>
  );
}
