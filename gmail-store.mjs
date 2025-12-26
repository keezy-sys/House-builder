import { readFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const SHARED_STATE_TABLE = "house_state";
const SHARED_STATE_ID = "default";
const GMAIL_ACCOUNTS_TABLE = "gmail_accounts";
const CONFIG_PATH = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "config.js",
);

const GMAIL_SCOPES = [
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/gmail.send",
];

let cachedConfig = null;

const buildError = (statusCode, error, code) => ({
  statusCode,
  payload: {
    error,
    code,
  },
});

const getHeaderValue = (headers, name) => {
  if (!headers) return "";
  const target = name.toLowerCase();
  const entry = Object.entries(headers).find(
    ([key]) => key.toLowerCase() === target,
  );
  return entry ? String(entry[1] || "") : "";
};

const extractAccessToken = (headers) => {
  const raw = getHeaderValue(headers, "authorization");
  if (!raw) return "";
  const match = raw.match(/^Bearer\s+(.+)$/i);
  return match ? match[1].trim() : "";
};

const parseConfigValue = (content, key) => {
  const pattern = new RegExp(`window\\.__${key}__\\s*=\\s*["']([^"']+)["']`);
  const match = content.match(pattern);
  return match ? match[1] : "";
};

const resolveSupabaseConfig = async () => {
  if (cachedConfig) return cachedConfig;
  const supabaseUrl = String(process.env.SUPABASE_URL || "").trim();
  const supabaseAnonKey = String(process.env.SUPABASE_ANON_KEY || "").trim();

  if (supabaseUrl && supabaseAnonKey) {
    cachedConfig = { supabaseUrl, supabaseAnonKey };
    return cachedConfig;
  }

  try {
    const content = await readFile(CONFIG_PATH, "utf8");
    const urlFromFile = parseConfigValue(content, "SUPABASE_URL");
    const keyFromFile = parseConfigValue(content, "SUPABASE_ANON_KEY");
    cachedConfig = {
      supabaseUrl: urlFromFile || supabaseUrl,
      supabaseAnonKey: keyFromFile || supabaseAnonKey,
    };
    return cachedConfig;
  } catch {
    cachedConfig = { supabaseUrl, supabaseAnonKey };
    return cachedConfig;
  }
};

const getGoogleConfig = () => {
  const clientId = String(process.env.GOOGLE_CLIENT_ID || "").trim();
  const clientSecret = String(process.env.GOOGLE_CLIENT_SECRET || "").trim();
  const redirectUri = String(process.env.GOOGLE_REDIRECT_URI || "").trim();
  return { clientId, clientSecret, redirectUri };
};

