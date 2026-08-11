import * as THREE from 'three';

const PHI = (1 + Math.sqrt(5)) / 2;
const TAU = Math.PI * 2;

const BASE_VERTICES = [
  [-1, PHI, 0], [1, PHI, 0], [-1, -PHI, 0], [1, -PHI, 0],
  [0, -1, PHI], [0, 1, PHI], [0, -1, -PHI], [0, 1, -PHI],
  [PHI, 0, -1], [PHI, 0, 1], [-PHI, 0, -1], [-PHI, 0, 1],
] as const;

const FACE_INDICES = [
  [0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11],
  [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8],
  [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9],
  [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1],
] as const;

// Explicit display mapping. Opposite faces sum to 21.
const FACE_VALUES = [20, 2, 18, 4, 16, 6, 14, 8, 12, 10, 17, 3, 19, 1, 5, 9, 11, 15, 7, 13] as const;

const RADIUS = 1.12;
const FACE_INSET = 0.84;
const LABEL_INSET = 0.625;
const FRAME_OUTER_INSET = 0.77;
const FRAME_INNER_INSET = 0.72;
const TABLE_REST_SCALE = 0.38;
const TABLE_PLANE_Y = -0.31;
const WORLD_UP = new THREE.Vector3(0, 1, 0);
const FINAL_PLANAR = new THREE.Vector3(0, 0, 0);
const MOTION_SAMPLE_COUNT = 540;

const LABEL_BASE = new THREE.Color(0xffffff);
const LABEL_REVEAL = new THREE.Color(0xfff0bd);
const TMP_COLOR = new THREE.Color();

interface FaceData {
  value: number;
  normal: THREE.Vector3;
  up: THREE.Vector3;
}

interface EdgeSide {
  pointByVertex: Map<number, number>;
}

interface EdgeData {
  a: number;
  b: number;
  sides: EdgeSide[];
}

type MotionPhase = 'air' | 'roll' | 'rest';

interface MotionSample {
  planar: THREE.Vector3;
  clearance: number;
  phase: MotionPhase;
  speedRatio: number;
  contactIndex: number;
}

interface RollAnimation {
  startedAt: number;
  durationMs: number;
  result: number;
  target: THREE.Quaternion;
  motionSamples: MotionSample[];
  positionSamples: THREE.Vector3[];
  orientationSamples: THREE.Quaternion[];
  impactSamples: Set<number>;
  impactStrengths: number[];
  airAxisA: THREE.Vector3;
  airAxisB: THREE.Vector3;
  airSpinRate: number;
  airPrecessionRate: number;
  effectiveRollingRadius: number;
}

interface PhysicsPlan {
  durationSeconds: number;
  motionSamples: MotionSample[];
  impactSamples: Set<number>;
  impactStrengths: number[];
}

export interface D20SceneOptions {
  canvas: HTMLCanvasElement;
  onComplete?: () => void;
  onContextLost?: () => void;
}

export class D20Scene {
  private readonly canvas: HTMLCanvasElement;
  private readonly renderer: THREE.WebGLRenderer;
  private readonly scene = new THREE.Scene();
  private readonly camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  private readonly die = new THREE.Group();
  private readonly faceMap = new Map<number, FaceData>();
  private readonly labelMaterials = new Map<number, THREE.MeshBasicMaterial>();
  private readonly textures: THREE.Texture[] = [];
  private readonly bodyVertices = BASE_VERTICES.map(([x, y, z]) =>
    new THREE.Vector3(x, y, z).normalize().multiplyScalar(RADIUS));
  private readonly supportProbe = new THREE.Vector3();
  private readonly revealLight = new THREE.PointLight(0xffb34f, 0, 4.5, 2);
  private readonly onContextLost?: () => void;

  private contactShadow?: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>;
  private onComplete?: () => void;
  private animation?: RollAnimation;
  private rafId = 0;
  private disposed = false;

  public constructor({ canvas, onComplete, onContextLost }: D20SceneOptions) {
    this.canvas = canvas;
    this.onComplete = onComplete;
    this.onContextLost = onContextLost;

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 0.92;
    this.renderer.shadowMap.enabled = false;

    // Higher camera than the previous prototype: the die now genuinely rests
    // on a horizontal table and the result is the top face, not a face aimed
    // straight at the camera.
    this.camera.position.set(0, 2.15, 6.15);
    this.camera.lookAt(0, -0.16, 0);

    this.buildScene();
    this.canvas.addEventListener('webglcontextlost', this.handleContextLost, false);
    this.resize();
  }

  public setOnComplete(callback?: () => void): void {
    this.onComplete = callback;
  }

  public resize(): void {
    if (this.disposed) return;

    const width = Math.max(1, this.canvas.clientWidth);
    const height = Math.max(1, this.canvas.clientHeight);
    this.renderer.setSize(width, height, false);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.render();
  }

