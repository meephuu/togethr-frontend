import fs from 'node:fs';
import { API_URL, BASE_URL } from '../env';
import { RAW_RESULTS, RESULTS_DIR, RESULTS_MD, testDatabaseName } from './config';

// Collects each test case's actual output and P/F, and writes results/test-plan-results.md.

export const STORIES: { id: string; first: number; last: number }[] = [
  { id: 'US1-1', first: 1, last: 9 },
  { id: 'US1-2', first: 10, last: 16 },
  { id: 'US1-3', first: 17, last: 26 },
  { id: 'US1-5', first: 27, last: 35 },
  { id: 'US6-1', first: 36, last: 48 },
  { id: 'US6-2', first: 49, last: 55 },
  { id: 'US6-3', first: 56, last: 64 },
  { id: 'US6-4', first: 65, last: 71 },
];

export interface PlanResult {
  tc: string;
  actual: string;
  pass: boolean;
}

const tcNumber = (tc: string) => Number(tc.replace(/^TC/, ''));
const tcId = (n: number) => `TC${String(n).padStart(2, '0')}`;

export function storyOf(tc: string): string {
  const n = tcNumber(tc);
  return STORIES.find((s) => n >= s.first && n <= s.last)?.id ?? '?';
}

export function resetResults(): void {
  fs.mkdirSync(RESULTS_DIR, { recursive: true });
  fs.writeFileSync(RAW_RESULTS, '');
}

export function recordResult(result: PlanResult): void {
  fs.mkdirSync(RESULTS_DIR, { recursive: true });
  fs.appendFileSync(RAW_RESULTS, JSON.stringify(result) + '\n');
}

function readResults(): Map<string, PlanResult> {
  const results = new Map<string, PlanResult>();
  if (!fs.existsSync(RAW_RESULTS)) return results;
  for (const line of fs.readFileSync(RAW_RESULTS, 'utf8').split('\n')) {
    if (!line.trim()) continue;
    const result = JSON.parse(line) as PlanResult;
    results.set(result.tc, result); // a re-run of one case replaces its earlier row
  }
  return results;
}

const cell = (text: string) => text.replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');

export function writeReport(): void {
  const results = readResults();
  const all = STORIES.flatMap((s) =>
    Array.from({ length: s.last - s.first + 1 }, (_, i) => tcId(s.first + i)),
  );
  const pf = (tc: string) => {
    const r = results.get(tc);
    return r ? (r.pass ? 'P' : 'F') : '-';
  };
  const passed = all.filter((tc) => pf(tc) === 'P').length;
  const notRun = all.filter((tc) => !results.has(tc));

  const lines = [
    '# Test plan results',
    '',
    `Run ${new Date().toISOString()} against ${BASE_URL} (frontend), ${API_URL} (API), ` +
      `database \`${testDatabaseName() || 'unknown'}\`.`,
    '',
    `**${passed} of ${all.length} passed.**` +
      (notRun.length ? ` Not run: ${notRun.join(', ')} (marked "-").` : ''),
    '',
    'P = the actual output matches the expected output exactly; F = it does not.',
    '',
    '| TC ID | Actual output | P/F |',
    '|---|---|---|',
    ...all.map((tc) => `| ${tc} | ${cell(results.get(tc)?.actual ?? 'not run')} | ${pf(tc)} |`),
    '',
    '## Coverage matrix',
    '',
    ...STORIES.map((s) => {
      const tcs = all.filter((tc) => storyOf(tc) === s.id);
      return `- ${s.id} (${tcs[0]}–${tcs[tcs.length - 1]}): ${tcs.map(pf).join(', ')}`;
    }),
    '',
  ];
  fs.mkdirSync(RESULTS_DIR, { recursive: true });
  fs.writeFileSync(RESULTS_MD, lines.join('\n'));
}
