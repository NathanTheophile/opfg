import type { ComponentProps } from 'react';
import { Button } from './button';

type IconButtonProps = Omit<ComponentProps<typeof Button>, 'size' | 'aria-label'> & {
  label: string;
};

export function IconButton({ label, title, ...props }: IconButtonProps) {
  return <Button aria-label={label} title={title ?? label} size="icon" {...props} />;
}