  public roll(result: number, rollKey: string | number): void {
    if (result < 1 || result > 20 || !Number.isInteger(result)) {
      throw new RangeError(`D20 result must be an integer from 1 to 20. Received: ${result}`);
    }

    const seed = hash32(`${String(rollKey)}:${result}`);
    const rng = mulberry32(seed);
    const target = this.getTargetQuaternion(result);

    this.cancelAnimation();
    this.resetLabelColors();
    this.revealLight.intensity = 0;

    const physics = this.buildPhysicsPlan(rng);
    const animation: RollAnimation = {
      startedAt: performance.now(),
      durationMs: physics.durationSeconds * 1000,
      result,
      target,
      motionSamples: physics.motionSamples,
      positionSamples: [],
      orientationSamples: [],
      impactSamples: physics.impactSamples,
      impactStrengths: physics.impactStrengths,
      airAxisA: randomUnitVector(rng, new THREE.Vector3(0.8, 0.35, 0.45)),
      airAxisB: randomUnitVector(rng, new THREE.Vector3(-0.25, 0.82, 0.48)),
      airSpinRate: range(rng, 17.5, 22.5),
      airPrecessionRate: range(rng, 4.2, 6.4) * (rng() > 0.5 ? 1 : -1),
      effectiveRollingRadius: RADIUS * TABLE_REST_SCALE * range(rng, 0.69, 0.76),
    };

    animation.orientationSamples = this.buildOrientationSamples(animation, rng);
    animation.positionSamples = this.buildPositionSamples(animation);

    this.die.scale.setScalar(TABLE_REST_SCALE);
    this.die.position.copy(animation.positionSamples[0]);
    this.die.quaternion.copy(animation.orientationSamples[0]);

    this.animation = animation;
    this.rafId = requestAnimationFrame(this.tick);
  }

  public dispose(): void {
    if (this.disposed) return;
    this.disposed = true;

    this.cancelAnimation();
    this.canvas.removeEventListener('webglcontextlost', this.handleContextLost, false);

    this.scene.traverse((object) => {
      if (!(object instanceof THREE.Mesh) && !(object instanceof THREE.LineSegments)) return;
      object.geometry.dispose();
      const materials = Array.isArray(object.material) ? object.material : [object.material];
      materials.forEach((material) => material.dispose());
    });

    this.textures.forEach((texture) => texture.dispose());
    this.renderer.dispose();
  }

  private readonly tick = (now: number): void => {
    const animation = this.animation;
    if (!animation || this.disposed) return;

    const p = THREE.MathUtils.clamp((now - animation.startedAt) / animation.durationMs, 0, 1);
    this.updatePose(animation, p);
    this.updateReveal(animation, p);
    this.render();

    if (p >= 1) {
      const last = MOTION_SAMPLE_COUNT;
      this.die.position.copy(animation.positionSamples[last]);
      this.die.quaternion.copy(animation.orientationSamples[last]);
      this.highlightResult(animation.result, 1);
      this.revealLight.intensity = 2.75;
      this.animation = undefined;
      this.rafId = 0;
      this.render();
      this.onComplete?.();
      return;
    }

    this.rafId = requestAnimationFrame(this.tick);
  };

  private updatePose(animation: RollAnimation, p: number): void {
    const samplePosition = THREE.MathUtils.clamp(p, 0, 1) * MOTION_SAMPLE_COUNT;
    const index = Math.min(MOTION_SAMPLE_COUNT - 1, Math.floor(samplePosition));
    const local = samplePosition - index;

    this.die.position
      .copy(animation.positionSamples[index])
      .lerp(animation.positionSamples[index + 1], local);

    this.die.quaternion
      .copy(animation.orientationSamples[index])
      .slerp(animation.orientationSamples[index + 1], local)
      .normalize();
  }

