import { expect, request } from '@playwright/test';
import { MAILPIT_URL } from './env';

// Reads the test inbox through Mailpit's HTTP API (https://mailpit.axllent.org/docs/api-v1/).
// The backend must send through Mailpit: SMTP_HOST=127.0.0.1 SMTP_PORT=1025.

interface Address {
  Name: string;
  Address: string;
}

interface MessageSummary {
  ID: string;
  To: Address[];
  Subject: string;
  Created: string;
}

export interface MailpitMessage {
  ID: string;
  From: Address;
  To: Address[];
  Subject: string;
  Date: string;
  Text: string;
  HTML: string;
}

/** The newest message sent to `address`, or null if the inbox has none. */
export async function getLatestMessage(address: string): Promise<MailpitMessage | null> {
  const api = await request.newContext();
  try {
    const search = await api
      .get(`${MAILPIT_URL}/api/v1/search`, { params: { query: `to:"${address}"`, limit: 50 } })
      .catch((err: Error) => {
        throw new Error(
          `Cannot reach Mailpit at ${MAILPIT_URL}. Start it with "docker compose --profile test up -d" ` +
            `in DeawKoyKid-Backend, or set MAILPIT_URL. (${err.message})`,
        );
      });
    if (!search.ok()) {
      throw new Error(`Mailpit search failed: ${search.status()} ${await search.text()}`);
    }

    // Mailpit lists newest first. "to:" also matches partial addresses, so keep exact matches only.
    const { messages } = (await search.json()) as { messages: MessageSummary[] };
    const wanted = address.toLowerCase();
    const latest = messages.find((m) => m.To.some((to) => to.Address.toLowerCase() === wanted));
    if (!latest) return null;

    const full = await api.get(`${MAILPIT_URL}/api/v1/message/${latest.ID}`);
    if (!full.ok()) {
      throw new Error(`Mailpit could not return message ${latest.ID}: ${full.status()}`);
    }
    return (await full.json()) as MailpitMessage;
  } finally {
    await api.dispose();
  }
}

/**
 * Waits until a message to `address` newer than `previousId` arrives and returns it.
 * Pass the ID of getLatestMessage() taken before the action that sends the email.
 */
export async function waitForNewMessage(
  address: string,
  previousId: string | null,
  timeout = 15_000,
): Promise<MailpitMessage> {
  let message: MailpitMessage | null = null;
  await expect
    .poll(
      async () => {
        message = await getLatestMessage(address);
        return message?.ID ?? null;
      },
      { message: `an email to ${address} should arrive in Mailpit`, timeout },
    )
    .not.toBe(previousId);
  return message!;
}

/** The password reset link in a reset email's plain-text body. */
export function extractResetLink(message: MailpitMessage): string {
  const match = message.Text.match(/https?:\/\/\S+\/reset-password\?token=[A-Za-z0-9]+/);
  if (!match) {
    throw new Error(`No reset link found in email "${message.Subject}":\n${message.Text}`);
  }
  return match[0];
}
