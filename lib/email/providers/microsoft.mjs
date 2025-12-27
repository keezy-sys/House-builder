const GRAPH_BASE = "https://graph.microsoft.com/v1.0";

const getMicrosoftConfig = () => {
  const clientId = String(process.env.MICROSOFT_CLIENT_ID || "").trim();
  const clientSecret = String(process.env.MICROSOFT_CLIENT_SECRET || "").trim();
  const appBaseUrl = String(process.env.APP_BASE_URL || "").trim();
  const redirectUri = appBaseUrl
    ? appBaseUrl.endsWith("/")
      ? appBaseUrl
      : `${appBaseUrl}/`
    : "";
  return { clientId, clientSecret, redirectUri };
};

const buildAuthUrl = ({ state }) => {
  const { clientId, redirectUri } = getMicrosoftConfig();
  if (!clientId || !redirectUri) return null;
  const params = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    redirect_uri: redirectUri,
    response_mode: "query",
    scope: ["offline_access", "Mail.ReadWrite", "Mail.Send", "User.Read"].join(
      " ",
    ),
  });
  if (state) {
    params.set("state", state);
  }
  return `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?${params.toString()}`;
};

const exchangeCode = async ({ code }) => {
  const { clientId, clientSecret, redirectUri } = getMicrosoftConfig();
  if (!clientId || !clientSecret || !redirectUri) {
    const error = new Error("Missing Microsoft OAuth configuration.");
    error.statusCode = 500;
    throw error;
  }
  const response = await fetch(
    "https://login.microsoftonline.com/common/oauth2/v2.0/token",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
        code,
      }),
    },
  );
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
  const { clientId, clientSecret, redirectUri } = getMicrosoftConfig();
  if (!clientId || !clientSecret || !redirectUri) {
    const error = new Error("Missing Microsoft OAuth configuration.");
    error.statusCode = 500;
    throw error;
  }
  const response = await fetch(
    "https://login.microsoftonline.com/common/oauth2/v2.0/token",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "refresh_token",
        refresh_token: refreshTokenValue,
      }),
    },
  );
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data?.error_description || "Token refresh failed.");
    error.statusCode = response.status;
    throw error;
  }
  return data;
};

const graphRequest = async ({ accessToken, url, method = "GET", body }) => {
  const response = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data?.error?.message || "Microsoft Graph error.");
    error.statusCode = response.status;
    throw error;
  }
  return data;
};

const fetchProfile = async ({ accessToken }) =>
  graphRequest({ accessToken, url: `${GRAPH_BASE}/me` });

const normalizeFolderName = (name) => String(name || "").trim().toLowerCase();

const findFolderByName = (folders, targetName) => {
  if (!Array.isArray(folders)) return null;
  for (const folder of folders) {
    if (normalizeFolderName(folder?.displayName) === targetName) {
      return folder;
    }
    const children = Array.isArray(folder?.childFolders)
      ? folder.childFolders
      : [];
    const match = findFolderByName(children, targetName);
    if (match) return match;
  }
  return null;
};

const ensureLuganoFolder = async ({ accessToken }) => {
  const existing = await graphRequest({
    accessToken,
    url: `${GRAPH_BASE}/me/mailFolders?$top=100&$expand=childFolders($top=100)`,
  });
  const folders = Array.isArray(existing?.value) ? existing.value : [];
  const match = findFolderByName(folders, "lugano");
  if (match?.id) return match.id;
  try {
    const inboxChildren = await graphRequest({
      accessToken,
      url: `${GRAPH_BASE}/me/mailFolders/inbox/childFolders?$top=100`,
    });
    const inboxMatch = findFolderByName(inboxChildren?.value, "lugano");
    if (inboxMatch?.id) return inboxMatch.id;
  } catch {
    // Ignore and fall through to creation.
  }
  const created = await graphRequest({
    accessToken,
    url: `${GRAPH_BASE}/me/mailFolders`,
    method: "POST",
    body: { displayName: "Lugano" },
  });
  return created?.id || "";
};

const toParticipant = (recipient, role) => {
  const email = recipient?.emailAddress?.address || "";
  if (!email) return null;
  return {
    name: recipient?.emailAddress?.name || "",
    email,
    role,
  };
};

