import type { Box, Point } from './index';

/** Lower bound from difficult terrain spanning a cross section of the route's
 * feasible ellipse. The resulting layered metric admits a scalar potential
 * whose gradient has norm at most the terrain cost in every layer. */
export function stripBound(start: Point, end: Point, cost: number, bounds: Box, terrain: readonly Box[]): number {
  const margin = 1e-6;
  const cap = cost + margin;
  let lower = 0;
  for (const axis of ['x', 'y'] as const) {
    const crossAxis = axis === 'x' ? 'y' : 'x';
    const from = Math.min(start[axis], end[axis]);
    const to = Math.max(start[axis], end[axis]);
    if (from === to) continue;
    const transverse = Math.abs(end[crossAxis] - start[crossAxis]);
    const center = (end[crossAxis] + start[crossAxis]) / 2;
    const radius = Math.sqrt(Math.max(0, (cap - (to - from)) * (cap + (to - from)))) / 2;
    const min = axis === 'x' ? 'minX' : 'minY';
    const max = axis === 'x' ? 'maxX' : 'maxY';
    const crossMin = axis === 'x' ? 'minY' : 'minX';
    const crossMax = axis === 'x' ? 'maxY' : 'maxX';
    const near = Math.max(bounds[crossMin], center - radius) - margin;
    const far = Math.min(bounds[crossMax], center + radius) + margin;
    const bands = terrain.filter(box => box[min] < to && box[max] > from && box[crossMin] < far && box[crossMax] > near)
      .sort((a, b) => a[crossMin] - b[crossMin]);
    const cuts = [...new Set([from, to, ...bands.flatMap(box => [Math.max(from, box[min]), Math.min(to, box[max])])])]
      .sort((a, b) => a - b);
    let difficult = 0;
    for (let i = 1; i < cuts.length; i++) {
      const left = cuts[i - 1]!;
      const right = cuts[i]!;
      let covered = near;
      for (const band of bands) {
        // Strict overlap preserves the ordinary-cost seam between touching boxes.
        if (band[crossMin] >= covered) break;
        if (band[min] <= left && band[max] >= right) covered = Math.max(covered, band[crossMax]);
        if (covered > far) {
          difficult += right - left;
          break;
        }
      }
    }
    if (difficult === 0) continue;
    const ordinary = Math.max(0, to - from - difficult);
    // At any p in [0,1], a potential with transverse slope p and longitudinal
    // slope sqrt(weight²-p²) gives a valid lower bound by Cauchy–Schwarz.
    let lo = 0;
    let hi = 1;
    for (let i = 0; i < 48; i++) {
      const p = (lo + hi) / 2;
      const rise = p * (ordinary / Math.sqrt(1 - p * p) + difficult / Math.sqrt(4 - p * p));
      if (rise < transverse) lo = p;
      else hi = p;
    }
    const p = (lo + hi) / 2;
    const value = p * transverse + ordinary * Math.sqrt(1 - p * p) + difficult * Math.sqrt(4 - p * p);
    lower = Math.max(lower, Math.min(cost, value - margin));
  }
  return lower;
}
