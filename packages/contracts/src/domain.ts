import { z } from 'zod';

export const idSchema = z.uuid();
export const revisionSchema = z.number().int().min(0).max(Number.MAX_SAFE_INTEGER);
export const recordKindSchema = z.enum(['campaign', 'session', 'entity', 'location', 'area-template', 'encounter', 'placement', 'draft', 'definition', 'asset', 'shop']);
export const recordReferenceSchema = z.object({ kind: recordKindSchema, recordId: idSchema }).strict();
export const qualifiedRecordReferenceSchema = recordReferenceSchema.extend({ worldInstanceId: idSchema }).strict();
export const recordVersionSchema = recordReferenceSchema.extend({ version: revisionSchema.nullable() }).strict();
export const expectedRecordVersionsSchema = z.array(recordVersionSchema).max(1024).superRefine((records, context) => {
  const seen = new Set<string>();
  records.forEach((record, index) => {
    const key = `${record.kind}:${record.recordId}`;
    if (seen.has(key)) context.addIssue({ code: 'custom', message: 'Duplicate version expectation', path: [index] });
    seen.add(key);
  });
});
export const sessionStatusSchema = z.enum(['in-progress', 'complete']);
export const versionConflictSchema = recordReferenceSchema.extend({
  expectedVersion: revisionSchema.nullable(), actualVersion: revisionSchema.nullable(),
}).strict();

// Runtime contracts for approved A01 invariants; repository enforcement belongs to B05.
export const sessionSchema = z.object({
  id: idSchema, campaignId: idSchema, version: revisionSchema, status: sessionStatusSchema,
  continuationOf: idSchema.optional(),
}).strict();
export const reservationSchema = z.object({
  record: recordReferenceSchema, sessionId: idSchema,
}).strict();
export const placementSchema = z.object({
  id: idSchema, entityId: idSchema, encounterId: idSchema, version: revisionSchema,
  xFeet: z.number().finite(), yFeet: z.number().finite(), elevationFeet: z.number().finite(),
  widthFeet: z.number().finite().positive(), heightFeet: z.number().finite().positive(),
}).strict();

/** Parsed, bounded formula terms. No executable source or arbitrary function names. */
export const formulaSchema = z.object({
  terms: z.array(z.discriminatedUnion('type', [
    z.object({ type: z.literal('constant'), value: z.number().int().min(-1_000_000).max(1_000_000) }).strict(),
    z.object({ type: z.literal('dice'), sign: z.union([z.literal(1), z.literal(-1)]), count: z.number().int().min(1).max(100), sides: z.number().int().min(2).max(1000) }).strict(),
  ])).min(1).max(32),
}).strict();
