import { decrypt, encrypt } from "../crypto.mjs";
import {
  fetchThread as fetchGmailThread,
  isThreadInLabel,
  listThreads as listGmailThreads,
  refreshToken as refreshGmailToken,
  sendReply as sendGmailReply,
  toEmailMessages as gmailToEmailMessages,
  toThreadSummary as gmailToThreadSummary,
} from "./providers/gmail.mjs";
import {
  fetchThreadMessages as fetchMicrosoftThreadMessages,
  fetchThreadSummary as fetchMicrosoftThreadSummary,
  listThreads as listMicrosoftThreads,
  refreshToken as refreshMicrosoftToken,
  sendReply as sendMicrosoftReply,
} from "./providers/microsoft.mjs";

const updateEmailAccount = async ({
  supabaseConfig,
  accessToken,
  accountId,
  payload,
}) => {
  const response = await fetch(
    `${supabaseConfig.supabaseUrl}/rest/v1/email_accounts?id=eq.${accountId}`,
    {
      method: "PATCH",
      headers: {
        apikey: supabaseConfig.supabaseAnonKey,
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify(payload),
    },
  );
  if (!response.ok) {
    const message = await response.text();
    const error = new Error(message || "Supabase update failed.");
    error.statusCode = response.status;
    throw error;
  }
  return response.json().catch(() => []);
};

const ensureAccessToken = async ({
  supabaseConfig,
  accessToken,
  account,
  provider,
}) => {
  const decryptedAccess = decrypt(account?.access_token_enc);
  if (!decryptedAccess) return { accessToken: "" };
  if (!account?.token_expires_at) {
    return { accessToken: decryptedAccess };
  }
  const expiresAt = new Date(account.token_expires_at).getTime();
  if (!Number.isFinite(expiresAt)) {
    return { accessToken: decryptedAccess };
  }
  if (expiresAt > Date.now() + 60_000) {
    return { accessToken: decryptedAccess };
  }
  const decryptedRefresh = decrypt(account?.refresh_token_enc);
  if (!decryptedRefresh) {
    return { accessToken: decryptedAccess };
  }

  const refresh =
    provider === "gmail" ? refreshGmailToken : refreshMicrosoftToken;
  const refreshed = await refresh({ refreshToken: decryptedRefresh });
  const updatedExpiresAt = refreshed.expires_in
    ? new Date(Date.now() + refreshed.expires_in * 1000).toISOString()
    : account.token_expires_at;

  const payload = {
    access_token_enc: encrypt(refreshed.access_token),
    token_expires_at: updatedExpiresAt,
    updated_at: new Date().toISOString(),
  };
  if (refreshed.refresh_token) {
    payload.refresh_token_enc = encrypt(refreshed.refresh_token);
  }
  if (refreshed.scope) {
    payload.scopes = String(refreshed.scope)
      .split(" ")
      .map((scope) => scope.trim())
      .filter(Boolean);
  }
  await updateEmailAccount({
    supabaseConfig,
    accessToken,
    accountId: account.id,
    payload,
  });
  return { accessToken: refreshed.access_token };
};

const loadEmailClient = async ({
  supabaseConfig,
  accessToken,
  account,
}) => {
  if (!account?.access_token_enc) {
    const error = new Error("Email not connected.");
    error.statusCode = 404;
    throw error;
  }
  if (account.is_paused) {
    const error = new Error("Email integration paused.");
    error.statusCode = 423;
    error.code = "email_paused";
    throw error;
  }
  const provider = account.provider;
  const refreshed = await ensureAccessToken({
    supabaseConfig,
    accessToken,
    account,
    provider,
  });
  const effectiveAccessToken = refreshed.accessToken || decrypt(account.access_token_enc);
  const luganoContainerId = account.lugano_container_id;
  if (!luganoContainerId) {
    const error = new Error("Lugano container missing.");
    error.statusCode = 400;
    throw error;
  }

  if (provider === "gmail") {
    return {
      provider,
      account,
      listLuganoThreads: async ({ limit, q }) => {
        const threads = await listGmailThreads({
          accessToken: effectiveAccessToken,
          labelId: luganoContainerId,
          limit,
          query: q,
        });
        const summaries = [];
        for (const thread of threads) {
          const full = await fetchGmailThread({
            accessToken: effectiveAccessToken,
            threadId: thread.id,
            format: "metadata",
          });
          if (!isThreadInLabel(full, luganoContainerId)) continue;
          summaries.push(gmailToThreadSummary(full));
        }
        return summaries;
      },
      getThreadSummary: async (threadId) => {
        const full = await fetchGmailThread({
          accessToken: effectiveAccessToken,
          threadId,
          format: "metadata",
        });
        if (!isThreadInLabel(full, luganoContainerId)) {
          const error = new Error("Thread not in Lugano label.");
          error.statusCode = 403;
          throw error;
        }
        return gmailToThreadSummary(full);
      },
      getThreadMessages: async (threadId) => {
        const full = await fetchGmailThread({
          accessToken: effectiveAccessToken,
          threadId,
          format: "full",
        });
        if (!isThreadInLabel(full, luganoContainerId)) {
          const error = new Error("Thread not in Lugano label.");
          error.statusCode = 403;
          throw error;
        }
        return gmailToEmailMessages(full);
      },
      reply: async (threadId, payload) =>
        sendGmailReply({
          accessToken: effectiveAccessToken,
          threadId,
          labelId: luganoContainerId,
          bodyText: payload.bodyText || payload.bodyHtml || "",
        }),
    };
  }

  if (provider === "microsoft") {
    return {
      provider,
      account,
      listLuganoThreads: async ({ limit }) =>
        listMicrosoftThreads({
          accessToken: effectiveAccessToken,
          folderId: luganoContainerId,
          limit,
        }),
      getThreadSummary: async (threadId) =>
        fetchMicrosoftThreadSummary({
          accessToken: effectiveAccessToken,
          folderId: luganoContainerId,
          threadId,
        }),
      getThreadMessages: async (threadId) =>
        fetchMicrosoftThreadMessages({
          accessToken: effectiveAccessToken,
          folderId: luganoContainerId,
          threadId,
        }),
      reply: async (threadId, payload) =>
        sendMicrosoftReply({
          accessToken: effectiveAccessToken,
          folderId: luganoContainerId,
          threadId,
          body: payload,
        }),
    };
  }

  const error = new Error("Unknown provider.");
  error.statusCode = 400;
  throw error;
};

export { loadEmailClient };
