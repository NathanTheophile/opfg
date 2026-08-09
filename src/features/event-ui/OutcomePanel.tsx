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
  Sparkles,
  type LucideIcon,
} from 'lucide-react';
import {
  Badge,
  Button,
  Panel,
  PanelBody,
  PanelFooter,
  PanelHeader,
  PanelTitle,
} from '@/components/ui';
import type {
  OutcomeEffectTone,
  OutcomeEffectViewModel,
  OutcomeViewModel,
} from './types';
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
  | 'luck'
  | 'awakening';

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
  awakening: Sparkles,
};

const STAT_IDS = new Set<OutcomeStatId>(
  Object.keys(STAT_ICONS) as OutcomeStatId[],
);

function getStatVisual(
  effect: OutcomeEffectViewModel,
): OutcomeStatVisual | null {
  if (!effect.id.startsWith('stat-')) return null;

  const statId = effect.id.slice('stat-'.length) as OutcomeStatId;
  if (!STAT_IDS.has(statId)) return null;

  const match = effect.label.trim().match(/^([+-]?\d+(?:[.,]\d+)?)\b/);
  if (!match) return null;

  const delta = Number(match[1].replace(',', '.'));
  if (!Number.isFinite(delta) || delta === 0) return null;

  return {
    statId,
    delta,
    Icon: STAT_ICONS[statId],
  };
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
}

export function OutcomePanel({
  outcome,
  onContinue,
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
          } => entry.visual !== null,
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

  return (
    <Panel
      variant="strong"
      padding="none"
      className="w-full overflow-hidden shadow-overlay"
    >
      <PanelHeader className="mb-0 px-5 pb-4 pt-5 md:px-7 md:pb-5 md:pt-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">
          Conséquence
        </p>
        <PanelTitle className="text-2xl md:text-[1.75rem]">
          {outcome.title ?? 'La suite de votre histoire'}
        </PanelTitle>
      </PanelHeader>

      <div className="h-px bg-[var(--border-subtle)]" />

      <PanelBody className="px-5 py-5 md:px-7 md:py-6">
        <p className="max-w-[68ch] text-[0.98rem] leading-7 text-fg-secondary md:text-base md:leading-7">
          {outcome.body}
        </p>

        {outcome.dice && (
          <div
            className="mt-4 flex flex-wrap gap-2"
            aria-label="Résultat du DiceCheck"
          >
            <Badge variant="gold">
              {outcome.dice.statLabel}{' '}
              {outcome.dice.modifier >= 0 ? '+' : ''}
              {outcome.dice.modifier}
            </Badge>
            <Badge variant="default">
              d20 : {outcome.dice.rawRoll}
            </Badge>
            <Badge variant="default">
              Total : {outcome.dice.total}
            </Badge>
            <Badge
              variant={
                outcome.dice.resultLabel.includes('critique')
                  ? 'critical'
                  : 'default'
              }
            >
              {outcome.dice.resultLabel}
            </Badge>
          </div>
        )}

        {outcome.effects && outcome.effects.length > 0 && (
          <div
            className="mt-5 flex flex-wrap gap-2"
            aria-label="Effets de la conséquence"
          >
            {outcome.effects.map((effect) => {
              const statVisual = getStatVisual(effect);

              if (!statVisual) {
                return (
                  <Badge
                    key={effect.id}
                    variant={EFFECT_VARIANT[effect.tone ?? 'default']}
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
                      effectRefs.current.set(effect.id, element);
                    } else {
                      effectRefs.current.delete(effect.id);
                    }
                  }}
                  className="opfg-outcome-stat-effect"
                  data-stat={statId}
                  data-tone={delta > 0 ? 'positive' : 'negative'}
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

      <PanelFooter className="mt-0 border-t border-[var(--border-subtle)] bg-black/[0.08] px-4 py-4 md:px-6">
        <Button
          variant="glass"
          size="lg"
          onClick={onContinue}
        >
          Continuer
          <ArrowRight
            className="size-4"
            aria-hidden="true"
          />
        </Button>
      </PanelFooter>
    </Panel>
  );
}
