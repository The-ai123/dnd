import { writeFileSync } from 'node:fs';
import os from 'node:os';
import { expect, it } from 'vitest';
import { corners, Exploration, Router, visible, type Barrier, type Box, type Scene } from '../../packages/geometry/src/index';

const box = (minX: number, minY: number, maxX: number, maxY: number): Box => ({ minX, minY, maxX, maxY });
it('measures the agreed maximum-extent workload with 100 tokens, 200 blocking edges and 50 terrain regions', () => {
  const barriers: Barrier[] = [], difficult: Box[] = [];
  // A deterministic 10-by-5 set of obstacles and adjacent terrain patches.
  // Not a direct-path-only benchmark: both objectives cross occupied rows.
  for (let row = 0; row < 5; row++) for (let col = 0; col < 10; col++) {
    const x = 40 + col * 45, y = 40 + row * 80;
    barriers.push({ polygon: corners(box(x, y, x + 12, y + 40)), movement: true, sight: true });
    difficult.push(box(x + 15, y + 5, x + 35, y + 55));
  }
  const scene: Scene = { bounds: box(0, 0, 5280, 5280), barriers, difficult };
  const tokens = Array.from({ length: 100 }, (_, i) => ({ x: 12 + i % 10 * 45, y: 15 + Math.floor(i / 10) * 40 }));
  const before = process.memoryUsage(), prepareStart = performance.now();
  const router = new Router(scene, { width: 5, height: 5 }, 4);
  const prepareMs = performance.now() - prepareStart;
  const after = process.memoryUsage();
  const fog = new Exploration();
  // Record cold geometry construction separately; warm includes start/end connection and refinement.
  const samples: number[] = [], costs: number[] = [];
  let certifiedWeighted = 0;
  let weightedQueries = 0;
  const weightedGaps: number[] = [];
  const weightedSamples: number[] = [];
  for (let i = 0; i < 120; i++) {
    const start = tokens[i % tokens.length]!, end = { x: 510, y: 20 + i % 10 * 40 };
    const begin = performance.now();
    const result = router.route(start, end, i % 2 ? 'cost' : 'distance');
    const elapsed = performance.now() - begin;
    expect(result.status).toBe('route');
    if (result.status === 'route') costs.push(result.cost);
    if (i >= 20) {
      samples.push(elapsed);
      if (i % 2) {
        weightedQueries++;
        weightedSamples.push(elapsed);
        if (result.status === 'route' && result.withinTolerance) certifiedWeighted++;
        if (result.status === 'route') weightedGaps.push(result.cost - result.lowerBound);
      }
    }
    if (visible(scene, start, start, 60)) fog.reveal(start);
  }
  samples.sort((a, b) => a - b);
  weightedSamples.sort((a, b) => a - b);
  const p95Ms = samples[Math.ceil(samples.length * 0.95) - 1]!, maxMs = samples.at(-1)!;
  const weightedP95Ms = weightedSamples[Math.ceil(weightedSamples.length * 0.95) - 1]!;
  const latencyPasses = p95Ms <= 100 && maxMs <= 250;
  const accuracyPasses = certifiedWeighted === weightedQueries;
  const report = {
    timestamp: new Date().toISOString(), node: process.version,
    hardware: { cpu: os.cpus()[0]?.model, logicalProcessors: os.cpus().length, memoryGiB: os.totalmem() / 2 ** 30, platform: os.platform(), release: os.release(), arch: os.arch() },
    fixture: { extentFeet: 5280, tokens: tokens.length, blockingEdges: barriers.length * 4, terrainRegions: difficult.length, samplesPerTerrainEdge: 4 },
    measurement: {
      prepareMs, p95Ms, maxMs, warmQueries: samples.length, weightedP95Ms, certifiedWeighted, weightedQueries,
      maximumWeightedGap: Math.max(...weightedGaps), graphNodes: router.nodes.length, undirectedEdges: router.edgeCount,
      heapDeltaBytes: after.heapUsed - before.heapUsed, rssDeltaBytes: after.rss - before.rss, exploredCells: fog.size,
      costsChecksum: costs.reduce((a, b) => a + b, 0),
    },
    acceptedTargets: { p95Ms: 100, maxMs: 250 },
    latencyPasses,
    accuracyPasses,
    passes: latencyPasses && accuracyPasses,
    limits: 'Local warm CPU queries include weighted certification attempts. Accuracy passes when every weighted query meets the agreed bound.',
  };
  if (process.env.A04_RECORD_REPORT) writeFileSync(process.env.A04_RECORD_REPORT, `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify(report));
  expect(p95Ms).toBeLessThanOrEqual(100); expect(maxMs).toBeLessThanOrEqual(250);
  expect(fog.size).toBeLessThanOrEqual(100);
  // Storage depends on mechanical geometry, not 0.1-foot area cells (2.79 billion).
  expect(router.nodes.length).toBeLessThanOrEqual(1100);
});
