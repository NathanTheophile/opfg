import {
  type CSSProperties,
  type ReactNode,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import './context-tooltip.css';

type TooltipSide = 'auto' | 'left' | 'right' | 'top' | 'bottom';

export interface ContextTooltipProps {
  title: string;
  detail: string;
  meta?: string;
  accent?: string;
  side?: TooltipSide;
  className?: string;
  children: ReactNode;
  focusable?: boolean;
}

interface TooltipPosition {
  left: number;
  top: number;
  placement: Exclude<TooltipSide, 'auto'>;
}

const GAP = 10;
const VIEWPORT_PADDING = 10;

export function ContextTooltip({
  title,
  detail,
  meta,
  accent,
  side = 'auto',
  className,
  children,
  focusable = false,
}: ContextTooltipProps) {
  const id = useId();
  const triggerRef = useRef<HTMLSpanElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<TooltipPosition | null>(null);

  useLayoutEffect(() => {
    if (!open) return;

    const update = () => {
      const trigger = triggerRef.current;
      const tooltip = tooltipRef.current;
      if (!trigger || !tooltip) return;

      const a = trigger.getBoundingClientRect();
      const b = tooltip.getBoundingClientRect();
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      const fits = {
        right: a.right + GAP + b.width <= vw - VIEWPORT_PADDING,
        left: a.left - GAP - b.width >= VIEWPORT_PADDING,
        top: a.top - GAP - b.height >= VIEWPORT_PADDING,
        bottom: a.bottom + GAP + b.height <= vh - VIEWPORT_PADDING,
      };

      let placement: TooltipPosition['placement'];

      if (side !== 'auto' && fits[side]) {
        placement = side;
      } else if (fits.right) {
        placement = 'right';
      } else if (fits.left) {
        placement = 'left';
      } else if (fits.bottom) {
        placement = 'bottom';
      } else {
        placement = 'top';
      }

      let left = a.left;
      let top = a.top;

      if (placement === 'right') {
        left = a.right + GAP;
        top = a.top + a.height / 2 - b.height / 2;
      } else if (placement === 'left') {
        left = a.left - GAP - b.width;
        top = a.top + a.height / 2 - b.height / 2;
      } else if (placement === 'bottom') {
        left = a.left + a.width / 2 - b.width / 2;
        top = a.bottom + GAP;
      } else {
        left = a.left + a.width / 2 - b.width / 2;
        top = a.top - GAP - b.height;
      }

      left = Math.max(
        VIEWPORT_PADDING,
        Math.min(vw - VIEWPORT_PADDING - b.width, left),
      );
      top = Math.max(
        VIEWPORT_PADDING,
        Math.min(vh - VIEWPORT_PADDING - b.height, top),
      );

      setPosition({ left, top, placement });
    };

    update();

    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);

    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [open, side]);

  const style = {
    '--opfg-context-tooltip-accent': accent ?? 'var(--gold)',
  } as CSSProperties;

  return (
    <>
      <span
        ref={triggerRef}
        className={`opfg-context-tooltip__trigger${className ? ` ${className}` : ''}`}
        tabIndex={focusable ? 0 : undefined}
        aria-describedby={open ? id : undefined}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
      >
        {children}
      </span>

      {open &&
        createPortal(
          <div
            ref={tooltipRef}
            id={id}
            role="tooltip"
            className="opfg-context-tooltip"
            data-placement={position?.placement ?? 'right'}
            style={{
              ...style,
              left: position?.left ?? -9999,
              top: position?.top ?? -9999,
              visibility: position ? 'visible' : 'hidden',
            }}
          >
            <div className="opfg-context-tooltip__title">{title}</div>

            {meta && (
              <div className="opfg-context-tooltip__meta">{meta}</div>
            )}

            <em className="opfg-context-tooltip__detail">{detail}</em>
          </div>,
          document.body,
        )}
    </>
  );
}
