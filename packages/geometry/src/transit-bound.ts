import type { Box, Point } from './index';

interface Plane { readonly at: Point; readonly x: number; readonly y: number }
interface Region { readonly box: Box; readonly planes: readonly Plane[] }
interface Feature extends Box {
  readonly rectangle: number;
  readonly side: number;
  readonly includesCorner: boolean;
}

type MinQueue = {
  push(id: number, value: number): void;
  pop(): { id: number; value: number } | undefined;
};

const MARGIN = 1e-6;
export const FACE_INTERVALS = 16;
const REFINEMENT_ROUNDS = 16;

function region(points: readonly Point[]): Region {
  return {
    box: {
      minX: Math.min(...points.map(p => p.x)), maxX: Math.max(...points.map(p => p.x)),
      minY: Math.min(...points.map(p => p.y)), maxY: Math.max(...points.map(p => p.y)),
    },
    planes: points.map((at, i) => {
      const end = points[(i + 1) % points.length]!;
      const dx = end.x - at.x;
      const dy = end.y - at.y;
      const length = Math.hypot(dx, dy);
      return { at, x: -dy / length, y: dx / length };
    }),
  };
}

function pointFeature(point: Point, rectangle = -1): Feature {
  return {
    minX: point.x, maxX: point.x, minY: point.y, maxY: point.y,
    rectangle, side: -1, includesCorner: false,
  };
}

function separation(a: Box, b: Box): number {
  return Math.hypot(
    Math.max(0, a.minX - b.maxX, b.minX - a.maxX),
    Math.max(0, a.minY - b.maxY, b.minY - a.maxY),
  );
}

/** A positive result means all chords enter the polygon at a shared parameter. */
function mustEnter(a: Box, b: Box, { box, planes }: Region): boolean {
  if (Math.max(a.maxX, b.maxX) <= box.minX || Math.min(a.minX, b.minX) >= box.maxX ||
      Math.max(a.maxY, b.maxY) <= box.minY || Math.min(a.minY, b.minY) >= box.maxY) return false;
  let low = 0;
  let high = 1;
  for (const { at, x, y } of planes) {
    const from = ((x >= 0 ? a.minX : a.maxX) - at.x) * x + ((y >= 0 ? a.minY : a.maxY) - at.y) * y - 2 * MARGIN;
    const to = ((x >= 0 ? b.minX : b.maxX) - at.x) * x + ((y >= 0 ? b.minY : b.maxY) - at.y) * y - 2 * MARGIN;
    if (from <= 0 && to <= 0) return false;
    if (from <= 0) low = Math.max(low, from / (from - to));
    if (to <= 0) high = Math.min(high, from / (from - to));
    if (low >= high) return false;
  }
  return high - low > 1e-12;
}

function exterior(a: Feature, b: Feature): boolean {
  if (a.side < 0 || a.includesCorner) return true;
  switch (a.side) {
    case 0: return b.minY <= a.minY + MARGIN;
    case 1: return b.maxX >= a.maxX - MARGIN;
    case 2: return b.maxY >= a.maxY - MARGIN;
    default: return b.minX <= a.minX + MARGIN;
  }
}

/** Relaxed visibility over fixed vertices and isolated double-cost crossings.
 * Each interior run between adjacent sides can be replaced by perimeter
 * travel costing at most sqrt(2) times its length. The ordinary graph
 * therefore needs only fixed visibility vertices and contacts that lead to
 * or from a paid opposite-side crossing. A query inside a rectangle also
 * has direct transitions to or from every side of that rectangle.
 */
export class TransitBound {
  private readonly features: readonly Feature[];
  private readonly ordinary: readonly Float32Array[];
  private readonly blocked: readonly Region[];
  private readonly faces: readonly number[][][];

  constructor(
    vertices: readonly Point[],
    private readonly rectangles: readonly Box[],
    obstacles: readonly Point[][],
    private readonly Queue: new () => MinQueue,
  ) {
    const features = vertices.map(point => pointFeature(point));
    this.blocked = [...obstacles.map(region), ...rectangles.map(box => region([
      { x: box.minX, y: box.minY }, { x: box.maxX, y: box.minY },
      { x: box.maxX, y: box.maxY }, { x: box.minX, y: box.maxY },
    ]))];
    this.faces = rectangles.map((box, rectangle) => Array.from({ length: 4 }, (_, side) => {
      const vertical = side % 2 === 1;
      const min = vertical ? box.minY : box.minX;
      const max = vertical ? box.maxY : box.maxX;
      const constant = side === 0 ? box.minY : side === 1 ? box.maxX : side === 2 ? box.maxY : box.minX;
      const divisions = FACE_INTERVALS;
      return Array.from({ length: divisions }, (_, i) => {
        const lo = min + (max - min) * i / divisions;
        const hi = i === divisions - 1 ? max : min + (max - min) * (i + 1) / divisions;
        const bounds = vertical
          ? { minX: constant, maxX: constant, minY: lo, maxY: hi }
          : { minX: lo, maxX: hi, minY: constant, maxY: constant };
        const id = features.length;
        features.push({ ...bounds, rectangle, side, includesCorner: i === 0 || i === divisions - 1 });
        return id;
      });
    }));
    this.features = features;
    const ordinary = features.map(() => new Float32Array(features.length).fill(-1));
    for (let i = 0; i < features.length; i++) {
      for (let j = 0; j < i; j++) {
        const length = this.ordinaryLength(features[i]!, features[j]!);
        ordinary[i]![j] = length;
        ordinary[j]![i] = length;
      }
    }
    this.ordinary = ordinary;
  }

