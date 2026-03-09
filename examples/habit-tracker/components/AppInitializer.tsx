'use client';

import { useEffect } from 'react';
import { useStore } from '@/lib/store';

/**
 * Mounted once inside the root layout. Calls initAuth() so the Zustand store
 * restores the user session from any stored JWT token before any protected
 * pages are rendered.
 */
export default function AppInitializer({
  children,
}: {
  children: React.ReactNode;
}) {
  const initAuth = useStore((s) => s.initAuth);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  return <>{children}</>;
}
