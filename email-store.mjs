import qrcode from "qrcode";
import { authenticator } from "otplib";
import {
  decrypt,
  encrypt,
  generateRandomHex,
  hashValue,
} from "./lib/crypto.mjs";
import { loadEmailClient } from "./lib/email/client.mjs";
import { translate } from "./lib/translate.mjs";
import * as gmailProvider from "./lib/email/providers/gmail.mjs";
import * as microsoftProvider from "./lib/email/providers/microsoft.mjs";
import {
  fetchHouseState,
  getSupabaseUser,
  resolveSupabaseConfig,
} from "./lib/supabase.mjs";

const EMAIL_ACCOUNTS_TABLE = "email_accounts";
const EMAIL_THREAD_LINKS_TABLE = "email_thread_links";
const EMAIL_MESSAGES_CACHE_TABLE = "email_messages_cache";
const EMAIL_ACTIVITY_LOG_TABLE = "email_activity_log";
const TASK_REGISTRY_TABLE = "task_registry";
const SECURITY_TABLE = "user_security_settings";
const REAUTH_MAX_AGE_MINUTES = 24 * 60;

const PROVIDERS = {
  gmail: {
    id: "gmail",
    buildAuthUrl: gmailProvider.buildAuthUrl,
    exchangeCode: gmailProvider.exchangeCode,
    fetchProfile: gmailProvider.fetchProfile,
    ensureLuganoContainer: gmailProvider.ensureLuganoLabel,
  },
  microsoft: {
    id: "microsoft",
    buildAuthUrl: microsoftProvider.buildAuthUrl,
    exchangeCode: microsoftProvider.exchangeCode,
    fetchProfile: microsoftProvider.fetchProfile,
    ensureLuganoContainer: microsoftProvider.ensureLuganoFolder,
  },
};

