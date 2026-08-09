import { cva, type VariantProps } from 'class-variance-authority';
import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export const surfaceVariants = cva('border text-fg', {
  variants: {
    variant: {
      soft: 'border-[var(--border-subtle)] bg-surface-soft',
      default: 'border-[var(--border-default)] bg-surface',
      raised: 'border-[var(--border-default)] bg-surface-raised',
      strong: 'border-[var(--border-strong)] bg-surface-strong',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

export interface SurfaceProps extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof surfaceVariants> {}

export function Surface({ className, variant, ...props }: SurfaceProps) {
  return <div className={cn(surfaceVariants({ variant }), className)} {...props} />;
}
