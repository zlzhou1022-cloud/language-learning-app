'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // Use a transition to avoid hydration mismatch
  React.useEffect(() => {
    React.startTransition(() => {
      setMounted(true);
    });
  }, []);

  if (!mounted) {
    return (
      <Button variant="ghost" size="sm" className="h-8 w-8 rounded-md p-0">
        <Sun strokeWidth={1.5} className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
      aria-label="Toggle theme"
      className="h-8 w-8 rounded-md p-0 text-muted-foreground hover:bg-accent hover:text-foreground"
    >
      {resolvedTheme === 'dark' ? (
        <Moon strokeWidth={1.5} className="h-4 w-4" />
      ) : (
        <Sun strokeWidth={1.5} className="h-4 w-4" />
      )}
    </Button>
  );
}
