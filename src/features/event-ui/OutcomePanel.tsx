import { useEffect, useRef } from 'react';
import {
  ArrowRight,
  Brain,
  Clover,
  Compass,
  Dumbbell,
  Eye,
  Footprints,
  Heart,
  MessageCircle,
  Smile,
  type LucideIcon,
} from 'lucide-react';
import {
  NineSliceFrame,
  Badge,
  Button,
  Panel,
  PanelBody,
  PanelFooter,
} from '@/components/ui';
import type { DiceResult } from '@/game/content/schema';
import type { Translator } from '@/game/localization';
import type {
  OutcomeEffectTone,
  OutcomeEffectViewModel,
  OutcomeViewModel,
} from './types';
import parchmentTextFrame from './assets/parchment-text-frame.webp';
import './outcome-panel.css';

const STAT_IMPACT_EVENT = 'opfg:stat-impact';

const EFFECT_VARIANT: Record<
  OutcomeEffectTone,
  'default' | 'success' | 'warning' | 'critical'
> = {
  default: 'default',
  positive: 'success',
  warning: 'warning',
  critical: 'critical',
};

type OutcomeStatId =
  | 'health'
  | 'morale'
  | 'strength'
  | 'agility'
  | 'observation'
  | 'intelligence'
  | 'navigation'
  | 'charisma'
  | 'luck';

interface OutcomeStatVisual {
  statId: OutcomeStatId;
  delta: number;
  Icon: LucideIcon;
}

const STAT_ICONS: Record<OutcomeStatId, LucideIcon> = {
  health: Heart,
  morale: Smile,
  strength: Dumbbell,
  agility: Footprints,
  observation: Eye,
  intelligence: Brain,
  navigation: Compass,
  charisma: MessageCircle,
  luck: Clover,
};

const STAT_IDS = new Set<OutcomeStatId>(
  Object.keys(STAT_ICONS) as OutcomeStatId[],
);

function getStatVisual(
  effect: OutcomeEffectViewModel,
): OutcomeStatVisual | null {
  if (!effect.statId || effect.delta === undefined) return null;
  if (!STAT_IDS.has(effect.statId as OutcomeStatId)) return null;
  const statId = effect.statId as OutcomeStatId;
  return { statId, delta: effect.delta, Icon: STAT_ICONS[statId] };
}

function getDiceFeedbackTone(result: DiceResult): 'success' | 'failure' | 'neutral' {
  if (result === 'failure' || result === 'criticalFailure') return 'failure';
  if (result === 'success' || result === 'criticalSuccess') return 'success';
  return 'neutral';
}

function isCriticalDiceResult(result: DiceResult): boolean {
  return result === 'criticalSuccess' || result === 'criticalFailure';
}

function isVisibleElement(element: HTMLElement): boolean {
  const rect = element.getBoundingClientRect();
  const style = window.getComputedStyle(element);

  return (
    rect.width > 0 &&
    rect.height > 0 &&
    style.display !== 'none' &&
    style.visibility !== 'hidden' &&
    Number(style.opacity || '1') > 0
  );
}

function findVisibleStatTarget(statId: OutcomeStatId): HTMLElement | null {
  const candidates = Array.from(
    document.querySelectorAll<HTMLElement>(
      `.opfg-player-stat[data-stat="${statId}"]`,
    ),
  );

  return candidates.find(isVisibleElement) ?? null;
}

function createImpactNumber(
  target: HTMLElement,
  delta: number,
): HTMLElement {
  const layer = document.createElement('span');
  const foreground = document.createElement('strong');
  const watermark = document.createElement('strong');
  const text = `${delta > 0 ? '+' : ''}${delta}`;
  const tone = delta > 0 ? 'positive' : 'negative';

  layer.className = 'opfg-stat-impact-layer';
  layer.dataset.tone = tone;
  layer.setAttribute('aria-hidden', 'true');

  watermark.className = 'opfg-stat-impact-layer__watermark';
  watermark.textContent = text;

  foreground.className = 'opfg-stat-impact-layer__value';
  foreground.textContent = text;

  layer.append(watermark, foreground);
  target.appendChild(layer);

  return layer;
}

