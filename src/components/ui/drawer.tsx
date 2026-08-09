import { Drawer as BaseDrawer } from '@base-ui/react/drawer';
import { createContext, useContext, type ComponentProps, type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type DrawerSide = 'left' | 'right' | 'bottom';

const DrawerSideContext = createContext<DrawerSide>('right');

export interface DrawerProps extends Omit<ComponentProps<typeof BaseDrawer.Root>, 'swipeDirection'> {
  side?: DrawerSide;
}

export function Drawer({ side = 'right', children, ...props }: DrawerProps) {
  const swipeDirection = side === 'bottom' ? 'down' : side;

  return (
    <DrawerSideContext.Provider value={side}>
      <BaseDrawer.Root swipeDirection={swipeDirection} {...props}>
        {children}
      </BaseDrawer.Root>
    </DrawerSideContext.Provider>
  );
}

export const DrawerTrigger = BaseDrawer.Trigger;
export const DrawerClose = BaseDrawer.Close;
export const DrawerVirtualKeyboardProvider = BaseDrawer.VirtualKeyboardProvider;

export interface DrawerContentProps extends ComponentProps<typeof BaseDrawer.Popup> {
  backdropClassName?: string;
  viewportClassName?: string;
}

const viewportSideClasses: Record<DrawerSide, string> = {
  left: 'items-stretch justify-start',
  right: 'items-stretch justify-end',
  bottom: 'items-end justify-center',
};

const popupSideClasses: Record<DrawerSide, string> = {
  left: [
    'h-full w-[min(92vw,28rem)] rounded-r-[var(--radius-overlay)] border-r',
    '[transform:translateX(var(--drawer-swipe-movement-x))]',
    'data-[starting-style]:-translate-x-full data-[ending-style]:-translate-x-full',
  ].join(' '),
  right: [
    'h-full w-[min(92vw,28rem)] rounded-l-[var(--radius-overlay)] border-l',
    '[transform:translateX(var(--drawer-swipe-movement-x))]',
    'data-[starting-style]:translate-x-full data-[ending-style]:translate-x-full',
  ].join(' '),
  bottom: [
    'max-h-[min(88dvh,46rem)] w-full rounded-t-[var(--radius-overlay)] border-t',
    '[transform:translateY(var(--drawer-swipe-movement-y))]',
    'data-[starting-style]:translate-y-full data-[ending-style]:translate-y-full',
  ].join(' '),
};

export function DrawerContent({
  className,
  backdropClassName,
  viewportClassName,
  children,
  ...props
}: DrawerContentProps) {
  const side = useContext(DrawerSideContext);

  return (
    <BaseDrawer.Portal>
      <BaseDrawer.Backdrop
        className={cn(
          'fixed inset-0 z-[var(--layer-overlay)] bg-black/[0.55]',
          'transition-opacity duration-[var(--motion-normal)] ease-[var(--ease-standard)]',
          'data-[starting-style]:opacity-0 data-[ending-style]:opacity-0',
          backdropClassName,
        )}
      />
      <BaseDrawer.Viewport
        className={cn(
          'fixed inset-0 z-[calc(var(--layer-overlay)_+_1)] flex',
          viewportSideClasses[side],
          viewportClassName,
        )}
      >
        <BaseDrawer.Popup
          className={cn(
            'border-[var(--border-strong)] bg-surface-strong text-fg shadow-overlay outline-none',
            'transition-[transform,translate,opacity] duration-[var(--motion-normal)] ease-[var(--ease-emphasized)]',
            popupSideClasses[side],
            className,
          )}
          {...props}
        >
          {side === 'bottom' && (
            <div className="mx-auto mt-2.5 h-1 w-10 rounded-full bg-[var(--border-strong)]" aria-hidden="true" />
          )}
          <BaseDrawer.Content className="h-full min-h-0 overflow-hidden p-5 md:p-6">
            {children}
          </BaseDrawer.Content>
        </BaseDrawer.Popup>
      </BaseDrawer.Viewport>
    </BaseDrawer.Portal>
  );
}


export function DrawerTitle({ className, ...props }: ComponentProps<typeof BaseDrawer.Title>) {
  return <BaseDrawer.Title className={cn('font-display text-xl font-semibold leading-tight text-fg', className)} {...props} />;
}

export function DrawerDescription({ className, ...props }: ComponentProps<typeof BaseDrawer.Description>) {
  return <BaseDrawer.Description className={cn('text-sm leading-relaxed text-fg-secondary', className)} {...props} />;
}

export function DrawerHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('mb-4 flex flex-col gap-1.5', className)} {...props} />;
}

export function DrawerBody({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('min-h-0 flex-1 text-sm leading-relaxed text-fg-secondary', className)} {...props} />;
}

export function DrawerFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('mt-5 flex flex-wrap items-center justify-end gap-2', className)} {...props} />;
}
