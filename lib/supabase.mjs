import { readFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

let cachedConfig = null;
let cachedConfigPath = null;

const resolveConfigPath = () => {
  if (cachedConfigPath) return cachedConfigPath;
  let filePath = path.resolve(process.cwd(), "config.js");
  try {
    const metaUrl = import.meta.url;
    if (metaUrl) {
      filePath = path.join(
        path.dirname(fileURLToPath(metaUrl)),
        "..",
        "config.js",
      );
    }
  } catch {
    // Fallback to process.cwd().
  }
  cachedConfigPath = filePath;
  return cachedConfigPath;
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
    const content = await readFile(resolveConfigPath(), "utf8");
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
    `${supabaseUrl}/rest/v1/house_state?id=eq.default&select=data`,
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

export { fetchHouseState, getSupabaseUser, resolveSupabaseConfig };