function animateStatTransfer(
  source: HTMLElement,
  target: HTMLElement,
  delta: number,
): {
  cancel: () => void;
} {
  const startRect = source.getBoundingClientRect();
  const targetRect = target.getBoundingClientRect();

  const clone = source.cloneNode(true) as HTMLElement;
  clone.classList.add('opfg-outcome-stat-effect--flying');
  clone.removeAttribute('aria-label');

  Object.assign(clone.style, {
    position: 'fixed',
    left: `${startRect.left}px`,
    top: `${startRect.top}px`,
    width: `${startRect.width}px`,
    height: `${startRect.height}px`,
    margin: '0',
  });

  document.body.appendChild(clone);
  source.classList.add('is-transferring');

  const startCenterX = startRect.left + startRect.width / 2;
  const startCenterY = startRect.top + startRect.height / 2;
  const targetCenterX = targetRect.left + targetRect.width / 2;
  const targetCenterY = targetRect.top + targetRect.height / 2;

  const dx = targetCenterX - startCenterX;
  const dy = targetCenterY - startCenterY;

  const targetScale = Math.max(
    0.42,
    Math.min(
      0.72,
      Math.min(
        targetRect.width / Math.max(startRect.width, 1),
        targetRect.height / Math.max(startRect.height, 1),
      ) * 0.92,
    ),
  );

  const fly = clone.animate(
    [
      {
        transform: 'translate3d(0, 0, 0) scale(1) rotate(0deg)',
        opacity: 0.5,
        offset: 0,
      },
      {
        transform: `translate3d(${dx * 0.16}px, ${dy * 0.07 - 16}px, 0) scale(1.08) rotate(-2.5deg)`,
        opacity: 0.5,
        offset: 0.18,
      },
      {
        transform: `translate3d(${dx * 0.82}px, ${dy * 0.74 - 5}px, 0) scale(${Math.max(targetScale * 1.22, 0.58)}) rotate(1.2deg)`,
        opacity: 0.5,
        offset: 0.78,
      },
      {
        transform: `translate3d(${dx}px, ${dy}px, 0) scale(${targetScale * 1.08}, ${targetScale * 0.72}) rotate(0deg)`,
        opacity: 0.5,
        offset: 0.95,
      },
      {
        transform: `translate3d(${dx}px, ${dy}px, 0) scale(${targetScale * 0.8}, ${targetScale * 0.48}) rotate(0deg)`,
        opacity: 0,
        offset: 1,
      },
    ],
    {
      duration: 720,
      easing: 'cubic-bezier(0.18, 0.82, 0.2, 1)',
      fill: 'forwards',
    },
  );

  let impactLayer: HTMLElement | null = null;
  let impactTimer: number | null = null;

  fly.onfinish = () => {
    clone.remove();
    source.classList.remove('is-transferring');

    // The engine state was already resolved earlier. This event is the visual
    // commit point: PlayerStatsRail reveals the new value only when the flying
    // effect actually hits the corresponding HUD row.
    window.dispatchEvent(
      new CustomEvent(STAT_IMPACT_EVENT, {
        detail: {
          statId: target.dataset.stat,
          delta,
        },
      }),
    );

    const impactClass =
      delta > 0
        ? 'opfg-player-stat--impact-positive'
        : 'opfg-player-stat--impact-negative';

    target.classList.remove(
      'opfg-player-stat--impact-positive',
      'opfg-player-stat--impact-negative',
    );

    // Force a reflow so repeated hits on the same stat restart the animation.
    void target.offsetWidth;
    target.classList.add(impactClass);

    impactLayer = createImpactNumber(target, delta);

    impactTimer = window.setTimeout(() => {
      target.classList.remove(impactClass);
      impactLayer?.remove();
      impactLayer = null;
      impactTimer = null;
    }, 820);
  };

  return {
    cancel: () => {
      fly.cancel();
      clone.remove();
      source.classList.remove('is-transferring');

      if (impactTimer !== null) {
        window.clearTimeout(impactTimer);
      }

      impactLayer?.remove();
      target.classList.remove(
        'opfg-player-stat--impact-positive',
        'opfg-player-stat--impact-negative',
      );
    },
  };
}

export interface OutcomePanelProps {
  outcome: OutcomeViewModel;
  onContinue: () => void;
  translate: Translator;
}