  private ordinaryLength(a: Feature, b: Feature): number {
    if (!exterior(a, b) || !exterior(b, a)) return -1;
    if (this.blocked.some(region => mustEnter(a, b, region))) return -1;
    return separation(a, b) * (1 - 1e-7);
  }

  lowerBound(
    start: Point, end: Point, upper: number, measure: (points: readonly Point[]) => number,
  ): { bound: number; candidate?: Point[] } {
    const containing = (p: Point) => this.rectangles.findIndex(box =>
      p.x > box.minX && p.x < box.maxX && p.y > box.minY && p.y < box.maxY);
    const from = pointFeature(start, containing(start));
    const to = pointFeature(end, containing(end));
    const first = this.features.length;
    const last = first + 1;
    const features = [...this.features, from, to];
    const active = new Set<number>();
    const startEdges: number[] = [];
    const endEdges: number[] = [];
    const extraRows: number[][] = [];
    const faces = this.faces.map(sides => sides.map(side => [...side]));
    const heuristic = features.map((point, i) => {
      const finish = separation(point, to);
      if (i < first && separation(from, point) + finish <= upper + MARGIN) active.add(i);
      return finish;
    });
    const addEndpoints = (id: number) => {
      const point = features[id]!;
      if (from.rectangle < 0) startEdges[id] = this.ordinaryLength(from, point);
      if (to.rectangle < 0) endEdges[id] = this.ordinaryLength(point, to);
    };
    for (const i of active) {
      addEndpoints(i);
    }
    const ordinaryAt = (a: number, b: number) => {
      const high = Math.max(a, b);
      const low = Math.min(a, b);
      return high < first ? this.ordinary[high]![low]! : extraRows[high - last - 1]![low] ?? -1;
    };
    const split = (id: number) => {
      const a = features[id]!;
      const x = (a.minX + a.maxX) / 2;
      const y = (a.minY + a.maxY) / 2;
      const limits = this.rectangles[a.rectangle]!;
      const vertical = a.side % 2 === 1;
      active.delete(id);
      const firstChild = features.length;
      for (const half of [{ ...a, maxX: x, maxY: y }, { ...a, minX: x, minY: y }]) {
        const includesCorner = vertical
          ? half.minY === limits.minY || half.maxY === limits.maxY
          : half.minX === limits.minX || half.maxX === limits.maxX;
        const child = { ...half, includesCorner };
        const next = features.length;
        features.push(child);
        heuristic.push(separation(child, to));
        const row: number[] = [];
        extraRows.push(row);
        for (const other of active) {
          const point = features[other]!;
          if ((other >= firstChild || ordinaryAt(id, other) >= 0) &&
              exterior(child, point) && exterior(point, child)) {
            row[other] = separation(child, point);
          }
        }
        addEndpoints(next);
        active.add(next);
        faces[a.rectangle]![a.side]!.push(next);
      }
    };
    let candidate: Point[] | undefined;
    let bound = 0;
    for (let round = 0; round <= REFINEMENT_ROUNDS; round++) {
      const result = this.search(
        features, faces, [...active], active, startEdges, endEdges, extraRows, heuristic, first, last, upper,
      );
      if (!result) break;
      bound = Math.max(bound, result.bound);
      if (result.states) {
        const points = realize(features, result.states);
        const cost = measure(points);
        if (cost < upper) {
          upper = cost;
          candidate = points;
        }
      }
      if (upper - bound <= Math.max(0.1, 0.005 * bound) || round === REFINEMENT_ROUNDS || !result.states) break;
      // A child inherits possible visibility from its parent. Test only the
      // inherited edges that actually appear in an optimistic route.
      let invalid = false;
      for (let i = 1; i < result.states.length; i++) {
        const state = result.states[i - 1]!;
        const a = state >> 1;
        const b = result.states[i]! >> 1;
        if (a === first || b === last) continue;
        if (features[a]!.side >= 0 && !(state & 1)) continue;
        const high = Math.max(a, b);
        if (high <= last || this.ordinaryLength(features[a]!, features[b]!) >= 0) continue;
        extraRows[high - last - 1]![Math.min(a, b)] = -1;
        invalid = true;
      }
      if (invalid) continue;
      const intervals = [...new Set(result.states.map(state => state >> 1))]
        .filter(id => features[id]!.side >= 0);
      if (!intervals.length) break;
      for (const id of intervals) split(id);
    }
    return candidate ? { bound: Math.min(upper, bound), candidate } : { bound };
  }

