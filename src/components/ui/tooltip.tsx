import { Tooltip as BaseTooltip } from '@base-ui/react/tooltip';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export const TooltipProvider = BaseTooltip.Provider;
export const Tooltip = BaseTooltip.Root;
export const TooltipTrigger = BaseTooltip.Trigger;

export interface TooltipContentProps extends ComponentProps<typeof BaseTooltip.Popup> {
  sideOffset?: number;
}

export function TooltipContent({ className, sideOffset = 8, children, ...props }: TooltipContentProps) {
  return (
    <BaseTooltip.Portal>
      <BaseTooltip.Positioner sideOffset={sideOffset} className="z-[var(--layer-system)] outline-none">
        <BaseTooltip.Popup
          className={cn(
            'max-w-64 origin-[var(--transform-origin)] rounded-[var(--radius-control)]',
            'border border-[var(--border-default)] bg-surface-strong px-3 py-2',
            'text-xs leading-relaxed text-fg shadow-overlay outline-none',
            'transition-[scale,opacity] duration-[var(--motion-fast)] ease-[var(--ease-standard)]',
            'data-[starting-style]:scale-95 data-[starting-style]:opacity-0',
            'data-[ending-style]:scale-95 data-[ending-style]:opacity-0',
            className,
          )}
          {...props}
        >
          {children}
        </BaseTooltip.Popup>
      </BaseTooltip.Positioner>
    </BaseTooltip.Portal>
  );
}
