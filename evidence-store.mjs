import { readFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const SHARED_STATE_TABLE = "house_state";
const SHARED_STATE_ID = "default";

const CONFIG_PATH = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "config.js",
);

let cachedConfig = null;

const matchEvidencePath = (urlPath) => {
  const match = urlPath?.match?.(/^\/api\/rooms\/([^/]+)\/(files|decisions)$/);
  if (!match) return null;
  return { roomId: match[1], resource: match[2] };
};

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

const parseJsonBody = (body) => {
  if (!body) return {};
  if (typeof body === "string") {
    try {
      return JSON.parse(body);
    } catch {
      return {};
    }
  }
  if (typeof body === "object") {
    return body;
  }
  return {};
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

const upsertHouseState = async ({
  supabaseUrl,
  supabaseAnonKey,
  accessToken,
  payload,
}) => {
  const response = await fetch(
    `${supabaseUrl}/rest/v1/${SHARED_STATE_TABLE}?on_conflict=id`,
    {
      method: "POST",
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates",
      },
      body: JSON.stringify({
        id: SHARED_STATE_ID,
        data: payload,
        updated_at: new Date().toISOString(),
      }),
    },
  );

  if (!response.ok) {
    const message = await response.text();
    const error = new Error(message || "Supabase update failed.");
    error.statusCode = response.status;
    throw error;
  }
};

const defaultRoomData = () => ({
  checklist: [],
  images: [],
  comments: [],
  decisions: [],
  scene: null,
});

const ensureRoomData = (payload, roomId) => {
  if (!payload.roomData || typeof payload.roomData !== "object") {
    payload.roomData = {};
  }
  if (!payload.roomData[roomId]) {
    payload.roomData[roomId] = defaultRoomData();
  }
  const roomData = payload.roomData[roomId];
  if (!Array.isArray(roomData.checklist)) roomData.checklist = [];
  if (!Array.isArray(roomData.images)) roomData.images = [];
  if (!Array.isArray(roomData.comments)) roomData.comments = [];
  if (!Array.isArray(roomData.decisions)) roomData.decisions = [];
  if (roomData.scene === undefined) roomData.scene = null;
  return roomData;
};

const normalizeFileRecord = (input = {}) => {
  const label = String(input.label || input.name || "").trim();
  if (!label) {
    return { error: "Missing file label." };
  }
  const size = Number(input.size);
  return {
    record: {
      id: String(input.id || `file-${Date.now()}`),
      label,
      name: String(input.name || label),
      url: String(input.url || ""),
      type: String(input.type || ""),
      size: Number.isFinite(size) ? size : null,
      createdAt: String(input.createdAt || new Date().toISOString()),
      userName: String(input.userName || ""),
      userEmail: String(input.userEmail || ""),
    },
  };
};

const normalizeDecisionRecord = (input = {}) => {
  const title = String(input.title || "").trim();
  const body = String(input.body || "").trim();
  if (!title || !body) {
    return { error: "Missing decision title or body." };
  }
  const taskIds = Array.isArray(input.taskIds)
    ? input.taskIds.map((item) => String(item || "").trim()).filter(Boolean)
    : Array.isArray(input.taskLinks)
      ? input.taskLinks.map((item) => String(item || "").trim()).filter(Boolean)
      : [];
  return {
    record: {
      id: String(input.id || `decision-${Date.now()}`),
      title,
      body,
      taskIds,
      createdAt: String(input.createdAt || new Date().toISOString()),
      userName: String(input.userName || ""),
      userEmail: String(input.userEmail || ""),
    },
  };
};

const ensurePayload = async (bodyPayload, config, accessToken) => {
  const providedState = bodyPayload?.state;
  if (
    providedState &&
    typeof providedState === "object" &&
    providedState.floorPlans
  ) {
    return providedState;
  }
  return fetchHouseState({ ...config, accessToken });
};

const addRecordIfMissing = (list, record) => {
  const existing = list.find((item) => item.id === record.id);
  if (existing) {
    return existing;
  }
  list.unshift(record);
  return record;
};

const buildError = (statusCode, error, code) => ({
  statusCode,
  payload: {
    error,
    code,
  },
});

const handleEvidenceApi = async ({ method, urlPath, headers, body }) => {
  const match = matchEvidencePath(urlPath);
  if (!match) return null;

  const normalizedMethod = String(method || "").toUpperCase();
  if (!["GET", "POST"].includes(normalizedMethod)) {
    return buildError(405, "Method not allowed.", "method_not_allowed");
  }

  const accessToken = extractAccessToken(headers);
  if (!accessToken) {
    return buildError(401, "Missing access token.", "missing_access_token");
  }

  const config = await resolveSupabaseConfig();
  if (!config.supabaseUrl || !config.supabaseAnonKey) {
    return buildError(
      500,
      "Supabase configuration missing.",
      "missing_supabase_config",
    );
  }

  if (normalizedMethod === "GET") {
    try {
      const payload = await fetchHouseState({
        ...config,
        accessToken,
      });
      if (!payload) {
        return { statusCode: 200, payload: { items: [] } };
      }
      const roomData = ensureRoomData(payload, match.roomId);
      const items =
        match.resource === "files" ? roomData.images : roomData.decisions;
      return { statusCode: 200, payload: { items } };
    } catch (error) {
      return buildError(
        error.statusCode || 502,
        "Failed to load evidence data.",
        "supabase_error",
      );
    }
  }

  const bodyPayload = parseJsonBody(body);
  let payload = null;
  try {
    payload = await ensurePayload(bodyPayload, config, accessToken);
  } catch (error) {
    return buildError(
      error.statusCode || 502,
      "Failed to load house state.",
      "supabase_error",
    );
  }

  if (!payload || typeof payload !== "object") {
    return buildError(404, "Missing house state.", "missing_state");
  }

  const roomData = ensureRoomData(payload, match.roomId);
  const input =
    bodyPayload?.item ||
    bodyPayload?.file ||
    bodyPayload?.decision ||
    bodyPayload;

  if (match.resource === "files") {
    const { record, error } = normalizeFileRecord(input);
    if (error) {
      return buildError(400, error, "invalid_file");
    }
    const saved = addRecordIfMissing(roomData.images, record);
    try {
      await upsertHouseState({
        ...config,
        accessToken,
        payload,
      });
    } catch (error) {
      return buildError(
        error.statusCode || 502,
        "Failed to persist evidence file.",
        "supabase_error",
      );
    }
    return { statusCode: 201, payload: { item: saved } };
  }

  const { record, error } = normalizeDecisionRecord(input);
  if (error) {
    return buildError(400, error, "invalid_decision");
  }
  const saved = addRecordIfMissing(roomData.decisions, record);
  try {
    await upsertHouseState({
      ...config,
      accessToken,
      payload,
    });
  } catch (error) {
    return buildError(
      error.statusCode || 502,
      "Failed to persist decision.",
      "supabase_error",
    );
  }
  return { statusCode: 201, payload: { item: saved } };
};

export { handleEvidenceApi, matchEvidencePath };