  /**
   * Event-driven, physically-shaped trajectory:
   * - ballistic free fall under gravity;
   * - 1..3 rebounds with restitution-driven height loss;
   * - tangential velocity loss at each impact (friction impulse analogue);
   * - a final rolling phase with monotonic deceleration.
   *
   * The whole plan is cosmetic. It never computes the gameplay result.
   */
  private buildPhysicsPlan(rng: () => number): PhysicsPlan {
    const side = rng() > 0.5 ? 1 : -1;
    const start = new THREE.Vector3(
      side * range(rng, 2.55, 2.88),
      0,
      range(rng, 0.34, 0.72) * (rng() > 0.5 ? 1 : -1),
    );

    const gravity = range(rng, 8.2, 9.1);
    const initialClearance = range(rng, 0.7, 0.92);
    const initialVerticalVelocity = range(rng, -0.55, 0.18);
    const firstFlight = solveGroundHitTime(initialClearance, initialVerticalVelocity, gravity);
    const firstImpactSpeed = Math.abs(initialVerticalVelocity - gravity * firstFlight);

    const reboundCount = 1 + Math.floor(rng() * 3);
    const restitutionBase = range(rng, 0.42, 0.49);
    const bounceFlights: number[] = [];
    const bounceUpSpeeds: number[] = [];
    const impactStrengths = [firstImpactSpeed];

    let incomingSpeed = firstImpactSpeed;
    for (let i = 0; i < reboundCount; i += 1) {
      const restitution = restitutionBase * (0.92 ** i);
      const upSpeed = incomingSpeed * restitution;
      bounceUpSpeeds.push(upSpeed);
      bounceFlights.push((2 * upSpeed) / gravity);
      incomingSpeed = upSpeed;
      impactStrengths.push(incomingSpeed);
    }

    const rollSeconds = range(rng, 0.64, 0.84);
    const restSeconds = 0.12;
    const flightSegments = [firstFlight, ...bounceFlights];

    // Coulomb friction acts tangentially at contact. We use the same visual
    // consequence here: each impact removes a fraction of horizontal speed.
    const tangentRetention = range(rng, 0.77, 0.84);
    const segmentSpeedRatios = flightSegments.map((_, index) => tangentRetention ** index);
    const rollingSpeedRatio = tangentRetention ** flightSegments.length;

    const distanceWeights = flightSegments.map((duration, index) =>
      duration * segmentSpeedRatios[index]);
    distanceWeights.push(rollSeconds * rollingSpeedRatio * 0.53);

    const totalWeight = distanceWeights.reduce((sum, weight) => sum + weight, 0);
    const totalDistance = start.distanceTo(FINAL_PLANAR);
    const forward = FINAL_PLANAR.clone().sub(start).normalize();
    const lateral = new THREE.Vector3(-forward.z, 0, forward.x);

    const waypoints: THREE.Vector3[] = [start.clone()];
    let cumulativeDistance = 0;
    for (let i = 0; i < flightSegments.length; i += 1) {
      cumulativeDistance += totalDistance * (distanceWeights[i] / totalWeight);
      const base = start.clone().addScaledVector(forward, cumulativeDistance);
      const lateralKick =
        range(rng, 0.045, 0.13) *
        (i % 2 === 0 ? 1 : -1) *
        (rng() > 0.5 ? 1 : -1) *
        (0.72 ** i);
      waypoints.push(base.addScaledVector(lateral, lateralKick));
    }
    waypoints.push(FINAL_PLANAR.clone());

    const segmentStarts: number[] = [0];
    for (const duration of flightSegments) {
      segmentStarts.push(segmentStarts[segmentStarts.length - 1] + duration);
    }
    const rollStart = segmentStarts[segmentStarts.length - 1];
    const rollEnd = rollStart + rollSeconds;
    const durationSeconds = rollEnd + restSeconds;

    const impactSamples = new Set<number>();
    for (let i = 1; i < segmentStarts.length; i += 1) {
      impactSamples.add(Math.round((segmentStarts[i] / durationSeconds) * MOTION_SAMPLE_COUNT));
    }

    const samples: MotionSample[] = [];
    for (let i = 0; i <= MOTION_SAMPLE_COUNT; i += 1) {
      const time = (i / MOTION_SAMPLE_COUNT) * durationSeconds;

      if (time < rollStart) {
        let segmentIndex = 0;
        while (
          segmentIndex + 1 < segmentStarts.length &&
          time >= segmentStarts[segmentIndex + 1]
        ) {
          segmentIndex += 1;
        }

        const startTime = segmentStarts[segmentIndex];
        const duration = flightSegments[segmentIndex];
        const localTime = THREE.MathUtils.clamp(time - startTime, 0, duration);
        const u = duration > 0 ? localTime / duration : 1;
        const planar = waypoints[segmentIndex].clone().lerp(waypoints[segmentIndex + 1], u);

        const clearance = segmentIndex === 0
          ? Math.max(0, initialClearance + initialVerticalVelocity * localTime - 0.5 * gravity * localTime * localTime)
          : Math.max(0, bounceUpSpeeds[segmentIndex - 1] * localTime - 0.5 * gravity * localTime * localTime);

        samples.push({
          planar,
          clearance,
          phase: 'air',
          speedRatio: segmentSpeedRatios[segmentIndex],
          contactIndex: segmentIndex,
        });
        continue;
      }

      if (time < rollEnd) {
        const u = THREE.MathUtils.clamp((time - rollStart) / rollSeconds, 0, 1);
        const progress = deceleratingProgress(u, 2.2);
        const planar = waypoints[waypoints.length - 2]
          .clone()
          .lerp(FINAL_PLANAR, progress);

        samples.push({
          planar,
          clearance: 0,
          phase: 'roll',
          speedRatio: (1 - u) ** 1.2,
          contactIndex: flightSegments.length,
        });
        continue;
      }

      samples.push({
        planar: FINAL_PLANAR.clone(),
        clearance: 0,
        phase: 'rest',
        speedRatio: 0,
        contactIndex: flightSegments.length,
      });
    }

    // Exactly pin the final sample. No late translational correction exists in
    // the animation loop because the trajectory already ends here.
    samples[MOTION_SAMPLE_COUNT].planar.copy(FINAL_PLANAR);
    samples[MOTION_SAMPLE_COUNT].clearance = 0;
    samples[MOTION_SAMPLE_COUNT].phase = 'rest';

    return { durationSeconds, motionSamples: samples, impactSamples, impactStrengths };
  }