const getSupabaseUser = async ({
  supabaseUrl,
  supabaseAnonKey,
  accessToken,
}) => {
  const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${accessToken}`,
    },
  });
  if (!response.ok) {
    const message = await response.text();
    const error = new Error(message || "Supabase auth failed.");
    error.statusCode = response.status;
    throw error;
  }
  return response.json();
};

const fetchHouseState = async ({
  supabaseUrl,
  supabaseAnonKey,
  accessToken,
}) => {
  const response = await fetch(
    `${supabaseUrl}/rest/v1/${SHARED_STATE_TABLE}?id=eq.${SHARED_STATE_ID}&select=data`,
    {
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
    },
  );

  if (!response.ok) {
    const message = await response.text();
    const error = new Error(message || "Supabase request failed.");
    error.statusCode = response.status;
    throw error;
  }

  const data = await response.json();
  return data?.[0]?.data ?? null;
};

const fetchGmailAccount = async ({
  supabaseUrl,
  supabaseAnonKey,
  accessToken,
  userId,
}) => {
  const response = await fetch(
    `${supabaseUrl}/rest/v1/${GMAIL_ACCOUNTS_TABLE}?user_id=eq.${userId}&select=user_id,email,access_token,refresh_token,token_type,scope,expires_at,updated_at`,
    {
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
    },
  );

  if (!response.ok) {
    const message = await response.text();
    const error = new Error(message || "Supabase request failed.");
    error.statusCode = response.status;
    throw error;
  }

  const data = await response.json();
  return data?.[0] || null;
};

const upsertGmailAccount = async ({
  supabaseUrl,
  supabaseAnonKey,
  accessToken,
  payload,
}) => {
  const response = await fetch(
    `${supabaseUrl}/rest/v1/${GMAIL_ACCOUNTS_TABLE}?on_conflict=user_id`,
    {
      method: "POST",
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates",
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
};

const deleteGmailAccount = async ({
  supabaseUrl,
  supabaseAnonKey,
  accessToken,
  userId,
}) => {
  const response = await fetch(
    `${supabaseUrl}/rest/v1/${GMAIL_ACCOUNTS_TABLE}?user_id=eq.${userId}`,
    {
      method: "DELETE",
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  if (!response.ok) {
    const message = await response.text();
    const error = new Error(message || "Supabase delete failed.");
    error.statusCode = response.status;
    throw error;
  }
};

const buildGoogleAuthUrl = ({ state }) => {
  const { clientId, redirectUri } = getGoogleConfig();
  if (!clientId || !redirectUri) {
    return null;
  }
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    access_type: "offline",
    prompt: "consent",
    include_granted_scopes: "true",
    scope: GMAIL_SCOPES.join(" "),
  });
  if (state) {
    params.set("state", state);
  }
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
};

const exchangeCodeForTokens = async ({ code }) => {
  const { clientId, clientSecret, redirectUri } = getGoogleConfig();
  if (!clientId || !clientSecret || !redirectUri) {
    const error = new Error("Missing Google OAuth configuration.");
    error.statusCode = 500;
    throw error;
  }

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(
      data?.error_description || "Token exchange failed.",
    );
    error.statusCode = response.status;
    throw error;
  }
  return data;
};

const refreshAccessToken = async ({ refreshToken }) => {
  const { clientId, clientSecret } = getGoogleConfig();
  if (!clientId || !clientSecret) {
    const error = new Error("Missing Google OAuth configuration.");
    error.statusCode = 500;
    throw error;
  }

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data?.error_description || "Token refresh failed.");
    error.statusCode = response.status;
    throw error;
  }
  return data;
};

const fetchGmailProfile = async ({ accessToken }) => {
  const response = await fetch(
    "https://gmail.googleapis.com/gmail/v1/users/me/profile",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  if (!response.ok) {
    const message = await response.text();
    const error = new Error(message || "Failed to fetch Gmail profile.");
    error.statusCode = response.status;
    throw error;
  }

  return response.json();
};

const pickHeader = (headers, name) => {
  if (!Array.isArray(headers)) return "";
  const target = name.toLowerCase();
  const match = headers.find(
    (header) => String(header?.name || "").toLowerCase() === target,
  );
  return match ? String(match.value || "").trim() : "";
};

const normalizeThread = (thread) => {
  const messages = Array.isArray(thread?.messages)
    ? thread.messages.map((message) => {
        const headers = message?.payload?.headers || [];
        const internalDate = message?.internalDate
          ? new Date(Number(message.internalDate)).toISOString()
          : null;
        return {
          id: message?.id || "",
          threadId: message?.threadId || "",
          snippet: message?.snippet || "",
          internalDate,
          headers: {
            subject: pickHeader(headers, "Subject"),
            from: pickHeader(headers, "From"),
            to: pickHeader(headers, "To"),
            date: pickHeader(headers, "Date"),
            messageId: pickHeader(headers, "Message-Id"),
            replyTo: pickHeader(headers, "Reply-To"),
            references: pickHeader(headers, "References"),
          },
        };
      })
    : [];

  const subject =
    messages.find((message) => message.headers.subject)?.headers.subject || "";
  const lastMessageAt =
    messages.length > 0 ? messages[messages.length - 1].internalDate : null;

  return {
    id: thread?.id || "",
    historyId: thread?.historyId || "",
    snippet: thread?.snippet || "",
    subject,
    lastMessageAt,
    messageCount: messages.length,
    messages,
  };
};

const fetchThread = async ({ accessToken, threadId }) => {
  const url = new URL(
    `https://gmail.googleapis.com/gmail/v1/users/me/threads/${encodeURIComponent(
      threadId,
    )}`,
  );
  url.searchParams.set("format", "metadata");
  [
    "Subject",
    "From",
    "To",
    "Date",
    "Message-Id",
    "Reply-To",
    "References",
  ].forEach((header) => url.searchParams.append("metadataHeaders", header));

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data?.error?.message || "Failed to load thread.");
    error.statusCode = response.status;
    throw error;
  }
  return data;
};

const getLatestMessage = (thread) => {
  const messages = Array.isArray(thread?.messages) ? thread.messages : [];
  return messages.reduce((latest, message) => {
    const current = Number(message?.internalDate || 0);
    if (!latest) return message;
    const latestDate = Number(latest?.internalDate || 0);
    return current >= latestDate ? message : latest;
  }, null);
};

const buildReplyRaw = ({ to, subject, messageId, references, body }) => {
  const normalizedSubject = subject?.toLowerCase().startsWith("re:")
    ? subject
    : `Re: ${subject || ""}`.trim();
  const headers = [
    `To: ${to}`,
    `Subject: ${normalizedSubject}`,
    `In-Reply-To: ${messageId}`,
    `References: ${references}`,
    'Content-Type: text/plain; charset="UTF-8"',
    "Content-Transfer-Encoding: 7bit",
  ];
  const raw = `${headers.join("\r\n")}\r\n\r\n${body}`;
  return Buffer.from(raw)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
};

const extractPinnedThread = (payload, threadId) => {
  const tasks = Array.isArray(payload?.tasks) ? payload.tasks : [];
  return tasks.find((task) => {
    const thread = task?.gmailThread;
    if (!thread || typeof thread !== "object") return false;
    const id =
      typeof thread.id === "string"
        ? thread.id.trim()
        : typeof thread.threadId === "string"
          ? thread.threadId.trim()
          : "";
    return id && id === threadId;
  });
};

const ensureAccessToken = async ({ supabaseConfig, accessToken, account }) => {
  if (!account?.access_token) return { accessToken: "" };
  if (!account.expires_at) {
    return { accessToken: account.access_token };
  }
  const expiresAt = new Date(account.expires_at).getTime();
  if (!Number.isFinite(expiresAt)) {
    return { accessToken: account.access_token };
  }
  if (expiresAt > Date.now() + 60_000) {
    return { accessToken: account.access_token };
  }
  if (!account.refresh_token) {
    return { accessToken: account.access_token };
  }

  const refreshed = await refreshAccessToken({
    refreshToken: account.refresh_token,
  });
  const updatedExpiresAt = refreshed.expires_in
    ? new Date(Date.now() + refreshed.expires_in * 1000).toISOString()
    : account.expires_at;
  await upsertGmailAccount({
    supabaseUrl: supabaseConfig.supabaseUrl,
    supabaseAnonKey: supabaseConfig.supabaseAnonKey,
    accessToken,
    payload: {
      user_id: account.user_id,
      access_token: refreshed.access_token,
      token_type: refreshed.token_type || account.token_type || "Bearer",
      scope: refreshed.scope || account.scope || "",
      expires_at: updatedExpiresAt,
      updated_at: new Date().toISOString(),
    },
  });
  return { accessToken: refreshed.access_token };
};

const handleGmailApi = async ({ method, urlPath, headers, body, query }) => {
  if (!urlPath?.startsWith("/api/gmail")) return null;
  const normalizedMethod = String(method || "").toUpperCase();

  const supabaseConfig = await resolveSupabaseConfig();
  if (!supabaseConfig.supabaseUrl || !supabaseConfig.supabaseAnonKey) {
    return buildError(
      500,
      "Supabase configuration missing.",
      "missing_supabase_config",
    );
  }

  if (urlPath === "/api/gmail/auth") {
    if (normalizedMethod !== "GET") {
      return buildError(405, "Method not allowed.", "method_not_allowed");
    }
    const state = query?.get?.("state") || "";
    const authUrl = buildGoogleAuthUrl({ state });
    if (!authUrl) {
      return buildError(
        500,
        "Google OAuth configuration missing.",
        "missing_google_config",
      );
    }
    return { statusCode: 200, payload: { url: authUrl } };
  }

  const accessToken = extractAccessToken(headers);
  if (!accessToken) {
    return buildError(401, "Missing access token.", "missing_access_token");
  }

  let user;
  try {
    user = await getSupabaseUser({ ...supabaseConfig, accessToken });
  } catch (error) {
    return buildError(
      error.statusCode || 401,
      "Invalid access token.",
      "invalid_access_token",
    );
  }

  if (urlPath === "/api/gmail/status") {
    if (normalizedMethod !== "GET") {
      return buildError(405, "Method not allowed.", "method_not_allowed");
    }
    try {
      const account = await fetchGmailAccount({
        ...supabaseConfig,
        accessToken,
        userId: user.id,
      });
      return {
        statusCode: 200,
        payload: {
          connected: Boolean(account?.access_token),
          email: account?.email || "",
        },
      };
    } catch (error) {
      return buildError(
        error.statusCode || 502,
        "Failed to load Gmail status.",
        "gmail_status_error",
      );
    }
  }

  if (urlPath === "/api/gmail/token") {
    if (normalizedMethod !== "POST") {
      return buildError(405, "Method not allowed.", "method_not_allowed");
    }
    const code = String(body?.code || "").trim();
    if (!code) {
      return buildError(400, "Missing auth code.", "missing_code");
    }
    try {
      const tokens = await exchangeCodeForTokens({ code });
      const expiresAt = tokens.expires_in
        ? new Date(Date.now() + tokens.expires_in * 1000).toISOString()
        : null;
      const profile = await fetchGmailProfile({
        accessToken: tokens.access_token,
      });
      await upsertGmailAccount({
        ...supabaseConfig,
        accessToken,
        payload: {
          user_id: user.id,
          email: profile?.emailAddress || user.email || "",
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token || null,
          token_type: tokens.token_type || "Bearer",
          scope: tokens.scope || "",
          expires_at: expiresAt,
          updated_at: new Date().toISOString(),
        },
      });
      return {
        statusCode: 200,
        payload: {
          connected: true,
          email: profile?.emailAddress || user.email || "",
        },
      };
    } catch (error) {
      return buildError(
        error.statusCode || 502,
        error.message || "Failed to connect Gmail.",
        "gmail_token_error",
      );
    }
  }

  if (urlPath === "/api/gmail/account") {
    if (normalizedMethod !== "DELETE") {
      return buildError(405, "Method not allowed.", "method_not_allowed");
    }
    try {
      await deleteGmailAccount({
        ...supabaseConfig,
        accessToken,
        userId: user.id,
      });
      return {
        statusCode: 200,
        payload: { connected: false },
      };
    } catch (error) {
      return buildError(
        error.statusCode || 502,
        "Failed to disconnect Gmail.",
        "gmail_disconnect_error",
      );
    }
  }

  const threadMatch = urlPath.match(/^\/api\/gmail\/thread\/([^/]+)(.*)?$/);
  if (!threadMatch) {
    return buildError(404, "Not found.", "not_found");
  }
  const threadId = decodeURIComponent(threadMatch[1] || "");
  const suffix = threadMatch[2] || "";

  let payload;
  try {
    payload = await fetchHouseState({ ...supabaseConfig, accessToken });
  } catch (error) {
    return buildError(
      error.statusCode || 502,
      "Failed to load tasks.",
      "supabase_error",
    );
  }

  const pinnedTask = extractPinnedThread(payload, threadId);
  if (!pinnedTask) {
    return buildError(404, "Thread not pinned.", "thread_not_pinned");
  }

  const ownerId = pinnedTask?.gmailThread?.ownerId;
  if (ownerId && ownerId !== user.id) {
    return buildError(403, "Thread not owned.", "thread_forbidden");
  }

  let account;
  try {
    account = await fetchGmailAccount({
      ...supabaseConfig,
      accessToken,
      userId: user.id,
    });
  } catch (error) {
    return buildError(
      error.statusCode || 502,
      "Failed to load Gmail account.",
      "gmail_account_error",
    );
  }

  if (!account?.access_token) {
    return buildError(404, "Gmail not connected.", "gmail_not_connected");
  }

  let effectiveAccessToken = account.access_token;
  try {
    const refreshed = await ensureAccessToken({
      supabaseConfig,
      accessToken,
      account,
    });
    effectiveAccessToken = refreshed.accessToken || effectiveAccessToken;
  } catch (error) {
    return buildError(
      error.statusCode || 502,
      "Failed to refresh Gmail token.",
      "gmail_refresh_error",
    );
  }

  if (!suffix || suffix === "") {
    if (normalizedMethod !== "GET") {
      return buildError(405, "Method not allowed.", "method_not_allowed");
    }
    try {
      const thread = await fetchThread({
        accessToken: effectiveAccessToken,
        threadId,
      });
      return {
        statusCode: 200,
        payload: {
          thread: normalizeThread(thread),
        },
      };
    } catch (error) {
      return buildError(
        error.statusCode || 502,
        error.message || "Failed to load Gmail thread.",
        "gmail_thread_error",
      );
    }
  }

  if (suffix === "/reply") {
    if (normalizedMethod !== "POST") {
      return buildError(405, "Method not allowed.", "method_not_allowed");
    }
    const replyText = String(
      body?.message || body?.text || body?.body || "",
    ).trim();
    if (!replyText) {
      return buildError(400, "Missing reply body.", "missing_reply");
    }

    try {
      const thread = await fetchThread({
        accessToken: effectiveAccessToken,
        threadId,
      });
      const latest = getLatestMessage(thread);
      if (!latest?.payload?.headers) {
        return buildError(
          502,
          "Missing thread headers.",
          "missing_thread_headers",
        );
      }

      const headers = latest.payload.headers;
      const subject = pickHeader(headers, "Subject");
      const replyTo = pickHeader(headers, "Reply-To");
      const from = pickHeader(headers, "From");
      const messageId = pickHeader(headers, "Message-Id");
      const references = pickHeader(headers, "References");
      const to = replyTo || from;

      if (!to || !messageId) {
        return buildError(
          502,
          "Thread missing reply headers.",
          "missing_reply_headers",
        );
      }

      const replyRaw = buildReplyRaw({
        to,
        subject,
        messageId,
        references: references ? `${references} ${messageId}` : messageId,
        body: replyText,
      });

      const sendResponse = await fetch(
        "https://gmail.googleapis.com/gmail/v1/users/me/messages/send",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${effectiveAccessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            raw: replyRaw,
            threadId,
          }),
        },
      );

      const sendData = await sendResponse.json().catch(() => ({}));
      if (!sendResponse.ok) {
        return buildError(
          sendResponse.status,
          sendData?.error?.message || "Failed to send reply.",
          "gmail_reply_error",
        );
      }

      return {
        statusCode: 200,
        payload: {
          sent: true,
          messageId: sendData?.id || "",
        },
      };
    } catch (error) {
      return buildError(
        error.statusCode || 502,
        error.message || "Failed to send reply.",
        "gmail_reply_error",
      );
    }
  }

  return buildError(404, "Not found.", "not_found");
};

export { handleGmailApi };
