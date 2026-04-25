'use client';

import { useEffect, useState, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Ensures children are only rendered on the client to avoid hydration mismatches
 * for components that depend heavily on browser APIs or client-side context.
 */
export function ClientOnly({ children, fallback = null }: Props) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
