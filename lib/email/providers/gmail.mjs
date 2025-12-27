const GMAIL_API_BASE = "https://gmail.googleapis.com/gmail/v1/users/me";

const getGoogleConfig = () => {
  const clientId = String(process.env.GOOGLE_CLIENT_ID || "").trim();
  const clientSecret = String(process.env.GOOGLE_CLIENT_SECRET || "").trim();
  const appBaseUrl = String(process.env.APP_BASE_URL || "").trim();
  const redirectUri = appBaseUrl
    ? appBaseUrl.endsWith("/")
      ? appBaseUrl
      : `${appBaseUrl}/`
    : "";
  return { clientId, clientSecret, redirectUri };
};

const buildAuthUrl = ({ state }) => {
  const { clientId, redirectUri } = getGoogleConfig();
  if (!clientId || !redirectUri) return null;
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    access_type: "offline",
    prompt: "consent",
    include_granted_scopes: "true",
    scope: [
      "https://www.googleapis.com/auth/gmail.modify",
      "https://www.googleapis.com/auth/gmail.send",
    ].join(" "),
  });
  if (state) {
    params.set("state", state);
  }
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
};

const exchangeCode = async ({ code }) => {
  const { clientId, clientSecret, redirectUri } = getGoogleConfig();
  if (!clientId || !clientSecret || !redirectUri) {
    const error = new Error("Missing Google OAuth configuration.");
    error.statusCode = 500;
    throw error;
  }

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
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

const refreshToken = async ({ refreshToken: refreshTokenValue }) => {
  const { clientId, clientSecret } = getGoogleConfig();
  if (!clientId || !clientSecret) {
    const error = new Error("Missing Google OAuth configuration.");
    error.statusCode = 500;
    throw error;
  }

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshTokenValue,
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

const fetchProfile = async ({ accessToken }) => {
  const response = await fetch(`${GMAIL_API_BASE}/profile`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) {
    const message = await response.text();
    const error = new Error(message || "Failed to fetch Gmail profile.");
    error.statusCode = response.status;
    throw error;
  }
  return response.json();
};

const ensureLuganoLabel = async ({ accessToken }) => {
  const response = await fetch(`${GMAIL_API_BASE}/labels`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(
      data?.error?.message || "Failed to load Gmail labels.",
    );
    error.statusCode = response.status;
    throw error;
  }
  const existing = Array.isArray(data?.labels)
    ? data.labels.find((label) => label?.name === "Lugano")
    : null;
  if (existing?.id) return existing.id;

  const createResponse = await fetch(`${GMAIL_API_BASE}/labels`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: "Lugano",
      labelListVisibility: "labelShow",
      messageListVisibility: "show",
    }),
  });
  const created = await createResponse.json().catch(() => ({}));
  if (!createResponse.ok) {
    const error = new Error(
      created?.error?.message || "Failed to create Lugano label.",
    );
    error.statusCode = createResponse.status;
    throw error;
  }
  return created?.id || "";
};

const decodeBase64Url = (value) =>
  Buffer.from(
    String(value || "")
      .replace(/-/g, "+")
      .replace(/_/g, "/"),
    "base64",
  )
    .toString("utf8")
    .trim();

const pickHeader = (headers, name) => {
  if (!Array.isArray(headers)) return "";
  const target = name.toLowerCase();
  const match = headers.find(
    (header) => String(header?.name || "").toLowerCase() === target,
  );
  return match ? String(match.value || "").trim() : "";
};

const parseAddressList = (raw, role) => {
  const value = String(raw || "").trim();
  if (!value) return [];
  return value
    .split(",")
    .map((entry) => {
      const chunk = entry.trim();
      if (!chunk) return null;
      const match = chunk.match(/^(.*)<([^>]+)>$/);
      if (match) {
        return {
          name: match[1].trim().replace(/^"|"$/g, ""),
          email: match[2].trim(),
          role,
        };
      }
      return { name: "", email: chunk, role };
    })
    .filter(Boolean);
};

