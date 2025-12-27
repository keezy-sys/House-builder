import crypto from "crypto";
import { readFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const SHARED_STATE_TABLE = "house_state";
const SHARED_STATE_ID = "default";

const TASK_STATUSES = ["Backlog", "Planned", "InProgress", "Blocked", "Done"];
const TASK_STATUS_ALIASES = {
  backlog: "Backlog",
  todo: "Backlog",
  planned: "Planned",
  plan: "Planned",
  inprogress: "InProgress",
  "in-progress": "InProgress",
  progress: "InProgress",
  blocked: "Blocked",
  done: "Done",
  complete: "Done",
  completed: "Done",
};
const TASK_PRIORITIES = ["Low", "Med", "High"];
const DEFAULT_TASK_STATUS = "Backlog";
const DEFAULT_TASK_PRIORITY = "Med";
const TASK_COST_KEYS = ["materials", "devices", "permits", "contractors"];

const CONFIG_PATH = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "config.js",
);

let cachedConfig = null;

const matchTasksPath = (urlPath) => {
  if (urlPath === "/api/tasks") return { id: null };
  const match = urlPath?.match?.(/^\/api\/tasks\/([^/]+)$/);
  if (!match) return null;
  return { id: match[1] };
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

const buildError = (statusCode, error, code) => ({
  statusCode,
  payload: {
    error,
    code,
  },
});

const createTaskId = () => {
  if (typeof crypto.randomUUID === "function") {
    return `task-${crypto.randomUUID()}`;
  }
  return `task-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
};

const normalizeRoomId = (value) => {
  if (value === null || value === undefined) return null;
  const raw = String(value || "").trim();
  if (!raw) return null;
  const lowered = raw.toLowerCase();
  if (lowered === "none" || lowered === "null") return null;
  return raw;
};

const normalizeAssignee = (value) => {
  if (value === null || value === undefined) return "";
  const raw = String(value || "").trim();
  return raw || "";
};

const normalizeTaskLink = (value) => {
  if (value === null || value === undefined) return "";
  const raw = String(value || "").trim();
  if (!raw) return "";
  try {
    const url = new URL(raw);
    if (!["http:", "https:"].includes(url.protocol)) return "";
    return url.toString();
  } catch {
    return "";
  }
};

const normalizeTaskTags = (tags) => {
  const raw = Array.isArray(tags)
    ? tags
    : typeof tags === "string"
      ? tags.split(",")
      : [];
  const seen = new Set();
  const normalized = [];
  raw.forEach((tag) => {
    String(tag || "")
      .split(/\s+/)
      .forEach((chunk) => {
        const value = String(chunk || "")
          .trim()
          .replace(/^#/, "")
          .toLowerCase();
        if (!value || seen.has(value)) return;
        seen.add(value);
        normalized.push(value);
      });
  });
  return normalized;
};

const normalizeStatus = (value) => {
  const raw = typeof value === "string" ? value.trim() : "";
  if (!raw) return "";
  if (TASK_STATUSES.includes(raw)) return raw;
  const lowered = raw.toLowerCase().replace(/[\s_-]+/g, "");
  return TASK_STATUS_ALIASES[lowered] || "";
};

const coerceStatus = (value, fallback = DEFAULT_TASK_STATUS) =>
  normalizeStatus(value) || fallback;

const normalizePriority = (value) => {
  const raw = typeof value === "string" ? value.trim() : "";
  if (!raw) return "";
  if (TASK_PRIORITIES.includes(raw)) return raw;
  const lowered = raw.toLowerCase();
  if (lowered === "low") return "Low";
  if (lowered === "med" || lowered === "medium") return "Med";
  if (lowered === "high") return "High";
  return "";
};

const coercePriority = (value, fallback = DEFAULT_TASK_PRIORITY) =>
  normalizePriority(value) || fallback;

const normalizeDate = (value) => {
  if (value === null || value === undefined) return null;
  const raw = String(value || "").trim();
  if (!raw) return null;
  return /^\d{4}-\d{2}-\d{2}$/.test(raw) ? raw : null;
};

const normalizeCostValue = (value) => {
  if (value === null || value === undefined || value === "") return null;
  const raw =
    typeof value === "string" ? value.trim().replace(",", ".") : value;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
};

const normalizeTaskCosts = (costs) => {
  const source = costs && typeof costs === "object" ? costs : {};
  return TASK_COST_KEYS.reduce((normalized, key) => {
    normalized[key] = normalizeCostValue(source[key]);
    return normalized;
  }, {});
};

const parseFilters = (searchParams) => {
  if (!searchParams) {
    return {
      roomId: "",
      status: "",
      assignee: "",
      tag: "",
      query: "",
    };
  }
  return {
    roomId: String(searchParams.get("roomId") || "").trim(),
    status: String(searchParams.get("status") || "").trim(),
    assignee: String(searchParams.get("assignee") || "").trim(),
    tag: String(searchParams.get("tag") || "").trim(),
    query: String(searchParams.get("q") || "").trim(),
  };
};

const filterTasks = (tasks, filters) => {
  const roomId = normalizeRoomId(filters.roomId);
  const status = normalizeStatus(filters.status);
  const assignee = filters.assignee.trim();
  const tag = filters.tag.trim().replace(/^#/, "").toLowerCase();
  const query = filters.query.trim().toLowerCase();

  return tasks.filter((task) => {
    if (roomId !== null && roomId !== "" && task.roomId !== roomId) {
      return false;
    }
    if (filters.roomId && roomId === null && task.roomId) {
      return false;
    }
    if (status && normalizeStatus(task.status) !== status) {
      return false;
    }
    if (assignee) {
      if (assignee === "unassigned" || assignee === "none") {
        if (task.assignee) return false;
      } else if (task.assignee !== assignee) {
        return false;
      }
    }
    if (tag) {
      const tags = Array.isArray(task.tags) ? task.tags : [];
      if (!tags.includes(tag)) return false;
    }
    if (query) {
      const haystack = [
        task.title,
        task.notes,
        task.link,
        task.assignee,
        Array.isArray(task.tags) ? task.tags.join(" ") : "",
      ]
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    return true;
  });
};

const coerceTasksArray = (payload) => {
  if (!payload || typeof payload !== "object") {
    return { payload: { tasks: [] }, tasks: [] };
  }
  if (!Array.isArray(payload.tasks)) {
    payload.tasks = [];
  }
  return { payload, tasks: payload.tasks };
};

const applyTaskPatch = (task, patch) => {
  if (!patch || typeof patch !== "object") return;
  if (typeof patch.title === "string") {
    const trimmed = patch.title.trim();
    if (trimmed) task.title = trimmed;
  }
  if (Object.prototype.hasOwnProperty.call(patch, "roomId")) {
    task.roomId = normalizeRoomId(patch.roomId);
  }
  if (Object.prototype.hasOwnProperty.call(patch, "status")) {
    const nextStatus = normalizeStatus(patch.status);
    if (nextStatus) task.status = nextStatus;
  }
  if (Object.prototype.hasOwnProperty.call(patch, "tags")) {
    task.tags = normalizeTaskTags(patch.tags);
  }
  if (Object.prototype.hasOwnProperty.call(patch, "assignee")) {
    task.assignee = normalizeAssignee(patch.assignee);
  }
  if (Object.prototype.hasOwnProperty.call(patch, "dueDate")) {
    task.dueDate = normalizeDate(patch.dueDate);
  }
  if (Object.prototype.hasOwnProperty.call(patch, "priority")) {
    const nextPriority = normalizePriority(patch.priority);
    if (nextPriority) task.priority = nextPriority;
  }
  if (Object.prototype.hasOwnProperty.call(patch, "notes")) {
    task.notes = typeof patch.notes === "string" ? patch.notes : "";
  }
  if (Object.prototype.hasOwnProperty.call(patch, "link")) {
    task.link = normalizeTaskLink(patch.link);
  }
  if (Object.prototype.hasOwnProperty.call(patch, "startDate")) {
    task.startDate = normalizeDate(patch.startDate);
  }
  if (Object.prototype.hasOwnProperty.call(patch, "endDate")) {
    task.endDate = normalizeDate(patch.endDate);
  }
  if (Object.prototype.hasOwnProperty.call(patch, "dependencyIds")) {
    task.dependencyIds = Array.isArray(patch.dependencyIds)
      ? patch.dependencyIds.filter((id) => typeof id === "string")
      : [];
  }
  if (Object.prototype.hasOwnProperty.call(patch, "materials")) {
    task.materials =
      patch.materials && typeof patch.materials === "object"
        ? patch.materials
        : null;
  }
  if (Object.prototype.hasOwnProperty.call(patch, "costs")) {
    if (patch.costs && typeof patch.costs === "object") {
      task.costs = normalizeTaskCosts({
        ...(task.costs && typeof task.costs === "object" ? task.costs : {}),
        ...patch.costs,
      });
    } else {
      task.costs = normalizeTaskCosts();
    }
  }
  if (Object.prototype.hasOwnProperty.call(patch, "gmailThread")) {
    delete task.gmailThread;
  }
};

const handleTasksApi = async ({ method, urlPath, headers, body, query }) => {
  const match = matchTasksPath(urlPath);
  if (!match) return null;

  const normalizedMethod = String(method || "").toUpperCase();
  if (!["GET", "POST", "PATCH", "DELETE"].includes(normalizedMethod)) {
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
      const payload = await fetchHouseState({ ...config, accessToken });
      const tasks = Array.isArray(payload?.tasks) ? payload.tasks : [];
      if (match.id) {
        const task = tasks.find((item) => item.id === match.id);
        if (!task) {
          return buildError(404, "Task not found.", "task_not_found");
        }
        return { statusCode: 200, payload: { item: task } };
      }
      const filters = parseFilters(query);
      const filtered = filters ? filterTasks(tasks, filters) : tasks.slice();
      return { statusCode: 200, payload: { items: filtered } };
    } catch (error) {
      return buildError(
        error.statusCode || 502,
        "Failed to load tasks.",
        "supabase_error",
      );
    }
  }

  if (normalizedMethod === "POST" && match.id) {
    return buildError(405, "Method not allowed.", "method_not_allowed");
  }

  if (normalizedMethod !== "POST" && !match.id) {
    return buildError(400, "Missing task id.", "missing_task_id");
  }

  let payload;
  try {
    payload = await fetchHouseState({ ...config, accessToken });
  } catch (error) {
    return buildError(
      error.statusCode || 502,
      "Failed to load house state.",
      "supabase_error",
    );
  }

  const { payload: state, tasks } = coerceTasksArray(payload);

  if (normalizedMethod === "POST") {
    const input =
      body?.task ||
      body?.item ||
      body?.data ||
      (body && typeof body === "object" ? body : {});
    const title = typeof input.title === "string" ? input.title.trim() : "";
    if (!title) {
      return buildError(400, "Missing task title.", "missing_title");
    }
    const timestamp = new Date().toISOString();
    const task = {
      id:
        typeof input.id === "string" && input.id.trim()
          ? input.id.trim()
          : createTaskId(),
      title,
      roomId: normalizeRoomId(input.roomId),
      status: coerceStatus(input.status),
      tags: normalizeTaskTags(input.tags),
      assignee: normalizeAssignee(input.assignee),
      dueDate: normalizeDate(input.dueDate),
      priority: coercePriority(input.priority),
      notes: typeof input.notes === "string" ? input.notes : "",
      link: normalizeTaskLink(input.link),
      costs: normalizeTaskCosts(input.costs),
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    tasks.unshift(task);
    state.tasks = tasks;
    try {
      await upsertHouseState({ ...config, accessToken, payload: state });
    } catch (error) {
      return buildError(
        error.statusCode || 502,
        "Failed to persist task.",
        "supabase_error",
      );
    }
    return { statusCode: 201, payload: { item: task } };
  }

  const targetIndex = tasks.findIndex((item) => item.id === match.id);
  if (targetIndex < 0) {
    return buildError(404, "Task not found.", "task_not_found");
  }

  if (normalizedMethod === "DELETE") {
    const removed = tasks.splice(targetIndex, 1)[0];
    state.tasks = tasks;
    try {
      await upsertHouseState({ ...config, accessToken, payload: state });
    } catch (error) {
      return buildError(
        error.statusCode || 502,
        "Failed to delete task.",
        "supabase_error",
      );
    }
    return { statusCode: 200, payload: { item: removed } };
  }

  const patch =
    body?.task ||
    body?.item ||
    body?.data ||
    (body && typeof body === "object" ? body : {});
  const task = tasks[targetIndex];
  applyTaskPatch(task, patch);
  task.updatedAt = new Date().toISOString();
  state.tasks = tasks;
  try {
    await upsertHouseState({ ...config, accessToken, payload: state });
  } catch (error) {
    return buildError(
      error.statusCode || 502,
      "Failed to update task.",
      "supabase_error",
    );
  }
  return { statusCode: 200, payload: { item: task } };
};

export { handleTasksApi, matchTasksPath };
