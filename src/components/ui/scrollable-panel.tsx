import { ScrollArea } from '@base-ui/react/scroll-area';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export interface ScrollablePanelProps extends ComponentProps<typeof ScrollArea.Root> {
  contentClassName?: string;
  viewportClassName?: string;
}

export function ScrollablePanel({
  className,
  contentClassName,
  viewportClassName,
  children,
  ...props
}: ScrollablePanelProps) {
  return (
    <ScrollArea.Root className={cn('relative min-h-0 overflow-hidden', className)} {...props}>
      <ScrollArea.Viewport className={cn('h-full w-full overscroll-contain', viewportClassName)}>
        <ScrollArea.Content className={contentClassName}>{children}</ScrollArea.Content>
      </ScrollArea.Viewport>
      <ScrollArea.Scrollbar
        orientation="vertical"
        className="m-1 flex w-2 touch-none select-none justify-center rounded-full bg-transparent py-0.5"
      >
        <ScrollArea.Thumb className="w-1.5 rounded-full bg-[var(--border-strong)] transition-colors hover:bg-[var(--border-accent)]" />
      </ScrollArea.Scrollbar>
    </ScrollArea.Root>
  );
}
