import fs from 'node:fs';
import { RESULTS_DIR, STATE_FILE } from './config';

// State shared by the test-plan specs (later cases depend on earlier ones). Kept in a
// file rather than in memory so it survives a worker restart.

export interface RunState {
  /** Seed labels (SV-001, SL-01, BK-1001, ...) -> ids, from `npm run seed:test`. */
  ids: Record<string, string>;
  /** Raw reset tokens: T1 (TC27), T2 (seed), T3 (TC35). */
  tokens: Record<string, string>;
  somchaiId?: string;
  /** somchai's current password: TC31 changes it. */
  somchaiPassword: string;
  /** Booking created by TC36. */
  tc36BookingId?: string;
  /** Mailpit ids of somchai's emails before TC49, so TC56 only looks at newer ones. */
  somchaiMailBeforeTC49?: string[];
}

const INITIAL: RunState = { ids: {}, tokens: {}, somchaiPassword: 'Travel@2026' };

export function resetState(): void {
  fs.mkdirSync(RESULTS_DIR, { recursive: true });
  fs.writeFileSync(STATE_FILE, JSON.stringify(INITIAL, null, 2));
}

export function getState(): RunState {
  try {
    return { ...INITIAL, ...JSON.parse(fs.readFileSync(STATE_FILE, 'utf8')) };
  } catch {
    return { ...INITIAL };
  }
}

export function setState(patch: Partial<RunState>): RunState {
  const next = { ...getState(), ...patch };
  fs.mkdirSync(RESULTS_DIR, { recursive: true });
  fs.writeFileSync(STATE_FILE, JSON.stringify(next, null, 2));
  return next;
}

/** Id of a seed label, or an error the test records when the seed didn't run. */
export function seedId(label: string): string {
  const id = getState().ids[label];
  if (!id) throw new Error(`no id for ${label}: the seed after TC16 did not run or did not print it`);
  return id;
}
