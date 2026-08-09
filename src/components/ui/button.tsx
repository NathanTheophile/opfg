import { cva, type VariantProps } from 'class-variance-authority';
import type { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export const buttonVariants = cva(
  [
    'inline-flex min-h-[var(--touch-target-min)] items-center justify-center gap-2',
    'rounded-[var(--radius-control)] border px-4 py-2 text-sm font-semibold leading-none',
    'select-none whitespace-nowrap shadow-control',
    'transition-[background-color,border-color,color,box-shadow,transform,translate,opacity]',
    'duration-[var(--motion-fast)] ease-[var(--ease-standard)]',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
    'active:translate-y-px',
    'disabled:pointer-events-none disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-45',
  ].join(' '),
  {
    variants: {
      variant: {
        default:
          'border-[var(--border-default)] bg-surface text-fg hover:border-[var(--border-strong)] hover:bg-surface-hover active:bg-surface-pressed',
        primary:
          'border-[var(--border-accent)] bg-gold text-[var(--text-inverse)] hover:bg-gold-strong active:brightness-90',
        subtle:
          'border-transparent bg-surface-soft text-fg-secondary shadow-none hover:border-[var(--border-subtle)] hover:bg-surface-hover hover:text-fg',
        danger:
          'border-[var(--border-critical)] bg-critical/[0.18] text-fg hover:bg-critical/[0.28] active:bg-critical/[0.36]',
      },
      size: {
        sm: 'min-h-9 px-3 py-1.5 text-xs',
        md: '',
        lg: 'min-h-12 px-5 py-3 text-base',
        icon: 'size-[var(--touch-target-min)] shrink-0 p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export function Button({ className, variant, size, type = 'button', ...props }: ButtonProps) {
  return <button type={type} className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