  /**
   * Build small forward rotational increments, then solve every absolute
   * orientation backwards from the known final face. This preserves the spin,
   * impact kicks and rolling direction exactly while making a final correction
   * mathematically unnecessary.
   */
  private buildOrientationSamples(animation: RollAnimation, rng: () => number): THREE.Quaternion[] {
    const deltas: THREE.Quaternion[] = [new THREE.Quaternion()];
    const dt = animation.durationMs / 1000 / MOTION_SAMPLE_COUNT;
    const contactKickSigns = animation.impactStrengths.map(() => (rng() > 0.5 ? 1 : -1));
    const impactIndexBySample = new Map(
      [...animation.impactSamples]
        .sort((a, b) => a - b)
        .map((sample, index) => [sample, index] as const),
    );

    for (let i = 1; i <= MOTION_SAMPLE_COUNT; i += 1) {
      const previous = animation.motionSamples[i - 1];
      const current = animation.motionSamples[i];
      const planarDelta = current.planar.clone().sub(previous.planar).setY(0);
      const travelled = planarDelta.length();
      const delta = new THREE.Quaternion();

      if (current.phase === 'air' || previous.phase === 'air') {
        const elapsed = (i / MOTION_SAMPLE_COUNT) * (animation.durationMs / 1000);
        const airDamping = Math.exp(-0.11 * elapsed);
        const impactDamping = 0.74 ** current.contactIndex;
        const spin = new THREE.Quaternion().setFromAxisAngle(
          animation.airAxisA,
          animation.airSpinRate * airDamping * impactDamping * dt,
        );
        const precession = new THREE.Quaternion().setFromAxisAngle(
          animation.airAxisB,
          animation.airPrecessionRate * airDamping * impactDamping * dt,
        );
        delta.copy(precession).multiply(spin).normalize();
      } else if (current.phase === 'roll' && travelled > 1e-8) {
        const forward = planarDelta.multiplyScalar(1 / travelled);
        const rollAxis = forward.clone().cross(WORLD_UP).normalize();
        const angularDamping = 0.94 + 0.12 * current.speedRatio;
        const angle = -(travelled / animation.effectiveRollingRadius) * angularDamping;
        delta.setFromAxisAngle(rollAxis, angle).normalize();
      }

      const impactIndex = impactIndexBySample.get(i);
      if (impactIndex !== undefined) {
        const strength = animation.impactStrengths[impactIndex] ?? 0;
        const normalizedStrength = THREE.MathUtils.clamp(strength / 4.2, 0.12, 1);
        const motion = current.planar.clone().sub(previous.planar).setY(0);
        const forward = motion.lengthSq() > 1e-8
          ? motion.normalize()
          : new THREE.Vector3(1, 0, 0);
        const rollAxis = forward.clone().cross(WORLD_UP).normalize();
        const kickAxis = rollAxis
          .clone()
          .addScaledVector(WORLD_UP, 0.22 * contactKickSigns[impactIndex])
          .addScaledVector(forward, 0.08 * contactKickSigns[impactIndex])
          .normalize();
        const kick = new THREE.Quaternion().setFromAxisAngle(
          kickAxis,
          rangeFromIndex(impactIndex, 0.18, 0.34) * normalizedStrength,
        );
        delta.premultiply(kick).normalize();
      }

      deltas.push(delta);
    }

    const orientations: THREE.Quaternion[] = new Array(MOTION_SAMPLE_COUNT + 1);
    orientations[MOTION_SAMPLE_COUNT] = animation.target.clone().normalize();

    for (let i = MOTION_SAMPLE_COUNT; i >= 1; i -= 1) {
      orientations[i - 1] = deltas[i]
        .clone()
        .invert()
        .multiply(orientations[i])
        .normalize();
    }

    return orientations;
  }

  private buildPositionSamples(animation: RollAnimation): THREE.Vector3[] {
    return animation.motionSamples.map((sample, index) => {
      const orientation = animation.orientationSamples[index];
      const supportHeight = this.getSupportHeight(orientation);
      return new THREE.Vector3(
        sample.planar.x,
        TABLE_PLANE_Y + supportHeight + sample.clearance,
        sample.planar.z,
      );
    });
  }

  /** Distance from the die center to its lowest transformed vertex. */
  private getSupportHeight(orientation: THREE.Quaternion): number {
    let minY = Number.POSITIVE_INFINITY;

    for (const vertex of this.bodyVertices) {
      const y = this.supportProbe
        .copy(vertex)
        .applyQuaternion(orientation).y * TABLE_REST_SCALE;
      if (y < minY) minY = y;
    }

    return -minY;
  }

  private updateReveal(animation: RollAnimation, p: number): void {
    if (p < 0.9) return;
    const u = easeOutCubic((p - 0.9) / 0.1);
    this.highlightResult(animation.result, u);
    this.revealLight.intensity = THREE.MathUtils.lerp(0, 2.75, u);
  }

