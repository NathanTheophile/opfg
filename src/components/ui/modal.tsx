import { Dialog } from '@base-ui/react/dialog';
import type { ComponentProps, HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export const Modal = Dialog.Root;
export const ModalTrigger = Dialog.Trigger;
export const ModalClose = Dialog.Close;

export interface ModalContentProps extends ComponentProps<typeof Dialog.Popup> {
  backdropClassName?: string;
}

export function ModalContent({ className, backdropClassName, children, ...props }: ModalContentProps) {
  return (
    <Dialog.Portal>
      <Dialog.Backdrop
        className={cn(
          'fixed inset-0 z-[var(--layer-overlay)] bg-black/[0.55]',
          'transition-opacity duration-[var(--motion-normal)] ease-[var(--ease-standard)]',
          'data-[starting-style]:opacity-0 data-[ending-style]:opacity-0',
          backdropClassName,
        )}
      />
      <Dialog.Popup
        className={cn(
          'fixed left-1/2 top-1/2 z-[calc(var(--layer-overlay)_+_1)]',
          'max-h-[calc(100dvh_-_var(--safe-area-top)_-_var(--safe-area-bottom)_-_2rem)]',
          'w-[min(calc(100vw_-_2rem),36rem)] -translate-x-1/2 -translate-y-1/2 overflow-auto',
          'rounded-[var(--radius-overlay)] border border-[var(--border-strong)] bg-surface-strong',
          'p-5 text-fg shadow-overlay outline-none md:p-6',
          'transition-[scale,opacity] duration-[var(--motion-normal)] ease-[var(--ease-emphasized)]',
          'data-[starting-style]:scale-95 data-[starting-style]:opacity-0',
          'data-[ending-style]:scale-95 data-[ending-style]:opacity-0',
          className,
        )}
        {...props}
      >
        {children}
      </Dialog.Popup>
    </Dialog.Portal>
  );
}


export function ModalTitle({ className, ...props }: ComponentProps<typeof Dialog.Title>) {
  return <Dialog.Title className={cn('font-display text-xl font-semibold leading-tight text-fg', className)} {...props} />;
}

export function ModalDescription({ className, ...props }: ComponentProps<typeof Dialog.Description>) {
  return <Dialog.Description className={cn('text-sm leading-relaxed text-fg-secondary', className)} {...props} />;
}

export function ModalHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('mb-4 flex flex-col gap-1.5', className)} {...props} />;
}

export function ModalBody({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('min-w-0 text-sm leading-relaxed text-fg-secondary', className)} {...props} />;
}

export function ModalFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('mt-5 flex flex-wrap items-center justify-end gap-2', className)} {...props} />;
}
