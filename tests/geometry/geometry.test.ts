import { describe, expect, it } from 'vitest';
import { corners, distance, EPSILON, Exploration, isCurrent, measure, Router, visible, visibilityPolygon, type Box, type RouteResult, type Scene } from '../../packages/geometry/src/index';

const bounds: Box = { minX: 0, minY: 0, maxX: 5280, maxY: 5280 };
const box = (minX: number, minY: number, maxX: number, maxY: number): Box => ({ minX, minY, maxX, maxY });
const barrier = (b: Box) => ({ polygon: corners(b), movement: true, sight: true });
const scene = (changes: Partial<Scene> = {}): Scene => ({ bounds, barriers: [], difficult: [], ...changes });
function route(result: RouteResult) { if (result.status !== 'route') throw new Error('Expected route'); return result; }
function within(actual: number, optimum: number) {
  expect(actual).toBeGreaterThanOrEqual(optimum - EPSILON);
  expect(actual - optimum).toBeLessThanOrEqual(Math.max(0.1, 0.005 * optimum));
}

describe('continuous physical routes and square footprint', () => {
  it('preserves fractional diagonals, 0.1-foot moves, and unrounded cost thresholds', () => {
    const router = new Router(scene(), { width: 5, height: 5 });
    const result = route(router.route({ x: 100.125, y: 200.25 }, { x: 105.125, y: 205.25 }, 'distance'));
    expect(result.distance).toBeCloseTo(Math.sqrt(50), 10);
    expect(route(router.route({ x: 100, y: 100 }, { x: 100.1, y: 100 }, 'cost')).distance).toBeCloseTo(0.1, 10);
    expect(measure([{ x: 0, y: 0 }, { x: 30.00001, y: 0 }], []).cost).toBeGreaterThan(30 + EPSILON);
  });
  it('matches the analytic shortest route around an inflated rectangle', () => {
    const router = new Router(scene({ barriers: [barrier(box(20, 10, 30, 30))] }), { width: 5, height: 5 });
    const result = route(router.route({ x: 10, y: 20 }, { x: 40, y: 20 }, 'distance'));
    within(result.distance, 2 * Math.hypot(7.5, 12.5) + 15);
    expect(result.points).toHaveLength(4);
    expect(result.withinTolerance).toBe(true);
  });
  it('distinguishes a 5-ft exact-fit gap from a gap smaller than the footprint', () => {
    const make = (gap: number) => scene({ bounds: box(0, 0, 100, 100), barriers: [barrier(box(40, 0, 60, 50 - gap / 2)), barrier(box(40, 50 + gap / 2, 60, 100))] });
    expect(new Router(make(4.9), { width: 5, height: 5 }).route({ x: 10, y: 50 }, { x: 90, y: 50 }, 'distance').status).toBe('blocked');
    expect(route(new Router(make(5), { width: 5, height: 5 }).route({ x: 10, y: 50 }, { x: 90, y: 50 }, 'distance')).distance).toBe(80);
    expect(new Router(make(9.9), { width: 10, height: 10 }).route({ x: 10, y: 50 }, { x: 90, y: 50 }, 'cost').status).toBe('blocked');
  });
  it('does not leak outside the map or fall back to Through', () => {
    const router = new Router(scene({ bounds: box(0, 0, 100, 100), barriers: [barrier(box(45, 0, 55, 100))] }), { width: 5, height: 5 });
    expect(router.route({ x: 10, y: 50 }, { x: 90, y: 50 }, 'cost').status).toBe('blocked');
    expect(router.route({ x: 1, y: 50 }, { x: 10, y: 50 }, 'distance').status).toBe('blocked');
    expect(router.route({ x: 10, y: 50 }, { x: 50, y: 50 }, 'distance').status).toBe('blocked');
  });
  it('inflates diagonal segments with a square Minkowski sum', () => {
    const router = new Router(scene({ barriers: [{ polygon: [{ x: 20, y: 20 }, { x: 40, y: 40 }], movement: true, sight: false }] }), { width: 10, height: 10 });
    const result = route(router.route({ x: 10, y: 30 }, { x: 50, y: 30 }, 'distance'));
    expect(result.distance).toBeGreaterThan(40);
    expect(result.points.some(p => p.x === 15 || p.x === 45)).toBe(true);
  });
  it('routes around overlapping inflated obstacles using their union boundary', () => {
    const router = new Router(scene({ barriers: [barrier(box(20, 10, 35, 30)), barrier(box(30, 20, 45, 40))] }), { width: 5, height: 5 });
    const forward = route(router.route({ x: 10, y: 25 }, { x: 55, y: 25 }, 'distance'));
    const reverse = route(router.route({ x: 55, y: 25 }, { x: 10, y: 25 }, 'distance'));
    expect(forward.distance).toBeCloseTo(reverse.distance, 9);
    expect(forward.distance).toBeGreaterThan(45);
  });
});

