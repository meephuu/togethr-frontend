import { Client, types } from 'pg';
import { testDatabaseUrl } from './config';

// Read-only queries for expected outputs that are database facts
// (e.g. "users.consentAt set", "no user created", "token row expires 15 min later").

// Prisma stores DateTime as `timestamp without time zone` holding UTC. pg would read
// those as local time (7 hours off in Bangkok), so parse them as UTC.
const TIMESTAMP_WITHOUT_TZ = 1114;
const parseUtc = (value: string) => new Date(`${value.replace(' ', 'T')}Z`);

export async function dbQuery<T = Record<string, unknown>>(sql: string, params: unknown[] = []): Promise<T[]> {
  const url = new URL(testDatabaseUrl());
  url.search = ''; // drop Prisma's ?schema=public, which pg doesn't understand
  const client = new Client({
    connectionString: url.toString(),
    types: {
      getTypeParser: ((oid: number, format?: 'text' | 'binary') =>
        oid === TIMESTAMP_WITHOUT_TZ ? parseUtc : types.getTypeParser(oid, format)) as typeof types.getTypeParser,
    },
  });
  await client.connect();
  try {
    return (await client.query(sql, params)).rows as T[];
  } finally {
    await client.end();
  }
}

export async function countUsers(where: { username?: string; email?: string }): Promise<number> {
  const [row] = await dbQuery<{ n: number }>(
    'select count(*)::int as n from users where username = $1 or lower(email) = lower($2)',
    [where.username ?? null, where.email ?? null],
  );
  return row.n;
}