  private highlightResult(result: number, amount: number): void {
    const material = this.labelMaterials.get(result);
    if (!material) return;

    material.color.copy(TMP_COLOR.copy(LABEL_BASE).lerp(LABEL_REVEAL, amount));
    material.opacity = THREE.MathUtils.lerp(0.96, 1, amount);
  }

  private resetLabelColors(): void {
    this.labelMaterials.forEach((material) => {
      material.color.copy(LABEL_BASE);
      material.opacity = 0.96;
    });
  }

  /**
   * The gameplay result becomes the physical top face. Rotation around the
   * vertical axis is chosen so the number is upright from the raised camera.
   */
  private getTargetQuaternion(result: number): THREE.Quaternion {
    const face = this.faceMap.get(result);
    if (!face) throw new Error(`No face mapped for d20 result ${result}.`);

    const localZ = face.normal.clone().normalize();
    const localY = face.up.clone().projectOnPlane(localZ).normalize();
    const localX = localY.clone().cross(localZ).normalize();
    localY.copy(localZ).cross(localX).normalize();

    const targetZ = WORLD_UP.clone();
    const targetY = FINAL_PLANAR
      .clone()
      .sub(this.camera.position)
      .projectOnPlane(targetZ)
      .normalize();
    const targetX = targetY.clone().cross(targetZ).normalize();
    targetY.copy(targetZ).cross(targetX).normalize();

    const localBasis = new THREE.Matrix4().makeBasis(localX, localY, localZ);
    const targetBasis = new THREE.Matrix4().makeBasis(targetX, targetY, targetZ);
    const localRotation = new THREE.Quaternion().setFromRotationMatrix(localBasis);
    const targetRotation = new THREE.Quaternion().setFromRotationMatrix(targetBasis);

    return targetRotation.multiply(localRotation.invert()).normalize();
  }

  private buildScene(): void {
    this.die.scale.setScalar(TABLE_REST_SCALE);
    this.scene.add(this.die);

    this.buildBody(this.bodyVertices);
    this.buildLabels(this.bodyVertices);
    this.buildLighting();
    this.buildContactShadow();

    const idleTarget = this.getTargetQuaternion(20);
    this.die.quaternion.copy(idleTarget);
    this.die.position.set(0, TABLE_PLANE_Y + this.getSupportHeight(idleTarget), 0);

    this.revealLight.position.set(0, 1.15, 1.15);
    this.scene.add(this.revealLight);
  }

  private buildBody(vertices: THREE.Vector3[]): void {
    const faceTexture = createFaceTexture();
    this.textures.push(faceTexture);

    const faceMaterial = new THREE.MeshStandardMaterial({
      map: faceTexture,
      color: 0x7d7468,
      roughness: 0.78,
      metalness: 0.08,
      flatShading: true,
    });

    const bevelPositions: number[] = [];
    const bevelIndices: number[] = [];
    const edgeMap = new Map<string, EdgeData>();

    FACE_INDICES.forEach((face) => {
      const original = face.map(index => vertices[index]);
      const center = original
        .reduce((sum, vertex) => sum.add(vertex), new THREE.Vector3())
        .multiplyScalar(1 / 3);
      const normal = original[1]
        .clone()
        .sub(original[0])
        .cross(original[2].clone().sub(original[0]))
        .normalize();

      const inset = original.map(vertex => center.clone().lerp(vertex, FACE_INSET));
      const faceGeometry = new THREE.BufferGeometry();
      faceGeometry.setAttribute('position', new THREE.Float32BufferAttribute([
        inset[0].x, inset[0].y, inset[0].z,
        inset[1].x, inset[1].y, inset[1].z,
        inset[2].x, inset[2].y, inset[2].z,
      ], 3));
      faceGeometry.setAttribute('uv', new THREE.Float32BufferAttribute([
        0.5, 0.98,
        0.02, 0.02,
        0.98, 0.02,
      ], 2));
      faceGeometry.computeVertexNormals();
      this.die.add(new THREE.Mesh(faceGeometry, faceMaterial));

      this.buildInnerFrame(original, center, normal);

      const pointIds: number[] = [];
      inset.forEach((point) => {
        const id = bevelPositions.length / 3;
        bevelPositions.push(point.x, point.y, point.z);
        pointIds.push(id);
      });

      for (let i = 0; i < 3; i += 1) {
        const originalA = face[i];
        const originalB = face[(i + 1) % 3];
        const a = Math.min(originalA, originalB);
        const b = Math.max(originalA, originalB);
        const key = `${a}:${b}`;
        const edge = edgeMap.get(key) ?? { a, b, sides: [] };
        edge.sides.push({
          pointByVertex: new Map<number, number>([
            [originalA, pointIds[i]],
            [originalB, pointIds[(i + 1) % 3]],
          ]),
        });
        edgeMap.set(key, edge);
      }
    });

    const capIds = vertices.map((vertex) => {
      const cap = vertex.clone().normalize().multiplyScalar(RADIUS * 0.987);
      const id = bevelPositions.length / 3;
      bevelPositions.push(cap.x, cap.y, cap.z);
      return id;
    });

    edgeMap.forEach((edge) => {
      if (edge.sides.length !== 2) return;

      const [left, right] = edge.sides;
      const leftA = left.pointByVertex.get(edge.a);
      const leftB = left.pointByVertex.get(edge.b);
      const rightA = right.pointByVertex.get(edge.a);
      const rightB = right.pointByVertex.get(edge.b);
      if (leftA === undefined || leftB === undefined || rightA === undefined || rightB === undefined) return;

      addOutwardTriangle(bevelIndices, bevelPositions, leftA, leftB, rightB);
      addOutwardTriangle(bevelIndices, bevelPositions, leftA, rightB, rightA);
      addOutwardTriangle(bevelIndices, bevelPositions, leftA, rightA, capIds[edge.a]);
      addOutwardTriangle(bevelIndices, bevelPositions, leftB, capIds[edge.b], rightB);
    });

    const bevelGeometry = new THREE.BufferGeometry();
    bevelGeometry.setAttribute('position', new THREE.Float32BufferAttribute(bevelPositions, 3));
    bevelGeometry.setIndex(bevelIndices);
    bevelGeometry.computeVertexNormals();

    const bevelColors: number[] = [];
    for (let i = 0; i < bevelPositions.length; i += 3) {
      const x = bevelPositions[i];
      const y = bevelPositions[i + 1];
      const z = bevelPositions[i + 2];
      const grain = 0.5 + 0.5 * Math.sin(x * 17.3 + y * 11.7 + z * 23.1);
      const color = new THREE.Color(0x805017).lerp(new THREE.Color(0xe0aa4c), 0.34 + grain * 0.46);
      bevelColors.push(color.r, color.g, color.b);
    }
    bevelGeometry.setAttribute('color', new THREE.Float32BufferAttribute(bevelColors, 3));

    const bevelMaterial = new THREE.MeshStandardMaterial({
      color: 0xc18a31,
      vertexColors: true,
      roughness: 0.42,
      metalness: 0.64,
      side: THREE.DoubleSide,
    });

    this.die.add(new THREE.Mesh(bevelGeometry, bevelMaterial));
  }

