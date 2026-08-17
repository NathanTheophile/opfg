#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();

const EVENT_TSX = path.join(
  ROOT,
  'src/features/event-ui/EventPreview.tsx',
);
const EVENT_CSS = path.join(
  ROOT,
  'src/features/event-ui/event-preview.css',
);
const HUD_CSS = path.join(
  ROOT,
  'src/features/event-ui/top-world-hud.css',
);
const DRAWER_CSS = path.join(
  ROOT,
  'src/features/event-ui/mobile-side-drawers.css',
);

function fail(message) {
  console.error(`\n[responsive-game-ui-v2] ERROR: ${message}\n`);
  process.exit(1);
}

function read(file) {
  if (!fs.existsSync(file)) {
    fail(`Missing file: ${path.relative(ROOT, file)}`);
  }

  return fs.readFileSync(file, 'utf8');
}

function write(file, content) {
  fs.writeFileSync(
    file,
    content.replace(/\r?\n/g, '\n'),
    'utf8',
  );

  console.log(
    `[responsive-game-ui-v2] updated ${path.relative(ROOT, file)}`,
  );
}

function ensureNamedReactImport(source, name) {
  const match = source.match(
    /import\s*\{([\s\S]*?)\}\s*from\s*['"]react['"];/,
  );

  if (!match) {
    fail('Could not find named React import.');
  }

  const names = match[1]
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);

  if (names.includes(name)) return source;

  names.push(name);

  const replacement = `import {\n${names
    .map((entry) => `  ${entry},`)
    .join('\n')}\n} from 'react';`;

  return source.replace(match[0], replacement);
}

function insertBeforeRegex(
  source,
  regex,
  insertion,
  label,
) {
  if (source.includes(insertion.trim())) return source;

  const match = source.match(regex);

  if (!match || match.index === undefined) {
    fail(`Could not find ${label}.`);
  }

  return (
    source.slice(0, match.index)
    + insertion
    + source.slice(match.index)
  );
}

function replaceRegexOnce(
  source,
  regex,
  replacement,
  alreadyPresent,
  label,
) {
  if (
    alreadyPresent
    && source.includes(alreadyPresent)
  ) {
    return source;
  }

  if (!regex.test(source)) {
    fail(`Could not find ${label}.`);
  }

  regex.lastIndex = 0;

  return source.replace(regex, replacement);
}

function upsertCssBlock(
  source,
  start,
  end,
  block,
) {
  const startIndex = source.indexOf(start);
  const endIndex = source.indexOf(end);

  if (
    startIndex >= 0
    && endIndex >= startIndex
  ) {
    return (
      source.slice(0, startIndex).trimEnd()
      + '\n\n'
      + block
      + '\n'
      + source
        .slice(endIndex + end.length)
        .trimStart()
    );
  }

  return source.trimEnd() + '\n\n' + block + '\n';
}

console.log('[responsive-game-ui-v2] repo:', ROOT);

// ============================================================================
// EventPreview.tsx
// ============================================================================
let tsx = read(EVENT_TSX);

tsx = ensureNamedReactImport(
  tsx,
  'useLayoutEffect',
);

const REF_MARKER =
  '// OPFG responsive gameplay scaling refs';

if (!tsx.includes(REF_MARKER)) {
  const refsBlock = `
  ${REF_MARKER}
  const gameScreenRef =
    useRef<HTMLElement | null>(null);
  const gameScaleRef =
    useRef<HTMLDivElement | null>(null);

`;

  tsx = insertBeforeRegex(
    tsx,
    /\n\s*const translate:\s*Translator\s*=/,
    refsBlock,
    'translate declaration',
  );
}

const EFFECT_MARKER =
  '// OPFG responsive gameplay scaling effect';

