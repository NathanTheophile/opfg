import { useEffect, useRef } from 'react';
import {
  motion,
  useReducedMotion,
} from 'motion/react';
import type { AgeTransition } from './age-transition';
import './age-transition-overlay.css';

interface AgeTransitionOverlayProps {
  transition: AgeTransition;
  unitLabel: string;
  onCovered: () => void;
  onComplete: () => void;
}

export function AgeTransitionOverlay({
  transition,
  unitLabel,
  onCovered,
  onComplete,
}: AgeTransitionOverlayProps) {
  const reducedMotion = useReducedMotion();
  const coarsePointer =
    typeof window !== 'undefined'
    && window.matchMedia('(pointer: coarse)').matches;
  const reduceAgeMotion = reducedMotion && !coarsePointer;
    const durationMs =
    reduceAgeMotion
      ? 650
      : coarsePointer
        ? 4400
        : 2200;
    const coverMs =
    reduceAgeMotion
      ? 90
      : coarsePointer
        ? 1520
        : 260;
  const onCoveredRef = useRef(onCovered);
  const onCompleteRef = useRef(onComplete);

  onCoveredRef.current = onCovered;
  onCompleteRef.current = onComplete;

  useEffect(() => {
    const coverTimer = window.setTimeout(
      () => onCoveredRef.current(),
      coverMs,
    );
    const completeTimer = window.setTimeout(
      () => onCompleteRef.current(),
      durationMs,
    );

    return () => {
      window.clearTimeout(coverTimer);
      window.clearTimeout(completeTimer);
    };
  }, [coverMs, durationMs]);

  return (
    <motion.div
      className="opfg-age-transition"
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 1, 1, 0] }}
      transition={{
        duration: durationMs / 1000,
        times: reduceAgeMotion
          ? [0, 0.14, 0.76, 1]
          : coarsePointer
            ? [0, 0.36, 0.80, 1]
            : [0, 0.12, 0.78, 1],
        ease: 'linear',
      }}
      role="status"
      aria-label={`${transition.toAge} ${unitLabel}`}
    >
      <div
        className="opfg-age-transition__content"
        aria-hidden="true"
      >
        <div className="opfg-age-transition__numbers">
          {reduceAgeMotion ? (
            <span className="opfg-age-transition__number">
              {transition.toAge}
            </span>
          ) : (
            <>
              <motion.span
                className="opfg-age-transition__number"
                initial={{
                  opacity: 1,
                  scaleX: 1,
                  scaleY: 1,
                  filter: 'blur(0px)',
                }}
                animate={{
                  opacity: [1, 1, 0],
                  scaleX: [1, 1, 1.16],
                  scaleY: [1, 1, 0.04],
                  filter: [
                    'blur(0px)',
                    'blur(0px)',
                    'blur(8px)',
                  ],
                }}
                transition={{
                  delay: coarsePointer ? 0.52 : 0.26,
                  duration: coarsePointer ? 1.44 : 0.72,
                  times: [0, 0.52, 1],
                  ease: [0.4, 0, 1, 1],
                }}
              >
                {transition.fromAge}
              </motion.span>

              <motion.span
                className="opfg-age-transition__number"
                initial={{
                  opacity: 0,
                  scaleX: 1.14,
                  scaleY: 0.05,
                  filter: 'blur(8px)',
                }}
                animate={{
                  opacity: [0, 1, 1],
                  scaleX: [1.14, 0.98, 1],
                  scaleY: [0.05, 1.08, 1],
                  filter: [
                    'blur(8px)',
                    'blur(0px)',
                    'blur(0px)',
                  ],
                }}
                transition={{
                  delay: coarsePointer ? 1.84 : 0.92,
                  duration: coarsePointer ? 1.04 : 0.52,
                  times: [0, 0.7, 1],
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                {transition.toAge}
              </motion.span>
            </>
          )}
        </div>

        <span className="opfg-age-transition__unit">
          {unitLabel}
        </span>
      </div>
    </motion.div>
  );
}
