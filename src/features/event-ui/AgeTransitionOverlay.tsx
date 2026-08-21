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
  const durationMs = reducedMotion ? 650 : 2200;
  const coverMs = reducedMotion ? 90 : 260;
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
        times: reducedMotion
          ? [0, 0.14, 0.76, 1]
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
          {reducedMotion ? (
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
                  delay: 0.26,
                  duration: 0.72,
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
                  delay: 0.92,
                  duration: 0.52,
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
