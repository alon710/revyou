'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Register page - redirects to login
 * Since we're using Google OAuth, registration happens automatically
 * on first login
 */
export default function RegisterPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to login page
    router.push('/login');
  }, [router]);

  return null;
}