describe('weighted continuous movement', () => {
  it('splits at exact terrain boundaries and unions overlapping difficult terrain', () => {
    expect(measure([{ x: 0, y: 5 }, { x: 30, y: 5 }], [box(5, 0, 15, 10), box(10, 0, 25, 10)])).toEqual({ distance: 30, cost: 50 });
    expect(measure([{ x: 0.125, y: 0 }, { x: 10.125, y: 0 }], [box(5.125, -1, 20, 1)]).cost).toBeCloseTo(15, 9);
  });
  it('chooses distinct distance and cost paths against an analytic rectangle detour', () => {
    const router = new Router(scene({ difficult: [box(20, 40, 40, 60)] }), { width: 0, height: 0 }, 8);
    const start = { x: 10, y: 50 }, end = { x: 50, y: 50 };
    const physical = route(router.route(start, end, 'distance')), weighted = route(router.route(start, end, 'cost'));
    expect(physical.distance).toBe(40); expect(physical.cost).toBe(60);
    within(weighted.cost, 20 + 2 * Math.sqrt(200));
    expect(weighted.distance).toBeGreaterThan(physical.distance);
    expect(weighted.cost).toBeLessThan(physical.cost);
  });
  it('refracts through a forced terrain interface against an independent Snell-law oracle', () => {
    // Entire upper half is difficult: an optimal path crosses y=50 exactly once.
    const router = new Router(scene({ bounds: box(0, 0, 100, 100), difficult: [box(-100, 50, 200, 200)] }), { width: 0, height: 0 }, 4);
    const start = { x: 10, y: 10 }, end = { x: 90, y: 90 };
    // Solve d/dx [sqrt((x-10)^2+40^2)+2sqrt((90-x)^2+40^2)] = 0.
    let low = 10, high = 90;
    for (let i = 0; i < 100; i++) { const x = (low + high) / 2; if ((x - 10) / Math.hypot(x - 10, 40) - 2 * (90 - x) / Math.hypot(90 - x, 40) < 0) low = x; else high = x; }
    const x = (low + high) / 2, optimum = Math.hypot(x - 10, 40) + 2 * Math.hypot(90 - x, 40);
    const result = route(router.route(start, end, 'cost'));
    within(result.cost, optimum);
    expect(Math.abs(result.points[1]!.x - 50)).toBeGreaterThan(10);
    expect(result.withinTolerance).toBe(false); // Safe lower bound is too loose to certify this arrangement.
  });
  it('handles two refracting interfaces against a conserved-angle analytic oracle', () => {
    const router = new Router(scene({ bounds: box(0, 0, 120, 120), difficult: [box(30, -100, 90, 200)] }), { width: 0, height: 0 }, 8);
    const start = { x: 10, y: 20 }, end = { x: 110, y: 100 };
    let low = 0, high = 1;
    const widths = [20, 60, 20], weights = [1, 2, 1];
    for (let step = 0; step < 100; step++) {
      const p = (low + high) / 2;
      const rise = widths.reduce((sum, width, i) => sum + width * p / Math.sqrt(weights[i]! ** 2 - p * p), 0);
      if (rise < 80) low = p; else high = p;
    }
    const p = (low + high) / 2;
    const optimum = widths.reduce((sum, width, i) => sum + weights[i]! ** 2 * width / Math.sqrt(weights[i]! ** 2 - p * p), 0);
    within(route(router.route(start, end, 'cost')).cost, optimum);
  });
  it('keeps terrain costs for explicit Through and ordered waypoint composition', () => {
    const terrain = [box(5, 0, 15, 20)];
    const first = measure([{ x: 0, y: 10 }, { x: 10, y: 10 }], terrain);
    const second = measure([{ x: 10, y: 10 }, { x: 20, y: 10 }], terrain);
    expect(first.cost + second.cost).toBe(30);
  });
});

