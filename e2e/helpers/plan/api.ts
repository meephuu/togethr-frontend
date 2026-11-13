import { request, type APIRequestContext, type Page, type Response } from '@playwright/test';
import { apiUrl } from '../env';
import type { ApiResult } from './outcome';
import { getState } from './state';

// API sessions for the test plan. Each user gets its own request context, so its
// login cookie is sent with its requests only.

export type PlanUser = 'somchai' | 'somsri' | 'nida';

export const EMAILS: Record<PlanUser, string> = {
  somchai: 'somchai@gmail.com',
  somsri: 'somsri@gmail.com',
  nida: 'nida@gmail.com',
};

function passwordOf(user: PlanUser): string {
  if (user === 'somchai') return getState().somchaiPassword; // TC31 changes it
  return user === 'somsri' ? 'Guide@2026' : 'Nida@2026';
}

export async function call(
  ctx: APIRequestContext,
  method: 'GET' | 'POST' | 'PATCH',
  path: string,
  data?: unknown,
): Promise<ApiResult> {
  const res = await ctx.fetch(apiUrl(path), { method, data });
  const text = await res.text();
  let body: any = text;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    // not JSON: keep the text
  }
  const setCookie = res
    .headersArray()
    .filter((h) => h.name.toLowerCase() === 'set-cookie')
    .map((h) => h.value)
    .join('\n');
  return { status: res.status(), body, setCookie };
}

/** Opens request contexts for one test and disposes them afterwards. */
export class Sessions {
  private readonly contexts: APIRequestContext[] = [];

  /** No cookie, unless `cookie` is given (e.g. "token=abc.def.ghi"). */
  async anon(cookie?: string): Promise<APIRequestContext> {
    const ctx = await request.newContext(cookie ? { extraHTTPHeaders: { Cookie: cookie } } : {});
    this.contexts.push(ctx);
    return ctx;
  }

  /** Logged in as a test-plan user. Throws (recorded as F) if the login fails. */
  async as(user: PlanUser): Promise<APIRequestContext> {
    const ctx = await this.anon();
    const res = await call(ctx, 'POST', '/auth/login', { email: EMAILS[user], password: passwordOf(user) });
    if (res.status !== 200) {
      throw new Error(`could not log in as ${user}: ${res.status} ${JSON.stringify(res.body)}`);
    }
    return ctx;
  }

  async dispose(): Promise<void> {
    await Promise.all(this.contexts.map((ctx) => ctx.dispose()));
  }
}

/** Logs in through the login page; resolves to the login response the page received. */
export async function uiLogin(page: Page, email: string, password: string): Promise<Response> {
  await page.goto('/login');
  await page.getByLabel('Username or Email').fill(email);
  await page.getByLabel('Password', { exact: true }).fill(password);
  const [response] = await Promise.all([
    page.waitForResponse(
      (r) => r.request().method() === 'POST' && new URL(r.url()).pathname.endsWith('/auth/login'),
    ),
    page.getByRole('button', { name: 'Log In' }).click(),
  ]);
  return response;
}

/** somchai's (or anyone's) notifications, newest first. */
export async function notificationsOf(ctx: APIRequestContext): Promise<any[]> {
  const res = await call(ctx, 'GET', '/notifications');
  if (res.status !== 200) throw new Error(`GET /api/notifications returned ${res.status}`);
  return res.body.notifications;
}

/** A booking from GET /api/bookings/me (upcoming or past), with which list it is in. */
export async function myBooking(ctx: APIRequestContext, id: string): Promise<{ list: string; booking: any } | null> {
  const res = await call(ctx, 'GET', '/bookings/me');
  if (res.status !== 200) throw new Error(`GET /api/bookings/me returned ${res.status}`);
  for (const list of ['upcoming', 'past']) {
    const booking = res.body[list].find((b: any) => b.id === id);
    if (booking) return { list, booking };
  }
  return null;
}

export async function myBookingCount(ctx: APIRequestContext): Promise<number> {
  const res = await call(ctx, 'GET', '/bookings/me');
  if (res.status !== 200) throw new Error(`GET /api/bookings/me returned ${res.status}`);
  return res.body.upcoming.length + res.body.past.length;
}

/** The token cookie in Set-Cookie header values, if any. */
export function tokenCookie(setCookie: string): string | undefined {
  return setCookie.split('\n').find((c) => /^token=/.test(c.trim()));
}

export const pause = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