  private buildInnerFrame(
    vertices: THREE.Vector3[],
    center: THREE.Vector3,
    normal: THREE.Vector3,
  ): void {
    const outer = vertices.map(vertex =>
      center.clone().lerp(vertex, FRAME_OUTER_INSET).addScaledVector(normal, 0.012));
    const inner = vertices.map(vertex =>
      center.clone().lerp(vertex, FRAME_INNER_INSET).addScaledVector(normal, 0.0135));

    const positions: number[] = [];
    const indices: number[] = [];

    for (let edge = 0; edge < 3; edge += 1) {
      const next = (edge + 1) % 3;
      const base = positions.length / 3;
      const points = [outer[edge], outer[next], inner[next], inner[edge]];
      points.forEach(point => positions.push(point.x, point.y, point.z));
      indices.push(base, base + 1, base + 2, base, base + 2, base + 3);
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();

    const material = new THREE.MeshStandardMaterial({
      color: 0xc88b2c,
      roughness: 0.44,
      metalness: 0.58,
      side: THREE.DoubleSide,
      polygonOffset: true,
      polygonOffsetFactor: -2,
      polygonOffsetUnits: -2,
    });

    this.die.add(new THREE.Mesh(geometry, material));
  }

  private buildLabels(vertices: THREE.Vector3[]): void {
    FACE_INDICES.forEach(([ia, ib, ic], faceIndex) => {
      const value = FACE_VALUES[faceIndex];
      const a = vertices[ia].clone();
      const b = vertices[ib].clone();
      const c = vertices[ic].clone();
      const center = a.clone().add(b).add(c).multiplyScalar(1 / 3);
      const normal = b.clone().sub(a).cross(c.clone().sub(a)).normalize();
      const up = a.clone().sub(center).projectOnPlane(normal).normalize();

      this.faceMap.set(value, { value, normal: normal.clone(), up: up.clone() });

      const offset = normal.clone().multiplyScalar(0.02);
      const la = center.clone().lerp(a, LABEL_INSET).add(offset);
      const lb = center.clone().lerp(b, LABEL_INSET).add(offset);
      const lc = center.clone().lerp(c, LABEL_INSET).add(offset);

      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.Float32BufferAttribute([
        la.x, la.y, la.z,
        lb.x, lb.y, lb.z,
        lc.x, lc.y, lc.z,
      ], 3));
      geometry.setAttribute('uv', new THREE.Float32BufferAttribute([
        0.5, 0.91,
        0.08, 0.1,
        0.92, 0.1,
      ], 2));

      const texture = createNumberTexture(value);
      this.textures.push(texture);

      // The gold, brushed texture and engraved inner shadow are already baked
      // into the canvas texture. Keep labels unlit so they remain readable on
      // every face instead of disappearing when a face turns away from the key.
      const material = new THREE.MeshBasicMaterial({
        map: texture,
        color: LABEL_BASE,
        transparent: true,
        opacity: 1,
        alphaTest: 0.02,
        depthWrite: false,
        polygonOffset: true,
        polygonOffsetFactor: -5,
        polygonOffsetUnits: -5,
        side: THREE.FrontSide,
        // The numbers are a readability layer baked into the die rather than
        // a light-reactive surface. ACES was crushing the small gold glyphs
        // against the dark face at gameplay scale.
        toneMapped: false,
      });

      this.labelMaterials.set(value, material);
      this.die.add(new THREE.Mesh(geometry, material));
    });
  }

