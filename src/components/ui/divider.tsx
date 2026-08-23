import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface DividerProps extends HTMLAttributes<HTMLHRElement> {
  accent?: boolean;
}

export function Divider({ className, accent = false, ...props }: DividerProps) {
  return (
    <hr
      className={cn(
        'h-px w-full border-0',
        accent ? 'bg-[var(--border-accent)]' : 'bg-[var(--border-subtle)]',
        className,
      )}
      {...props}
    />
  );
}
