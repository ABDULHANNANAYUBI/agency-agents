'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useStore } from '@/lib/store';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const currentUser = useStore((s) => s.currentUser);
  const isInitialized = useStore((s) => s.isInitialized);

  const isAuthPage = pathname.startsWith('/auth');

  useEffect(() => {
    // Wait until initAuth() has finished before deciding to redirect.
    // This prevents a flash of the /auth page while the token is being validated.
    if (!isInitialized) return;
    if (!isAuthPage && currentUser === null) {
      router.replace('/auth');
    }
  }, [currentUser, isInitialized, router, isAuthPage]);

  // Always render auth pages — they handle their own UI
  if (isAuthPage) return <>{children}</>;

  // While initAuth() is running, show a centered spinner
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Redirecting to /auth — keep spinner up to avoid layout flash
  if (currentUser === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
