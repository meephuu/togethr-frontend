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

/** Messages sent to exactly `address`, newest first (at most `limit`). */
async function searchTo(address: string, limit: number): Promise<MessageSummary[]> {
  const api = await request.newContext();
  try {
    const search = await api
      .get(`${MAILPIT_URL}/api/v1/search`, { params: { query: `to:"${address}"`, limit } })
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
    return messages.filter((m) => m.To.some((to) => to.Address.toLowerCase() === wanted));
  } finally {
    await api.dispose();
  }
}

/** One full message by its Mailpit id. */
export async function getMessage(id: string): Promise<MailpitMessage> {
  const api = await request.newContext();
  try {
    const full = await api.get(`${MAILPIT_URL}/api/v1/message/${id}`);
    if (!full.ok()) {
      throw new Error(`Mailpit could not return message ${id}: ${full.status()}`);
    }
    return (await full.json()) as MailpitMessage;
  } finally {
    await api.dispose();
  }
}

/** The newest message sent to `address`, or null if the inbox has none. */
export async function getLatestMessage(address: string): Promise<MailpitMessage | null> {
  const [latest] = await searchTo(address, 50);
  return latest ? getMessage(latest.ID) : null;
}

/** Ids of the messages sent to `address`, newest first. Take this before an action. */
export async function listMessageIds(address: string): Promise<string[]> {
  return (await searchTo(address, 500)).map((m) => m.ID);
}

/** Messages to `address` that are not in `knownIds` (from listMessageIds), newest first. */
export async function newMessagesTo(address: string, knownIds: string[]): Promise<MailpitMessage[]> {
  const known = new Set(knownIds);
  const fresh = (await searchTo(address, 500)).filter((m) => !known.has(m.ID));
  return Promise.all(fresh.map((m) => getMessage(m.ID)));
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