const collectParticipants = (message) => {
  const participants = [];
  const from = toParticipant(message?.from, "from");
  if (from) participants.push(from);
  (message?.toRecipients || []).forEach((recipient) => {
    const entry = toParticipant(recipient, "to");
    if (entry) participants.push(entry);
  });
  (message?.ccRecipients || []).forEach((recipient) => {
    const entry = toParticipant(recipient, "cc");
    if (entry) participants.push(entry);
  });
  const seen = new Set();
  return participants.filter((entry) => {
    const key = `${entry.email}-${entry.role}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const listFolderMessages = async ({
  accessToken,
  folderId,
  top = 30,
  filter,
  orderBy,
  select,
}) => {
  const url = new URL(`${GRAPH_BASE}/me/mailFolders/${folderId}/messages`);
  url.searchParams.set("$top", String(top));
  if (filter) url.searchParams.set("$filter", filter);
  if (orderBy) url.searchParams.set("$orderby", orderBy);
  if (select) url.searchParams.set("$select", select);
  const data = await graphRequest({ accessToken, url: url.toString() });
  return Array.isArray(data?.value) ? data.value : [];
};

const listThreads = async ({ accessToken, folderId, limit = 30 }) => {
  const messages = await listFolderMessages({
    accessToken,
    folderId,
    top: limit,
    orderBy: "receivedDateTime desc",
    select:
      "id,conversationId,subject,from,toRecipients,ccRecipients,receivedDateTime,bodyPreview",
  });
  const seen = new Set();
  const summaries = [];
  for (const message of messages) {
    const conversationId = message?.conversationId;
    if (!conversationId || seen.has(conversationId)) continue;
    seen.add(conversationId);
    summaries.push({
      id: conversationId,
      subject: message?.subject || "",
      snippet: message?.bodyPreview || "",
      lastMessageAt: message?.receivedDateTime || null,
      participants: collectParticipants(message),
    });
  }
  return summaries;
};

const fetchThreadSummary = async ({ accessToken, folderId, threadId }) => {
  const messages = await listFolderMessages({
    accessToken,
    folderId,
    top: 1,
    filter: `conversationId eq '${threadId}'`,
    orderBy: "receivedDateTime desc",
    select:
      "id,conversationId,subject,from,toRecipients,ccRecipients,receivedDateTime,bodyPreview",
  });
  const message = messages[0];
  if (!message) return null;
  return {
    id: message?.conversationId || "",
    subject: message?.subject || "",
    snippet: message?.bodyPreview || "",
    lastMessageAt: message?.receivedDateTime || null,
    participants: collectParticipants(message),
  };
};

const fetchThreadMessages = async ({
  accessToken,
  folderId,
  threadId,
  top = 50,
}) => {
  const messages = await listFolderMessages({
    accessToken,
    folderId,
    top,
    filter: `conversationId eq '${threadId}'`,
    orderBy: "receivedDateTime asc",
    select:
      "id,conversationId,subject,from,toRecipients,ccRecipients,receivedDateTime,body,bodyPreview",
  });
  return messages.map((message) => {
    const body = message?.body || {};
    const contentType = String(body?.contentType || "").toLowerCase();
    return {
      id: message?.id || "",
      threadId: message?.conversationId || "",
      sentAt: message?.receivedDateTime || null,
      from: toParticipant(message?.from, "from"),
      to: (message?.toRecipients || [])
        .map((recipient) => toParticipant(recipient, "to"))
        .filter(Boolean),
      cc: (message?.ccRecipients || [])
        .map((recipient) => toParticipant(recipient, "cc"))
        .filter(Boolean),
      subject: message?.subject || "",
      snippet: message?.bodyPreview || "",
      bodyHtml: contentType === "html" ? body?.content || null : null,
      bodyText: contentType === "text" ? body?.content || null : null,
    };
  });
};

const getLatestMessageId = async ({ accessToken, folderId, threadId }) => {
  const messages = await listFolderMessages({
    accessToken,
    folderId,
    top: 1,
    filter: `conversationId eq '${threadId}'`,
    orderBy: "receivedDateTime desc",
    select: "id",
  });
  return messages[0]?.id || "";
};

const sendReply = async ({ accessToken, folderId, threadId, body }) => {
  const latestMessageId = await getLatestMessageId({
    accessToken,
    folderId,
    threadId,
  });
  if (!latestMessageId) {
    const error = new Error("Thread not found in Lugano folder.");
    error.statusCode = 404;
    throw error;
  }
  const draft = await graphRequest({
    accessToken,
    url: `${GRAPH_BASE}/me/messages/${latestMessageId}/createReply`,
    method: "POST",
  });
  const draftId = draft?.id;
  if (!draftId) {
    const error = new Error("Failed to create reply draft.");
    error.statusCode = 502;
    throw error;
  }
  const contentType = body?.bodyHtml ? "HTML" : "Text";
  const content = body?.bodyHtml || body?.bodyText || "";
  await graphRequest({
    accessToken,
    url: `${GRAPH_BASE}/me/messages/${draftId}`,
    method: "PATCH",
    body: { body: { contentType, content } },
  });
  await graphRequest({
    accessToken,
    url: `${GRAPH_BASE}/me/messages/${draftId}/send`,
    method: "POST",
  });
  try {
    await graphRequest({
      accessToken,
      url: `${GRAPH_BASE}/me/messages/${draftId}/move`,
      method: "POST",
      body: { destinationId: folderId },
    });
  } catch {
    // Best effort: Sent Items may not be movable immediately.
  }
  return draftId;
};

export {
  buildAuthUrl,
  exchangeCode,
  fetchProfile,
  ensureLuganoFolder,
  listThreads,
  fetchThreadSummary,
  fetchThreadMessages,
  refreshToken,
  sendReply,
};