  private buildLighting(): void {
    this.scene.add(new THREE.HemisphereLight(0xffe4b6, 0x100b07, 0.64));

    const key = new THREE.SpotLight(0xffc064, 42, 12, Math.PI / 4.5, 0.7, 1.45);
    key.position.set(-3.4, 4.8, 4.2);
    key.target.position.set(0, -0.08, 0);
    this.scene.add(key, key.target);

    const fill = new THREE.DirectionalLight(0x9a7650, 0.72);
    fill.position.set(3.2, 1.6, 2.7);
    this.scene.add(fill);

    const rim = new THREE.PointLight(0xff9d35, 3.4, 9, 2);
    rim.position.set(2.9, 1.8, -3.1);
    this.scene.add(rim);
  }

  private buildContactShadow(): void {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 128;

    const context = canvas.getContext('2d');
    if (!context) return;

    context.save();
    context.translate(128, 64);
    context.scale(1, 0.44);
    const gradient = context.createRadialGradient(0, 0, 0, 0, 0, 84);
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0.48)');
    gradient.addColorStop(0.3, 'rgba(0, 0, 0, 0.22)');
    gradient.addColorStop(0.66, 'rgba(0, 0, 0, 0.06)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    context.fillStyle = gradient;
    context.fillRect(-128, -128, 256, 256);
    context.restore();

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;
    this.textures.push(texture);

    const material = new THREE.MeshBasicMaterial({
      map: texture,
      color: 0x000000,
      transparent: true,
      opacity: 0.22,
      depthWrite: false,
      depthTest: false,
      side: THREE.DoubleSide,
    });

    const shadow = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), material);
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = TABLE_PLANE_Y + 0.004;
    shadow.renderOrder = -10;
    this.contactShadow = shadow;
    this.scene.add(shadow);
  }

  private updateContactShadow(): void {
    const shadow = this.contactShadow;
    if (!shadow) return;

    const support = this.getSupportHeight(this.die.quaternion);
    const clearance = Math.max(0, this.die.position.y - (TABLE_PLANE_Y + support));
    const lift = THREE.MathUtils.clamp(clearance / 0.82, 0, 1);

    shadow.position.x = this.die.position.x;
    shadow.position.z = this.die.position.z;

    const width = THREE.MathUtils.lerp(0.88, 1.24, lift);
    const depth = THREE.MathUtils.lerp(0.42, 0.64, lift);
    shadow.scale.set(width, depth, 1);
    shadow.material.opacity = THREE.MathUtils.lerp(0.22, 0.045, lift);
  }

  private render(): void {
    this.updateContactShadow();
    this.renderer.render(this.scene, this.camera);
  }

  private cancelAnimation(): void {
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.rafId = 0;
    this.animation = undefined;
  }

  private readonly handleContextLost = (event: Event): void => {
    event.preventDefault();
    this.cancelAnimation();
    this.onContextLost?.();
  };
}

function createFaceTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;

  const context = canvas.getContext('2d');
  if (!context) throw new Error('Unable to create d20 face texture.');

  const base = context.createRadialGradient(128, 112, 12, 128, 128, 170);
  base.addColorStop(0, '#242019');
  base.addColorStop(0.56, '#171410');
  base.addColorStop(1, '#0b0907');
  context.fillStyle = base;
  context.fillRect(0, 0, 256, 256);

  // Deterministic pits / age marks. No Math.random: texture generation must not
  // introduce another source of non-repeatability into the visual component.
  for (let i = 0; i < 150; i += 1) {
    const x = fract(Math.sin(i * 91.713 + 4.1) * 43758.5453) * 256;
    const y = fract(Math.sin(i * 47.117 + 8.7) * 24634.6345) * 256;
    const radius = 0.35 + fract(Math.sin(i * 17.43) * 8127.17) * 1.25;
    const alpha = 0.025 + fract(Math.sin(i * 23.61) * 1371.7) * 0.08;
    context.beginPath();
    context.arc(x, y, radius, 0, TAU);
    context.fillStyle = `rgba(218, 170, 83, ${alpha})`;
    context.fill();
  }

  context.lineCap = 'round';
  for (let i = 0; i < 18; i += 1) {
    const y = 24 + i * 12.1 + Math.sin(i * 1.73) * 8;
    const x = 24 + fract(Math.sin(i * 33.71) * 9751.31) * 110;
    const length = 18 + fract(Math.sin(i * 71.13) * 5271.93) * 64;
    context.beginPath();
    context.moveTo(x, y);
    context.lineTo(x + length, y + Math.sin(i * 0.91) * 4);
    context.lineWidth = 0.45 + (i % 3) * 0.28;
    context.strokeStyle = `rgba(224, 178, 91, ${0.035 + (i % 4) * 0.012})`;
    context.stroke();
  }

  const vignette = context.createRadialGradient(128, 128, 74, 128, 128, 186);
  vignette.addColorStop(0, 'rgba(0,0,0,0)');
  vignette.addColorStop(1, 'rgba(0,0,0,0.56)');
  context.fillStyle = vignette;
  context.fillRect(0, 0, 256, 256);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  texture.needsUpdate = true;
  return texture;
}