if (!tsx.includes(EFFECT_MARKER)) {
  const effectBlock = `
  ${EFFECT_MARKER}
  useLayoutEffect(() => {
    if (!session.gameState) return undefined;

    const screen = gameScreenRef.current;
    const stage = gameScaleRef.current;

    if (!screen || !stage) return undefined;

    let frame = 0;

    const px = (value: string) =>
      Number.parseFloat(value) || 0;

    const fit = () => {
      window.cancelAnimationFrame(frame);

      frame = window.requestAnimationFrame(() => {
        // Measure from the natural, unscaled UI every time.
        stage.style.setProperty(
          '--opfg-game-ui-scale',
          '1',
        );

        const viewport =
          window.visualViewport;

        const viewportWidth =
          viewport?.width
          ?? window.innerWidth;

        const viewportHeight =
          viewport?.height
          ?? window.innerHeight;

        const screenStyle =
          window.getComputedStyle(screen);

        const horizontalPadding =
          px(screenStyle.paddingLeft)
          + px(screenStyle.paddingRight);

        const verticalPadding =
          px(screenStyle.paddingTop)
          + px(screenStyle.paddingBottom);

        const availableWidth =
          Math.max(
            1,
            viewportWidth
              - horizontalPadding
              - 12,
          );

        const availableHeight =
          Math.max(
            1,
            viewportHeight
              - verticalPadding
              - 12,
          );

        const candidates = [
          ...stage.querySelectorAll<HTMLElement>(
            '[data-opfg-scale-bound="true"],'
            + '.opfg-top-world-hud',
          ),
        ];

        const nodes =
          candidates.filter((node) => {
            const style =
              window.getComputedStyle(node);

            if (
              style.display === 'none'
              || style.visibility === 'hidden'
            ) {
              return false;
            }

            const rect =
              node.getBoundingClientRect();

            return (
              rect.width > 0
              && rect.height > 0
            );
          });

        if (nodes.length === 0) return;

        let left =
          Number.POSITIVE_INFINITY;
        let top =
          Number.POSITIVE_INFINITY;
        let right =
          Number.NEGATIVE_INFINITY;
        let bottom =
          Number.NEGATIVE_INFINITY;

        for (const node of nodes) {
          const rect =
            node.getBoundingClientRect();

          left =
            Math.min(left, rect.left);

          top =
            Math.min(top, rect.top);

          right =
            Math.max(right, rect.right);

          bottom =
            Math.max(bottom, rect.bottom);
        }

        const naturalWidth =
          Math.max(
            1,
            right - left,
          );

        const naturalHeight =
          Math.max(
            1,
            bottom - top,
          );

        const widthScale =
          availableWidth / naturalWidth;

        const heightScale =
          availableHeight / naturalHeight;

        /*
         * Scale BOTH directions:
         * - > 1 on large viewports
         * - < 1 on small viewports
         *
         * 4 is only a pathological safety guard.
         */
        const scale =
          Math.max(
            0.25,
            Math.min(
              widthScale,
              heightScale,
              4,
            ),
          );

        const value =
          scale.toFixed(4);

        stage.style.setProperty(
          '--opfg-game-ui-scale',
          value,
        );

        document.documentElement
          .style
          .setProperty(
            '--opfg-game-ui-scale',
            value,
          );
      });
    };

    const observer =
      new ResizeObserver(fit);

    const observed = [
      ...stage.querySelectorAll<HTMLElement>(
        '[data-opfg-scale-bound="true"],'
        + '.opfg-top-world-hud',
      ),
    ];

    for (const node of observed) {
      observer.observe(node);
    }

    observer.observe(stage);

    window.addEventListener(
      'resize',
      fit,
    );

    window.addEventListener(
      'orientationchange',
      fit,
    );

    window.visualViewport
      ?.addEventListener(
        'resize',
        fit,
      );

    fit();

    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();

      window.removeEventListener(
        'resize',
        fit,
      );

      window.removeEventListener(
        'orientationchange',
        fit,
      );

      window.visualViewport
        ?.removeEventListener(
          'resize',
          fit,
        );

      document.documentElement
        .style
        .removeProperty(
          '--opfg-game-ui-scale',
        );
    };
  }, [session.gameState !== null]);

`;

  tsx = insertBeforeRegex(
    tsx,
    /\n\s*const eventView\s*=/,
    effectBlock,
    'eventView declaration',
  );
}

