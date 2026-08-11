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
const FACE_INSET = 0.875;
const LABEL_INSET = 0.57;
const FINAL_POSITION = new THREE.Vector3(0, 0.03, 0);
const TABLE_REST_SCALE = 0.38;
const WORLD_UP = new THREE.Vector3(0, 1, 0);
const ROTATION_SAMPLE_COUNT = 480;
const TABLE_PLANE_Y = FINAL_POSITION.y - RADIUS * TABLE_REST_SCALE;
const LABEL_COLOR = new THREE.Color(0xf0ede5);
const LABEL_HIGHLIGHT = new THREE.Color(0xffffff);
const TMP_COLOR = new THREE.Color();

interface FaceData {
  value: number;
  normal: THREE.Vector3;
  up: THREE.Vector3;
}

interface EdgeSide {
  faceIndex: number;
  pointByVertex: Map<number, number>;
}

interface EdgeData {
  a: number;
  b: number;
  sides: EdgeSide[];
}

interface RollAnimation {
  startedAt: number;
  durationMs: number;
  result: number;
  startPosition: THREE.Vector3;
  impactPosition: THREE.Vector3;
  rollDirection: THREE.Vector3;
  rollDistance: number;
  settleDistance: number;
  curveOffset: number;
  speedExponent: number;
  wobblePhase: number;
  startScale: number;
  contactScale: number;
  effectiveRollingRadius: number;
  impactAt: number;
  settleAt: number;
  target: THREE.Quaternion;
  orientationSamples: THREE.Quaternion[];
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
  private readonly camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  private readonly die = new THREE.Group();
  private readonly faceMap = new Map<number, FaceData>();
  private readonly labelMaterials = new Map<number, THREE.MeshBasicMaterial>();
  private readonly labelTextures: THREE.CanvasTexture[] = [];
  private readonly revealLight = new THREE.PointLight(0xffffff, 0, 5, 2);
  private readonly onContextLost?: () => void;
  private contactShadow?: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>;
  private contactShadowTexture?: THREE.CanvasTexture;

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
    this.renderer.toneMappingExposure = 1;
    this.renderer.shadowMap.enabled = false;

    this.camera.position.set(0, 0.42, 6.1);
    this.camera.lookAt(0, 0.02, 0);

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
    const side = rng() > 0.5 ? 1 : -1;

    this.cancelAnimation();
    this.resetLabelColors();
    this.revealLight.intensity = 0;

    // One short airborne entry followed by a longer monotonic table roll.
    // The die starts much farther from its final resting point so it visibly
    // crosses the tabletop instead of stopping after a short central drift.
    const startPosition = new THREE.Vector3(
      side * range(rng, 2.45, 2.72),
      range(rng, 0.4, 0.52),
      range(rng, 0.42, 0.68),
    );

    const contactScale = range(rng, 0.372, 0.392);
    const impactPosition = new THREE.Vector3(
      side * range(rng, 1.68, 1.92),
      TABLE_PLANE_Y + RADIUS * contactScale,
      range(rng, 0.1, 0.24),
    );

    const planarToFinal = FINAL_POSITION.clone().sub(impactPosition);
    planarToFinal.y = 0;

    const totalPlanarDistance = Math.max(0.001, planarToFinal.length());
    const rollDirection = planarToFinal.clone().normalize();

    // A small final section continues in the exact same direction. There is
    // never a backwards correction toward FINAL_POSITION.
    const settleDistance = Math.min(
      range(rng, 0.11, 0.17),
      totalPlanarDistance * 0.14,
    );
    const rollDistance = Math.max(0.001, totalPlanarDistance - settleDistance);

    // The curve is still only perpendicular to the main direction, so forward
    // progress remains strictly monotonic.
    const curveOffset = range(rng, 0.08, 0.17) * (rng() > 0.5 ? 1 : -1);

    // Strictly decreasing speed.
    const speedExponent = range(rng, 1.9, 2.25);

    const effectiveRollingRadius =
      RADIUS * TABLE_REST_SCALE * range(rng, 0.72, 0.82);

