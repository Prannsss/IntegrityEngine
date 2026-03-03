'use client';

import { AuthProvider } from '@/context/AuthContext';
import { GooeyToaster } from 'goey-toast';
import { useTheme } from 'next-themes';

function ThemedGooeyToaster() {
  const { resolvedTheme } = useTheme();
  return (
    <GooeyToaster
      position="top-center"
      theme={resolvedTheme === 'light' ? 'light' : 'dark'}
      preset="bouncy"
      offset="20px"
    />
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {children}
      <ThemedGooeyToaster />
    </AuthProvider>
  );
}
