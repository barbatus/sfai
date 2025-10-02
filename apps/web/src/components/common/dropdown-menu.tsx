'use client';

import * as React from 'react';

import { cn } from '@/lib/tw';

interface DropdownMenuContextType {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const DropdownMenuContext = React.createContext<DropdownMenuContextType | undefined>(undefined);

export function DropdownMenu({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);

  return (
    <DropdownMenuContext.Provider value={{ open, setOpen }}>
      <div className="relative">{children}</div>
    </DropdownMenuContext.Provider>
  );
}

export function DropdownMenuTrigger({
  asChild,
  children,
}: {
  asChild?: boolean;
  children: React.ReactNode;
}) {
  const context = React.useContext(DropdownMenuContext);
  if (!context) throw new Error('DropdownMenuTrigger must be used within DropdownMenu');

  const handleClick = () => {
    context.setOpen(!context.open);
  };

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      onClick: handleClick,
    });
  }

  return <div onClick={handleClick}>{children}</div>;
}

export function DropdownMenuContent({
  align = 'start',
  children,
  className,
}: {
  align?: 'start' | 'end' | 'center';
  children: React.ReactNode;
  className?: string;
}) {
  const context = React.useContext(DropdownMenuContext);
  if (!context) throw new Error('DropdownMenuContent must be used within DropdownMenu');

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('[data-dropdown-menu]')) {
        context.setOpen(false);
      }
    };

    if (context.open) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [context.open, context]);

  if (!context.open) return null;

  const alignmentClasses = {
    start: 'left-0',
    end: 'right-0',
    center: 'left-1/2 -translate-x-1/2',
  };

  return (
    <div
      data-dropdown-menu
      className={cn(
        'absolute z-50 mt-2 min-w-[12rem] overflow-hidden border-2 border-foreground bg-background shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]',
        alignmentClasses[align],
        className,
      )}
    >
      {children}
    </div>
  );
}

export function DropdownMenuItem({
  children,
  onClick,
  className,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  const context = React.useContext(DropdownMenuContext);

  const handleClick = () => {
    onClick?.();
    context?.setOpen(false);
  };

  return (
    <button
      type="button"
      className={cn(
        'flex w-full items-center px-3 py-2 text-sm hover:bg-secondary transition-colors',
        className,
      )}
      onClick={handleClick}
    >
      {children}
    </button>
  );
}
