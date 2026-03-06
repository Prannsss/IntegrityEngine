'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [spinning, setSpinning] = useState(false);

  useEffect(() => setMounted(true), []);

  const toggle = () => {
    setSpinning(true);
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
    // Reset spin state after animation completes
    setTimeout(() => setSpinning(false), 500);
  };

  // Avoid hydration mismatch — render a stable placeholder until mounted
  if (!mounted) {
    return <div className={cn('w-9 h-9 rounded-xl', className)} />;
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Toggle theme"
      onClick={toggle}
      className={cn(
        'w-9 h-9 rounded-xl hover:bg-muted dark:hover:bg-white/5 transition-colors relative group',
        className
      )}
    >
      <span
        className={cn(
          'flex items-center justify-center transition-transform duration-500 group-hover:rotate-180',
          spinning ? 'animate-theme-spin' : ''
        )}
      >
        {resolvedTheme === 'dark' ? (
          <Sun className="h-4 w-4" />
        ) : (
          <Moon className="h-4 w-4" />
        )}
      </span>
    </Button>
  );
}
