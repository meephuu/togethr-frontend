// Builds a test case's actual output in the style of the plan's expected output
// ("400 “email is required”; no user created") and decides P/F: P only if every check
// matched. Each check adds the text it observed, so a passing case reads like its
// expected output and a failing one shows what came back instead.

export interface ApiResult {
  status: number;
  body: any;
  /** All Set-Cookie header values, joined with newlines. */
  setCookie: string;
}

export const quote = (text: unknown) => `“${String(text)}”`;

/** The error or message string of a response body. */
export function messageOf(body: any): string | undefined {
  return body?.error ?? body?.message;
}

export class Outcome {
  private readonly parts: { text: string; ok: boolean }[] = [];

  /** A check: `text` is what was observed, `ok` whether it matches the expected output. */
  add(text: string, ok: boolean): this {
    this.parts.push({ text, ok });
    return this;
  }

  /** Status code only, e.g. "201". */
  status(res: ApiResult, expected: number): this {
    return this.add(String(res.status), res.status === expected);
  }

  /** Status code and message, e.g. 400 “email is required”. */
  statusMessage(res: ApiResult, expectedStatus: number, expectedMessage: string): this {
    return this.add(statusMessageText(res), res.status === expectedStatus && messageOf(res.body) === expectedMessage);
  }

  /** An exception inside the test: the case can't pass. */
  error(err: unknown): this {
    const message = err instanceof Error ? err.message : String(err);
    return this.add(`harness error: ${message.split('\n')[0]}`, false);
  }

  get pass(): boolean {
    return this.parts.length > 0 && this.parts.every((p) => p.ok);
  }

  get text(): string {
    return this.parts.map((p) => p.text).join('; ') || 'no checks ran';
  }
}

export function statusMessageText(res: ApiResult): string {
  const message = messageOf(res.body);
  return message === undefined ? `${res.status} ${JSON.stringify(res.body)}` : `${res.status} ${quote(message)}`;
}
