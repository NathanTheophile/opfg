import { cva, type VariantProps } from 'class-variance-authority';
import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex min-h-6 items-center rounded-[var(--radius-pill)] border px-2.5 py-0.5 text-xs font-semibold leading-none',
  {
    variants: {
      variant: {
        default: 'border-[var(--border-default)] bg-surface-soft text-fg-secondary',
        gold: 'border-[var(--border-accent)] bg-gold/[0.12] text-gold',
        success: 'border-success/[0.45] bg-success/[0.12] text-success',
        warning: 'border-warning/[0.45] bg-warning/[0.12] text-warning',
        critical: 'border-[var(--border-critical)] bg-critical/[0.12] text-critical',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
