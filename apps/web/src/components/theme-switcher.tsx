'use client';

import { Monitor, Palette } from 'lucide-react';

import { Button } from '@/components/common/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/common/dropdown-menu';
import { useTheme } from '@/contexts/theme-context';

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="h-9 w-9" aria-label="Switch theme">
          <Palette className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme('neo-brutalist')} className="gap-2">
          <Monitor className="h-4 w-4" />
          <span className="font-medium">Neo Brutalist</span>
          {theme === 'neo-brutalist' && <span className="ml-auto text-xs">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('classic-blue')} className="gap-2">
          <Monitor className="h-4 w-4" />
          <span className="font-medium">Classic Blue</span>
          {theme === 'classic-blue' && <span className="ml-auto text-xs">✓</span>}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