const buildError = (statusCode, error, code, extra = {}) => ({
  statusCode,
  payload: {
    error,
    code,
    ...extra,
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

const parseProvider = (value) => {
  const key = String(value || "")
    .trim()
    .toLowerCase();
  return PROVIDERS[key] ? key : "";
};

const stripHtml = (value) => {
  const raw = String(value || "");
  if (!raw) return "";
  const withoutScripts = raw
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, " ");
  const withBreaks = withoutScripts
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n");
  const withoutTags = withBreaks.replace(/<[^>]+>/g, " ");
  return withoutTags
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#39;/gi, "'")
    .replace(/&quot;/gi, '"')
    .replace(/\s+\n/g, "\n")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
};

const resolveMessageText = (message) => {
  if (!message) return "";
  const bodyText = String(message.bodyText || "").trim();
  if (bodyText) return bodyText;
  const bodyHtml = String(message.bodyHtml || "").trim();
  if (bodyHtml) return stripHtml(bodyHtml);
  const snippet = String(message.snippet || "").trim();
  return snippet;
};

const supabaseRequest = async ({
  supabaseConfig,
  accessToken,
  path,
  method = "GET",
  body,
  prefer,
}) => {
  const response = await fetch(
    `${supabaseConfig.supabaseUrl}/rest/v1/${path}`,
    {
      method,
      headers: {
        apikey: supabaseConfig.supabaseAnonKey,
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(prefer ? { Prefer: prefer } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    },
  );
  if (!response.ok) {
    const message = await response.text();
    const error = new Error(message || "Supabase request failed.");
    error.statusCode = response.status;
    throw error;
  }
  return response.json().catch(() => []);
};

const fetchEmailAccount = async ({
  supabaseConfig,
  accessToken,
  userId,
  provider,
}) => {
  const rows = await supabaseRequest({
    supabaseConfig,
    accessToken,
    path: `${EMAIL_ACCOUNTS_TABLE}?user_id=eq.${userId}&provider=eq.${provider}&select=*`,
  });
  return rows?.[0] || null;
};

const fetchEmailAccounts = async ({ supabaseConfig, accessToken, userId }) =>
  supabaseRequest({
    supabaseConfig,
    accessToken,
    path: `${EMAIL_ACCOUNTS_TABLE}?user_id=eq.${userId}&select=id,provider,email_address,is_paused,lugano_container_id,updated_at`,
  });

const upsertEmailAccount = async ({ supabaseConfig, accessToken, payload }) =>
  supabaseRequest({
    supabaseConfig,
    accessToken,
    method: "POST",
    path: `${EMAIL_ACCOUNTS_TABLE}?on_conflict=user_id,provider`,
    prefer: "resolution=merge-duplicates,return=representation",
    body: payload,
  });

const buildMessageCacheRows = (messages, linkId) =>
  (messages || [])
    .map((message) => {
      const providerId = String(message?.id || "").trim();
      if (!providerId) return null;
      return {
        thread_link_id: linkId,
        provider_message_id: providerId,
        sent_at: message?.sentAt || null,
        from: message?.from || null,
        to: Array.isArray(message?.to) ? message.to : [],
        cc: Array.isArray(message?.cc) ? message.cc : [],
        subject: message?.subject || "",
        snippet: message?.snippet || "",
        body_html: message?.bodyHtml || null,
        body_text: resolveMessageText(message) || null,
      };
    })
    .filter(Boolean);

const upsertMessageCache = async ({ supabaseConfig, accessToken, rows }) => {
  if (!rows?.length) return;
  await supabaseRequest({
    supabaseConfig,
    accessToken,
    method: "POST",
    path: `${EMAIL_MESSAGES_CACHE_TABLE}?on_conflict=thread_link_id,provider_message_id`,
    prefer: "resolution=merge-duplicates",
    body: rows,
  });
};

const fetchCachedMessages = async ({ supabaseConfig, accessToken, linkId }) =>
  supabaseRequest({
    supabaseConfig,
    accessToken,
    path: `${EMAIL_MESSAGES_CACHE_TABLE}?thread_link_id=eq.${linkId}&select=*&order=sent_at.asc`,
  });

const toCachedMessageResponse = (row, threadId) => ({
  id: row?.provider_message_id || "",
  threadId,
  sentAt: row?.sent_at || null,
  from: row?.from || null,
  to: Array.isArray(row?.to) ? row.to : [],
  cc: Array.isArray(row?.cc) ? row.cc : [],
  subject: row?.subject || "",
  snippet: row?.snippet || "",
  bodyHtml: row?.body_html || null,
  bodyText: row?.body_text || null,
  messageCacheId: row?.id || null,
  translations:
    row?.translations && typeof row.translations === "object"
      ? row.translations
      : {},
  detectedLanguage: row?.detected_language || null,
});

const ensureTaskRegistryId = async ({
  supabaseConfig,
  accessToken,
  legacyTaskId,
}) => {
  const existing = await supabaseRequest({
    supabaseConfig,
    accessToken,
    path: `${TASK_REGISTRY_TABLE}?legacy_task_id=eq.${encodeURIComponent(
      legacyTaskId,
    )}&select=id`,
  });
  if (existing?.[0]?.id) return existing[0].id;
  const inserted = await supabaseRequest({
    supabaseConfig,
    accessToken,
    method: "POST",
    path: `${TASK_REGISTRY_TABLE}?on_conflict=legacy_task_id`,
    prefer: "resolution=merge-duplicates,return=representation",
    body: { legacy_task_id: legacyTaskId },
  });
  if (inserted?.[0]?.id) return inserted[0].id;
  const retry = await supabaseRequest({
    supabaseConfig,
    accessToken,
    path: `${TASK_REGISTRY_TABLE}?legacy_task_id=eq.${encodeURIComponent(
      legacyTaskId,
    )}&select=id`,
  });
  return retry?.[0]?.id || null;
};

const logEmailActivity = async ({
  supabaseConfig,
  accessToken,
  userId,
  taskId,
  threadLinkId,
  action,
  meta,
}) => {
  await supabaseRequest({
    supabaseConfig,
    accessToken,
    method: "POST",
    path: EMAIL_ACTIVITY_LOG_TABLE,
    body: {
      user_id: userId,
      task_id: taskId,
      thread_link_id: threadLinkId,
      action,
      meta: meta && typeof meta === "object" ? meta : null,
    },
  });
};

const getSecuritySettings = async ({ supabaseConfig, accessToken, userId }) => {
  const rows = await supabaseRequest({
    supabaseConfig,
    accessToken,
    path: `${SECURITY_TABLE}?user_id=eq.${userId}&select=*`,
  });
  return rows?.[0] || null;
};

const upsertSecuritySettings = async ({
  supabaseConfig,
  accessToken,
  payload,
}) =>
  supabaseRequest({
    supabaseConfig,
    accessToken,
    method: "POST",
    path: `${SECURITY_TABLE}?on_conflict=user_id`,
    prefer: "resolution=merge-duplicates,return=representation",
    body: payload,
  });

const updateSecuritySettings = async ({
  supabaseConfig,
  accessToken,
  userId,
  payload,
}) =>
  supabaseRequest({
    supabaseConfig,
    accessToken,
    method: "PATCH",
    path: `${SECURITY_TABLE}?user_id=eq.${userId}`,
    prefer: "return=representation",
    body: payload,
  });

const generateRecoveryCodes = (count = 8) => {
  const codes = [];
  while (codes.length < count) {
    const raw = generateRandomHex(4);
    codes.push(`${raw.slice(0, 4)}-${raw.slice(4)}`.toUpperCase());
  }
  return codes;
};

const verifyRecentAuth = ({
  settings,
  maxAgeMinutes = REAUTH_MAX_AGE_MINUTES,
}) => {
  const last = settings?.last_verified_at
    ? new Date(settings.last_verified_at).getTime()
    : 0;
  if (!last) return false;
  return last >= Date.now() - maxAgeMinutes * 60_000;
};

const buildReauthError = (settings) =>
  buildError(401, "Reauth required.", "reauth_required", {
    requiresReauth: true,
    method: settings?.totp_enabled ? "totp" : "password",
  });

const shouldRequireEmailReauth = (urlPath) => {
  if (!urlPath) return false;
  if (urlPath.startsWith("/api/security")) return false;
  if (urlPath.startsWith("/api/email/oauth/")) return false;
  if (urlPath === "/api/email/cron/refresh-lugano") return false;
  if (urlPath.startsWith("/api/translate")) return true;
  if (urlPath.startsWith("/api/email")) return true;
  if (urlPath.startsWith("/api/email-links")) return true;
  return /^\/api\/tasks\/[^/]+\/email-links$/.test(urlPath);
};

const handleSecuritySettings = async ({
  supabaseConfig,
  accessToken,
  userId,
}) => {
  const settings = await getSecuritySettings({
    supabaseConfig,
    accessToken,
    userId,
  });
  return {
    totpEnabled: Boolean(settings?.totp_enabled),
    recoveryCodesRemaining: Array.isArray(settings?.recovery_codes_hash)
      ? settings.recovery_codes_hash.length
      : 0,
    lastVerifiedAt: settings?.last_verified_at || null,
  };
};

const handleTotpSetup = async ({
  supabaseConfig,
  accessToken,
  userId,
  email,
}) => {
  const secret = authenticator.generateSecret();
  const otpauth = authenticator.keyuri(email, "House-builder", secret);
  const qrDataUrl = await qrcode.toDataURL(otpauth);
  await upsertSecuritySettings({
    supabaseConfig,
    accessToken,
    payload: {
      user_id: userId,
      totp_secret_enc: encrypt(secret),
      totp_enabled: false,
      updated_at: new Date().toISOString(),
    },
  });
  return {
    otpauthUrl: otpauth,
    qrDataUrl,
    secret,
  };
};

const handleTotpConfirm = async ({
  supabaseConfig,
  accessToken,
  userId,
  code,
}) => {
  const settings = await getSecuritySettings({
    supabaseConfig,
    accessToken,
    userId,
  });
  if (!settings?.totp_secret_enc) {
    const error = new Error("Missing TOTP setup.");
    error.statusCode = 400;
    throw error;
  }
  const secret = decrypt(settings.totp_secret_enc);
  const ok = authenticator.check(code, secret);
  if (!ok) {
    const error = new Error("Invalid TOTP code.");
    error.statusCode = 401;
    throw error;
  }
  const recoveryCodes = generateRecoveryCodes();
  const hashed = recoveryCodes.map((entry) => hashValue(entry));
  await updateSecuritySettings({
    supabaseConfig,
    accessToken,
    userId,
    payload: {
      totp_enabled: true,
      recovery_codes_hash: hashed,
      last_verified_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  });
  return recoveryCodes;
};

const handleTotpDisable = async ({
  supabaseConfig,
  accessToken,
  userId,
  code,
}) => {
  const settings = await getSecuritySettings({
    supabaseConfig,
    accessToken,
    userId,
  });
  if (!settings?.totp_secret_enc) {
    return;
  }
  const secret = decrypt(settings.totp_secret_enc);
  if (!authenticator.check(code, secret)) {
    const error = new Error("Invalid TOTP code.");
    error.statusCode = 401;
    throw error;
  }
  await updateSecuritySettings({
    supabaseConfig,
    accessToken,
    userId,
    payload: {
      totp_secret_enc: null,
      totp_enabled: false,
      recovery_codes_hash: null,
      last_verified_at: null,
      updated_at: new Date().toISOString(),
    },
  });
};

const handleReauth = async ({ supabaseConfig, accessToken, user, body }) => {
  const settings = await getSecuritySettings({
    supabaseConfig,
    accessToken,
    userId: user.id,
  });
  const totpEnabled = Boolean(settings?.totp_enabled);
  const now = new Date().toISOString();

  if (totpEnabled) {
    const code = String(body?.code || "").trim();
    const recovery = String(body?.recoveryCode || "").trim();
    const secret = settings?.totp_secret_enc
      ? decrypt(settings.totp_secret_enc)
      : "";
    if (code) {
      if (!authenticator.check(code, secret)) {
        const error = new Error("Invalid TOTP code.");
        error.statusCode = 401;
        throw error;
      }
      await updateSecuritySettings({
        supabaseConfig,
        accessToken,
        userId: user.id,
        payload: {
          last_verified_at: now,
          updated_at: now,
        },
      });
      return { verifiedAt: now };
    }
    if (recovery) {
      const hash = hashValue(recovery.toUpperCase());
      const remaining = Array.isArray(settings?.recovery_codes_hash)
        ? settings.recovery_codes_hash.filter((entry) => entry !== hash)
        : [];
      if (remaining.length === settings?.recovery_codes_hash?.length) {
        const error = new Error("Invalid recovery code.");
        error.statusCode = 401;
        throw error;
      }
      await updateSecuritySettings({
        supabaseConfig,
        accessToken,
        userId: user.id,
        payload: {
          recovery_codes_hash: remaining,
          last_verified_at: now,
          updated_at: now,
        },
      });
      return { verifiedAt: now, recoveryCodesRemaining: remaining.length };
    }
    const error = new Error("Missing TOTP or recovery code.");
    error.statusCode = 400;
    throw error;
  }

  const password = String(body?.password || "").trim();
  if (!password) {
    const error = new Error("Missing password.");
    error.statusCode = 400;
    throw error;
  }
  const response = await fetch(
    `${supabaseConfig.supabaseUrl}/auth/v1/token?grant_type=password`,
    {
      method: "POST",
      headers: {
        apikey: supabaseConfig.supabaseAnonKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: user.email,
        password,
      }),
    },
  );
  if (!response.ok) {
    const error = new Error("Password check failed.");
    error.statusCode = response.status;
    throw error;
  }
  await upsertSecuritySettings({
    supabaseConfig,
    accessToken,
    payload: {
      user_id: user.id,
      last_verified_at: now,
      updated_at: now,
    },
  });
  return { verifiedAt: now };
};

const handleEmailApi = async ({ method, urlPath, headers, body, query }) => {
  if (
    !urlPath?.startsWith("/api/email") &&
    !urlPath?.startsWith("/api/email-links") &&
    !urlPath?.startsWith("/api/security") &&
    !urlPath?.startsWith("/api/tasks/") &&
    !urlPath?.startsWith("/api/translate")
  ) {
    return null;
  }

  const normalizedMethod = String(method || "").toUpperCase();
  const supabaseConfig = await resolveSupabaseConfig();
  if (!supabaseConfig.supabaseUrl || !supabaseConfig.supabaseAnonKey) {
    return buildError(
      500,
      "Supabase configuration missing.",
      "missing_supabase_config",
    );
  }

  if (urlPath === "/api/email/cron/refresh-lugano") {
    if (normalizedMethod !== "POST") {
      return buildError(405, "Method not allowed.", "method_not_allowed");
    }
    const cronSecret = String(process.env.CRON_SECRET || "").trim();
    const authHeader = getHeaderValue(headers, "authorization");
    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return buildError(401, "Unauthorized.", "cron_unauthorized");
    }
    const systemToken = String(
      process.env.SUPABASE_SERVICE_ROLE_KEY || "",
    ).trim();
    if (!systemToken) {
      return buildError(
        500,
        "Missing service role key.",
        "missing_service_role_key",
      );
    }
    const accounts = await supabaseRequest({
      supabaseConfig,
      accessToken: systemToken,
      path: `${EMAIL_ACCOUNTS_TABLE}?is_paused=is.false&select=*`,
    });
    for (const account of accounts || []) {
      try {
        const client = await loadEmailClient({
          supabaseConfig,
          accessToken: systemToken,
          account,
        });
        const threads = await client.listLuganoThreads({ limit: 50 });
        const linked = await supabaseRequest({
          supabaseConfig,
          accessToken: systemToken,
          path: `${EMAIL_THREAD_LINKS_TABLE}?user_id=eq.${account.user_id}&provider=eq.${account.provider}&select=*`,
        });
        const linkedMap = new Map(
          (linked || []).map((row) => [row.provider_thread_id, row]),
        );
        for (const thread of threads) {
          const match = linkedMap.get(thread.id);
          if (!match) continue;
          await supabaseRequest({
            supabaseConfig,
            accessToken: systemToken,
            method: "PATCH",
            path: `${EMAIL_THREAD_LINKS_TABLE}?id=eq.${match.id}`,
            body: {
              subject: thread.subject || match.subject,
              participants: thread.participants || match.participants,
              last_message_at: thread.lastMessageAt || match.last_message_at,
              last_snippet: thread.snippet || match.last_snippet,
            },
          });
          const messages = await client.getThreadMessages(thread.id);
          await upsertMessageCache({
            supabaseConfig,
            accessToken: systemToken,
            rows: buildMessageCacheRows(messages, match.id),
          });
        }
      } catch {
        // Continue with next account.
      }
    }
    return { statusCode: 200, payload: { refreshed: true } };
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

  if (urlPath.startsWith("/api/security")) {
    if (urlPath === "/api/security/settings") {
      if (normalizedMethod !== "GET") {
        return buildError(405, "Method not allowed.", "method_not_allowed");
      }
      const data = await handleSecuritySettings({
        supabaseConfig,
        accessToken,
        userId: user.id,
      });
      return { statusCode: 200, payload: data };
    }

    if (urlPath === "/api/security/totp/setup") {
      if (normalizedMethod !== "POST") {
        return buildError(405, "Method not allowed.", "method_not_allowed");
      }
      try {
        const setup = await handleTotpSetup({
          supabaseConfig,
          accessToken,
          userId: user.id,
          email: user.email || "user",
        });
        return { statusCode: 200, payload: setup };
      } catch (error) {
        if (
          String(error?.message || "").includes("EMAIL_TOKEN_ENCRYPTION_KEY")
        ) {
          return buildError(
            500,
            "Missing EMAIL_TOKEN_ENCRYPTION_KEY.",
            "missing_encryption_key",
          );
        }
        return buildError(
          error.statusCode || 500,
          error.message || "Setup failed.",
          "setup_failed",
        );
      }
    }

    if (urlPath === "/api/security/totp/confirm") {
      if (normalizedMethod !== "POST") {
        return buildError(405, "Method not allowed.", "method_not_allowed");
      }
      const code = String(body?.code || "").trim();
      if (!code) {
        return buildError(400, "Missing code.", "missing_code");
      }
      try {
        const recoveryCodes = await handleTotpConfirm({
          supabaseConfig,
          accessToken,
          userId: user.id,
          code,
        });
        return { statusCode: 200, payload: { recoveryCodes } };
      } catch (error) {
        return buildError(
          error.statusCode || 401,
          error.message || "Invalid code.",
          "invalid_code",
        );
      }
    }

    if (urlPath === "/api/security/totp/disable") {
      if (normalizedMethod !== "POST") {
        return buildError(405, "Method not allowed.", "method_not_allowed");
      }
      const code = String(body?.code || "").trim();
      if (!code) {
        return buildError(400, "Missing code.", "missing_code");
      }
      try {
        await handleTotpDisable({
          supabaseConfig,
          accessToken,
          userId: user.id,
          code,
        });
        return { statusCode: 200, payload: { disabled: true } };
      } catch (error) {
        return buildError(
          error.statusCode || 401,
          error.message || "Disable failed.",
          "disable_failed",
        );
      }
    }

    if (urlPath === "/api/security/reauth") {
      if (normalizedMethod !== "POST") {
        return buildError(405, "Method not allowed.", "method_not_allowed");
      }
      try {
        const result = await handleReauth({
          supabaseConfig,
          accessToken,
          user,
          body: body || {},
        });
        return { statusCode: 200, payload: result };
      } catch (error) {
        return buildError(
          error.statusCode || 401,
          error.message || "Reauth failed.",
          "reauth_failed",
        );
      }
    }
  }

  if (shouldRequireEmailReauth(urlPath)) {
    const settings = await getSecuritySettings({
      supabaseConfig,
      accessToken,
      userId: user.id,
    });
    if (!verifyRecentAuth({ settings })) {
      return buildReauthError(settings);
    }
  }

  if (urlPath === "/api/translate/message") {
    if (normalizedMethod !== "POST") {
      return buildError(405, "Method not allowed.", "method_not_allowed");
    }
    const messageCacheId = String(body?.messageCacheId || "").trim();
    const targetLang = String(body?.targetLang || "")
      .trim()
      .toLowerCase();
    if (!messageCacheId || !targetLang) {
      return buildError(
        400,
        "Missing translation data.",
        "missing_translation_data",
      );
    }
    if (targetLang !== "de") {
      return buildError(
        400,
        "Unsupported target language.",
        "unsupported_target",
      );
    }
    const rows = await supabaseRequest({
      supabaseConfig,
      accessToken,
      path: `${EMAIL_MESSAGES_CACHE_TABLE}?id=eq.${messageCacheId}&select=id,thread_link_id,body_text,body_html,translations,detected_language`,
    });
    const message = rows?.[0];
    if (!message) {
      return buildError(404, "Message not found.", "message_not_found");
    }
    const translations =
      message.translations && typeof message.translations === "object"
        ? message.translations
        : {};
    const existing = translations[targetLang];
    if (existing?.bodyText) {
      return {
        statusCode: 200,
        payload: { translation: existing, cached: true },
      };
    }
    const messageText =
      String(message.body_text || "").trim() ||
      stripHtml(message.body_html || "");
    if (!messageText) {
      return buildError(400, "Message body missing.", "missing_message_body");
    }
    try {
      const result = await translate({
        text: messageText,
        targetLang,
        sourceLang: message.detected_language || "",
      });
      const entry = {
        bodyText: result.translatedText,
        detectedSourceLang: result.detectedSourceLang || null,
        createdAt: new Date().toISOString(),
      };
      const nextTranslations = { ...translations, [targetLang]: entry };
      const updatePayload = { translations: nextTranslations };
      if (!message.detected_language && entry.detectedSourceLang) {
        updatePayload.detected_language = entry.detectedSourceLang;
      }
      await supabaseRequest({
        supabaseConfig,
        accessToken,
        method: "PATCH",
        path: `${EMAIL_MESSAGES_CACHE_TABLE}?id=eq.${messageCacheId}`,
        body: updatePayload,
      });
      let taskId = null;
      if (message.thread_link_id) {
        const linkRows = await supabaseRequest({
          supabaseConfig,
          accessToken,
          path: `${EMAIL_THREAD_LINKS_TABLE}?id=eq.${message.thread_link_id}&select=task_id`,
        });
        taskId = linkRows?.[0]?.task_id || null;
      }
      await logEmailActivity({
        supabaseConfig,
        accessToken,
        userId: user.id,
        taskId,
        threadLinkId: message.thread_link_id || null,
        action: "TRANSLATE_VIEW",
        meta: { targetLang, messageCacheId },
      });
      return {
        statusCode: 200,
        payload: { translation: entry, cached: false },
      };
    } catch (error) {
      return buildError(
        error.statusCode || 502,
        error.message || "Translation failed.",
        error.code || "translation_failed",
      );
    }
  }

  if (urlPath === "/api/translate/text") {
    if (normalizedMethod !== "POST") {
      return buildError(405, "Method not allowed.", "method_not_allowed");
    }
    const text = String(body?.text || "").trim();
    const targetLang = String(body?.targetLang || "")
      .trim()
      .toLowerCase();
    if (!text || !targetLang) {
      return buildError(
        400,
        "Missing translation data.",
        "missing_translation_data",
      );
    }
    if (targetLang !== "it") {
      return buildError(
        400,
        "Unsupported target language.",
        "unsupported_target",
      );
    }
    try {
      const result = await translate({ text, targetLang });
      await logEmailActivity({
        supabaseConfig,
        accessToken,
        userId: user.id,
        taskId: null,
        threadLinkId: null,
        action: "TRANSLATE_DRAFT",
        meta: { targetLang },
      });
      return {
        statusCode: 200,
        payload: {
          translatedText: result.translatedText,
          detectedSourceLang: result.detectedSourceLang || null,
        },
      };
    } catch (error) {
      return buildError(
        error.statusCode || 502,
        error.message || "Translation failed.",
        error.code || "translation_failed",
      );
    }
  }

  if (urlPath === "/api/email/accounts") {
    if (normalizedMethod !== "GET") {
      return buildError(405, "Method not allowed.", "method_not_allowed");
    }
    const accounts = await fetchEmailAccounts({
      supabaseConfig,
      accessToken,
      userId: user.id,
    });
    return {
      statusCode: 200,
      payload: {
        accounts: (accounts || []).map((account) => ({
          id: account.id,
          provider: account.provider,
          emailAddress: account.email_address,
          isPaused: account.is_paused,
          luganoContainerId: account.lugano_container_id,
          updatedAt: account.updated_at,
        })),
      },
    };
  }

  const accountMatch = urlPath.match(
    /^\/api\/email\/accounts\/([^/]+)\/(pause|unpause)$/,
  );
  if (accountMatch) {
    if (normalizedMethod !== "POST") {
      return buildError(405, "Method not allowed.", "method_not_allowed");
    }
    const accountId = decodeURIComponent(accountMatch[1]);
    const action = accountMatch[2];
    const rows = await supabaseRequest({
      supabaseConfig,
      accessToken,
      path: `${EMAIL_ACCOUNTS_TABLE}?id=eq.${accountId}&user_id=eq.${user.id}&select=*`,
    });
    const account = rows?.[0];
    if (!account) {
      return buildError(404, "Account not found.", "account_not_found");
    }
    const nextPaused = action === "pause";
    await supabaseRequest({
      supabaseConfig,
      accessToken,
      method: "PATCH",
      path: `${EMAIL_ACCOUNTS_TABLE}?id=eq.${accountId}`,
      body: {
        is_paused: nextPaused,
        updated_at: new Date().toISOString(),
      },
    });
    await logEmailActivity({
      supabaseConfig,
      accessToken,
      userId: user.id,
      taskId: null,
      threadLinkId: null,
      action: nextPaused ? "PAUSE" : "UNPAUSE",
      meta: { provider: account.provider },
    });
    return {
      statusCode: 200,
      payload: { paused: nextPaused },
    };
  }

  const oauthMatch = urlPath.match(
    /^\/api\/email\/oauth\/([^/]+)\/(start|callback)$/,
  );
  if (oauthMatch) {
    const providerKey = parseProvider(oauthMatch[1]);
    if (!providerKey) {
      return buildError(400, "Unknown provider.", "unknown_provider");
    }
    const provider = PROVIDERS[providerKey];
    const action = oauthMatch[2];
    if (normalizedMethod !== "GET") {
      return buildError(405, "Method not allowed.", "method_not_allowed");
    }
    if (action === "start") {
      const state = query?.get?.("state") || "";
      const authUrl = provider.buildAuthUrl({ state });
      if (!authUrl) {
        return buildError(
          500,
          "OAuth configuration missing.",
          "missing_oauth_config",
        );
      }
      return { statusCode: 200, payload: { url: authUrl } };
    }

    const code = query?.get?.("code") || "";
    if (!code) {
      return buildError(400, "Missing auth code.", "missing_code");
    }
    try {
      const tokens = await provider.exchangeCode({ code }).catch((error) => {
        const wrapped = new Error(
          `Token exchange failed: ${error?.message || "Unknown error."}`,
        );
        wrapped.statusCode = error?.statusCode || 502;
        throw wrapped;
      });
      const expiresAt = tokens.expires_in
        ? new Date(Date.now() + tokens.expires_in * 1000).toISOString()
        : null;
      const existingAccount = await fetchEmailAccount({
        supabaseConfig,
        accessToken,
        userId: user.id,
        provider: providerKey,
      });
      const profile = await provider
        .fetchProfile({
          accessToken: tokens.access_token,
        })
        .catch((error) => {
          const wrapped = new Error(
            `Profile fetch failed: ${error?.message || "Unknown error."}`,
          );
          wrapped.statusCode = error?.statusCode || 502;
          throw wrapped;
        });
      const emailAddress =
        profile?.emailAddress ||
        profile?.mail ||
        profile?.userPrincipalName ||
        "";
      const containerId = await provider
        .ensureLuganoContainer({
          accessToken: tokens.access_token,
        })
        .catch((error) => {
          const wrapped = new Error(
            `Lugano container failed: ${error?.message || "Unknown error."}`,
          );
          wrapped.statusCode = error?.statusCode || 502;
          throw wrapped;
        });
      const scopeList = String(tokens.scope || "")
        .split(" ")
        .map((scope) => scope.trim())
        .filter(Boolean);
      try {
        await upsertEmailAccount({
          supabaseConfig,
          accessToken,
          payload: {
            user_id: user.id,
            provider: providerKey,
            email_address: emailAddress || user.email || "",
            access_token_enc: encrypt(tokens.access_token),
            refresh_token_enc: tokens.refresh_token
              ? encrypt(tokens.refresh_token)
              : existingAccount?.refresh_token_enc || null,
            token_expires_at: expiresAt,
            scopes: scopeList.length ? scopeList : null,
            lugano_container_id: containerId,
            is_paused: false,
            updated_at: new Date().toISOString(),
          },
        });
      } catch (error) {
        const wrapped = new Error(
          `Account save failed: ${error?.message || "Unknown error."}`,
        );
        wrapped.statusCode = error?.statusCode || 502;
        throw wrapped;
      }
      await logEmailActivity({
        supabaseConfig,
        accessToken,
        userId: user.id,
        taskId: null,
        threadLinkId: null,
        action: "CONNECT",
        meta: {
          provider: providerKey,
          email: emailAddress || user.email || "",
        },
      });
      return {
        statusCode: 200,
        payload: {
          connected: true,
          provider: providerKey,
          email: emailAddress || user.email || "",
        },
      };
    } catch (error) {
      return buildError(
        error.statusCode || 502,
        error.message || "OAuth connect failed.",
        "oauth_connect_failed",
      );
    }
  }

  const unlinkedMatch = urlPath.match(
    /^\/api\/email\/([^/]+)\/lugano\/unlinked$/,
  );
  if (unlinkedMatch) {
    const providerKey = parseProvider(unlinkedMatch[1]);
    if (!providerKey) {
      return buildError(400, "Unknown provider.", "unknown_provider");
    }
    if (normalizedMethod !== "GET") {
      return buildError(405, "Method not allowed.", "method_not_allowed");
    }
    const account = await fetchEmailAccount({
      supabaseConfig,
      accessToken,
      userId: user.id,
      provider: providerKey,
    });
    if (!account) {
      return buildError(404, "Account not connected.", "account_not_found");
    }
    try {
      const client = await loadEmailClient({
        supabaseConfig,
        accessToken,
        account,
      });
      const limit = Number(query?.get?.("limit") || 30);
      const q = query?.get?.("q") || "";
      const threads = await client.listLuganoThreads({ limit, q });
      const linked = await supabaseRequest({
        supabaseConfig,
        accessToken,
        path: `${EMAIL_THREAD_LINKS_TABLE}?user_id=eq.${user.id}&provider=eq.${providerKey}&select=provider_thread_id`,
      });
      const linkedIds = new Set(
        (linked || []).map((row) => row.provider_thread_id),
      );
      const unlinked = threads.filter(
        (thread) => thread.id && !linkedIds.has(thread.id),
      );
      return { statusCode: 200, payload: { threads: unlinked } };
    } catch (error) {
      return buildError(
        error.statusCode || 502,
        error.message || "Failed to load Lugano threads.",
        "lugano_threads_error",
      );
    }
  }

  const linkMatch = urlPath.match(/^\/api\/tasks\/([^/]+)\/email-links$/);
  if (linkMatch) {
    const legacyTaskId = decodeURIComponent(linkMatch[1]);
    if (normalizedMethod === "GET") {
      const registryRows = await supabaseRequest({
        supabaseConfig,
        accessToken,
        path: `${TASK_REGISTRY_TABLE}?legacy_task_id=eq.${encodeURIComponent(
          legacyTaskId,
        )}&select=id`,
      });
      const registryId = registryRows?.[0]?.id;
      if (!registryId) {
        return { statusCode: 200, payload: { links: [] } };
      }
      const links = await supabaseRequest({
        supabaseConfig,
        accessToken,
        path: `${EMAIL_THREAD_LINKS_TABLE}?user_id=eq.${user.id}&task_id=eq.${registryId}&select=*`,
      });
      return { statusCode: 200, payload: { links: links || [] } };
    }

    if (normalizedMethod !== "POST") {
      return buildError(405, "Method not allowed.", "method_not_allowed");
    }
    const providerKey = parseProvider(body?.provider);
    const providerThreadId = String(body?.providerThreadId || "").trim();
    if (!providerKey || !providerThreadId) {
      return buildError(400, "Missing link data.", "missing_link_data");
    }
    const payload = await fetchHouseState({
      supabaseUrl: supabaseConfig.supabaseUrl,
      supabaseAnonKey: supabaseConfig.supabaseAnonKey,
      accessToken,
    });
    const tasks = Array.isArray(payload?.tasks) ? payload.tasks : [];
    const taskExists = tasks.some((task) => task?.id === legacyTaskId);
    if (!taskExists) {
      return buildError(404, "Task not found.", "task_not_found");
    }
    const existing = await supabaseRequest({
      supabaseConfig,
      accessToken,
      path: `${EMAIL_THREAD_LINKS_TABLE}?user_id=eq.${user.id}&provider=eq.${providerKey}&provider_thread_id=eq.${encodeURIComponent(
        providerThreadId,
      )}&select=id`,
    });
    if (existing?.[0]?.id) {
      return buildError(409, "Thread already linked.", "thread_already_linked");
    }
    const account = await fetchEmailAccount({
      supabaseConfig,
      accessToken,
      userId: user.id,
      provider: providerKey,
    });
    if (!account) {
      return buildError(404, "Account not connected.", "account_not_found");
    }
    let summary;
    try {
      const client = await loadEmailClient({
        supabaseConfig,
        accessToken,
        account,
      });
      summary = await client.getThreadSummary(providerThreadId);
    } catch (error) {
      return buildError(
        error.statusCode || 502,
        error.message || "Failed to fetch thread summary.",
        "thread_summary_error",
      );
    }
    const taskRegistryId = await ensureTaskRegistryId({
      supabaseConfig,
      accessToken,
      legacyTaskId,
    });
    if (!taskRegistryId) {
      return buildError(500, "Failed to map task.", "task_registry_error");
    }
    const inserted = await supabaseRequest({
      supabaseConfig,
      accessToken,
      method: "POST",
      path: EMAIL_THREAD_LINKS_TABLE,
      body: {
        task_id: taskRegistryId,
        user_id: user.id,
        provider: providerKey,
        provider_thread_id: providerThreadId,
        subject: summary?.subject || "",
        participants: summary?.participants || null,
        last_message_at: summary?.lastMessageAt || null,
        last_snippet: summary?.snippet || "",
      },
      prefer: "return=representation",
    });
    const link = inserted?.[0] || null;
    await logEmailActivity({
      supabaseConfig,
      accessToken,
      userId: user.id,
      taskId: taskRegistryId,
      threadLinkId: link?.id || null,
      action: "LINK",
      meta: { provider: providerKey, threadId: providerThreadId },
    });
    return { statusCode: 201, payload: { link } };
  }

  const unlinkMatch = urlPath.match(/^\/api\/email-links\/([^/]+)$/);
  if (unlinkMatch) {
    if (normalizedMethod !== "DELETE") {
      return buildError(405, "Method not allowed.", "method_not_allowed");
    }
    const linkId = decodeURIComponent(unlinkMatch[1]);
    const rows = await supabaseRequest({
      supabaseConfig,
      accessToken,
      path: `${EMAIL_THREAD_LINKS_TABLE}?id=eq.${linkId}&user_id=eq.${user.id}&select=*`,
    });
    const link = rows?.[0];
    if (!link) {
      return buildError(404, "Link not found.", "link_not_found");
    }
    await supabaseRequest({
      supabaseConfig,
      accessToken,
      method: "DELETE",
      path: `${EMAIL_THREAD_LINKS_TABLE}?id=eq.${linkId}`,
    });
    await logEmailActivity({
      supabaseConfig,
      accessToken,
      userId: user.id,
      taskId: link.task_id,
      threadLinkId: link.id,
      action: "UNLINK",
      meta: { provider: link.provider, threadId: link.provider_thread_id },
    });
    return { statusCode: 200, payload: { deleted: true } };
  }

  const messagesMatch = urlPath.match(
    /^\/api\/email-links\/([^/]+)\/messages$/,
  );
  if (messagesMatch) {
    if (normalizedMethod !== "GET") {
      return buildError(405, "Method not allowed.", "method_not_allowed");
    }
    const linkId = decodeURIComponent(messagesMatch[1]);
    const rows = await supabaseRequest({
      supabaseConfig,
      accessToken,
      path: `${EMAIL_THREAD_LINKS_TABLE}?id=eq.${linkId}&user_id=eq.${user.id}&select=*`,
    });
    const link = rows?.[0];
    if (!link) {
      return buildError(404, "Link not found.", "link_not_found");
    }
    const account = await fetchEmailAccount({
      supabaseConfig,
      accessToken,
      userId: user.id,
      provider: link.provider,
    });
    if (!account) {
      return buildError(404, "Account not connected.", "account_not_found");
    }
    try {
      const client = await loadEmailClient({
        supabaseConfig,
        accessToken,
        account,
      });
      const messages = await client.getThreadMessages(link.provider_thread_id);
      await upsertMessageCache({
        supabaseConfig,
        accessToken,
        rows: buildMessageCacheRows(messages, link.id),
      });
      const cachedRows = await fetchCachedMessages({
        supabaseConfig,
        accessToken,
        linkId: link.id,
      });
      await logEmailActivity({
        supabaseConfig,
        accessToken,
        userId: user.id,
        taskId: link.task_id,
        threadLinkId: link.id,
        action: "VIEW_THREAD",
        meta: { provider: link.provider, threadId: link.provider_thread_id },
      });
      return {
        statusCode: 200,
        payload: {
          messages: (cachedRows || []).map((row) =>
            toCachedMessageResponse(row, link.provider_thread_id),
          ),
        },
      };
    } catch (error) {
      return buildError(
        error.statusCode || 502,
        error.message || "Failed to load messages.",
        "messages_error",
      );
    }
  }

  const replyMatch = urlPath.match(/^\/api\/email-links\/([^/]+)\/reply$/);
  if (replyMatch) {
    if (normalizedMethod !== "POST") {
      return buildError(405, "Method not allowed.", "method_not_allowed");
    }
    const linkId = decodeURIComponent(replyMatch[1]);
    const rows = await supabaseRequest({
      supabaseConfig,
      accessToken,
      path: `${EMAIL_THREAD_LINKS_TABLE}?id=eq.${linkId}&user_id=eq.${user.id}&select=*`,
    });
    const link = rows?.[0];
    if (!link) {
      return buildError(404, "Link not found.", "link_not_found");
    }
    const bodyText = String(body?.bodyText || body?.body || "").trim();
    const bodyHtml = String(body?.bodyHtml || "").trim();
    if (!bodyText && !bodyHtml) {
      return buildError(400, "Missing reply body.", "missing_reply");
    }
    const account = await fetchEmailAccount({
      supabaseConfig,
      accessToken,
      userId: user.id,
      provider: link.provider,
    });
    if (!account) {
      return buildError(404, "Account not connected.", "account_not_found");
    }
    try {
      const client = await loadEmailClient({
        supabaseConfig,
        accessToken,
        account,
      });
      const messageId = await client.reply(link.provider_thread_id, {
        bodyText,
        bodyHtml,
      });
      await logEmailActivity({
        supabaseConfig,
        accessToken,
        userId: user.id,
        taskId: link.task_id,
        threadLinkId: link.id,
        action: "REPLY_SENT",
        meta: {
          provider: link.provider,
          threadId: link.provider_thread_id,
          messageId,
        },
      });
      const messages = await client.getThreadMessages(link.provider_thread_id);
      await upsertMessageCache({
        supabaseConfig,
        accessToken,
        rows: buildMessageCacheRows(messages, link.id),
      });
      return { statusCode: 200, payload: { sent: true } };
    } catch (error) {
      return buildError(
        error.statusCode || 502,
        error.message || "Failed to send reply.",
        "reply_error",
      );
    }
  }

  return buildError(404, "Not found.", "not_found");
};

export { handleEmailApi };
