import { cva, type VariantProps } from 'class-variance-authority';
import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import './panel-skin.css';

const panelVariants = cva(
  'opfg-panel-skin border text-fg',
  {
    variants: {
      variant: {
        default: '',
        strong: '',
        critical: '',
      },
      padding: {
        none: '',
        sm: 'p-3',
        md: 'p-5',
        lg: 'p-6 md:p-7',
      },
    },
    defaultVariants: {
      variant: 'default',
      padding: 'md',
    },
  },
);

export interface PanelProps
  extends HTMLAttributes<HTMLElement>,
    VariantProps<typeof panelVariants> {}

export function Panel({ className, variant, padding, children, ...props }: PanelProps) {
  return (
    <section className={cn(panelVariants({ variant, padding }), className)} {...props}>
      <span aria-hidden="true" className="opfg-panel-skin__frame" />
      {children}
    </section>
  );
}

export function PanelHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('mb-4 flex flex-col gap-1.5', className)} {...props} />;
}

export function PanelTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={cn('font-display text-xl font-semibold leading-tight text-fg', className)} {...props} />;
}

export function PanelDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('text-sm leading-relaxed text-fg-secondary', className)} {...props} />;
}

export function PanelBody({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('min-w-0', className)} {...props} />;
}

export function PanelFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('mt-5 flex flex-wrap items-center justify-end gap-2', className)} {...props} />;
}