    const flightMs = range(rng, 260, 330);
    const rollMs = range(rng, 1480, 1720);
    const settleMs = range(rng, 220, 280);
    const durationMs = flightMs + rollMs + settleMs;
    const impactAt = flightMs / durationMs;
    const settleAt = (flightMs + rollMs) / durationMs;

    const animation: RollAnimation = {
      startedAt: performance.now(),
      durationMs,
      result,
      startPosition,
      impactPosition,
      rollDirection,
      rollDistance,
      settleDistance,
      curveOffset,
      speedExponent,
      wobblePhase: rng() * TAU,
      startScale: range(rng, 0.42, 0.452),
      contactScale,
      effectiveRollingRadius,
      impactAt,
      settleAt,
      target,
      orientationSamples: [],
    };

    // Build ABSOLUTE orientation samples anchored on the final target.
    //
    // The last sample is literally `target`. Every previous sample is solved
    // backwards while preserving the exact same incremental rolling delta
    // between adjacent samples. There is therefore no final correction phase.
    animation.orientationSamples = this.buildOrientationSamples(animation);

    this.die.position.copy(startPosition);
    this.die.quaternion.copy(animation.orientationSamples[0]);
    this.die.scale.setScalar(animation.startScale);
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

    this.labelTextures.forEach((texture) => texture.dispose());
    this.contactShadowTexture?.dispose();
    this.renderer.dispose();
  }

  private readonly tick = (now: number): void => {
    const animation = this.animation;
    if (!animation || this.disposed) return;

    const p = THREE.MathUtils.clamp((now - animation.startedAt) / animation.durationMs, 0, 1);
    this.updatePosition(animation, p);
    this.updateRotation(animation, p);
    this.updateReveal(animation, p);
    this.render();

    if (p >= 1) {
      this.die.position.copy(FINAL_POSITION);
      // Do NOT overwrite quaternion here. updateRotation(p=1) has already
      // selected orientationSamples[last], which is exactly the target.
      // Keeping this untouched makes a corrective final snap impossible.
      this.die.scale.setScalar(TABLE_REST_SCALE);
      this.highlightResult(animation.result, 1);
      this.revealLight.intensity = 2.4;
      this.animation = undefined;
      this.rafId = 0;
      this.render();
      this.onComplete?.();
      return;
    }

    this.rafId = requestAnimationFrame(this.tick);
  };

  private updatePosition(animation: RollAnimation, p: number): void {
    const {
      impactAt,
      settleAt,
      impactPosition,
      startScale,
      contactScale,
    } = animation;

    if (p < impactAt) {
      const u = THREE.MathUtils.clamp(p / impactAt, 0, 1);
      const travel = easeInOutQuad(u);
      const scale = THREE.MathUtils.lerp(
        startScale,
        contactScale,
        smootherstep(u),
      );

      const contactY = TABLE_PLANE_Y + RADIUS * scale;
      const arc = Math.sin(u * Math.PI) * 0.065;

      this.die.position.set(
        THREE.MathUtils.lerp(animation.startPosition.x, impactPosition.x, travel),
        THREE.MathUtils.lerp(animation.startPosition.y, contactY, u) + arc,
        THREE.MathUtils.lerp(animation.startPosition.z, impactPosition.z, travel),
      );
      this.die.scale.setScalar(scale);
      return;
    }

    if (p < settleAt) {
      const u = THREE.MathUtils.clamp(
        (p - impactAt) / (settleAt - impactAt),
        0,
        1,
      );

      const progress = this.getRollProgress(animation, u);
      const planar = this.getRollingPlanarPosition(animation, progress);

      // Edge chatter is tied to the remaining speed and angular travel, so it
      // naturally vanishes as the die slows. It never creates a visible bounce.
      const speedRatio = this.getRollSpeedRatio(animation, u);
      const travelled =
        animation.rollDistance * progress;
      const chatterPhase =
        (travelled / animation.effectiveRollingRadius) * 2.15 +
        animation.wobblePhase;
      const chatter =
        Math.abs(Math.sin(chatterPhase)) * 0.0045 * speedRatio;

      const scale = THREE.MathUtils.lerp(
        contactScale,
        TABLE_REST_SCALE,
        progress,
      );
      const contactY = TABLE_PLANE_Y + RADIUS * scale;

      this.die.position.set(planar.x, contactY + chatter, planar.z);
      this.die.scale.setScalar(scale);
      return;
    }

    const u = THREE.MathUtils.clamp((p - settleAt) / (1 - settleAt), 0, 1);
    const settleProgress = deceleratingProgress(u, 2.65);
    const rollEnd = animation.impactPosition
      .clone()
      .addScaledVector(animation.rollDirection, animation.rollDistance);

    this.die.position.copy(
      rollEnd.addScaledVector(
        animation.rollDirection,
        animation.settleDistance * settleProgress,
      ),
    );
    this.die.position.y = TABLE_PLANE_Y + RADIUS * TABLE_REST_SCALE;
    this.die.scale.setScalar(TABLE_REST_SCALE);
  }

  private getRollProgress(animation: RollAnimation, u: number): number {
    return deceleratingProgress(u, animation.speedExponent);
  }

  private getRollSpeedRatio(animation: RollAnimation, u: number): number {
    const clamped = THREE.MathUtils.clamp(u, 0, 1);
    // Normalized derivative of 1-(1-u)^n.
    return (1 - clamped) ** (animation.speedExponent - 1);
  }

  private getRollingPlanarPosition(
    animation: RollAnimation,
    progress: number,
  ): THREE.Vector3 {
    const clamped = THREE.MathUtils.clamp(progress, 0, 1);
    const forward = animation.rollDirection;
    const perpendicular = new THREE.Vector3(-forward.z, 0, forward.x);

    const forwardDistance = animation.rollDistance * clamped;

    // A single smooth bow: zero at both endpoints. Its derivative can steer
    // sideways, but projection onto `forward` is always +forwardDistance, so
    // the die can never travel backward along its launch direction.
    const sideOffset =
      Math.sin(clamped * Math.PI) *
      animation.curveOffset *
      (1 - clamped * 0.18);

    return animation.impactPosition
      .clone()
      .addScaledVector(forward, forwardDistance)
      .addScaledVector(perpendicular, sideOffset);
  }


  private getCurrentSpeedRatio(animation: RollAnimation, p: number): number {
    if (p < animation.impactAt) return 1;

    if (p < animation.settleAt) {
      const u = THREE.MathUtils.clamp(
        (p - animation.impactAt) /
          (animation.settleAt - animation.impactAt),
        0,
        1,
      );
      return this.getRollSpeedRatio(animation, u);
    }

    const u = THREE.MathUtils.clamp(
      (p - animation.settleAt) / (1 - animation.settleAt),
      0,
      1,
    );
    return (1 - u) ** 1.65;
  }

  private updateRotation(animation: RollAnimation, p: number): void {
    const samplePosition =
      THREE.MathUtils.clamp(p, 0, 1) * ROTATION_SAMPLE_COUNT;
    const sampleIndex = Math.min(
      ROTATION_SAMPLE_COUNT - 1,
      Math.floor(samplePosition),
    );
    const local = samplePosition - sampleIndex;

    const from =
      animation.orientationSamples[sampleIndex];
    const to =
      animation.orientationSamples[
        Math.min(sampleIndex + 1, ROTATION_SAMPLE_COUNT)
      ];

    // Adjacent samples differ only by the small physical rolling increment.
    // With 480 samples this interpolation stays well below the quaternion
    // shortest-path ambiguity threshold and preserves the intended roll sense.
    this.die.quaternion
      .copy(from)
      .slerp(to, local)
      .normalize();
  }

  private buildOrientationSamples(
    animation: RollAnimation,
  ): THREE.Quaternion[] {
    // First build the incremental world-space rolling delta for every sample.
    const stepDeltas: THREE.Quaternion[] = [
      new THREE.Quaternion(),
    ];

    let previous = this.getPlanarPositionAt(animation, 0);

    for (let i = 1; i <= ROTATION_SAMPLE_COUNT; i += 1) {
      const p = i / ROTATION_SAMPLE_COUNT;
      const current = this.getPlanarPositionAt(animation, p);
      const delta = current.clone().sub(previous);
      delta.y = 0;

      const travelled = delta.length();
      const step = new THREE.Quaternion();

      if (travelled > 1e-8) {
        const forward = delta.multiplyScalar(1 / travelled);

        // Sole rolling axis:
        // current horizontal forward × world-up.
        //
        // This axis is always horizontal, perpendicular to current movement,
        // and follows any gentle curvature of the trajectory.
        const rollAxis = forward
          .clone()
          .cross(WORLD_UP)
          .normalize();

        const speedRatio = this.getCurrentSpeedRatio(animation, p);
        const initialSpinBoost =
          1.08 + 1.85 * Math.pow(speedRatio, 1.15);

        const angle =
          -(
            (travelled / animation.effectiveRollingRadius) *
            initialSpinBoost
          );

        step.setFromAxisAngle(rollAxis, angle).normalize();
      }

      stepDeltas.push(step);
      previous = current;
    }

    // Solve ABSOLUTE orientations backwards from the exact final target.
    //
    // Forward rolling relation:
    //   Q[i] = step[i] * Q[i - 1]
    //
    // Therefore backwards:
    //   Q[i - 1] = inverse(step[i]) * Q[i]
    //
    // This preserves every rolling increment exactly while guaranteeing:
    //   Q[last] === target
    const orientations: THREE.Quaternion[] =
      new Array(ROTATION_SAMPLE_COUNT + 1);

    orientations[ROTATION_SAMPLE_COUNT] =
      animation.target.clone().normalize();

    for (let i = ROTATION_SAMPLE_COUNT; i >= 1; i -= 1) {
      orientations[i - 1] = stepDeltas[i]
        .clone()
        .invert()
        .multiply(orientations[i])
        .normalize();
    }

    return orientations;
  }

  private getPlanarPositionAt(
    animation: RollAnimation,
    p: number,
  ): THREE.Vector3 {
    const clamped = THREE.MathUtils.clamp(p, 0, 1);

    if (clamped < animation.impactAt) {
      const u = THREE.MathUtils.clamp(
        clamped / animation.impactAt,
        0,
        1,
      );
      const travel = easeInOutQuad(u);

      return new THREE.Vector3(
        THREE.MathUtils.lerp(
          animation.startPosition.x,
          animation.impactPosition.x,
          travel,
        ),
        0,
        THREE.MathUtils.lerp(
          animation.startPosition.z,
          animation.impactPosition.z,
          travel,
        ),
      );
    }

    if (clamped < animation.settleAt) {
      const u = THREE.MathUtils.clamp(
        (clamped - animation.impactAt) /
          (animation.settleAt - animation.impactAt),
        0,
        1,
      );
      const progress = this.getRollProgress(animation, u);
      const planar = this.getRollingPlanarPosition(animation, progress);
      planar.y = 0;
      return planar;
    }

    const u = THREE.MathUtils.clamp(
      (clamped - animation.settleAt) /
        (1 - animation.settleAt),
      0,
      1,
    );
    const settleProgress = deceleratingProgress(u, 2.65);
    const rollEnd = animation.impactPosition
      .clone()
      .addScaledVector(
        animation.rollDirection,
        animation.rollDistance,
      );

    return rollEnd
      .addScaledVector(
        animation.rollDirection,
        animation.settleDistance * settleProgress,
      )
      .setY(0);
  }

  private updateReveal(animation: RollAnimation, p: number): void {
    if (p < 0.9) return;
    const u = easeOutCubic((p - 0.9) / 0.1);
    this.highlightResult(animation.result, u);
    this.revealLight.intensity = THREE.MathUtils.lerp(0, 2.4, u);
  }

  private highlightResult(result: number, amount: number): void {
    const material = this.labelMaterials.get(result);
    if (!material) return;
    material.color.copy(TMP_COLOR.copy(LABEL_COLOR).lerp(LABEL_HIGHLIGHT, amount));
    material.opacity = THREE.MathUtils.lerp(0.9, 1, amount);
  }

  private resetLabelColors(): void {
    this.labelMaterials.forEach((material) => {
      material.color.copy(LABEL_COLOR);
      material.opacity = 0.9;
    });
  }

  private getTargetQuaternion(result: number): THREE.Quaternion {
    const face = this.faceMap.get(result);
    if (!face) throw new Error(`No face mapped for d20 result ${result}.`);

    const localZ = face.normal.clone().normalize();
    const localY = face.up.clone().projectOnPlane(localZ).normalize();
    const localX = localY.clone().cross(localZ).normalize();
    localY.copy(localZ).cross(localX).normalize();

    const targetZ = this.camera.position.clone().sub(FINAL_POSITION).normalize();
    const targetY = this.camera.up.clone().projectOnPlane(targetZ).normalize();
    const targetX = targetY.clone().cross(targetZ).normalize();
    targetY.copy(targetZ).cross(targetX).normalize();

    const localBasis = new THREE.Matrix4().makeBasis(localX, localY, localZ);
    const targetBasis = new THREE.Matrix4().makeBasis(targetX, targetY, targetZ);
    const localRotation = new THREE.Quaternion().setFromRotationMatrix(localBasis);
    const targetRotation = new THREE.Quaternion().setFromRotationMatrix(targetBasis);

    return targetRotation.multiply(localRotation.invert()).normalize();
  }

  private buildScene(): void {
    this.die.position.copy(FINAL_POSITION);
    this.die.scale.setScalar(TABLE_REST_SCALE);
    this.scene.add(this.die);

    const vertices = BASE_VERTICES.map(([x, y, z]) => new THREE.Vector3(x, y, z).normalize().multiplyScalar(RADIUS));
    this.buildBody(vertices);
    this.buildLabels(vertices);
    this.buildLighting();
    this.buildContactShadow();

    this.revealLight.position.set(0, 0.5, 2.35);
    this.scene.add(this.revealLight);
  }

  private buildBody(vertices: THREE.Vector3[]): void {
    const facePositions: number[] = [];
    const bevelPositions: number[] = [];
    const bevelIndices: number[] = [];
    const facePointIds: number[][] = [];
    const edgeMap = new Map<string, EdgeData>();

    FACE_INDICES.forEach((face, faceIndex) => {
      const center = face
        .map(index => vertices[index])
        .reduce((sum, vertex) => sum.add(vertex), new THREE.Vector3())
        .multiplyScalar(1 / 3);

      const pointIds: number[] = [];

      face.forEach((vertexIndex) => {
        const point = center.clone().lerp(vertices[vertexIndex], FACE_INSET);
        facePositions.push(point.x, point.y, point.z);

        const id = bevelPositions.length / 3;
        bevelPositions.push(point.x, point.y, point.z);
        pointIds.push(id);
      });

      facePointIds.push(pointIds);

      for (let i = 0; i < 3; i += 1) {
        const originalA = face[i];
        const originalB = face[(i + 1) % 3];
        const a = Math.min(originalA, originalB);
        const b = Math.max(originalA, originalB);
        const key = `${a}:${b}`;
        const edge = edgeMap.get(key) ?? { a, b, sides: [] };
        const pointByVertex = new Map<number, number>([
          [originalA, pointIds[i]],
          [originalB, pointIds[(i + 1) % 3]],
        ]);

        edge.sides.push({ faceIndex, pointByVertex });
        edgeMap.set(key, edge);
      }
    });

    const capIds = vertices.map((vertex) => {
      const cap = vertex.clone().normalize().multiplyScalar(RADIUS * 0.968);
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

      // Small rounded corner fans close the five edge bevels around every vertex.
      addOutwardTriangle(bevelIndices, bevelPositions, leftA, rightA, capIds[edge.a]);
      addOutwardTriangle(bevelIndices, bevelPositions, leftB, capIds[edge.b], rightB);
    });

    const faceGeometry = new THREE.BufferGeometry();
    faceGeometry.setAttribute('position', new THREE.Float32BufferAttribute(facePositions, 3));
    faceGeometry.computeVertexNormals();

    const faceMaterial = new THREE.MeshStandardMaterial({
      color: 0x22262c,
      roughness: 0.58,
      metalness: 0,
      flatShading: true,
    });

    const faceMesh = new THREE.Mesh(faceGeometry, faceMaterial);
    this.die.add(faceMesh);

    const bevelGeometry = new THREE.BufferGeometry();
    bevelGeometry.setAttribute('position', new THREE.Float32BufferAttribute(bevelPositions, 3));
    bevelGeometry.setIndex(bevelIndices);
    bevelGeometry.computeVertexNormals();

    const bevelMaterial = new THREE.MeshStandardMaterial({
      color: 0x343941,
      roughness: 0.5,
      metalness: 0,
      side: THREE.DoubleSide,
    });

    const bevelMesh = new THREE.Mesh(bevelGeometry, bevelMaterial);
    this.die.add(bevelMesh);
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

      const offset = normal.clone().multiplyScalar(0.016);
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
      this.labelTextures.push(texture);

      const material = new THREE.MeshBasicMaterial({
        map: texture,
        color: LABEL_COLOR,
        transparent: true,
        opacity: 0.9,
        depthWrite: false,
        polygonOffset: true,
        polygonOffsetFactor: -2,
        polygonOffsetUnits: -2,
        side: THREE.FrontSide,
      });

      this.labelMaterials.set(value, material);
      this.die.add(new THREE.Mesh(geometry, material));
    });
  }

  private buildLighting(): void {
    this.scene.add(new THREE.HemisphereLight(0xffffff, 0x20242a, 1.25));

    const key = new THREE.SpotLight(0xffffff, 34, 12, Math.PI / 4.8, 0.72, 1.3);
    key.position.set(-3.2, 4.4, 4.8);
    key.target.position.set(0, 0, 0);
    this.scene.add(key, key.target);

    const fill = new THREE.DirectionalLight(0xffffff, 1.65);
    fill.position.set(3.2, 1.4, 2.2);
    this.scene.add(fill);

    const rim = new THREE.PointLight(0xffffff, 4.2, 10, 2);
    rim.position.set(3.4, 2.1, -3.2);
    this.scene.add(rim);
  }

  private buildContactShadow(): void {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 128;

    const context = canvas.getContext('2d');
    if (!context) return;

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.save();
    context.translate(canvas.width / 2, canvas.height / 2);
    context.scale(1, 0.48);

    const gradient = context.createRadialGradient(0, 0, 0, 0, 0, 82);
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0.72)');
    gradient.addColorStop(0.36, 'rgba(0, 0, 0, 0.42)');
    gradient.addColorStop(0.72, 'rgba(0, 0, 0, 0.14)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

    context.fillStyle = gradient;
    context.fillRect(-128, -128, 256, 256);
    context.restore();

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;
    this.contactShadowTexture = texture;

    const material = new THREE.MeshBasicMaterial({
      map: texture,
      color: 0x000000,
      transparent: true,
      opacity: 0.28,
      depthWrite: false,
      depthTest: false,
      side: THREE.DoubleSide,
    });

    const shadow = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), material);
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.set(FINAL_POSITION.x, TABLE_PLANE_Y + 0.004, FINAL_POSITION.z);
    shadow.renderOrder = -10;
    this.contactShadow = shadow;
    this.scene.add(shadow);
  }

  private updateContactShadow(): void {
    const shadow = this.contactShadow;
    if (!shadow) return;

    const scale = Math.max(0.001, (this.die.scale.x + this.die.scale.z) * 0.5);
    const contactCenterY = TABLE_PLANE_Y + RADIUS * scale;
    const airHeight = Math.max(0, this.die.position.y - contactCenterY);
    const lift = THREE.MathUtils.clamp(airHeight / 0.55, 0, 1);

    shadow.position.x = this.die.position.x;
    shadow.position.y = TABLE_PLANE_Y + 0.004;
    shadow.position.z = this.die.position.z;

    // At contact the shadow is compact/dark. While airborne it softens and
    // broadens slightly, but always remains directly underneath the die.
    const width = 2.65 * scale * THREE.MathUtils.lerp(1, 1.28, lift);
    const depth = 1.55 * scale * THREE.MathUtils.lerp(1, 1.18, lift);
    shadow.scale.set(width, depth, 1);
    shadow.material.opacity = THREE.MathUtils.lerp(0.3, 0.075, lift);
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

function createNumberTexture(value: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;

  const context = canvas.getContext('2d');
  if (!context) throw new Error('Unable to create 2D canvas context for d20 labels.');

  context.clearRect(0, 0, 256, 256);
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.font = `700 ${value >= 10 ? 78 : 90}px "Cinzel", Georgia, serif`;

  const text = String(value);
  const textX = 128;
  const textY = 148;

  // Warm gold base with a small vertical value shift.
  const gold = context.createLinearGradient(0, 92, 0, 202);
  gold.addColorStop(0, '#f7dc82');
  gold.addColorStop(0.42, '#d8a43f');
  gold.addColorStop(1, '#9d6720');
  context.fillStyle = gold;
  context.fillText(text, textX, textY);

  // Subtle deterministic brushed texture, clipped inside the glyph.
  // This keeps the gold from reading as a flat UI color without introducing
  // any non-deterministic randomness.
  context.save();
  context.globalCompositeOperation = 'source-atop';
  context.lineCap = 'round';
  for (let i = 0; i < 22; i++) {
    const y = 98 + i * 5.2 + Math.sin((i + value * 3) * 1.73) * 2.2;
    const alpha = 0.035 + ((i + value) % 4) * 0.012;
    context.beginPath();
    context.moveTo(72, y);
    context.lineTo(184, y + Math.sin((i + value) * 0.91) * 3);
    context.lineWidth = 1.1 + (i % 3) * 0.35;
    context.strokeStyle = `rgba(255, 239, 174, ${alpha})`;
    context.stroke();
  }
  context.restore();

  // Darker radial inset shadow: centered, blurred and clipped to the glyph,
  // so only the inner contour is darkened while the gold center stays clear.
  context.save();
  context.globalCompositeOperation = 'source-atop';
  context.filter = 'blur(1.9px)';
  context.lineWidth = 4.5;
  context.lineJoin = 'round';
  context.strokeStyle = 'rgba(9, 8, 7, 0.68)';
  context.strokeText(text, textX, textY);
  context.restore();

  if (value === 6 || value === 9) {
    const markerY = 200;

    context.beginPath();
    context.moveTo(111, markerY);
    context.lineTo(145, markerY);
    context.lineWidth = 5;
    context.lineCap = 'round';
    context.strokeStyle = '#c89032';
    context.stroke();

    // Same gold/inset treatment for the 6/9 orientation marker.
    context.save();
    context.globalCompositeOperation = 'source-atop';
    context.filter = 'blur(1.3px)';
    context.beginPath();
    context.moveTo(111, markerY);
    context.lineTo(145, markerY);
    context.lineWidth = 2.7;
    context.lineCap = 'round';
    context.strokeStyle = 'rgba(9, 8, 7, 0.64)';
    context.stroke();
    context.restore();
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

function easeOutQuad(t: number): number {
  return 1 - (1 - t) * (1 - t);
}

function deceleratingProgress(t: number, exponent: number): number {
  const clamped = THREE.MathUtils.clamp(t, 0, 1);
  return 1 - (1 - clamped) ** exponent;
}

function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3;
}

function easeInOutQuad(t: number): number {
  const clamped = THREE.MathUtils.clamp(t, 0, 1);
  return clamped < 0.5
    ? 2 * clamped * clamped
    : 1 - ((-2 * clamped + 2) ** 2) / 2;
}

function smootherstep(value: number): number {
  const x = THREE.MathUtils.clamp(value, 0, 1);
  return x * x * x * (x * (x * 6 - 15) + 10);
}

function smoothstep(min: number, max: number, value: number): number {
  const t = THREE.MathUtils.clamp((value - min) / (max - min), 0, 1);
  return t * t * (3 - 2 * t);
}