// Active gameplay main.
tsx = replaceRegexOnce(
  tsx,
  /<main\s+className="min-h-dvh w-full overflow-x-hidden overflow-y-auto ([^"]+)">/,
  `<main
      ref={gameScreenRef}
      className="opfg-game-screen min-h-dvh w-full overflow-x-hidden overflow-y-auto $1"
    >`,
  'ref={gameScreenRef}',
  'active gameplay main',
);

// Scale root.
tsx = replaceRegexOnce(
  tsx,
  /<div\s+className="mx-auto w-full max-w-\[78rem\]">/,
  `<div
        ref={gameScaleRef}
        className="opfg-game-scale-content mx-auto w-full max-w-[78rem]"
      >`,
  'ref={gameScaleRef}',
  'gameplay scale root',
);

// Restart row = top bound.
tsx = replaceRegexOnce(
  tsx,
  /<div\s+className="mb-3 flex items-center justify-end gap-3 px-1">/,
  `<div
          data-opfg-scale-bound="true"
          className="opfg-game-restart-row mb-3 flex items-center justify-end gap-3 px-1"
        >`,
  'opfg-game-restart-row',
  'restart row',
);

// Central adventure region = bound.
tsx = replaceRegexOnce(
  tsx,
  /<div\s+className="relative mx-auto mt-4 w-full max-w-\[52rem\]">/,
  `<div
          data-opfg-scale-bound="true"
          className="opfg-game-adventure-region relative mx-auto mt-4 w-full max-w-[52rem]"
        >`,
  'opfg-game-adventure-region',
  'adventure region',
);

// Stats rail.
tsx = replaceRegexOnce(
  tsx,
  /<div\s+className="absolute right-\[calc\(100%\+1rem\)\] top-0 z-10 hidden w-\[14rem\] justify-end xl:flex">/,
  `<div
            data-opfg-scale-bound="true"
            className="opfg-game-side-rail opfg-game-side-rail--stats absolute right-[calc(100%+1rem)] top-0 z-10 hidden w-[14rem] justify-end xl:flex"
          >`,
  'opfg-game-side-rail--stats',
  'stats rail wrapper',
);

// Crew rail.
tsx = replaceRegexOnce(
  tsx,
  /<div\s+className="absolute left-\[calc\(100%\+1rem\)\] top-0 z-10 hidden xl:block">/,
  `<div
            data-opfg-scale-bound="true"
            className="opfg-game-side-rail opfg-game-side-rail--crew absolute left-[calc(100%+1rem)] top-0 z-10 hidden xl:block"
          >`,
  'opfg-game-side-rail--crew',
  'crew rail wrapper',
);

write(EVENT_TSX, tsx);

// ============================================================================
// event-preview.css
// ============================================================================
let eventCss = read(EVENT_CSS);

const EVENT_START =
  '/* OPFG RESPONSIVE GAMEPLAY SCALE START */';

const EVENT_END =
  '/* OPFG RESPONSIVE GAMEPLAY SCALE END */';

