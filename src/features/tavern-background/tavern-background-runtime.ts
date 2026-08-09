export function mountTavernBackground(app: HTMLDivElement): () => void {
  const ART_WIDTH = 1536;
  const ART_HEIGHT = 1024;
  const ART_ASPECT = ART_WIDTH / ART_HEIGHT;
  const PIXELS_PER_WORLD_UNIT = ART_HEIGHT / 2; // 512, matches the former Three.js plate.

  const PARALLAX_X_WORLD = 0.016;
  const PARALLAX_Y_WORLD = 0.011;
  const IDLE_DRIFT_X_WORLD = 0.0045;
  const IDLE_DRIFT_Y_WORLD = 0.0032;

  // Flame is drawn directly at final resolution instead of scaling a pre-rendered sprite.
  // Anchor sits on the wick: the animated body grows upward from here.
  const FLAME_U = 0.781; // aligned to the baked concept flame (~1200 px on 1536 px art)
  const FLAME_BASE_V = 0.186;

  const scenePlate = document.createElement('div');
  scenePlate.className = 'tavern-scene-plate';

  const conceptArt = document.createElement('img');
  conceptArt.className = 'tavern-concept-art';
  conceptArt.src = '/art/tavern/tavern-concept.png';
  conceptArt.alt = '';
  conceptArt.draggable = false;

  const ambientDim = document.createElement('div');
  ambientDim.className = 'tavern-scene-layer tavern-ambient-dim';

  const roomWarm = document.createElement('div');
  roomWarm.className = 'tavern-scene-layer tavern-room-warm';

  function createRadialLayer(className: string): HTMLDivElement {
    const element = document.createElement('div');
    element.className = `tavern-radial-light ${className}`;
    return element;
  }

  const ambientWarm = createRadialLayer('tavern-ambient-warm');
  const tableGlow = createRadialLayer('tavern-table-glow');
  const lanternGlow = createRadialLayer('tavern-lantern-glow');
  const flameGlow = createRadialLayer('tavern-flame-glow');

  // Occasional cool lightning entering from an implied window on the left.
  // The broad layer lights the room softly; the canvas below adds only selected hard-facing highlights.
  const lightningWash = document.createElement('div');
  lightningWash.className = 'tavern-scene-layer tavern-lightning-wash';

  const lightningHighlights = document.createElement('img');
  lightningHighlights.className = 'tavern-lightning-highlights';
  lightningHighlights.src = '/art/tavern/lightning-highlights.png';
  lightningHighlights.alt = '';
  lightningHighlights.draggable = false;

  const passingShadow = document.createElement('div');
  passingShadow.className = 'tavern-passing-shadow';

  const fxCanvas = document.createElement('canvas');
  fxCanvas.className = 'tavern-fx-canvas';
  fxCanvas.width = ART_WIDTH;
  fxCanvas.height = ART_HEIGHT;
  const ctx = fxCanvas.getContext('2d', { alpha: true }) as CanvasRenderingContext2D;
  if (!ctx) throw new Error('Could not create 2D context.');

  scenePlate.append(
    conceptArt,
    ambientDim,
    roomWarm,
    ambientWarm,
    tableGlow,
    lanternGlow,
    flameGlow,
    lightningWash,
    lightningHighlights,
    fxCanvas,
    passingShadow,
  );

  const atmosphere = document.createElement('div');
  atmosphere.className = 'tavern-atmosphere';
  app.append(scenePlate, atmosphere);

  function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
  }

  function lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t;
  }

  function randFloat(min: number, max: number): number {
    return min + Math.random() * (max - min);
  }

  function worldScaleToArtPixels(worldScale: number): number {
    return worldScale * PIXELS_PER_WORLD_UNIT;
  }

  function setRadialLayer(
    element: HTMLElement,
    u: number,
    v: number,
    worldWidth: number,
    worldHeight: number,
    opacity: number,
  ): void {
    element.style.left = `${u * 100}%`;
    element.style.top = `${v * 100}%`;
    element.style.width = `${worldScaleToArtPixels(worldWidth)}px`;
    element.style.height = `${worldScaleToArtPixels(worldHeight)}px`;
    element.style.opacity = `${opacity}`;
  }

  function createCanvas(width: number, height = width): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    return canvas;
  }

  function createGlintTexture(size = 128): HTMLCanvasElement {
    const canvas = createCanvas(size);
    const c = canvas.getContext('2d');
    if (!c) throw new Error('Could not create glint context.');

    const center = size * 0.5;
    const glow = c.createRadialGradient(center, center, 0, center, center, size * 0.34);
    glow.addColorStop(0, 'rgba(255,255,240,1)');
    glow.addColorStop(0.09, 'rgba(255,238,161,0.94)');
    glow.addColorStop(0.32, 'rgba(255,184,66,0.30)');
    glow.addColorStop(1, 'rgba(255,145,28,0)');
    c.fillStyle = glow;
    c.fillRect(0, 0, size, size);

    c.save();
    c.translate(center, center);
    c.globalCompositeOperation = 'lighter';

    const drawRay = (rotation: number, length: number, width: number, alpha: number): void => {
      c.save();
      c.rotate(rotation);
      const gradient = c.createLinearGradient(-length, 0, length, 0);
      gradient.addColorStop(0, 'rgba(255,225,145,0)');
      gradient.addColorStop(0.42, `rgba(255,238,184,${alpha * 0.35})`);
      gradient.addColorStop(0.50, `rgba(255,255,247,${alpha})`);
      gradient.addColorStop(0.58, `rgba(255,238,184,${alpha * 0.35})`);
      gradient.addColorStop(1, 'rgba(255,225,145,0)');
      c.fillStyle = gradient;
      c.beginPath();
      c.ellipse(0, 0, length, width, 0, 0, Math.PI * 2);
      c.fill();
      c.restore();
    };

    drawRay(0, size * 0.38, size * 0.020, 0.82);
    drawRay(Math.PI * 0.5, size * 0.28, size * 0.018, 0.72);
    drawRay(Math.PI * 0.25, size * 0.18, size * 0.010, 0.34);
    drawRay(-Math.PI * 0.25, size * 0.18, size * 0.010, 0.34);
    c.restore();

    return canvas;
  }

  function drawAnimatedFlame(
    t: number,
    intensity: number,
    flicker: number,
    gust: number,
    stretch: number,
    widthFactor: number,
    lean: number,
  ): void {
    const baseX = FLAME_U * ART_WIDTH;
    const baseY = FLAME_BASE_V * ART_HEIGHT;

    // Final polish: slightly smaller and raised so the flame sits cleanly on the wick.
    const bodyHeight = 38 * stretch;
    const bodyHalfWidth = 10.2 * widthFactor; // wide enough to mask the baked flame underneath
    const tipLean = lean * 115 + gust * 34;
    const sway = Math.sin(t * 7.9 + 0.4) * 1.8 + flicker * 1.4;

    ctx.save();
    ctx.globalCompositeOperation = 'screen';

    // Soft orange aura behind the silhouette.
    const auraRadius = bodyHeight * 1.10;
    const aura = ctx.createRadialGradient(baseX, baseY - bodyHeight * 0.44, 0, baseX, baseY - bodyHeight * 0.44, auraRadius);
    aura.addColorStop(0, `rgba(255,224,150,${0.075 + intensity * 0.045})`);
    aura.addColorStop(0.28, `rgba(255,170,70,${0.045 + intensity * 0.032})`);
    aura.addColorStop(0.62, `rgba(255,118,28,${0.018 + intensity * 0.016})`);
    aura.addColorStop(1, 'rgba(255,95,15,0)');
    ctx.fillStyle = aura;
    ctx.fillRect(baseX - auraRadius, baseY - bodyHeight - auraRadius * 0.45, auraRadius * 2, auraRadius * 1.85);

    // Main flame body, drawn at final canvas resolution to keep it bright and smooth.
    const tipX = baseX + tipLean + sway;
    const tipY = baseY - bodyHeight;
    const bodyGradient = ctx.createLinearGradient(baseX, tipY, baseX, baseY);
    bodyGradient.addColorStop(0, 'rgba(255,255,215,0.98)');
    bodyGradient.addColorStop(0.32, 'rgba(255,224,104,0.99)');
    bodyGradient.addColorStop(0.68, 'rgba(255,142,35,0.95)');
    bodyGradient.addColorStop(1, 'rgba(255,78,12,0.20)');

    ctx.globalAlpha = clamp(0.56 + intensity * 0.14, 0.62, 0.78);
    ctx.shadowColor = 'rgba(255,130,28,0.95)';
    ctx.shadowBlur = 15 + intensity * 7;
    ctx.fillStyle = bodyGradient;
    ctx.beginPath();
    ctx.moveTo(baseX, baseY);
    ctx.bezierCurveTo(
      baseX + bodyHalfWidth * 0.82, baseY - bodyHeight * 0.16,
      baseX + bodyHalfWidth * 1.05 + tipLean * 0.22, baseY - bodyHeight * 0.57,
      tipX, tipY,
    );
    ctx.bezierCurveTo(
      baseX - bodyHalfWidth * 0.52 + tipLean * 0.12, baseY - bodyHeight * 0.53,
      baseX - bodyHalfWidth * 0.92, baseY - bodyHeight * 0.17,
      baseX, baseY,
    );
    ctx.closePath();
    ctx.fill();

    // White/yellow inner core. It moves independently enough to avoid a rigid cutout look.
    const coreHeight = bodyHeight * (0.58 + Math.sin(t * 9.2) * 0.025);
    const coreHalfWidth = bodyHalfWidth * 0.39;
    const coreTipX = baseX + tipLean * 0.46 - Math.sin(t * 8.7) * 1.2;
    const coreTipY = baseY - coreHeight;
    const coreGradient = ctx.createLinearGradient(baseX, coreTipY, baseX, baseY);
    coreGradient.addColorStop(0, 'rgba(255,255,246,0.99)');
    coreGradient.addColorStop(0.55, 'rgba(255,246,169,0.99)');
    coreGradient.addColorStop(1, 'rgba(255,178,49,0.12)');

    ctx.globalAlpha = clamp(0.64 + intensity * 0.12, 0.70, 0.84);
    ctx.shadowColor = 'rgba(255,241,170,0.78)';
    ctx.shadowBlur = 8 + intensity * 4;
    ctx.fillStyle = coreGradient;
    ctx.beginPath();
    ctx.moveTo(baseX, baseY - 1);
    ctx.bezierCurveTo(
      baseX + coreHalfWidth, baseY - coreHeight * 0.18,
      baseX + coreHalfWidth * 0.72 + tipLean * 0.14, baseY - coreHeight * 0.58,
      coreTipX, coreTipY,
    );
    ctx.bezierCurveTo(
      baseX - coreHalfWidth * 0.50, baseY - coreHeight * 0.55,
      baseX - coreHalfWidth, baseY - coreHeight * 0.18,
      baseX, baseY - 1,
    );
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  const glintTexture = createGlintTexture();

  interface CoinGlint {
    u: number;
    v: number;
    baseScale: number;
    active: boolean;
    startedAt: number;
    duration: number;
    baseRotation: number;
  }

  const coinGlints: CoinGlint[] = [
    { u: 0.267, v: 0.149, baseScale: 0.082, active: false, startedAt: 0, duration: 0.5, baseRotation: 0 },
    { u: 0.297, v: 0.305, baseScale: 0.075, active: false, startedAt: 0, duration: 0.5, baseRotation: 0 },
    { u: 0.146, v: 0.473, baseScale: 0.088, active: false, startedAt: 0, duration: 0.5, baseRotation: 0 },
    { u: 0.189, v: 0.494, baseScale: 0.090, active: false, startedAt: 0, duration: 0.5, baseRotation: 0 },
    { u: 0.183, v: 0.738, baseScale: 0.082, active: false, startedAt: 0, duration: 0.5, baseRotation: 0 },
    { u: 0.807, v: 0.347, baseScale: 0.073, active: false, startedAt: 0, duration: 0.5, baseRotation: 0 },
    { u: 0.823, v: 0.569, baseScale: 0.092, active: false, startedAt: 0, duration: 0.5, baseRotation: 0 },
    { u: 0.875, v: 0.606, baseScale: 0.092, active: false, startedAt: 0, duration: 0.5, baseRotation: 0 },
  ];

  function createDustMoteTexture(size = 64): HTMLCanvasElement {
    const canvas = createCanvas(size);
    const c = canvas.getContext('2d');
    if (!c) throw new Error('Could not create dust context.');

    const center = size * 0.5;

    // Tiny optical mote: bright pin core with a broad, extremely soft falloff.
    // No cross/star rays: those read as a UI sparkle rather than suspended dust.
    const glow = c.createRadialGradient(center, center, 0, center, center, center);
    glow.addColorStop(0.00, 'rgba(255,252,236,0.95)');
    glow.addColorStop(0.07, 'rgba(255,244,214,0.78)');
    glow.addColorStop(0.20, 'rgba(255,224,168,0.36)');
    glow.addColorStop(0.46, 'rgba(255,196,116,0.11)');
    glow.addColorStop(0.72, 'rgba(255,173,83,0.025)');
    glow.addColorStop(1.00, 'rgba(255,160,70,0)');
    c.fillStyle = glow;
    c.fillRect(0, 0, size, size);

    return canvas;
  }

  const dustMoteTexture = createDustMoteTexture();

  interface DustParticle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    speed: number;
    heading: number;
    turnAmplitude: number;
    turnFrequency: number;
    bobAmplitude: number;
    bobFrequency: number;
    alpha: number;
    size: number;
    phase: number;
    shimmerFrequency: number;
    bornAt: number;
    lifetime: number;
  }

  function createDustParticle(initial = true): DustParticle {
    // Long enough that every mote has time to visibly wander instead of merely blinking in place.
    const lifetime = randFloat(24, 42);
    const heading = randFloat(0, Math.PI * 2);
    const speed = randFloat(5.2, 10.0); // art px / second: still slow, but now visibly wandering across tens/hundreds of pixels.

    return {
      x: randFloat(0.008, 0.992) * ART_WIDTH,
      y: randFloat(0.008, 0.992) * ART_HEIGHT,
      vx: Math.cos(heading) * speed,
      vy: Math.sin(heading) * speed,
      speed,
      heading,
      // Very low-frequency steering gives the feeling of suspended dust wandering in air currents.
      turnAmplitude: randFloat(0.30, 0.82),
      turnFrequency: randFloat(0.060, 0.145),
      bobAmplitude: randFloat(0.8, 3.0),
      bobFrequency: randFloat(0.07, 0.16),
      alpha: randFloat(0.10, 0.34),
      // Most are tiny; a few slightly larger blurred motes add depth without becoming bokeh blobs.
      size: Math.random() < 0.16 ? randFloat(4.2, 6.2) : randFloat(2.0, 4.0),
      phase: randFloat(0, Math.PI * 2),
      shimmerFrequency: randFloat(0.075, 0.19),
      // Spread the initial population across their lifetimes so there is no startup burst.
      bornAt: initial ? -randFloat(0, lifetime) : 0,
      lifetime,
    };
  }

  const dust: DustParticle[] = Array.from({ length: 118 }, () => createDustParticle(true));

  function respawnDust(particle: DustParticle, t: number): void {
    const replacement = createDustParticle(false);
    Object.assign(particle, replacement);
    particle.bornAt = t + randFloat(0.15, 1.8);
  }

  const pointer = { x: 0, y: 0 };
  const pointerTarget = { x: 0, y: 0 };

  const handlePointerMove = (event: PointerEvent): void => {
    pointerTarget.x = event.clientX / window.innerWidth * 2 - 1;
    pointerTarget.y = -(event.clientY / window.innerHeight * 2 - 1);
  };

  const handlePointerLeave = (): void => {
    pointerTarget.x = 0;
    pointerTarget.y = 0;
  };

  function resize(): void {
    const coverScale = Math.max(window.innerWidth / ART_WIDTH, window.innerHeight / ART_HEIGHT) * 1.026;
    scenePlate.style.setProperty('--plate-width', `${ART_WIDTH * coverScale}px`);
    scenePlate.style.setProperty('--plate-height', `${ART_HEIGHT * coverScale}px`);
  }

  window.addEventListener('pointermove', handlePointerMove, { passive: true });
  window.addEventListener('pointerleave', handlePointerLeave);
  window.addEventListener('resize', resize, { passive: true });
  resize();

  let lastTime = performance.now() / 1000;
  let elapsed = 0;

  let flickerValue = 0;
  let flickerTarget = 0;
  let nextFlickerTargetAt = 0;
  let ambientIntensity = 1;
  let ambientDriftValue = 0;
  let ambientDriftTarget = 0;
  let nextAmbientDriftAt = 0;
  let gustStartedAt = -10;
  let gustDuration = 0;
  let gustStrength = 0;
  let gustDirection = 1;
  let nextGustAt = randFloat(2.8, 5.2);

  let roomNoiseValue = 0;
  let roomNoiseTarget = 0;
  let nextRoomNoiseAt = 0;

  let shadowActive = false;
  let shadowStartedAt = 0;
  let shadowDuration = 3.8;
  let shadowSide = 1;
  let shadowStrength = 0.44;
  let shadowX = 0;
  let shadowDrift = 0;
  // First pass happens quickly so the effect is easy to validate.
  let nextShadowAt = randFloat(2.5, 5.0);

  let lightningActive = false;
  let lightningStartedAt = 0;
  let lightningDuration = 1.18;
  // First strike is reasonably quick for validation; later ones stay occasional.
  let nextLightningAt = randFloat(5.5, 9.0);

  let nextGlintAt = randFloat(0.8, 2.0);
  let lastGlintIndex = -1;

  function triggerRandomGlint(t: number): void {
    let index = Math.floor(Math.random() * coinGlints.length);
    if (coinGlints.length > 1 && index === lastGlintIndex) {
      index = (index + 1 + Math.floor(Math.random() * (coinGlints.length - 1))) % coinGlints.length;
    }

    const glint = coinGlints[index];
    glint.active = true;
    glint.startedAt = t;
    glint.duration = randFloat(0.42, 0.72);
    glint.baseRotation = randFloat(-0.45, 0.45);
    lastGlintIndex = index;
    nextGlintAt = t + randFloat(1.4, 4.8);
  }

  function drawSprite(
    image: CanvasImageSource,
    centerX: number,
    centerY: number,
    width: number,
    height: number,
    rotation: number,
    alpha: number,
    composite: GlobalCompositeOperation = 'source-over',
  ): void {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.globalCompositeOperation = composite;
    ctx.translate(centerX, centerY);
    ctx.rotate(rotation);
    ctx.drawImage(image, -width * 0.5, -height * 0.5, width, height);
    ctx.restore();
  }

  function smoothPulse(t: number, start: number, duration: number): number {
    const p = clamp((t - start) / duration, 0, 1);
    if (p <= 0 || p >= 1) return 0;
    return Math.sin(p * Math.PI);
  }

  function lightningEnvelope(age: number): number {
    // First strike stays short and crisp. The second has a fast attack followed by a
    // much longer retinal-style fade so the room keeps a brief luminous after-image.
    const first = smoothPulse(age, 0.00, 0.105) * 0.78;

    const secondStart = 0.145;
    const secondAttack = 0.070;
    const secondFade = 0.78;
    let second = 0;

    if (age >= secondStart && age < secondStart + secondAttack) {
      const p = (age - secondStart) / secondAttack;
      second = 1 - Math.pow(1 - p, 3);
    } else if (age >= secondStart + secondAttack && age < secondStart + secondAttack + secondFade) {
      const p = (age - secondStart - secondAttack) / secondFade;
      second = Math.pow(1 - p, 2.35);
    }

    return clamp(Math.max(first, second), 0, 1);
  }

  function drawEffects(
    t: number,
    deltaForDust: number,
    intensity: number,
    flicker: number,
    gust: number,
    flameStretch: number,
    flameWidth: number,
    flameLean: number,
  ): void {
    ctx.clearRect(0, 0, ART_WIDTH, ART_HEIGHT);

    // Flame is drawn as vector paths directly into the final-resolution canvas.
    drawAnimatedFlame(t, intensity, flicker, gust, flameStretch, flameWidth, flameLean);

    // Coin sparkles.
    for (const glint of coinGlints) {
      if (!glint.active) continue;

      const phase = (t - glint.startedAt) / glint.duration;
      if (phase >= 1) {
        glint.active = false;
        continue;
      }

      const envelope = Math.sin(phase * Math.PI);
      const sparkle = Math.pow(envelope, 2.25);
      const pulse = 0.90 + Math.sin(phase * Math.PI * 3) * 0.10;
      const strength = sparkle * pulse;
      const size = worldScaleToArtPixels(glint.baseScale * (0.62 + strength * 0.88));

      drawSprite(
        glintTexture,
        glint.u * ART_WIDTH,
        glint.v * ART_HEIGHT,
        size,
        size,
        glint.baseRotation + phase * 0.42,
        strength * 0.86,
        'lighter',
      );
    }

    // Suspended dust flares that actually wander through the room. They keep a slow forward
    // motion while a low-frequency steering field gently bends their path over many seconds.
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    for (const particle of dust) {
      const age = t - particle.bornAt;
      if (age < 0) continue;
      if (age >= particle.lifetime) {
        respawnDust(particle, t);
        continue;
      }

      // Smooth wandering: heading evolves continuously rather than snapping to random targets.
      const turn = Math.sin(t * particle.turnFrequency + particle.phase) * particle.turnAmplitude;
      const secondaryTurn = Math.sin(t * particle.turnFrequency * 0.43 + particle.phase * 1.73) * particle.turnAmplitude * 0.36;
      particle.heading += (turn + secondaryTurn) * deltaForDust * 0.46;

      const desiredVx = Math.cos(particle.heading) * particle.speed;
      const desiredVy = Math.sin(particle.heading) * particle.speed;
      const velocityBlend = 1 - Math.exp(-deltaForDust * 0.72);
      particle.vx = lerp(particle.vx, desiredVx, velocityBlend);
      particle.vy = lerp(particle.vy, desiredVy, velocityBlend);

      particle.x += particle.vx * deltaForDust;
      particle.y += particle.vy * deltaForDust;

      // Tiny perpendicular bob keeps the motion organic without looking like a sine-wave screensaver.
      const normalX = -particle.vy / Math.max(particle.speed, 0.001);
      const normalY = particle.vx / Math.max(particle.speed, 0.001);
      const bob = Math.sin(t * particle.bobFrequency + particle.phase * 0.71) * particle.bobAmplitude;
      const renderX = particle.x + normalX * bob;
      const renderY = particle.y + normalY * bob;

      // Wrap around just outside the artwork so motes can keep wandering instead of popping at edges.
      const margin = 24;
      if (particle.x < -margin) particle.x = ART_WIDTH + margin;
      else if (particle.x > ART_WIDTH + margin) particle.x = -margin;
      if (particle.y < -margin) particle.y = ART_HEIGHT + margin;
      else if (particle.y > ART_HEIGHT + margin) particle.y = -margin;

      const fadeIn = clamp(age / 1.6, 0, 1);
      const fadeOut = clamp((particle.lifetime - age) / 2.6, 0, 1);
      const lifetimeEnvelope = Math.min(fadeIn, fadeOut);
      // Barely perceptible shimmer: these should feel like light catching dust, not blinking particles.
      const shimmer = 0.92 + Math.sin(t * particle.shimmerFrequency + particle.phase) * 0.08;

      const lanternInfluenceX = (renderX / ART_WIDTH - 0.79) / 0.48;
      const lanternInfluenceY = (renderY / ART_HEIGHT - 0.22) / 0.55;
      const lanternInfluence = Math.exp(-(lanternInfluenceX * lanternInfluenceX + lanternInfluenceY * lanternInfluenceY));
      const alpha = particle.alpha * lifetimeEnvelope * shimmer * (0.92 + lanternInfluence * 0.30);

      // Texture contains its own large soft falloff, so this diameter stays visually tiny.
      const renderSize = particle.size * 4.4;
      drawSprite(
        dustMoteTexture,
        renderX,
        renderY,
        renderSize,
        renderSize,
        0,
        alpha,
        'screen',
      );
    }
    ctx.restore();

    void flicker;
    void gust;
  }

  let animationFrameId = 0;

  function animate(nowMs: number): void {
    const now = nowMs / 1000;
    const delta = Math.min(now - lastTime, 0.05);
    lastTime = now;
    elapsed += delta;
    const t = elapsed;

    const pointerLerp = 1 - Math.exp(-delta * 2.2);
    pointer.x = lerp(pointer.x, pointerTarget.x, pointerLerp);
    pointer.y = lerp(pointer.y, pointerTarget.y, pointerLerp);

    const idleXWorld = Math.sin(t * 0.13) * IDLE_DRIFT_X_WORLD;
    const idleYWorld = Math.sin(t * 0.11 + 1.6) * IDLE_DRIFT_Y_WORLD;
    const parallaxXWorld = -pointer.x * PARALLAX_X_WORLD + idleXWorld;
    const parallaxYWorld = -pointer.y * PARALLAX_Y_WORLD + idleYWorld;
    const viewportPixelsPerWorld = window.innerHeight * 0.5;
    scenePlate.style.setProperty('--parallax-x', `${parallaxXWorld * viewportPixelsPerWorld}px`);
    scenePlate.style.setProperty('--parallax-y', `${-parallaxYWorld * viewportPixelsPerWorld}px`);

    if (t >= nextFlickerTargetAt) {
      flickerTarget = randFloat(-1, 1);
      nextFlickerTargetAt = t + randFloat(0.045, 0.145);
    }
    flickerValue = lerp(flickerValue, flickerTarget, 1 - Math.exp(-delta * 13));

    if (t >= nextAmbientDriftAt) {
      ambientDriftTarget = randFloat(-1, 1);
      nextAmbientDriftAt = t + randFloat(0.22, 0.52);
    }
    ambientDriftValue = lerp(
      ambientDriftValue,
      ambientDriftTarget,
      1 - Math.exp(-delta * 4.2),
    );

    if (t >= nextGustAt) {
      gustStartedAt = t;
      gustDuration = randFloat(0.45, 0.95);
      gustStrength = randFloat(0.08, 0.18);
      gustDirection = Math.random() < 0.58 ? -1 : 1;
      nextGustAt = t + randFloat(3.8, 8.0);
    }

    const gustPhase = clamp((t - gustStartedAt) / gustDuration, 0, 1);
    const gustEnvelope = gustPhase < 1 ? Math.sin(gustPhase * Math.PI) : 0;
    const gust = gustEnvelope * gustStrength * gustDirection;

    const micro = Math.sin(t * 12.7) * 0.042 + Math.sin(t * 7.1 + 0.7) * 0.030;
    const flameBreath = Math.sin(t * 1.55 + 1.2) * 0.065;
    const intensity = clamp(
      1 + flickerValue * 0.17 + micro + flameBreath + gust * 1.45,
      0.56,
      1.47,
    );

    if (t >= nextRoomNoiseAt) {
      roomNoiseTarget = randFloat(-1, 1);
      nextRoomNoiseAt = t + randFloat(1.6, 3.6);
    }
    roomNoiseValue = lerp(roomNoiseValue, roomNoiseTarget, 1 - Math.exp(-delta * 0.72));

    const slowPhase = t * 0.36 + Math.sin(t * 0.095) * 0.95;
    const slowPulse = Math.sin(slowPhase);
    const roomTarget = clamp(
      0.98 + slowPulse * 0.27 + roomNoiseValue * 0.075 + ambientDriftValue * 0.035,
      0.63,
      1.34,
    );
    ambientIntensity = lerp(ambientIntensity, roomTarget, 1 - Math.exp(-delta * 1.15));

    const roomLow = clamp((1.0 - ambientIntensity) / 0.37, 0, 1);
    const roomHigh = clamp((ambientIntensity - 0.88) / 0.46, 0, 1);
    ambientDim.style.opacity = `${0.012 + roomLow * 0.085}`;
    roomWarm.style.opacity = `${0.010 + roomHigh * 0.078}`;

    const ambientWarmOpacity = 0.075 + ambientIntensity * 0.105;
    const ambientWarmU = 0.665 + (
      Math.sin(t * 0.47) * 0.012 + roomNoiseValue * 0.010
    ) / 3;
    const ambientWarmV = 0.365 - Math.sin(t * 0.39 + 1.4) * 0.009 / 2;
    setRadialLayer(
      ambientWarm,
      ambientWarmU,
      ambientWarmV,
      2.34 + ambientIntensity * 0.34 + roomNoiseValue * 0.035,
      1.30 + ambientIntensity * 0.22 - roomNoiseValue * 0.020,
      ambientWarmOpacity,
    );

    setRadialLayer(
      tableGlow,
      0.700,
      0.310,
      1.34 + ambientIntensity * 0.19,
      0.62 + ambientIntensity * 0.105,
      0.070 + ambientIntensity * 0.105,
    );

    const localLight = clamp(ambientIntensity * 0.62 + intensity * 0.48, 0.55, 1.52);
    const lanternU = 0.787 + Math.sin(t * 4.1) * 0.0036 / 3;
    const lanternV = 0.215 - Math.sin(t * 5.6 + 0.4) * 0.0030 / 2;
    const lanternScale = 1.02 + localLight * 0.19;
    setRadialLayer(
      lanternGlow,
      lanternU,
      lanternV,
      lanternScale,
      lanternScale,
      0.075 + localLight * 0.205,
    );

    const flameGlowU = FLAME_U + Math.sin(t * 7.4) * 0.0050 / 3;
    const flameGlowV = FLAME_BASE_V - Math.sin(t * 8.8 + 1.1) * 0.0040 / 2;
    setRadialLayer(
      flameGlow,
      flameGlowU,
      flameGlowV,
      0.145 + intensity * 0.052 + flickerValue * 0.010,
      0.165 + intensity * 0.090 - flickerValue * 0.012,
      0.060 + intensity * 0.245,
    );

    const flameLean = Math.sin(t * 5.8) * 0.045 + flickerValue * 0.065 + gust * 0.23;
    const flameStretch = clamp(
      0.82 + intensity * 0.28 + Math.sin(t * 9.1 + 0.3) * 0.065,
      0.78,
      1.32,
    );
    const flameWidth = clamp(
      1.05 - (flameStretch - 1) * 0.34 + Math.sin(t * 7.7) * 0.045,
      0.82,
      1.18,
    );

    if (!shadowActive && t >= nextShadowAt) {
      shadowActive = true;
      shadowStartedAt = t;
      shadowDuration = randFloat(4.2, 6.8);
      shadowSide = Math.random() < 0.5 ? -1 : 1;
      // Roughly twice V11's opacity, while the radial falloff keeps the silhouette soft.
      shadowStrength = randFloat(0.40, 0.56);
      shadowX = shadowSide < 0 ? randFloat(-0.02, 0.035) : randFloat(0.715, 0.77);
      // Base offset plus a walking sway applied during the descent.
      shadowDrift = randFloat(-0.018, 0.018);
      nextShadowAt = t + randFloat(11, 26);
    }
    if (shadowActive) {
      const phase = (t - shadowStartedAt) / shadowDuration;
      if (phase >= 1) {
        shadowActive = false;
        passingShadow.style.opacity = '0';
      } else {
        // A large, rounded silhouette travels vertically from above the frame to below it.
        const envelope = Math.pow(Math.sin(phase * Math.PI), 0.72);
        const eased = phase * phase * (3 - 2 * phase);
        const top = lerp(-58, 108, eased);
        // 2-3 gentle side-to-side steps over the descent, strongest around the middle and
        // naturally damped as the silhouette enters/leaves the frame.
        const walkCycles = shadowDuration < 5.3 ? 2.0 : 2.75;
        const walkEnvelope = Math.pow(Math.sin(phase * Math.PI), 0.62);
        const walkSway = Math.sin(phase * Math.PI * 2 * walkCycles + shadowSide * 0.55)
          * 0.022
          * walkEnvelope;
        const x = (shadowX + shadowDrift * Math.sin(phase * Math.PI) + walkSway) * 100;
        passingShadow.style.left = `${x}%`;
        passingShadow.style.top = `${top}%`;
        passingShadow.style.opacity = `${envelope * shadowStrength}`;
        passingShadow.style.transform = `scale(${0.96 + envelope * 0.08})`;
      }
    }

    if (!lightningActive && t >= nextLightningAt) {
      lightningActive = true;
      lightningStartedAt = t;
      lightningDuration = randFloat(1.02, 1.20);
      nextLightningAt = t + randFloat(18, 42);
    }

    if (lightningActive) {
      const age = t - lightningStartedAt;
      if (age >= lightningDuration) {
        lightningActive = false;
        lightningWash.style.opacity = '0';
        lightningHighlights.style.opacity = '0';
      } else {
        const lightningStrength = lightningEnvelope(age);
        // Broad cool fill stays restrained; the art-space highlight mask reaches full strength
        // only at the peak of the strike and remains pixel-perfect with the concept art.
        lightningWash.style.opacity = `${lightningStrength * 0.54}`;
        lightningHighlights.style.opacity = `${lightningStrength}`;
      }
    }

    if (t >= nextGlintAt) triggerRandomGlint(t);

    drawEffects(t, delta, intensity, flickerValue, gust, flameStretch, flameWidth, flameLean);
    animationFrameId = requestAnimationFrame(animate);
  }

  animationFrameId = requestAnimationFrame((now) => {
    lastTime = now / 1000;
    animationFrameId = requestAnimationFrame(animate);
  });

  return () => {
    cancelAnimationFrame(animationFrameId);
    window.removeEventListener('pointermove', handlePointerMove);
    window.removeEventListener('pointerleave', handlePointerLeave);
    window.removeEventListener('resize', resize);
    app.replaceChildren();
  };
}