export function OutcomePanel({
  outcome,
  onContinue,
  translate,
}: OutcomePanelProps) {
  const effectRefs = useRef<Map<string, HTMLElement>>(new Map());

  useEffect(() => {
    const statEffects =
      outcome.effects
        ?.map((effect) => ({
          effect,
          visual: getStatVisual(effect),
        }))
        .filter(
          (
            entry,
          ): entry is {
            effect: OutcomeEffectViewModel;
            visual: OutcomeStatVisual;
          } => entry.visual !== null && entry.visual.delta !== 0,
        ) ?? [];

    if (statEffects.length === 0) return undefined;

    const timers: number[] = [];
    const transfers: Array<{ cancel: () => void }> = [];

    statEffects.forEach(({ effect, visual }, index) => {
      const timer = window.setTimeout(() => {
        const source = effectRefs.current.get(effect.id);
        const target = findVisibleStatTarget(visual.statId);

        if (!source || !target) return;

        transfers.push(
          animateStatTransfer(
            source,
            target,
            visual.delta,
          ),
        );
      }, 500 + index * 115);

      timers.push(timer);
    });

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
      transfers.forEach((transfer) => transfer.cancel());

      // If the player leaves the consequence before every transfer has landed,
      // never leave the presentation state stale: reveal every resolved stat.
      statEffects.forEach(({ visual }) => {
        window.dispatchEvent(
          new CustomEvent(STAT_IMPACT_EVENT, {
            detail: {
              statId: visual.statId,
              delta: visual.delta,
            },
          }),
        );
      });
    };
  }, [outcome.effects]);

  const diceTone = outcome.dice
    ? getDiceFeedbackTone(outcome.dice.result)
    : 'neutral';

  const hasStatEffect =
    outcome.effects?.some(
      (effect) => getStatVisual(effect) !== null,
    ) ?? false;

  const zeroStatId =
    outcome.dice && diceTone === 'failure' && !hasStatEffect
      ? outcome.dice.statId
      : null;

  const displayEffects: OutcomeEffectViewModel[] = [
    ...(outcome.effects ?? []),
    ...(zeroStatId && outcome.dice
      ? [
          {
            id: `stat-${zeroStatId}`,
            label: `+0 ${outcome.dice.statLabel}`,
            tone: 'warning' as const,
            statId: zeroStatId,
            delta: 0,
          },
        ]
      : []),
  ];

  return (
    <Panel
      variant="strong"
      padding="none"
      className="opfg-outcome-panel opfg-outcome-panel--inline w-full overflow-hidden shadow-overlay"
    >
      <PanelBody className="opfg-outcome-panel__body px-4 py-3 md:px-5 md:py-3">
        <NineSliceFrame
          className="opfg-parchment-nine-slice"
          texture={parchmentTextFrame}
        />
        <p className="max-w-[68ch] text-[0.98rem] leading-7 text-fg-secondary md:text-base md:leading-7">
          {outcome.body}
        </p>

        {(outcome.dice || displayEffects.length > 0) && (
          <div
            className="opfg-outcome-feedback-row opfg-outcome-effect-list"
            aria-label={translate('ui.outcome.feedbackAria')}
          >
            {outcome.dice && (
              <span
                className="opfg-outcome-dice-result"
                data-tone={diceTone}
                data-critical={
                  isCriticalDiceResult(
                    outcome.dice.result,
                  )
                    ? 'true'
                    : 'false'
                }
              >
                {outcome.dice.resultLabel}
              </span>
            )}

            {displayEffects.map((effect) => {
              const statVisual = getStatVisual(effect);

              if (!statVisual) {
                return (
                  <Badge
                    key={effect.id}
                    variant={
                      EFFECT_VARIANT[
                        effect.tone ?? 'default'
                      ]
                    }
                  >
                    {effect.label}
                  </Badge>
                );
              }

              const { Icon, statId, delta } = statVisual;

              return (
                <span
                  key={effect.id}
                  ref={(element) => {
                    if (element) {
                      effectRefs.current.set(
                        effect.id,
                        element,
                      );
                    } else {
                      effectRefs.current.delete(effect.id);
                    }
                  }}
                  className="opfg-outcome-stat-effect"
                  data-stat={statId}
                  data-tone={
                    delta > 0 ? 'positive' : 'negative'
                  }
                  data-zero={delta === 0 ? 'true' : 'false'}
                  aria-label={effect.label}
                >
                  <span
                    className="opfg-outcome-stat-effect__watermark"
                    aria-hidden="true"
                  >
                    <Icon />
                  </span>

                  <Icon
                    className="opfg-outcome-stat-effect__icon"
                    aria-hidden="true"
                  />

                  <strong className="opfg-outcome-stat-effect__label">
                    {effect.label}
                  </strong>
                </span>
              );
            })}
          </div>
        )}
      </PanelBody>

      <PanelFooter className="opfg-outcome-panel__footer mt-0 border-t border-[var(--border-subtle)] bg-black/[0.06] px-3 py-2 md:px-4">
        <Button
          variant="glass"
          onClick={onContinue}
          className="opfg-outcome-continue"
        >
          {translate('ui.action.continue')}
          <ArrowRight
            className="size-4"
            aria-hidden="true"
          />
        </Button>
      </PanelFooter>
    </Panel>
  );
}
