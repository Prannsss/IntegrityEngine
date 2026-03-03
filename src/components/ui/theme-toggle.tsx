'use client';

import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [spinning, setSpinning] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => setMounted(true), []);

  const toggle = useCallback(() => {
    setSpinning(true);
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  }, [resolvedTheme, setTheme]);

  if (!mounted) {
    // Render an empty placeholder with the same dimensions
    return (
      <button
        aria-label="Toggle theme"
        className={cn(
          'w-9 h-9 rounded-xl flex items-center justify-center',
          'border border-white/[0.08] bg-white/[0.03]',
          className
        )}
      />
    );
  }

  return (
    <button
      aria-label={resolvedTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      onClick={toggle}
      onAnimationEnd={() => setSpinning(false)}
      className={cn(
        'w-9 h-9 rounded-xl flex items-center justify-center',
        'border border-white/[0.08] bg-white/[0.03]',
        'hover:bg-primary/10 hover:border-primary/30',
        'text-muted-foreground hover:text-primary',
        'transition-colors duration-200',
        spinning && 'animate-theme-spin',
        className
      )}
    >
      {resolvedTheme === 'dark' ? (
        <Sun className="w-4 h-4" />
      ) : (
        <Moon className="w-4 h-4" />
      )}
    </button>
  );
}
