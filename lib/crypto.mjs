import crypto from "crypto";

const KEY_ENV = "EMAIL_TOKEN_ENCRYPTION_KEY";
const KEY_LENGTH = 32;

const decodeKey = (raw) => {
  const trimmed = String(raw || "").trim();
  if (!trimmed) return null;
  if (/^[0-9a-fA-F]{64}$/.test(trimmed)) {
    return Buffer.from(trimmed, "hex");
  }
  try {
    const decoded = Buffer.from(trimmed, "base64");
    if (decoded.length === KEY_LENGTH) return decoded;
  } catch {
    // fall through
  }
  const utf8 = Buffer.from(trimmed, "utf8");
  return utf8.length === KEY_LENGTH ? utf8 : null;
};

const getKey = () => {
  const key = decodeKey(process.env[KEY_ENV]);
  if (!key) {
    throw new Error(`Missing or invalid ${KEY_ENV}.`);
  }
  return key;
};

const encrypt = (value) => {
  const plain = String(value || "");
  if (!plain) return "";
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", getKey(), iv);
  const encrypted = Buffer.concat([
    cipher.update(plain, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return [
    "v1",
    iv.toString("base64"),
    encrypted.toString("base64"),
    tag.toString("base64"),
  ].join(":");
};

const decrypt = (payload) => {
  const raw = String(payload || "");
  if (!raw) return "";
  const [version, ivB64, dataB64, tagB64] = raw.split(":");
  if (version !== "v1" || !ivB64 || !dataB64 || !tagB64) {
    throw new Error("Invalid encrypted payload.");
  }
  const iv = Buffer.from(ivB64, "base64");
  const data = Buffer.from(dataB64, "base64");
  const tag = Buffer.from(tagB64, "base64");
  const decipher = crypto.createDecipheriv("aes-256-gcm", getKey(), iv);
  decipher.setAuthTag(tag);
  const decrypted = Buffer.concat([decipher.update(data), decipher.final()]);
  return decrypted.toString("utf8");
};

const hashValue = (value) =>
  crypto
    .createHash("sha256")
    .update(String(value || ""))
    .digest("hex");

const generateRandomHex = (bytes = 16) =>
  crypto.randomBytes(bytes).toString("hex");

export { decrypt, encrypt, generateRandomHex, hashValue };