function createNumberTexture(value: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;

  const context = canvas.getContext('2d');
  if (!context) throw new Error('Unable to create 2D canvas context for d20 labels.');

  context.clearRect(0, 0, 256, 256);
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.font = `800 ${value >= 10 ? 86 : 104}px "Cake Mono", "Comic Sans MS", cursive`;

  const text = String(value);
  const textX = 128;
  const textY = 153;

  const gold = context.createLinearGradient(0, 92, 0, 210);
  gold.addColorStop(0, '#fff3bd');
  gold.addColorStop(0.26, '#f0c96b');
  gold.addColorStop(0.62, '#d79a35');
  gold.addColorStop(1, '#b66c20');
  context.fillStyle = gold;
  context.fillText(text, textX, textY);

  context.save();
  context.globalCompositeOperation = 'source-atop';
  context.lineCap = 'round';
  for (let i = 0; i < 24; i += 1) {
    const y = 96 + i * 4.8 + Math.sin((i + value * 2) * 1.41) * 2;
    context.beginPath();
    context.moveTo(72, y);
    context.lineTo(184, y + Math.sin((i + value) * 0.77) * 3.2);
    context.lineWidth = 0.9 + (i % 3) * 0.32;
    context.strokeStyle = `rgba(255, 244, 194, ${0.055 + (i % 4) * 0.014})`;
    context.stroke();
  }
  context.restore();

  // Centered inner shadow: dark only at the inner contour, with no X/Y offset.
  context.save();
  context.globalCompositeOperation = 'source-atop';
  context.filter = 'blur(1.35px)';
  context.lineWidth = 3.5;
  context.lineJoin = 'round';
  context.strokeStyle = 'rgba(5, 3, 2, 0.68)';
  context.strokeText(text, textX, textY);
  context.restore();

  if (value === 6 || value === 9) {
    const markerY = 211;
    const markerGold = context.createLinearGradient(0, markerY - 4, 0, markerY + 4);
    markerGold.addColorStop(0, '#f4d27d');
    markerGold.addColorStop(1, '#bd7624');

    context.beginPath();
    context.moveTo(109, markerY);
    context.lineTo(147, markerY);
    context.lineWidth = 4.5;
    context.lineCap = 'round';
    context.strokeStyle = markerGold;
    context.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  texture.needsUpdate = true;
  return texture;
}

function addOutwardTriangle(
  indices: number[],
  positions: number[],
  a: number,
  b: number,
  c: number,
): void {
  const va = readPosition(positions, a);
  const vb = readPosition(positions, b);
  const vc = readPosition(positions, c);
  const normal = vb.clone().sub(va).cross(vc.clone().sub(va));
  const center = va.clone().add(vb).add(vc).multiplyScalar(1 / 3);

  if (normal.dot(center) >= 0) indices.push(a, b, c);
  else indices.push(a, c, b);
}

function readPosition(positions: number[], index: number): THREE.Vector3 {
  const offset = index * 3;
  return new THREE.Vector3(positions[offset], positions[offset + 1], positions[offset + 2]);
}

function solveGroundHitTime(height: number, verticalVelocity: number, gravity: number): number {
  return (verticalVelocity + Math.sqrt(verticalVelocity * verticalVelocity + 2 * gravity * height)) / gravity;
}

function randomUnitVector(rng: () => number, bias: THREE.Vector3): THREE.Vector3 {
  return bias
    .clone()
    .add(new THREE.Vector3(
      range(rng, -0.28, 0.28),
      range(rng, -0.28, 0.28),
      range(rng, -0.28, 0.28),
    ))
    .normalize();
}

function rangeFromIndex(index: number, min: number, max: number): number {
  const t = fract(Math.sin((index + 1) * 19.193) * 43758.5453);
  return THREE.MathUtils.lerp(min, max, t);
}

function fract(value: number): number {
  return value - Math.floor(value);
}

function hash32(value: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function range(rng: () => number, min: number, max: number): number {
  return min + (max - min) * rng();
}

function deceleratingProgress(t: number, exponent: number): number {
  const clamped = THREE.MathUtils.clamp(t, 0, 1);
  return 1 - (1 - clamped) ** exponent;
}

function easeOutCubic(t: number): number {
  return 1 - (1 - THREE.MathUtils.clamp(t, 0, 1)) ** 3;
}