describe('visibility, exploration and snapshot safety', () => {
  it('uses independent movement/sight flags, door state and radius', () => {
    const wall = barrier(box(40, 0, 45, 100)), origin = { x: 10, y: 50 }, target = { x: 90, y: 50 };
    expect(visible(scene({ barriers: [wall] }), origin, target, 100)).toBe(false);
    expect(visible(scene({ barriers: [{ ...wall, open: true }] }), origin, target, 100)).toBe(true);
    expect(visible(scene({ barriers: [{ ...wall, sight: false }] }), origin, target, 100)).toBe(true);
    expect(visible(scene(), origin, target, 79)).toBe(false);
    expect(visible(scene(), origin, target, 80)).toBe(true);
    expect(visible(scene({ barriers: [{ polygon: [{ x: 50, y: 0 }, { x: 50, y: 100 }], movement: false, sight: true }] }), origin, target, 100)).toBe(false);
  });
  it('allocates exploration by visits, with stable cells at maximum extent', () => {
    const fog = new Exploration();
    for (let i = 0; i < 100; i++) { fog.reveal({ x: 5279.9, y: 5279.9 }); fog.reveal({ x: 0.1, y: 0.1 }); }
    expect(fog.size).toBe(2); expect(fog.has({ x: 100, y: 100 })).toBe(false);
    expect(fog.has({ x: 5275.1, y: 5278 })).toBe(true);
  });
  it('clips visibility polygons to closed walls with bounded circle approximation', () => {
    const origin = { x: 10, y: 50 };
    const wall = barrier(box(40, -100, 45, 200));
    const polygon = visibilityPolygon(scene({ barriers: [wall] }), origin, 60);
    expect(polygon.length).toBeGreaterThan(60);
    expect(polygon.every(p => p.x <= 40 + EPSILON)).toBe(true);
    expect(polygon.every(p => distance(origin, p) <= 60 + EPSILON)).toBe(true);
    const circle = visibilityPolygon(scene(), origin, 5280);
    for (let i = 0; i < circle.length; i++) {
      const a = circle[i]!, b = circle[(i + 1) % circle.length]!;
      expect(5280 - distance(origin, { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 })).toBeLessThanOrEqual(0.05 + EPSILON);
    }
    expect(visibilityPolygon(scene({ barriers: [{ ...wall, open: true }] }), origin, 60).some(p => p.x > 40)).toBe(true);
  });
  it('rejects stale world, epoch, revision and request results', () => {
    const current = { worldInstanceId: 'world', sceneEpoch: 2, revision: 4, requestId: 10 };
    expect(isCurrent(current, current)).toBe(true);
    for (const changed of [{ worldInstanceId: 'other' }, { sceneEpoch: 1 }, { revision: 3 }, { requestId: 9 }]) expect(isCurrent({ ...current, ...changed }, current)).toBe(false);
  });
  it('rejects nonfinite inputs and unsupported concavity', () => {
    expect(() => new Router(scene(), { width: NaN, height: 5 })).toThrow();
    expect(() => new Router(scene({ barriers: [{ polygon: [{ x: 10, y: 10 }, { x: 30, y: 10 }, { x: 20, y: 15 }, { x: 30, y: 30 }, { x: 10, y: 30 }], movement: true, sight: false }] }), { width: 5, height: 5 })).toThrow(/convex/);
    expect(() => new Router(scene(), { width: 5, height: 5 }).route({ x: NaN, y: 0 }, { x: 10, y: 10 }, 'cost')).toThrow();
    expect(distance({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(5);
  });
});