  private search(
    features: readonly Feature[], faces: readonly number[][][], active: readonly number[],
    allowed: ReadonlySet<number>, startEdges: readonly number[], endEdges: readonly number[],
    extraRows: readonly number[][], heuristic: readonly number[],
    first: number, last: number, upper: number,
  ): { bound: number; states?: number[] } | undefined {
    const from = features[first]!;
    const to = features[last]!;
    const best = new Float64Array(features.length * 2).fill(Infinity);
    const previous = new Int32Array(best.length).fill(-1);
    const queue = new this.Queue();
    const target = Math.min(upper - 0.1, upper / 1.005) + 2 * MARGIN;
    best[first * 2] = 0;
    queue.push(first * 2, heuristic[first]!);
    // The heuristic bounds the remaining continuous suffix from every point
    // in the interval. For any competitive route, the first open state of
    // its representation has g + h no greater than that route's actual cost,
    // even when independently minimized graph edges disagree on a contact.
    for (let item = queue.pop(); item; item = queue.pop()) {
      const id = item.id >> 1;
      const cost = best[item.id]!;
      if (item.value !== cost + heuristic[id]!) continue;
      if (id === last) {
        const states: number[] = [];
        for (let state = item.id; state >= 0; state = previous[state]!) states.push(state);
        return { bound: Math.min(upper, item.value) - MARGIN, states: states.reverse() };
      }
      if (item.value >= target) return { bound: Math.min(upper, item.value) - MARGIN };
      const a = features[id]!;
      const push = (next: number, exit: boolean, length: number) => {
        if (!(length >= 0)) return;
        const state = next * 2 + Number(exit);
        const value = cost + length;
        if (value >= best[state]!) return;
        best[state] = value;
        previous[state] = item.id;
        queue.push(state, value + heuristic[next]!);
      };
      if (id === first && a.rectangle >= 0) {
        for (const side of faces[a.rectangle]!) {
          for (const next of side) {
            if (allowed.has(next)) push(next, true, 2 * separation(a, features[next]!));
          }
        }
        if (a.rectangle === to.rectangle) push(last, false, 2 * heuristic[id]!);
      } else if (a.side >= 0 && !(item.id & 1)) {
        for (const next of faces[a.rectangle]![(a.side + 2) % 4]!) {
          if (allowed.has(next)) push(next, true, 2 * separation(a, features[next]!));
        }
        if (a.rectangle === to.rectangle) push(last, false, 2 * heuristic[id]!);
      } else {
        const row = id === first ? startEdges : id < first ? this.ordinary[id]! : extraRows[id - last - 1]!;
        for (const next of active) {
          const length = id === first || next < first || next < id ? row[next]! : extraRows[next - last - 1]![id]!;
          push(next, false, length);
        }
        if (to.rectangle < 0) {
          push(last, false, id === first ? this.ordinaryLength(from, to) : endEdges[id]!);
        }
      }
    }
    // With no represented path, use the other bounds. This also covers
    // floating-point degeneracies at arrangement vertices.
    return undefined;
  }
}

/** Minimize the fixed crossing sequence over the current contact intervals.
 * The caller checks clearance and measures the actual continuous terrain cost.
 */
function realize(features: readonly Feature[], states: readonly number[]): Point[] {
  const contacts = states.map(state => features[state >> 1]!);
  const weights = contacts.slice(1).map((point, i) => {
    const before = contacts[i]!;
    return before.rectangle >= 0 && before.rectangle === point.rectangle &&
      !(states[i]! & 1) && (point.side < 0 || (states[i + 1]! & 1)) ? 2 : 1;
  });
  const points = contacts.map(a => ({ x: (a.minX + a.maxX) / 2, y: (a.minY + a.maxY) / 2 }));
  for (let pass = 0; pass < 8; pass++) {
    for (let i = 1; i + 1 < contacts.length; i++) {
      const a = contacts[i]!;
      if (a.side < 0) continue;
      const vertical = a.side % 2 === 1;
      const axis = vertical ? 'y' : 'x';
      const perpendicular = vertical ? 'x' : 'y';
      const p = points[i]!;
      const before = points[i - 1]!;
      const after = points[i + 1]!;
      const left = p[perpendicular] - before[perpendicular];
      const right = p[perpendicular] - after[perpendicular];
      let lo = vertical ? a.minY : a.minX;
      let hi = vertical ? a.maxY : a.maxX;
      for (let step = 0; step < 20; step++) {
        const mid = (lo + hi) / 2;
        const dl = mid - before[axis];
        const dr = mid - after[axis];
        const derivative = weights[i - 1]! * (dl === 0 ? 0 : dl / Math.hypot(dl, left)) +
          weights[i]! * (dr === 0 ? 0 : dr / Math.hypot(dr, right));
        if (derivative < 0) lo = mid;
        else hi = mid;
      }
      p[axis] = (lo + hi) / 2;
    }
  }
  return points;
}