const collectParticipants = (headers) => {
  const from = parseAddressList(pickHeader(headers, "From"), "from");
  const to = parseAddressList(pickHeader(headers, "To"), "to");
  const cc = parseAddressList(pickHeader(headers, "Cc"), "cc");
  const all = [...from, ...to, ...cc];
  const seen = new Set();
  return all.filter((entry) => {
    const key = `${entry.email}-${entry.role}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const extractBodyParts = (payload) => {
  if (!payload) return { html: "", text: "" };
  let html = "";
  let text = "";
  const walk = (part) => {
    if (!part) return;
    const mime = String(part.mimeType || "").toLowerCase();
    if (part.body?.data) {
      const decoded = decodeBase64Url(part.body.data);
      if (mime === "text/html" && !html) html = decoded;
      if (mime === "text/plain" && !text) text = decoded;
    }
    if (Array.isArray(part.parts)) {
      part.parts.forEach(walk);
    }
  };
  walk(payload);
  return { html, text };
};

const listThreads = async ({ accessToken, labelId, limit = 30, query }) => {
  const url = new URL(`${GMAIL_API_BASE}/threads`);
  url.searchParams.set("labelIds", labelId);
  url.searchParams.set("maxResults", String(limit));
  if (query) {
    url.searchParams.set("q", query);
  }
  const response = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(
      data?.error?.message || "Failed to list Gmail threads.",
    );
    error.statusCode = response.status;
    throw error;
  }
  return Array.isArray(data?.threads) ? data.threads : [];
};

const fetchThread = async ({ accessToken, threadId, format = "metadata" }) => {
  const url = new URL(
    `${GMAIL_API_BASE}/threads/${encodeURIComponent(threadId)}`,
  );
  url.searchParams.set("format", format);
  [
    "Subject",
    "From",
    "To",
    "Cc",
    "Date",
    "Message-Id",
    "Reply-To",
    "References",
  ].forEach((header) => url.searchParams.append("metadataHeaders", header));
  const response = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(
      data?.error?.message || "Failed to load Gmail thread.",
    );
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

const isThreadInLabel = (thread, labelId) => {
  const messages = Array.isArray(thread?.messages) ? thread.messages : [];
  return messages.some((message) =>
    Array.isArray(message?.labelIds)
      ? message.labelIds.includes(labelId)
      : false,
  );
};

const toThreadSummary = (thread) => {
  const latest = getLatestMessage(thread);
  const headers = latest?.payload?.headers || [];
  const subject = pickHeader(headers, "Subject");
  const snippet = String(thread?.snippet || "").trim();
  const lastMessageAt = latest?.internalDate
    ? new Date(Number(latest.internalDate)).toISOString()
    : null;
  return {
    id: thread?.id || "",
    subject,
    snippet,
    lastMessageAt,
    participants: collectParticipants(headers),
  };
};

const toEmailMessages = (thread) => {
  const messages = Array.isArray(thread?.messages) ? thread.messages : [];
  return messages.map((message) => {
    const headers = message?.payload?.headers || [];
    const body = extractBodyParts(message?.payload || {});
    const subject = pickHeader(headers, "Subject");
    return {
      id: message?.id || "",
      threadId: message?.threadId || "",
      sentAt: message?.internalDate
        ? new Date(Number(message.internalDate)).toISOString()
        : null,
      from: parseAddressList(pickHeader(headers, "From"), "from")[0] || null,
      to: parseAddressList(pickHeader(headers, "To"), "to"),
      cc: parseAddressList(pickHeader(headers, "Cc"), "cc"),
      subject,
      snippet: message?.snippet || "",
      bodyHtml: body.html || null,
      bodyText: body.text || null,
    };
  });
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

const sendReply = async ({ accessToken, threadId, labelId, bodyText }) => {
  const thread = await fetchThread({
    accessToken,
    threadId,
    format: "metadata",
  });
  if (!isThreadInLabel(thread, labelId)) {
    const error = new Error("Thread not in Lugano label.");
    error.statusCode = 403;
    throw error;
  }
  const latest = getLatestMessage(thread);
  const headers = latest?.payload?.headers || [];
  const subject = pickHeader(headers, "Subject");
  const replyTo = pickHeader(headers, "Reply-To");
  const from = pickHeader(headers, "From");
  const messageId = pickHeader(headers, "Message-Id");
  const references = pickHeader(headers, "References");
  const to = replyTo || from;
  if (!to || !messageId) {
    const error = new Error("Thread missing reply headers.");
    error.statusCode = 502;
    throw error;
  }
  const replyRaw = buildReplyRaw({
    to,
    subject,
    messageId,
    references: references ? `${references} ${messageId}` : messageId,
    body: bodyText,
  });
  const response = await fetch(`${GMAIL_API_BASE}/messages/send`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      raw: replyRaw,
      threadId,
      labelIds: [labelId],
    }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(
      data?.error?.message || "Failed to send Gmail reply.",
    );
    error.statusCode = response.status;
    throw error;
  }
  return data?.id || "";
};

export {
  buildAuthUrl,
  exchangeCode,
  fetchProfile,
  ensureLuganoLabel,
  listThreads,
  fetchThread,
  refreshToken,
  isThreadInLabel,
  toThreadSummary,
  toEmailMessages,
  sendReply,
};
