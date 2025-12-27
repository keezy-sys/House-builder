import assert from "node:assert/strict";
import { test } from "node:test";
import { toThreadSummary } from "../lib/email/providers/gmail.mjs";
import { listThreads } from "../lib/email/providers/microsoft.mjs";

test("gmail thread summary extracts subject and participants", () => {
  const thread = {
    id: "thread-1",
    snippet: "Snippet",
    messages: [
      {
        id: "msg-1",
        internalDate: "1700000000000",
        payload: {
          headers: [
            { name: "Subject", value: "Projektstatus" },
            { name: "From", value: "Alice <alice@example.com>" },
            { name: "To", value: "Bob <bob@example.com>" },
          ],
        },
      },
    ],
  };
  const summary = toThreadSummary(thread);
  assert.equal(summary.id, "thread-1");
  assert.equal(summary.subject, "Projektstatus");
  assert.equal(summary.snippet, "Snippet");
  assert.equal(summary.participants.length, 2);
});

test("microsoft listThreads groups by conversationId", async () => {
  const originalFetch = global.fetch;
  global.fetch = async () => ({
    ok: true,
    json: async () => ({
      value: [
        {
          id: "m1",
          conversationId: "c1",
          subject: "Betreff",
          receivedDateTime: "2024-01-01T10:00:00Z",
          bodyPreview: "Hallo",
          from: { emailAddress: { address: "a@example.com", name: "A" } },
        },
        {
          id: "m2",
          conversationId: "c1",
          subject: "Betreff",
          receivedDateTime: "2024-01-01T11:00:00Z",
          bodyPreview: "Antwort",
          from: { emailAddress: { address: "b@example.com", name: "B" } },
        },
      ],
    }),
  });
  try {
    const threads = await listThreads({
      accessToken: "token",
      folderId: "folder",
      limit: 10,
    });
    assert.equal(threads.length, 1);
    assert.equal(threads[0].id, "c1");
  } finally {
    global.fetch = originalFetch;
  }
});
