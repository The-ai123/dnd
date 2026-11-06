/** A04 isolated feasibility kernel. Coordinates are feet; no renderer or authority dependencies. */
import { stripBound } from './strip-bound';

export interface Point { readonly x: number; readonly y: number }
type Segment = readonly [Point, Point];
export interface Box { readonly minX: number; readonly minY: number; readonly maxX: number; readonly maxY: number }
export interface Footprint { readonly width: number; readonly height: number }
export interface Barrier { readonly polygon: readonly Point[]; readonly movement: boolean; readonly sight: boolean; readonly open?: boolean }
export interface Scene { readonly bounds: Box; readonly barriers: readonly Barrier[]; readonly difficult: readonly Box[] }
export type Objective = 'distance' | 'cost';
export interface Route {
  readonly points: readonly Point[]; readonly distance: number; readonly cost: number; readonly status: 'route';
  /** Lower bound on the chosen objective. Never present an uncertified weighted route as optimal. */
  readonly lowerBound: number; readonly withinTolerance: boolean;
}
export type RouteResult = Route | { readonly status: 'blocked' };
export const EPSILON = 1e-6;
const cross = (a: Point, b: Point, c: Point): number => (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
export const distance = (a: Point, b: Point): number => Math.hypot(b.x - a.x, b.y - a.y);
const lerp = (a: Point, b: Point, t: number): Point => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
function finitePoint(p: Point): void { if (!Number.isFinite(p.x) || !Number.isFinite(p.y)) throw new Error('Nonfinite coordinate'); }
function validBox(b: Box): void {
  finitePoint({ x: b.minX, y: b.minY }); finitePoint({ x: b.maxX, y: b.maxY });
  if (b.minX >= b.maxX || b.minY >= b.maxY) throw new Error('Empty box');
}
export const corners = (b: Box): Point[] => [{ x: b.minX, y: b.minY }, { x: b.maxX, y: b.minY }, { x: b.maxX, y: b.maxY }, { x: b.minX, y: b.maxY }];
function hull(points: readonly Point[]): Point[] {
  const sorted = [...points].sort((a, b) => a.x - b.x || a.y - b.y);
  const half = (list: readonly Point[]): Point[] => {
    const result: Point[] = [];
    for (const p of list) {
      while (result.length > 1 && cross(result.at(-2)!, result.at(-1)!, p) <= 0) result.pop();
      result.push(p);
    }
    result.pop(); return result;
  };
  return [...half(sorted), ...half([...sorted].reverse())];
}
function convex(polygon: readonly Point[]): Point[] {
  polygon.forEach(finitePoint);
  if (polygon.length === 2 && distance(polygon[0]!, polygon[1]!) > EPSILON) return [...polygon];
  const result = hull(polygon);
  if (result.length < 3) throw new Error('Barrier needs a nondegenerate convex polygon');
  // Reject concavity rather than filling in authored walkable areas silently.
  if (polygon.some(p => !result.some(q => distance(p, q) < EPSILON))) throw new Error('Split concave barriers into convex pieces');
  return result;
}
function inflate(polygon: readonly Point[], footprint: Footprint): Point[] {
  return hull(polygon.flatMap(p => [-1, 1].flatMap(x => [-1, 1].map(y => ({ x: p.x + x * footprint.width / 2, y: p.y + y * footprint.height / 2 })))));
}
/** Interval within a CCW convex polygon. Strict form permits tangency but no interior penetration. */
function interval(a: Point, b: Point, polygon: readonly Point[], strict = false, openBoundary = false): [number, number] | undefined {
  let low = 0, high = 1;
  for (let i = 0; i < polygon.length; i++) {
    const p = polygon[i]!, q = polygon[(i + 1) % polygon.length]!;
    const edge = distance(p, q);
    const start = cross(p, q, a) / edge, end = cross(p, q, b) / edge;
    const limit = strict ? EPSILON : 0;
    const delta = end - start;
    if (Math.abs(delta) < 1e-12) { if (start < limit || (openBoundary && start <= 0)) return undefined; }
    else if (delta > 0) low = Math.max(low, (limit - start) / delta);
    else high = Math.min(high, (limit - start) / delta);
    if (low > high) return undefined;
  }
  return high - low > 1e-12 ? [low, high] : undefined;
}
function inside(p: Point, polygon: readonly Point[]): boolean { return polygon.every((v, i) => cross(v, polygon[(i + 1) % polygon.length]!, p) > EPSILON * distance(v, polygon[(i + 1) % polygon.length]!)); }
export function measure(points: readonly Point[], difficult: readonly Box[]): { distance: number; cost: number } {
  difficult.forEach(validBox);
  return measurePolygons(points, difficult.map(corners));
}
function measurePolygons(points: readonly Point[], difficult: readonly (readonly Point[])[]): { distance: number; cost: number } {
  let length = 0, cost = 0;
  for (let i = 1; i < points.length; i++) {
    const metrics = segmentMetrics(points[i - 1]!, points[i]!, difficult);
    length += metrics.distance;
    cost += metrics.cost;
  }
  return { distance: length, cost };
}

function segmentMetrics(a: Point, b: Point, difficult: readonly (readonly Point[])[], masks?: Uint32Array) {
  finitePoint(a);
  finitePoint(b);
  const length = distance(a, b);
  const spans: [number, number][] = [];
  let terrainLow = 0;
  let terrainHigh = 0;
  for (let i = 0; i < difficult.length; i++) {
    const polygon = difficult[i]!;
    const span = interval(a, b, polygon, false, true);
    if (!span) continue;
    spans.push(span);
    const mask = masks?.[i] ?? 0;
    if (mask && inside(lerp(a, b, (span[0] + span[1]) / 2), polygon)) {
      if (i < 32) terrainLow |= mask;
      else terrainHigh |= mask;
    }
  }
  spans.sort((left, right) => left[0] - right[0]);
  let end = 0;
  let covered = 0;
  for (const [lo, hi] of spans) {
    covered += Math.max(0, hi - Math.max(end, lo));
    end = Math.max(end, hi);
  }
  return { distance: length, cost: length * (1 + covered), terrainLow, terrainHigh };
}

interface Edge {
  readonly to: number;
  readonly distance: number;
  readonly cost: number;
  readonly terrainLow: number;
  readonly terrainHigh: number;
}
/** Binary heap avoids a quadratic scan during every drag query. */
class Queue {
  private values: { id: number; value: number }[] = [];
  push(id: number, value: number): void {
    const item = { id, value }; let i = this.values.length; this.values.push(item);
    while (i > 0) { const parent = (i - 1) >> 1; if (this.values[parent]!.value <= value) break; this.values[i] = this.values[parent]!; i = parent; }
    this.values[i] = item;
  }
  pop(): { id: number; value: number } | undefined {
    const first = this.values[0], last = this.values.pop(); if (!first || !last || !this.values.length) return first;
    let i = 0;
    while (i * 2 + 1 < this.values.length) {
      let child = i * 2 + 1;
      if (child + 1 < this.values.length && this.values[child + 1]!.value < this.values[child]!.value) child++;
      if (this.values[child]!.value >= last.value) break;
      this.values[i] = this.values[child]!; i = child;
    }
    this.values[i] = last; return first;
  }
}

function shortestPath(
  nodes: readonly Point[], edges: readonly Edge[][], extra: readonly Edge[][], objective: Objective, forbidden = 0n,
): { points: Point[]; value: number } | undefined {
  const source = nodes.length - 2;
  const target = nodes.length - 1;
  const forbiddenLow = Number(forbidden & 0xffff_ffffn);
  const forbiddenHigh = Number(forbidden >> 32n);
  const best = new Float64Array(nodes.length).fill(Infinity);
  const previous = new Int32Array(nodes.length).fill(-1);
  const heuristic = nodes.map(point => distance(point, nodes[target]!));
  const queue = new Queue();
  best[source] = 0;
  queue.push(source, heuristic[source]!);
  for (let item = queue.pop(); item; item = queue.pop()) {
    if (item.value !== best[item.id]! + heuristic[item.id]!) continue;
    if (item.id === target) break;
    const staticEdges = edges[item.id];
    const dynamicEdges = extra[item.id]!;
    const count = staticEdges?.length ?? 0;
    for (let i = 0; i < count + dynamicEdges.length; i++) {
      const edge = i < count ? staticEdges![i]! : dynamicEdges[i - count]!;
      if ((edge.terrainLow & forbiddenLow) || (edge.terrainHigh & forbiddenHigh)) continue;
      const value = best[item.id]! + edge[objective];
      if (value < best[edge.to]!) {
        best[edge.to] = value;
        previous[edge.to] = item.id;
        queue.push(edge.to, value + heuristic[edge.to]!);
      }
    }
  }
  if (!Number.isFinite(best[target])) return undefined;
  const points: Point[] = [];
  for (let id = target; id !== -1; id = previous[id]!) points.push(nodes[id]!);
  return { points: points.reverse(), value: best[target]! };
}

const withinTolerance = (cost: number, bound: number): boolean =>
  cost - bound <= Math.max(0.1, 0.005 * bound);

export class Router {
  readonly nodes: readonly Point[];
  readonly edgeCount: number;
  private readonly blocked: readonly Point[][];
  private readonly bounds: Box;
  private readonly difficult: readonly Box[];
  private readonly terrainPolygons: readonly Point[][];
  private readonly edges: Edge[][];
  private readonly samplingError: number;
  private readonly rectangleMasks: Uint32Array;
  constructor(scene: Scene, footprint: Footprint, readonly samplesPerEdge = 4) {
    validBox(scene.bounds); scene.difficult.forEach(validBox);
    if (![footprint.width, footprint.height].every(v => Number.isFinite(v) && v >= 0)) throw new Error('Invalid footprint');
    if (!Number.isInteger(samplesPerEdge) || samplesPerEdge < 1 || samplesPerEdge > 256) throw new Error('Invalid sampling');
    this.bounds = { minX: scene.bounds.minX + footprint.width / 2, maxX: scene.bounds.maxX - footprint.width / 2, minY: scene.bounds.minY + footprint.height / 2, maxY: scene.bounds.maxY - footprint.height / 2 };
    validBox(this.bounds);
    this.blocked = scene.barriers.filter(b => b.movement && !b.open).map(b => {
      const result = inflate(convex(b.polygon), footprint);
      if (result.length < 3) throw new Error('Segment barriers require a nonzero footprint');
      return result;
    });
    // Copy inputs: later editor mutation must not change this prepared snapshot.
    this.difficult = scene.difficult.map(b => ({ ...b }));
    this.terrainPolygons = this.difficult.map(corners);
    const obstacleBounds = this.blocked.map(polygon => {
      const xs = polygon.map(point => point.x);
      const ys = polygon.map(point => point.y);
      return { minX: Math.min(...xs), maxX: Math.max(...xs), minY: Math.min(...ys), maxY: Math.max(...ys) };
    });
    this.rectangleMasks = Uint32Array.from(this.difficult, (box, i) => {
      // Extra rectangles still contribute their full measured terrain cost.
      if (i >= 64) return 0;
      if (box.minX < this.bounds.minX || box.maxX > this.bounds.maxX ||
          box.minY < this.bounds.minY || box.maxY > this.bounds.maxY) return 0;
      if (this.difficult.some((other, j) => i !== j && boxesTouch(box, other))) return 0;
      if (obstacleBounds.some(obstacle => boxesTouch(box, obstacle))) return 0;
      return 1 << (i % 32);
    });
    const vertices = [...corners(this.bounds), ...this.blocked.flat()];
    // Intersections are essential: overlapping inflated barriers can create new routing vertices.
    const polygons = [...this.blocked, corners(this.bounds)];
    for (let i = 0; i < polygons.length; i++) for (let j = i + 1; j < polygons.length; j++) {
      const first = polygons[i]!, second = polygons[j]!;
      for (let x = 0; x < first.length; x++) for (let y = 0; y < second.length; y++) {
        const hit = intersection(first[x]!, first[(x + 1) % first.length]!, second[y]!, second[(y + 1) % second.length]!);
        if (hit) vertices.push(hit);
      }
    }
    const portals = terrainPortals(this.terrainPolygons, polygons, this.bounds);
    // An optimum can take a single straight run on each ordinary-cost portal.
    // At most two contacts per portal move by half a sample interval, and
    // each contact can affect two legs of weight at most two.
    this.samplingError = portals.reduce((error, [a, b]) => error + 4 * distance(a, b) / samplesPerEdge, EPSILON);
    const candidates = [...vertices, ...portals.flatMap(([a, b]) =>
      [...Array.from({ length: samplesPerEdge }, (_, k) => lerp(a, b, k / samplesPerEdge)), b])];
    const seen = new Set<string>();
    this.nodes = candidates.filter(p => {
      const key = `${p.x},${p.y}`;
      if (!this.valid(p) || seen.has(key)) return false;
      seen.add(key); return true;
    });
    this.edges = this.nodes.map(() => []); let count = 0;
    for (let i = 0; i < this.nodes.length; i++) for (let j = i + 1; j < this.nodes.length; j++) {
      const a = this.nodes[i]!, b = this.nodes[j]!;
      if (this.clear(a, b)) { const m = segmentMetrics(a, b, this.terrainPolygons, this.rectangleMasks); this.edges[i]!.push({ to: j, ...m }); this.edges[j]!.push({ to: i, ...m }); count++; }
    }
    this.edgeCount = count;
  }
  private valid(p: Point): boolean {
    return p.x >= this.bounds.minX - EPSILON && p.x <= this.bounds.maxX + EPSILON && p.y >= this.bounds.minY - EPSILON && p.y <= this.bounds.maxY + EPSILON && !this.blocked.some(b => inside(p, b));
  }
  private clear(a: Point, b: Point): boolean { return !this.blocked.some(p => interval(a, b, p, true)); }
  route(start: Point, end: Point, objective: Objective): RouteResult {
    finitePoint(start); finitePoint(end);
    if (!this.valid(start) || !this.valid(end)) return { status: 'blocked' };
    const direct = measurePolygons([start, end], this.terrainPolygons);
    if (this.clear(start, end) && (objective === 'distance' || direct.cost <= direct.distance + EPSILON)) return { status: 'route', points: [start, end], ...direct, lowerBound: direct.distance, withinTolerance: true };
    const nodes = [...this.nodes, start, end], source = nodes.length - 2, target = nodes.length - 1;
    const extra = nodes.map(() => [] as Edge[]);
    for (const id of [source, target]) for (let i = 0; i < id; i++) {
      if (this.clear(nodes[id]!, nodes[i]!)) { const m = segmentMetrics(nodes[id]!, nodes[i]!, this.terrainPolygons, this.rectangleMasks); extra[id]!.push({ to: i, ...m }); extra[i]!.push({ to: id, ...m }); }
    }
    const geometric = shortestPath(nodes, this.edges, extra, 'distance');
    if (!geometric) return { status: 'blocked' };
    let lowerBound = geometric.value;
    let points = geometric.points;
    if (objective === 'cost') {
      const cost = measurePolygons(points, this.terrainPolygons).cost;
      if (!withinTolerance(cost, lowerBound)) {
        const sampled = shortestPath(nodes, this.edges, extra, 'cost')!;
        points = sampled.points;
        lowerBound = Math.max(lowerBound, sampled.value - this.samplingError);
      }
    }
    const split: Point[] = [];
    for (let i = 1; i < points.length; i++) {
      const a = points[i - 1]!, b = points[i]!;
      const times = [0, ...this.difficult.flatMap(box => interval(a, b, corners(box)) ?? []).filter(t => t > 0 && t < 1)].sort((a, b) => a - b);
      for (let j = 0; j < times.length; j++) if (j === 0 || times[j]! - times[j - 1]! > 1e-12) split.push(lerp(a, b, times[j]!));
    }
    split.push(end);
    if (objective === 'cost' && !withinTolerance(measurePolygons(split, this.terrainPolygons).cost, lowerBound)) this.refine(split);
    const measured = measurePolygons(split, this.terrainPolygons);
    if (objective === 'cost' && !withinTolerance(measured.cost, lowerBound)) {
      lowerBound = Math.max(lowerBound, stripBound(start, end, measured.cost, this.bounds, this.difficult));
    }
    if (objective === 'cost' && !withinTolerance(measured.cost, lowerBound)) {
      lowerBound = Math.max(lowerBound, this.rectangleBound(nodes, extra, geometric, measured.cost));
    }
    return { status: 'route', points: split, ...measured, lowerBound, withinTolerance: withinTolerance(measured[objective], lowerBound) };
  }

  private rectangleBound(nodes: readonly Point[], extra: readonly Edge[][], geometric: { points: Point[]; value: number }, cost: number): number {
    // An isolated rectangle's same-side and adjacent-side transits can be
    // replaced by cheaper boundary travel. Every remaining transit pays at
    // least one short dimension in addition to its geometric distance.
    const target = Math.min(cost - 0.1, cost / 1.005) + EPSILON;
    const start = nodes.at(-2)!;
    const end = nodes.at(-1)!;
    let forbidden = 0n;
    const rectangles = this.difficult.flatMap((box, i) => {
      if (!this.rectangleMasks[i] || pointInBox(start, box) || pointInBox(end, box)) return [];
      const mask = 1n << BigInt(i);
      const transit = rectangleTransitBound(start, end, box, geometric.value);
      if (transit >= target) forbidden |= mask;
      return [{ mask, transit, penalty: Math.min(box.maxX - box.minX, box.maxY - box.minY) }];
    });
    if (!rectangles.length) return 0;
    interface Branch {
      readonly forbidden: bigint;
      readonly crossed: bigint;
      readonly penalty: number;
      readonly extraTransitBound: number;
      readonly lower: number;
      readonly next: typeof rectangles[number] | undefined;
    }
    const pending: Branch[] = [];
    const paths = new Map<bigint, { distance: number; entered: bigint } | undefined>();
    const optimisticPath = (avoid: bigint) => {
      if (paths.has(avoid)) return paths.get(avoid);
      const path = avoid ? shortestPath(nodes, this.edges, extra, 'distance', avoid) : geometric;
      if (!path) {
        paths.set(avoid, undefined);
        return undefined;
      }
      let low = 0;
      let high = 0;
      for (let i = 1; i < path.points.length; i++) {
        const edge = segmentMetrics(path.points[i - 1]!, path.points[i]!, this.terrainPolygons, this.rectangleMasks);
        low |= edge.terrainLow;
        high |= edge.terrainHigh;
      }
      const result = { distance: path.value, entered: (BigInt(high >>> 0) << 32n) | BigInt(low >>> 0) };
      paths.set(avoid, result);
      return result;
    };
    const add = (avoid: bigint, crossed: bigint, penalty: number, extraTransitBound: number) => {
      if (extraTransitBound + penalty >= target) return;
      const path = optimisticPath(avoid);
      if (!path) return;
      const lower = Math.max(path.distance - EPSILON, extraTransitBound) + penalty;
      if (lower >= target) return;
      const undecided = path.entered & ~(crossed | avoid);
      let next: typeof rectangles[number] | undefined;
      for (const rectangle of rectangles) {
        if ((rectangle.mask & undecided) && (!next || rectangle.transit > next.transit)) next = rectangle;
      }
      pending.push({ forbidden: avoid, crossed, penalty, extraTransitBound, lower, next });
    };
    add(forbidden, 0n, 0, 0);
    // Every split covers both possibilities. On budget exhaustion the least
    // unresolved branch remains a lower bound on the original problem.
    for (let split = 0; split < 6 && pending.length; split++) {
      pending.sort((a, b) => b.lower - a.lower);
      const branch = pending.at(-1)!;
      const rectangle = branch.next;
      if (!rectangle) break;
      pending.pop();
      add(branch.forbidden | rectangle.mask, branch.crossed, branch.penalty, branch.extraTransitBound);
      add(branch.forbidden, branch.crossed | rectangle.mask, branch.penalty + rectangle.penalty,
        Math.max(branch.extraTransitBound, rectangle.transit - rectangle.penalty));
    }
    return pending.reduce((lower, branch) => Math.min(lower, branch.lower), target);
  }

  /** Continuous boundary minimization removes sampling quantization within the selected topology.
   * This is not a certificate of global optimality for arbitrary weighted arrangements. */
  private refine(points: Point[]): void {
    for (let pass = 0; pass < 24; pass++) {
      let improvement = 0;
      for (let i = 1; i + 1 < points.length; i++) {
        const current = points[i]!;
        for (const box of this.difficult) {
          const vertices = corners(box);
          for (let j = 0; j < 4; j++) {
            const a = vertices[j]!, b = vertices[(j + 1) % 4]!;
            if (Math.abs(cross(a, b, current)) > EPSILON * distance(a, b) || current.x < Math.min(a.x, b.x) - EPSILON || current.x > Math.max(a.x, b.x) + EPSILON || current.y < Math.min(a.y, b.y) - EPSILON || current.y > Math.max(a.y, b.y) + EPSILON) continue;
            const before = points[i - 1]!, after = points[i + 1]!;
            const evaluate = (t: number): number => {
              const p = lerp(a, b, t);
              return this.valid(p) && this.clear(before, p) && this.clear(p, after) ? measurePolygons([before, p, after], this.terrainPolygons).cost : Infinity;
            };
            let low = 0, high = 1;
            const ratio = (Math.sqrt(5) - 1) / 2;
            let left = high - ratio * (high - low), right = low + ratio * (high - low), lv = evaluate(left), rv = evaluate(right);
            for (let step = 0; step < 40; step++) {
              if (lv < rv) { high = right; right = left; rv = lv; left = high - ratio * (high - low); lv = evaluate(left); }
              else { low = left; left = right; lv = rv; right = low + ratio * (high - low); rv = evaluate(right); }
            }
            const t = (low + high) / 2, candidateCost = evaluate(t), oldCost = measurePolygons([before, points[i]!, after], this.terrainPolygons).cost;
            if (candidateCost < oldCost) { points[i] = lerp(a, b, t); improvement += oldCost - candidateCost; }
          }
        }
      }
      if (improvement < 1e-8) break;
    }
  }
}

function boxesTouch(a: Box, b: Box): boolean {
  return a.minX <= b.maxX && a.maxX >= b.minX && a.minY <= b.maxY && a.maxY >= b.minY;
}

function pointInBox(p: Point, box: Box): boolean {
  return p.x > box.minX && p.x < box.maxX && p.y > box.minY && p.y < box.maxY;
}

function rectangleTransitBound(start: Point, end: Point, box: Box, geometric: number): number {
  const width = box.maxX - box.minX;
  const height = box.maxY - box.minY;
  const vertical = (p: Point, x: number) => Math.hypot(p.x - x, Math.max(0, box.minY - p.y, p.y - box.maxY));
  const horizontal = (p: Point, y: number) => Math.hypot(p.y - y, Math.max(0, box.minX - p.x, p.x - box.maxX));
  const across = 2 * width + Math.min(
    vertical(start, box.minX) + vertical(end, box.maxX),
    vertical(start, box.maxX) + vertical(end, box.minX),
  );
  const along = 2 * height + Math.min(
    horizontal(start, box.minY) + horizontal(end, box.maxY),
    horizontal(start, box.maxY) + horizontal(end, box.minY),
  );
  return Math.min(Math.max(across, geometric + width), Math.max(along, geometric + height)) - EPSILON;
}

function terrainPortals(terrain: readonly Point[][], other: readonly Point[][], bounds: Box): Segment[] {
  const result = new Map<string, Segment>();
  for (const polygon of terrain) {
    for (let i = 0; i < polygon.length; i++) {
      const a = polygon[i]!;
      const b = polygon[(i + 1) % polygon.length]!;
      const vertical = a.x === b.x;
      const coordinate = (point: Point) => vertical ? point.y : point.x;
      const point = (value: number) => vertical ? { x: a.x, y: value } : { x: value, y: a.y };
      const cuts = new Set([coordinate(a), coordinate(b)]);
      for (const boundary of [...terrain, ...other]) {
        if (boundary === polygon) continue;
        for (let j = 0; j < boundary.length; j++) {
          const c = boundary[j]!;
          const d = boundary[(j + 1) % boundary.length]!;
          for (const hit of [intersection(a, b, c, d), intersection(b, a, c, d)]) {
            if (hit) cuts.add(coordinate(hit));
          }
        }
      }
      const sorted = [...cuts].sort((left, right) => left - right);
      for (let j = 1; j < sorted.length; j++) {
        const lo = point(sorted[j - 1]!);
        const hi = point(sorted[j]!);
        const mid = lerp(lo, hi, 0.5);
        if (mid.x < bounds.minX - EPSILON || mid.x > bounds.maxX + EPSILON ||
            mid.y < bounds.minY - EPSILON || mid.y > bounds.maxY + EPSILON) continue;
        result.set(`${lo.x},${lo.y},${hi.x},${hi.y}`, [lo, hi]);
      }
    }
  }
  return [...result.values()];
}
function intersection(a: Point, b: Point, c: Point, d: Point): Point | undefined {
  const denominator = (b.x - a.x) * (d.y - c.y) - (b.y - a.y) * (d.x - c.x);
  if (Math.abs(denominator) < 1e-12) {
    const squared = (b.x - a.x) ** 2 + (b.y - a.y) ** 2;
    if (squared === 0 || Math.abs(cross(a, b, c)) > EPSILON * Math.sqrt(squared)) return undefined;
    const project = (p: Point) => ((p.x - a.x) * (b.x - a.x) + (p.y - a.y) * (b.y - a.y)) / squared;
    const lo = Math.max(0, Math.min(project(c), project(d))), hi = Math.min(1, Math.max(project(c), project(d)));
    return lo <= hi ? lerp(a, b, lo) : undefined;
  }
  const t = ((c.x - a.x) * (d.y - c.y) - (c.y - a.y) * (d.x - c.x)) / denominator;
  const u = ((c.x - a.x) * (b.y - a.y) - (c.y - a.y) * (b.x - a.x)) / denominator;
  return t >= 0 && t <= 1 && u >= 0 && u <= 1 ? lerp(a, b, t) : undefined;
}
/** Wall/radius visibility probe. No lighting, elevation or special senses. */
export function visible(scene: Scene, origin: Point, target: Point, radius: number): boolean {
  finitePoint(origin); finitePoint(target);
  if (!Number.isFinite(radius) || radius < 0) throw new Error('Invalid sight radius');
  return distance(origin, target) <= radius + EPSILON && !scene.barriers.some(b => {
    if (!b.sight || b.open) return false;
    const polygon = convex(b.polygon);
    return polygon.length === 2 ? !!intersection(origin, target, polygon[0]!, polygon[1]!) : !!interval(origin, target, polygon, true);
  });
}
/** Conservative polygonal approximation to wall/radius sight. Circle chord error <= arcError feet.
 * Endpoint-adjacent rays capture narrow shadows; this is not a lighting or special-senses engine. */
export function visibilityPolygon(scene: Scene, origin: Point, radius: number, arcError = 0.05): readonly Point[] {
  finitePoint(origin);
  if (!Number.isFinite(radius) || radius < 0 || !Number.isFinite(arcError) || arcError <= 0) throw new Error('Invalid visibility resolution');
  if (radius === 0) return [{ ...origin }];
  const polygons = scene.barriers.filter(b => b.sight && !b.open).map(b => convex(b.polygon));
  if (polygons.some(p => p.length > 2 && inside(origin, p))) return [];
  const steps = Math.max(8, Math.ceil(Math.PI / Math.acos(Math.max(-1, 1 - Math.min(arcError, radius) / radius))));
  if (steps > 8192) throw new Error('Visibility resolution exceeds spike ray budget');
  const angles = Array.from({ length: steps }, (_, i) => -Math.PI + i * Math.PI * 2 / steps);
  for (const p of polygons.flat()) {
    const angle = Math.atan2(p.y - origin.y, p.x - origin.x);
    for (const delta of [-1e-8, 0, 1e-8]) angles.push(Math.atan2(Math.sin(angle + delta), Math.cos(angle + delta)));
  }
  angles.sort((a, b) => a - b);
  return angles.map(angle => {
    const end = { x: origin.x + radius * Math.cos(angle), y: origin.y + radius * Math.sin(angle) };
    let nearest = end, length = radius;
    for (const polygon of polygons) for (let i = 0; i < (polygon.length === 2 ? 1 : polygon.length); i++) {
      const hit = intersection(origin, end, polygon[i]!, polygon[(i + 1) % polygon.length]!);
      if (hit && distance(origin, hit) < length) { nearest = hit; length = distance(origin, hit); }
    }
    return nearest;
  });
}
/** Sparse explored cells are allocated only where revealed, independent of map extent. */
export class Exploration {
  private readonly cells = new Set<string>();
  constructor(readonly cellFeet = 5) { if (!Number.isFinite(cellFeet) || cellFeet <= 0) throw new Error('Invalid cell size'); }
  reveal(point: Point): void { finitePoint(point); this.cells.add(`${Math.floor(point.x / this.cellFeet)},${Math.floor(point.y / this.cellFeet)}`); }
  has(point: Point): boolean { finitePoint(point); return this.cells.has(`${Math.floor(point.x / this.cellFeet)},${Math.floor(point.y / this.cellFeet)}`); }
  get size(): number { return this.cells.size; }
}
/** Identity fields proposed for B01 review; caller owns worker dispatch and cancellation. */
export interface RequestIdentity { readonly worldInstanceId: string; readonly sceneEpoch: number; readonly revision: number; readonly requestId: number }
export const isCurrent = (result: RequestIdentity, latest: RequestIdentity): boolean => result.worldInstanceId === latest.worldInstanceId && result.sceneEpoch === latest.sceneEpoch && result.revision === latest.revision && result.requestId === latest.requestId;