const eventBlock = `${EVENT_START}

.opfg-game-screen {
  width: 100%;
  height: 100dvh;
  min-height: 0 !important;
  overflow: hidden !important;
}

.opfg-game-scale-content {
  --opfg-game-ui-scale: 1;

  position: relative;
  transform:
    scale(var(--opfg-game-ui-scale));
  transform-origin: top center;
  will-change: transform;
}

/*
 * Do not solve short viewports by clipping/scrolling the narrative.
 * The complete gameplay composition is what gets resized.
 */
.opfg-game-screen
  .opfg-adventure-scroll {
  max-height: none !important;
  overflow: visible !important;
}

/*
 * Side rails are selected by aspect orientation.
 */
.opfg-game-side-rail {
  display: none !important;
}

@media (orientation: landscape) {
  .opfg-game-side-rail--stats {
    display: flex !important;
  }

  .opfg-game-side-rail--crew {
    display: block !important;
  }
}

@media (orientation: portrait) {
  .opfg-game-side-rail {
    display: none !important;
  }

  .opfg-game-scale-content {
    max-width: 32rem !important;
  }

  .opfg-game-adventure-region {
    max-width: 32rem !important;
  }
}

${EVENT_END}`;

eventCss = upsertCssBlock(
  eventCss,
  EVENT_START,
  EVENT_END,
  eventBlock,
);

write(EVENT_CSS, eventCss);

// ============================================================================
// top-world-hud.css
// ============================================================================
let hudCss = read(HUD_CSS);

const HUD_START =
  '/* OPFG ORIENTATION HUD MODE START */';

const HUD_END =
  '/* OPFG ORIENTATION HUD MODE END */';

const hudBlock = `${HUD_START}

@media (orientation: portrait) {
  .opfg-top-world-hud {
    max-width:
      min(
        100%,
        var(--ui-hud-center-width, 32rem)
      ) !important;

    grid-template-columns:
      minmax(0, 1fr) !important;
  }

  .opfg-top-world-hud
    > .opfg-hud-inventory-stack,
  .opfg-top-world-hud
    > .opfg-hud-panel--ship {
    display: none !important;
  }

  .opfg-hud-panel--identity {
    min-height: auto !important;
  }
}

@media (orientation: landscape) {
  .opfg-top-world-hud {
    max-width:
      calc(
        var(--ui-hud-side-width, 15.5rem)
        + var(--ui-hud-side-width, 15.5rem)
        + var(--ui-hud-center-width, 32rem)
        + var(--ui-hud-group-gap, 0.75rem)
        + var(--ui-hud-group-gap, 0.75rem)
      ) !important;

    grid-template-columns:
      var(--ui-hud-side-width, 15.5rem)
      minmax(
        0,
        var(--ui-hud-center-width, 32rem)
      )
      var(--ui-hud-side-width, 15.5rem)
      !important;
  }

  .opfg-top-world-hud
    > .opfg-hud-inventory-stack {
    display: grid !important;
  }

  .opfg-top-world-hud
    > .opfg-hud-panel--ship {
    display: grid !important;
  }
}

${HUD_END}`;

hudCss = upsertCssBlock(
  hudCss,
  HUD_START,
  HUD_END,
  hudBlock,
);

write(HUD_CSS, hudCss);

// ============================================================================
// mobile-side-drawers.css
// ============================================================================
let drawerCss = read(DRAWER_CSS);

const DRAWER_START =
  '/* OPFG ORIENTATION DRAWER MODE START */';

const DRAWER_END =
  '/* OPFG ORIENTATION DRAWER MODE END */';

const drawerBlock = `${DRAWER_START}

@media (orientation: portrait) {
  .opfg-mobile-side-ui {
    display: block !important;
  }
}

@media (orientation: landscape) {
  .opfg-mobile-side-ui {
    display: none !important;
  }
}

${DRAWER_END}`;

drawerCss = upsertCssBlock(
  drawerCss,
  DRAWER_START,
  DRAWER_END,
  drawerBlock,
);

write(DRAWER_CSS, drawerCss);

console.log('\n[responsive-game-ui-v2] Done.');
console.log(
  '[responsive-game-ui-v2] Scale can now grow above 1 and shrink below 1.',
);
console.log(
  '[responsive-game-ui-v2] Portrait = mobile, landscape = classic.',
);
console.log(
  '[responsive-game-ui-v2] Next: npm run build',
);
